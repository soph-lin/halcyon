# Halcyon

## About

A personal website for writing.

## Architecture

The usual bread-and-butter for web apps:

- Next.js framework
- Supabase + Prisma ORM
- Vercel hosting
- Google OAuth

The rich text editor uses [Lexical](https://lexical.dev) framework, developed by Meta.

Posts are uploaded to configured database, so their fate is in your hands.

## Local Deployment

Install packages:

```bash
pnpm install
```

Config env:

```bash
# Database
DATABASE_URL=<...>
DIRECT_DATABASE_URL=<...>   # Direct Postgres URL (5432) for db:migrate, only if DATABASE_URL uses a pooler

# Auth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=<...>
GOOGLE_CLIENT_ID=<...>
GOOGLE_CLIENT_SECRET=<...>
ADMIN_EMAIL="your-cool-email@example.com"
```

Setup database (first time):

```bash
pnpm db:generate    # Generate db
pnpm db:migrate     # Track initial version of db for later updates
pnpm db:seed        # (Optional) Seed db with sample posts
```

Run server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Credits

Favicon: [Botanical](https://icons8.com/icon/wvpF6rQ8lYbV/botanical) icon by [https://icons8.com](Icons8)
