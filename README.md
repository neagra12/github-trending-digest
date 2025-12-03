# 🚀 TrendWatch AI - GitHub Trending Digest

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Never miss what's trending on GitHub. Get AI-powered summaries of trending repositories delivered to your inbox daily.

!((image.png))

## ✨ Features

- 🔥 **Daily GitHub Trending** - Scrapes 500+ trending repos across 10+ languages
- 🤖 **AI-Powered Summaries** - Uses OpenAI GPT to generate insightful 2-3 sentence summaries
- 📧 **Beautiful Email Digests** - Personalized, responsive HTML emails with gradient designs
- 🎯 **Language Filtering** - Subscribe to specific programming languages you care about
- ⏰ **Automated Delivery** - Serverless cron jobs run daily at 8 AM UTC
- 🗄️ **Persistent Storage** - PostgreSQL database with Prisma ORM
- 🎨 **Modern UI** - Glassmorphism design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database (Supabase)

### Integrations
- **GitHub API** - Repository data fetching
- **OpenAI API** - AI-powered summaries
- **Resend** - Transactional email delivery
- **Vercel Cron** - Scheduled job execution

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)
- API keys for: OpenAI, Resend, GitHub (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/neagra12/github-trending-digest.git
   cd github-trending-digest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   

3. **Set up environment variables**
   
   Create `.env` and `.env.local` files:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   
   
   # Resend
   RESEND_API_KEY="re_NTVovAGs_K8ZGX5eCh5psitdSPzjWcFxPy"
   
   
   
   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
github-trending-digest/
├── app/
│   ├── api/
│   │   ├── subscribe/       # Subscription endpoint
│   │   ├── unsubscribe/     # Unsubscribe endpoint
│   │   ├── test-scrape/     # Test scraper
│   │   ├── test-digest/     # Test email
│   │   └── cron/
│   │       └── scrape/      # Daily cron job
│   └── page.tsx             # Landing page
├── lib/
│   ├── db.ts                # Prisma client
│   ├── scraper.ts           # GitHub scraper
│   ├── ai-summarizer.ts     # OpenAI integration
│   ├── email.ts             # Email templates
│   └── logger.ts            # Logging utility
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

## 🗃️ Database Schema

```prisma
model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  languages String[] // e.g., ["TypeScript", "Python"]
  frequency String   @default("daily")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Repository {
  id           String   @id @default(cuid())
  fullName     String   @unique
  description  String?
  language     String?
  stars        Int
  todayStars   Int
  url          String
  aiSummary    String?
  scrapedAt    DateTime @default(now())
  trendingDate DateTime @default(now())
}

model DigestLog {
  id          String   @id @default(cuid())
  sentAt      DateTime @default(now())
  totalRepos  Int
  totalEmails Int
  status      String
  errorMsg    String?
}
```

## 🔄 How It Works

1. **Daily at 8 AM UTC**: Vercel Cron triggers `/api/cron/scrape`
2. **Scraping**: Fetches trending repos from GitHub API for each subscribed language
3. **AI Processing**: Generates summaries using OpenAI GPT for each repo
4. **Storage**: Saves repos and summaries to PostgreSQL
5. **Email Delivery**: Sends personalized digests to active subscribers via Resend
6. **Logging**: Records execution results in DigestLog table

## 🧪 Testing

### Test Scraper
```bash
curl http://localhost:3000/api/test-scrape
```

### Test Email Delivery
```bash
curl http://localhost:3000/api/test-digest
```

### Manual Cron Trigger (requires CRON_SECRET)
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/scrape
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Add environment variables
   - Deploy!

3. **Set up Cron Job**
   
   Create `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/scrape",
       "schedule": "0 8 * * *"
     }]
   }
   ```

4. **Update Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscribe` | POST | Subscribe to digest |
| `/api/unsubscribe` | GET/POST | Unsubscribe from digest |
| `/api/test-scrape` | GET | Test GitHub scraper |
| `/api/test-digest` | GET | Send test email |
| `/api/cron/scrape` | GET | Daily scraping job |

## 🔐 Security

- ✅ CRON_SECRET required for scheduled jobs
- ✅ Environment variables for sensitive data
- ✅ API rate limiting on scraper
- ✅ Email validation and sanitization
- ✅ Unsubscribe links in all emails (CAN-SPAM compliant)

## 🎨 Customization

### Change Email Schedule
Edit `vercel.json`:
```json
"schedule": "0 8 * * *"  // 8 AM daily
"schedule": "0 8 * * 1"  // 8 AM every Monday
"schedule": "0 */6 * * *" // Every 6 hours
```

### Add More Languages
Edit `app/page.tsx`:
```typescript
const languages = [
  'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust',
  'Ruby', 'PHP', 'C#', 'Dart', 'Scala' // Add more!
];
```

### Customize Email Template
Edit `lib/email.ts` - modify the HTML in `generateEmailHTML()`

## 📈 Future Enhancements

- [ ] User dashboard with preferences management
- [ ] Weekly digest option
- [ ] Webhook integrations (Slack, Discord)
- [ ] Vector search for repo recommendations
- [ ] Chrome extension
- [ ] Mobile app
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Supabase](https://supabase.com/) - Database hosting
- [OpenAI](https://openai.com/) - AI summaries
- [Resend](https://resend.com/) - Email delivery
- [Prisma](https://www.prisma.io/) - Database ORM

## 📧 Contact

Neeha Agrawal - [@LinkedIn(www.linkedin.com/in/neeha-agrawal) - neehaj12@gmail.com

Project Link: [https://github.com/neaagra12/github-trending-digest]
[https://github-trending-digest.vercel.app/]

---

Made with ❤️ by Neeha Agrawal(https://github.com/neagra12)