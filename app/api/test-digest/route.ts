import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scrapeGitHubTrending } from '@/lib/scraper';
import { generateRepoSummary } from '@/lib/ai-summarizer';
import { sendDigestEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing digest email send...');

    // Get first active subscriber
    const subscriber = await prisma.subscriber.findFirst({
      where: { isActive: true }
    });

    if (!subscriber) {
      return NextResponse.json({
        error: 'No subscribers found. Please subscribe first!'
      }, { status: 404 });
    }

    console.log(`📧 Sending test digest to: ${subscriber.email}`);
    console.log(`🔤 Languages: ${subscriber.languages.join(', ')}`);

    // Get repos for first language
    const firstLang = subscriber.languages[0];
    const repos = await scrapeGitHubTrending(firstLang);

    if (repos.length === 0) {
      return NextResponse.json({
        error: 'No repos found for language: ' + firstLang
      });
    }

    console.log(`✅ Found ${repos.length} ${firstLang} repos`);

    // Generate AI summary for first 5 repos
    const topRepos = repos.slice(0, 5);
    
    for (const repo of topRepos) {
      const summary = await generateRepoSummary(repo);
      repo.readme = summary; // Store in readme field temporarily
    }

    // Prepare repos for email
    const reposForEmail = topRepos.map(repo => ({
      fullName: repo.fullName,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      todayStars: repo.todayStars,
      url: repo.url,
      aiSummary: repo.readme || repo.description
    }));

    console.log('📨 Sending email...');

    // Send email
    const result = await sendDigestEmail(
      subscriber.email,
      reposForEmail,
      subscriber.languages
    );

    if (result.success) {
      console.log('✅ Email sent successfully!');
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${subscriber.email}`,
        messageId: result.messageId,
        repoCount: reposForEmail.length
      });
    } else {
      console.error('❌ Email failed:', result.error);
      return NextResponse.json({
        error: 'Failed to send email',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test digest error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}