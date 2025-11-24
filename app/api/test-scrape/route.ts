import { NextResponse } from 'next/server';
import { scrapeGitHubTrending } from '@/lib/scraper';
import { generateRepoSummary } from '@/lib/ai-summarizer';

export async function GET() {
  try {
    console.log('🧪 Testing scraper...');
    
    // Test scraping TypeScript repos
    const repos = await scrapeGitHubTrending('typescript');
    
    console.log(`✅ Found ${repos.length} TypeScript repos`);
    
    if (repos.length > 0) {
      // Test AI summarization on first repo
      const firstRepo = repos[0];
      console.log('🤖 Generating AI summary for:', firstRepo.fullName);
      
      const summary = await generateRepoSummary(firstRepo);
      
      return NextResponse.json({
        success: true,
        reposFound: repos.length,
        sample: {
          ...firstRepo,
          aiSummary: summary
        },
        allRepos: repos.map(r => ({
          name: r.fullName,
          language: r.language,
          stars: r.stars,
          todayStars: r.todayStars
        }))
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'No repos found',
      reposFound: 0
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}