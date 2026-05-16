# Sypho.io — Architecture Overview

## Phase 0: Foundation

This document describes the foundational architecture decisions for Sypho.io,
a high-performance clinic booking and scheduling SaaS targeting the EU market.

---

## Technology Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | Next.js 14+ (App Router) | RSC performance, SEO, server-side rendering |
| Language | TypeScript (strict mode) | Type safety, maintainability |
| Database | PostgreSQL via Supabase | Managed, EU-region, built-in auth + RLS |
| Auth | Supabase Auth | JWT-based, built-in MFA support |
| Styling | Tailwind CSS | Rapid UI development, consistent design tokens |
| Validation | Zod | Runtime schema validation, type inference |
| Testing | Vitest + Playwright | Unit, integration, and E2E coverage |

---

## Multi-Tenancy Model

Sypho.io uses a **shared database, row-level security** multi-tenancy model:

- Each **clinic** is a top-level tenant (Data Controller under GDPR).
- All patient data is scoped to a `clinic_id` foreign key.
- PostgreSQL **Row Level Security (RLS)** enforces strict data isolation at the
  database layer — a query from Clinic A can never return data belonging to Clinic B,
  regardless of the application-layer code.
- The `get_current_clinic_id()` database function resolves the current user's
  clinic from their JWT, making RLS policies tenant-aware.

---

## Supabase Client Strategy

Three Supabase client instances are used depending on context:

| Client | File | Key Used | RLS Enforced | When to Use |
|--------|------|----------|--------------|-------------|
| Browser Client | `lib/supabase/client.ts` | ANON | YES | Client Components |
| Server Client | `lib/supabase/server.ts` | ANON | YES | Server Components, Route Handlers, Server Actions |
| Admin Client | `lib/supabase/server.ts` | SERVICE ROLE | NO | Background jobs, webhooks, migrations |

**Never expose the Service Role key to the browser.**

---

## GDPR Compliance Architecture

### Data Controller
Each clinic registered on Sypho.io acts as the **Data Controller** for their
patients' data. Sypho.io acts as a **Data Processor**.

### Special Category Data
Patient records and appointments contain **Special Category Data** (health data)
as defined by GDPR Article 9. Processing is lawful under Article 9(2)(h)
(healthcare provision).

### Key Compliance Features
- **RLS**: Database-level tenant isolation (all sensitive tables)
- **Consent Management**: `patient_consents` table — append-only, immutable audit trail
- **Audit Logging**: `audit_logs` table — immutable, 5-year minimum retention
- **Soft Delete**: `deleted_at` timestamps — no hard deletes without legal authorization
- **Data Retention**: `data_retention_until` columns with automated deletion pipeline
- **Anonymization**: `anonymized_at` flag for post-retention anonymization
- **Security Headers**: CSP, HSTS, X-Frame-Options injected via Next.js middleware

---

## Folder Structure

```
/
├── app/                    Next.js App Router
│   ├── (auth)/             Route group: authentication pages
│   ├── (dashboard)/        Route group: authenticated app
│   └── api/                REST API Route Handlers
├── components/             Reusable React components
├── lib/                    Core utilities and configurations
│   └── supabase/           Supabase client factories
├── database/               Database schema and types
│   ├── migrations/         SQL migration files (ordered)
│   ├── seeds/              Development seed data
│   └── types/              Generated TypeScript types
├── types/                  Global TypeScript definitions
├── config/                 Application configuration
├── middleware/             Next.js middleware (auth, CSP)
├── tests/                  Test suites
└── docs/                   Architecture documentation
```

---

## Database Schema (Phase 0)

Core tables with their primary relationships:

```
clinics
  └── clinic_members (users ↔ clinics, with roles)
  └── doctors
  └── appointment_types
  └── patients
       └── patient_consents (GDPR consent audit trail)
       └── appointments
            ├── → doctor
            └── → appointment_type

audit_logs (system-wide immutable audit trail)
```

All tables with personal data have RLS enabled and FORCE ROW LEVEL SECURITY.

---

## Security Architecture

- Authentication: Supabase Auth (JWT, short-lived tokens)
- Authorization: PostgreSQL RLS + application-layer role checks
- Transport: TLS 1.3 enforced via HSTS headers
- CSP: Content Security Policy headers on every response
- Rate Limiting: Applied at middleware and API route level
- Input Validation: Zod schemas at every API boundary
- Secrets: Environment variables only — never in source code

---

*This document is maintained by the Sypho Engineering Team.*
*Last updated: 2026-05-16 (Phase 0)*
