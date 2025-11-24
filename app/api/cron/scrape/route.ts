import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scrapeGitHubTrending } from '@/lib/scraper';
import { generateBatchSummaries } from '@/lib/ai-summarizer';
import { sendDigestEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logger.warning('Unauthorized cron access attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    logger.info('🚀 Starting daily scrape job...');

    // Get all unique languages from active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
      select: { languages: true }
    });

    const allLanguages = new Set<string>();
    subscribers.forEach(sub => {
      sub.languages.forEach(lang => allLanguages.add(lang));
    });

    console.log(`📊 Found ${allLanguages.size} languages to scrape`);

    let totalRepos = 0;
    const scrapedRepos = new Map<string, any>();

    // Scrape trending repos for each language
    for (const language of allLanguages) {
      console.log(`🔍 Scraping ${language}...`);
      
      const repos = await scrapeGitHubTrending(language);
      
      if (repos.length > 0) {
        console.log(`✅ Found ${repos.length} ${language} repos`);
        
        // Generate AI summaries
        const summaries = await generateBatchSummaries(repos);
        
        // Store in database
        for (const repo of repos) {
          const summary = summaries.get(repo.fullName) || repo.description;
          
          await prisma.repository.upsert({
            where: { fullName: repo.fullName },
            update: {
              stars: repo.stars,
              todayStars: repo.todayStars,
              aiSummary: summary,
              scrapedAt: new Date(),
              trendingDate: new Date()
            },
            create: {
              fullName: repo.fullName,
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
              todayStars: repo.todayStars,
              url: repo.url,
              aiSummary: summary
            }
          });

          scrapedRepos.set(repo.fullName, {
            ...repo,
            aiSummary: summary
          });
          
          totalRepos++;
        }
      }
    }

    console.log(`📦 Stored ${totalRepos} total repos`);

    // Send emails to subscribers
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const subscriber of subscribers) {
      try {
        // Get repos matching subscriber's languages
        const matchingRepos = Array.from(scrapedRepos.values())
          .filter(repo => subscriber.languages.includes(repo.language))
          .slice(0, 10); // Top 10 per subscriber

        if (matchingRepos.length > 0) {
          const result = await sendDigestEmail(
            subscriber.email,
            matchingRepos,
            subscriber.languages
          );

          if (result.success) {
            emailsSent++;
            console.log(`✉️  Sent to ${subscriber.email}`);
          } else {
            emailsFailed++;
            console.error(`❌ Failed to send to ${subscriber.email}`);
          }
        }

        // Rate limit: delay between emails
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        emailsFailed++;
        console.error(`❌ Error sending to ${subscriber.email}:`, error);
      }
    }

    // Log digest completion
    await prisma.digestLog.create({
      data: {
        totalRepos,
        totalEmails: emailsSent,
        status: emailsFailed > 0 ? 'partial' : 'success',
        errorMsg: emailsFailed > 0 ? `${emailsFailed} emails failed` : null
      }
    });

    console.log('✅ Daily scrape job completed!');

    return NextResponse.json({
      success: true,
      totalRepos,
      emailsSent,
      emailsFailed,
      languages: Array.from(allLanguages)
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    
    // Log failure
    await prisma.digestLog.create({
      data: {
        totalRepos: 0,
        totalEmails: 0,
        status: 'failed',
        errorMsg: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return NextResponse.json(
      { error: 'Cron job failed', details: error },
      { status: 500 }
    );
  }
}

// Allow manual trigger for testing
export async function POST(request: NextRequest) {
  // For testing, allow without auth (remove in production)
  console.log('⚠️  Manual trigger - running scrape job');
  return GET(request);
}