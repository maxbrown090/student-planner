# Planner — Student Life OS

An AI-powered scheduling app for students and busy people.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Add AI API key
cp .env.local.example .env.local
# Edit .env.local with your ANTHROPIC_API_KEY

# 3. Run the dev server
npm run dev
```

Open http://localhost:3000

## Features

| Feature | Free | Pro ($8/mo) |
|---------|------|-------------|
| Assignments & Calendar | ✓ | ✓ |
| Bucket List | ✓ | ✓ |
| AI Scheduling | 3/day | Unlimited |
| AI Task Breakdown | 3/day | Unlimited |
| Auto-rescheduling | — | ✓ |
| Analytics | — | ✓ |
| Custom Themes | — | ✓ |
| Google Calendar Sync | — | ✓ |

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand + localStorage persistence
- **AI**: Anthropic Claude API (optional — app works without it)
- **Dates**: date-fns

## Adding Real AI (Optional)

1. Get an API key from console.anthropic.com
2. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`
3. The `/api/schedule` route will automatically use Claude instead of the mock scheduler

## Expanding to Production

- **Database**: Add Supabase for multi-device sync and user auth
- **Payments**: Add Stripe for the Pro tier
- **Notifications**: Add push notifications via web-push
- **Mobile**: The app is responsive; wrap with Capacitor for native apps
- **Calendar sync**: Add Google Calendar OAuth via NextAuth.js
