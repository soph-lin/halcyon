# Halcyon

## About

A personal website for writing.

## Architecture

The rich text editor uses [Lexical](https://lexical.dev) framework, developed by Meta.

Posts are uploaded to configured database, so their fate is in your hands.

## Local Deployment

Install packages:

```bash
pnpm install
```

Config env:

```bash
DATABASE_URL=<...>
DIRECT_DATABASE_URL=<...>   # Direct Postgres URL (5432) for db:migrate, only if DATABASE_URL uses a pooler
```

Setup database (first time):

```bash
pnpm db:generate    # Generate db
pnpm db:migrate     # Make db match prisma
pnpm db:seed        # (Optional) Seed db with sample posts
```

Run server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Credits

Favicon used
<a target="_blank" href="https://icons8.com/icon/wvpF6rQ8lYbV/botanical">Botanical</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
