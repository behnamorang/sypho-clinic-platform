# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Sypho.io is a GDPR-compliant clinic booking and scheduling SaaS (Next.js 14 App Router, TypeScript strict mode, Supabase, Tailwind CSS). Single-service architecture — no Docker, no monorepo.

### Running the app

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint (next lint)
npm run type-check # TypeScript strict check (tsc --noEmit)
```

### Environment variables

The update script auto-generates `.env.local` from injected secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`). Next.js requires `NEXT_PUBLIC_*` vars in `.env.local` — they cannot be read from process env alone because they must be inlined at compile time for client-side code. With placeholder values, the dev server starts and all pages render, but auth/data flows will fail at runtime.

**Important**: The `NEXT_PUBLIC_SUPABASE_URL` must be the base project URL (e.g. `https://projectref.supabase.co`), NOT the REST API URL with `/rest/v1/` appended. The update script strips this suffix automatically.

### Key caveats

- **No local Supabase CLI** — the project uses a hosted Supabase instance. Database migrations are in `database/migrations/` and must be applied to a remote Supabase project.
- **Middleware runs on all routes** — `middleware.ts` re-exports from `middleware/index.ts`. It refreshes Supabase sessions, enforces auth guards, injects CSP headers, and performs geo-detection.
- **Strict TypeScript** — `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and all strict flags are enabled. Use `unknown` instead of `any`.
- **The root page (`/`) requires Supabase** — it calls `createSupabaseServerClient()` and redirects based on auth state. Test UI pages at `/login`, `/register`, `/forgot-password`, or `/{slug}/booking` instead.
- **Package manager is npm** — lockfile is `package-lock.json`.
- **Node.js v22+** is required.
