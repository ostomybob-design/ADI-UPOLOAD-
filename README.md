# Ostomy Content Dashboard

A Next.js dashboard for managing and publishing social media content about ostomy care and awareness. Integrates with Late.dev API for automated posting to Instagram and Facebook.

## Features

- 📊 **Content Dashboard** - View and manage all posts
- ✍️ **Create Posts** - Create posts with captions, hashtags, and media
- 📅 **Scheduling** - Schedule posts for future publication
- 🤖 **AI Integration** - AI-generated content from bot
- 📱 **Multi-Platform** - Post to Instagram and Facebook simultaneously
- 🔄 **Late.dev Integration** - Automated posting via Late.dev API
- ✅ **Approval Workflow** - Review and approve AI-generated content

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Late.dev account with connected Instagram/Facebook accounts

### Setup

1. **Install dependencies**
```bash
<<<<<<< HEAD
npm install
=======
npm run dev

yarn dev
# or
pnpm dev
# or
bun dev
>>>>>>> 7b50535f0001f137bcaaee74c75a1ce6c39dc2d6
```

2. **Configure environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your_database_url
LATE_API_KEY=your_late_api_key
```

3. **Set up database**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Late.dev API Integration

This dashboard uses Late.dev API for automated social media posting.

### Quick Setup

1. Sign up at https://getlate.dev
2. Connect your Instagram and Facebook accounts
3. Generate an API key (Settings → API Keys)
4. Add `LATE_API_KEY` to `.env.local`
5. Run database migration: `npx prisma migrate dev`

### Data Synchronization

The dashboard automatically syncs with Late.dev to keep post statuses up-to-date:

- **Automatic Sync**: Runs on page load for Dashboard and Scheduling pages
- **Manual Sync**: Click the refresh button to sync immediately
- **What Gets Synced**:
  - Post status (scheduled, published, failed)
  - Scheduled times
  - Published times
  - Platform information

**How it works:**
1. Dashboard fetches posts from Late.dev API
2. Updates local database with latest status
3. Creates local records for posts that only exist in Late.dev
4. Both `/dashboard` (Scheduled tab) and `/scheduling` pages show the same data

**API Endpoint:** `POST /api/late/sync`

**📚 Detailed Documentation:**
- [Quick Start Guide](../QUICK_START.md) - 5-minute setup
- [Setup Guide](./SETUP_LATE_API.md) - Step-by-step instructions
- [Integration Guide](./LATE_API_INTEGRATION.md) - Technical details
- [Implementation Summary](../LATE_API_IMPLEMENTATION_SUMMARY.md) - Overview
- [Checklist](../LATE_API_CHECKLIST.md) - Verification checklist

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── late/         # Late.dev API integration
│   │   ├── posts/        # Post management
│   │   └── schedule/     # Scheduling
│   ├── dashboard/        # Dashboard page
│   └── scheduling/       # Scheduling page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── create-post-modal.tsx
│   ├── edit-post-modal.tsx
│   └── view-post-modal.tsx
├── lib/                 # Utilities
│   ├── late-api.ts     # Late.dev API client
│   └── db.ts           # Database client
├── prisma/             # Database schema
│   └── schema.prisma
└── public/             # Static assets
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
npx prisma migrate   # Run database migrations
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **API Integration**: Late.dev for social media posting
- **TypeScript**: Full type safety

## Key Features

### Create Post Modal
- Caption and hashtag input
- Media upload (images/videos)
- Platform selection (Instagram/Facebook)
- Account selection for each platform
- Scheduling for future publication
- Real-time preview
- Draft saving

### Dashboard
- View all posts with status
- Filter by platform, status, date
- Approve/reject AI-generated content
- Edit posts before publishing
- Track posting history

### Scheduling
- Configure posting frequency
- Set posting times
- Manage buffer of approved posts
- Auto-approval settings

## Database Schema

Key tables:
- `search_results` - Posts and content
- `posting_schedule` - Scheduling configuration

Late.dev tracking fields:
- `late_post_id` - Late.dev post ID
- `late_status` - Post status (scheduled/published/failed)
- `late_published_at` - Publication timestamp
- `late_error_message` - Error details if failed

## Environment Variables

Required:
- `NEXT_PUBLIC_APP_URL` - App URL (e.g., http://localhost:3000)
- `DATABASE_URL` - PostgreSQL connection string
- `LATE_API_KEY` - Late.dev API key

Optional:
- `DIRECT_URL` - Direct database connection (for Prisma migrations)

## Development

### Adding New Features

1. Create components in `components/`
2. Add API routes in `app/api/`
3. Update database schema in `prisma/schema.prisma`
4. Run migrations: `npx prisma migrate dev`
5. Update types and interfaces

### Testing

Manual testing checklist:
- Create post to Instagram
- Create post to Facebook
- Create multi-platform post
- Schedule post for future
- Edit existing post
- Approve AI-generated content

## Troubleshooting

### Accounts not loading
- Check `LATE_API_KEY` in `.env.local`
- Verify accounts connected in Late.dev
- Check browser console for errors

### Posts not publishing
- Check post status in Late.dev dashboard
- Verify account permissions
- Check for error messages

### Database issues
- Run `npx prisma generate`
- Check database connection string
- Verify migrations are up to date

See [SETUP_LATE_API.md](./SETUP_LATE_API.md) for detailed troubleshooting.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
