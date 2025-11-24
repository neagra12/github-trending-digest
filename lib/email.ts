import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface RepoForEmail {
  fullName: string;
  description: string;
  language: string;
  stars: number;
  todayStars: number;
  url: string;
  aiSummary: string;
}

export async function sendDigestEmail(
  to: string,
  repos: RepoForEmail[],
  subscriberLanguages: string[]
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  No Resend API key - email would be sent to:', to);
      console.log('📦 Repos count:', repos.length);
      return { success: true, messageId: 'test-mode' };
    }

    console.log('📧 Preparing email for:', to);
    console.log('🔑 API Key exists:', !!process.env.RESEND_API_KEY);
    
    const html = generateEmailHTML(repos, subscriberLanguages, to);
    
    console.log('📨 Sending via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'TrendWatch AI <onboarding@resend.dev>', // Using Resend's test domain
      to: [to],
      subject: `🔥 ${repos.length} Trending ${subscriberLanguages.join(', ')} Repos Today`,
      html: html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error };
    }

    console.log('✅ Resend response:', data);
    return { success: true, messageId: data?.id, resendData: data };
  } catch (error) {
    console.error('❌ Email send error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { success: false, error };
  }
}

function generateEmailHTML(repos: RepoForEmail[], languages: string[], recipientEmail: string): string {
  const repoCards = repos.map(repo => `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin-bottom: 20px; color: white;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div>
          <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold;">
            <a href="${repo.url}" style="color: white; text-decoration: none;">
              ${repo.fullName}
            </a>
          </h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">${repo.description}</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; margin-bottom: 4px;">⭐ ${repo.stars.toLocaleString()}</div>
          <div style="font-size: 12px; color: #4ade80; font-weight: bold;">+${repo.todayStars} today</div>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 16px; margin: 16px 0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">✨ AI SUMMARY</span>
        </div>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; opacity: 0.95;">
          ${repo.aiSummary}
        </p>
      </div>
      
      <div style="display: flex; gap: 12px; align-items: center;">
        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          ${repo.language}
        </span>
        <a href="${repo.url}" style="color: white; text-decoration: none; font-size: 14px; opacity: 0.9;">
          View on GitHub →
        </a>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily GitHub Digest</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: white; font-size: 32px; margin: 0 0 8px 0;">
            🚀 TrendWatch AI
          </h1>
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 16px;">
            Your Daily GitHub Trending Digest
          </p>
          <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0 0; font-size: 14px;">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <!-- Language Badge -->
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="background: rgba(255,255,255,0.15); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${languages.join(' • ')}
          </span>
        </div>

        <!-- Repos -->
        ${repoCards}

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0 0 16px 0;">
            You're receiving this because you subscribed to TrendWatch AI
          </p>
          <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: rgba(255,255,255,0.7); text-decoration: underline;">Manage preferences</a> • 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color: rgba(255,255,255,0.7); text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}