export interface TrendingRepo {
  fullName: string;
  description: string;
  language: string;
  stars: number;
  todayStars: number;
  url: string;
  readme?: string;
}

// Primary method: Use GitHub API (more reliable)
export async function scrapeGitHubTrending(
  language?: string
): Promise<TrendingRepo[]> {
  try {
    // Get repos created in the last week, sorted by stars
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateStr = lastWeek.toISOString().split('T')[0];
    
    // Build query
    let query = `created:>${dateStr}`;
    if (language) {
      query += `+language:${language}`;
    }
    
    const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=25`;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'TrendWatch-App'
    };
    
    // Add GitHub token if available (increases rate limit from 60 to 5000/hour)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    console.log('🔍 Fetching from GitHub API:', url);

    const response = await fetch(url, { 
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', response.status, error);
      
      // If rate limited, try fallback
      if (response.status === 403) {
        console.log('⚠️  Rate limited, trying fallback...');
        return getFallbackTrendingRepos(language);
      }
      
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.items?.length || 0} repos`);
    
    if (!data.items || data.items.length === 0) {
      return getFallbackTrendingRepos(language);
    }

    const repos: TrendingRepo[] = data.items.map((item: any) => ({
      fullName: item.full_name,
      description: item.description || 'No description available',
      language: item.language || language || 'Unknown',
      stars: item.stargazers_count,
      todayStars: Math.floor(item.stargazers_count / 30), // Estimate
      url: item.html_url
    }));

    return repos;

  } catch (error) {
    console.error('Scraping error:', error);
    return getFallbackTrendingRepos(language);
  }
}

// Fallback: Some popular repos if API fails
function getFallbackTrendingRepos(language?: string): TrendingRepo[] {
  const fallbacks: TrendingRepo[] = [
    {
      fullName: 'vercel/next.js',
      description: 'The React Framework for the Web',
      language: 'TypeScript',
      stars: 125000,
      todayStars: 150,
      url: 'https://github.com/vercel/next.js'
    },
    {
      fullName: 'facebook/react',
      description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
      language: 'JavaScript',
      stars: 227000,
      todayStars: 200,
      url: 'https://github.com/facebook/react'
    },
    {
      fullName: 'microsoft/vscode',
      description: 'Visual Studio Code',
      language: 'TypeScript',
      stars: 162000,
      todayStars: 180,
      url: 'https://github.com/microsoft/vscode'
    },
    {
      fullName: 'python/cpython',
      description: 'The Python programming language',
      language: 'Python',
      stars: 62000,
      todayStars: 90,
      url: 'https://github.com/python/cpython'
    },
    {
      fullName: 'golang/go',
      description: 'The Go programming language',
      language: 'Go',
      stars: 123000,
      todayStars: 120,
      url: 'https://github.com/golang/go'
    }
  ];

  if (language) {
    return fallbacks.filter(r => 
      r.language.toLowerCase() === language.toLowerCase()
    );
  }

  return fallbacks;
}

// Alternative: Get truly trending repos (updated daily)
export async function getActualTrendingRepos(language?: string): Promise<TrendingRepo[]> {
  try {
    // Use a third-party trending API
    const url = language 
      ? `https://api.gitterapp.com/repositories?language=${language}&since=daily`
      : 'https://api.gitterapp.com/repositories?since=daily';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Trending API failed');
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      fullName: item.full_name || item.name,
      description: item.description || 'No description available',
      language: item.language || language || 'Unknown',
      stars: item.stargazers_count || 0,
      todayStars: item.stars_today || 0,
      url: item.html_url || `https://github.com/${item.full_name}`
    }));

  } catch (error) {
    console.error('Trending API error:', error);
    // Fall back to GitHub API
    return scrapeGitHubTrending(language);
  }
}