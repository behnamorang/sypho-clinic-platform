# Remote database schema (Supabase)

API keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) do **not** grant PostgreSQL DDL access. To create tables from `database/migrations/`, use one of the paths below.

## Option A — `DATABASE_URL` (recommended for this repo)

1. In the Supabase Dashboard, open **Project Settings → Database**.
2. Under **Connection string**, choose **URI** and **Session mode** (pooler, port **5432**).
3. Copy the URI into **`.env.local`** as `DATABASE_URL=...` (the script reads this only from `.env.local` / `.env`, not from unrelated shell environment variables).
4. From the repository root:

```bash
npm install
npm run db:migrate:remote
npm run db:seed:demo
```

If the database password is unknown, use **Reset database password** in the same settings page, then update `DATABASE_URL`.

## Option B — Supabase CLI (`link` + `db push`)

1. Create a personal access token: **Account → Access Tokens** on [supabase.com](https://supabase.com/dashboard/account/tokens).
2. Export it: `export SUPABASE_ACCESS_TOKEN=...`
3. Link and push (use the **database** password from the dashboard when prompted or via `--password`):

```bash
npx supabase link --project-ref <your-project-ref> --password '<db-password>'
npx supabase db push --yes
```

Migrations for the CLI live under `supabase/migrations/` (timestamped copies of `database/migrations/*.sql`).

## Option C — SQL Editor

Run the three files **in order** in the Supabase SQL editor:

1. `database/migrations/001_initial_schema.sql`
2. `database/migrations/002_auth_onboarding_helpers.sql`
3. `database/migrations/003_booking_portal.sql`

Then run `npm run db:seed:demo` locally with valid API keys.
