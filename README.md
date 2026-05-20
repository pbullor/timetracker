# TimeTracker

Dev time tracking with AI-assisted session logging. Tracks time per project manually (start/stop) and automatically via Claude Code hooks.

## Setup

### 1. Database (Neon)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string (the one with `?sslmode=require`)
3. Create `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required env vars:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
CLAUDE_HOOK_API_KEY=<generate a random string, e.g.: openssl rand -hex 32>
CLAUDE_HOOK_USER_EMAIL=you@example.com
```

4. Push the schema to Neon:

```bash
npm run db:push
```

### 2. Run locally

```bash
npm run dev
```

Open http://localhost:3000. Enter your email in the top-right corner to start tracking.

### 3. Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo in the Vercel dashboard. Set the three env vars above in Settings > Environment Variables.

### 4. Install Claude Code hooks

```bash
bash hooks/install.sh
```

This configures Claude Code to send session events to your TimeTracker instance. See [hooks/README.md](hooks/README.md) for details.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## Stack

- Next.js 15 (App Router)
- Drizzle ORM + Neon Postgres
- shadcn/ui + Tailwind CSS
- Zod validation
- date-fns
