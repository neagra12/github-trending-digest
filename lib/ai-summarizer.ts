export interface RepoData {
  fullName: string;
  description: string;
  language: string;
  stars: number;
  todayStars: number;
}

export async function generateRepoSummary(repo: RepoData): Promise<string> {
  try {
    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.warn('No OpenAI API key found, using fallback summary');
      return generateFallbackSummary(repo);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'You are a technical writer creating concise summaries for developers. Be insightful and technical, no marketing fluff.'
        }, {
          role: 'user',
          content: `Summarize this GitHub repository in 2-3 sentences:

Repository: ${repo.fullName}
Description: ${repo.description}
Language: ${repo.language}
Stars: ${repo.stars.toLocaleString()}
Stars gained today: ${repo.todayStars}

Focus on:
1. What problem it solves or what it does
2. Why it's trending (if stars gained today is high)
3. Why developers should care`
        }],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return generateFallbackSummary(repo);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || generateFallbackSummary(repo);

    return summary.trim();

  } catch (error) {
    console.error('AI summarization error:', error);
    return generateFallbackSummary(repo);
  }
}

export async function generateBatchSummaries(repos: RepoData[]): Promise<Map<string, string>> {
  const summaries = new Map<string, string>();
  
  // Process in batches to avoid rate limits
  const BATCH_SIZE = 3;
  const DELAY_MS = 1000; // 1 second between batches

  for (let i = 0; i < repos.length; i += BATCH_SIZE) {
    const batch = repos.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (repo) => {
      const summary = await generateRepoSummary(repo);
      return { fullName: repo.fullName, summary };
    });

    const results = await Promise.all(batchPromises);
    
    results.forEach(({ fullName, summary }) => {
      summaries.set(fullName, summary);
    });

    console.log(`✅ Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);

    // Delay between batches
    if (i + BATCH_SIZE < repos.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  return summaries;
}

function generateFallbackSummary(repo: RepoData): string {
  let summary = `${repo.fullName} is a ${repo.language} project`;
  
  if (repo.description) {
    summary += ` that ${repo.description.toLowerCase()}`;
  }
  
  if (repo.todayStars > 100) {
    summary += `. It's rapidly gaining popularity with ${repo.todayStars} stars gained today`;
  } else if (repo.stars > 10000) {
    summary += `. With ${repo.stars.toLocaleString()} stars, it's a well-established project in the community`;
  }
  
  summary += '.';
  
  return summary;
}