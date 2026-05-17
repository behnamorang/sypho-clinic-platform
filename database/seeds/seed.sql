-- =============================================================================
-- Sypho.io — Development & Testing Seed Data
-- File: database/seeds/seed.sql
-- Phase: 1 — Mock Data & System Simulation
-- Description: Populates the database with realistic European clinic data
--              covering two isolated tenants:
--                Clinic 1: Medisyn Amsterdam (Netherlands, NL)
--                Clinic 2: BerlinMed Zentrum (Germany, DE)
--              Designed to validate multi-tenancy, RLS isolation, GDPR
--              compliance patterns, scheduling logic, and role-based access.
-- Environment: Development / Staging ONLY
-- Author: Sypho Engineering Team
-- Created: 2026-05-16
-- =============================================================================
--
-- PREREQUISITES:
--   - Execute as PostgreSQL superuser or Supabase service role to bypass RLS.
--   - Migration 001_initial_schema.sql must already be applied.
--   - pgcrypto extension must be enabled (done in the migration).
--
-- IMPORTANT GDPR NOTE:
--   All patient names, dates of birth, addresses, and identifiers in this
--   file are entirely fictional and correspond to no real individuals.
--   National IDs are intentionally stored as NULL — application-layer
--   encryption is required before storage and is unavailable in raw SQL.
--   Insurance policy numbers use a pseudonymized TEST format.
--   Patient raw_user_meta_data stores only initials, not full names.
--
-- IDEMPOTENCY:
--   All INSERT statements use ON CONFLICT (id) DO NOTHING.
--   Re-running this script on an already-seeded database is safe.
--   Note: auth.users email must be unique; clear existing seed users
--   manually before re-seeding from scratch if email conflicts occur.
--
-- TENANT OVERVIEW:
--   Clinic 1 — Medisyn Amsterdam (slug: medisyn-amsterdam)
--     Timezone : Europe/Amsterdam | Country: NL
--     Specialty: General Practice & Cardiology
--     Staff    : 5 members (owner, admin, 2 doctors, 1 receptionist)
--     Patients : 4 pseudonymized records
--
--   Clinic 2 — BerlinMed Zentrum (slug: berlinmed-zentrum)
--     Timezone : Europe/Berlin | Country: DE
--     Specialty: Neurology
--     Staff    : 4 members (owner, admin, 1 doctor, 1 receptionist)
--     Patients : 3 pseudonymized records
--
-- TEST PASSWORD (all seed users): SeedTestPassword@2026!
-- ROTATE ALL PASSWORDS BEFORE DEPLOYING TO ANY NON-DEVELOPMENT ENVIRONMENT.
--
-- HOSTED SUPABASE (SQL Editor) — run order for email/password login:
--   1) Paste and run this entire file (seed.sql).
--   2) Run database/seeds/seed-auth-identities-supplement.sql next.
--      Without step 2, users exist in auth.users but signInWithPassword fails
--      because GoTrue requires an `email` row in auth.identities.
--   If auth.users inserts error on instance_id, apply migrations first; the
--   supplement script also backfills instance_id when it is NULL.
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 1: AUTH USERS (auth schema — Supabase Auth / GoTrue)
-- =============================================================================
-- Note: 'confirmed_at' is a GENERATED ALWAYS AS column (computed from
-- LEAST(email_confirmed_at, phone_confirmed_at)) and must NOT appear in
-- INSERT column lists. It is omitted here intentionally.
--
-- UUID allocation scheme:
--   10000000-0000-0000-0001-xxxxxxxxxxxx  Amsterdam staff auth users
--   10000000-0000-0000-0002-xxxxxxxxxxxx  Amsterdam patient auth users
--   20000000-0000-0000-0001-xxxxxxxxxxxx  Berlin staff auth users
--   20000000-0000-0000-0002-xxxxxxxxxxxx  Berlin patient auth users
-- =============================================================================

INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user,
  created_at,
  updated_at
)
VALUES

  -- =========================================================================
  -- Amsterdam Clinic Staff (5 users)
  -- =========================================================================

  -- Clinic Owner: Thomas de Vries
  (
    '10000000-0000-0000-0001-000000000001',
    'authenticated',
    'authenticated',
    'thomas.devries@medisyn-amsterdam.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-01-10 08:00:00+00',
    '2026-05-16 07:32:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "T. de Vries", "role_hint": "clinic_owner"}',
    false,
    false,
    '2026-01-10 08:00:00+00',
    '2026-05-16 07:32:00+00'
  ),

  -- Clinic Admin: Sophie van den Berg
  (
    '10000000-0000-0000-0001-000000000002',
    'authenticated',
    'authenticated',
    'sophie.vandenberg@medisyn-amsterdam.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-01-20 09:00:00+00',
    '2026-05-16 08:01:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "S. van den Berg", "role_hint": "clinic_admin"}',
    false,
    false,
    '2026-01-20 09:00:00+00',
    '2026-05-16 08:01:00+00'
  ),

  -- Doctor: Anna Muller (General Practice)
  (
    '10000000-0000-0000-0001-000000000003',
    'authenticated',
    'authenticated',
    'anna.muller@medisyn-amsterdam.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-01-25 09:00:00+00',
    '2026-05-16 07:55:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "A. Muller", "role_hint": "doctor"}',
    false,
    false,
    '2026-01-25 09:00:00+00',
    '2026-05-16 07:55:00+00'
  ),

  -- Doctor: Pieter Jansen (Cardiology)
  (
    '10000000-0000-0000-0001-000000000004',
    'authenticated',
    'authenticated',
    'pieter.jansen@medisyn-amsterdam.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-01-25 09:30:00+00',
    '2026-05-16 08:10:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "P. Jansen", "role_hint": "doctor"}',
    false,
    false,
    '2026-01-25 09:30:00+00',
    '2026-05-16 08:10:00+00'
  ),

  -- Receptionist: Emma Bakker
  (
    '10000000-0000-0000-0001-000000000005',
    'authenticated',
    'authenticated',
    'emma.bakker@medisyn-amsterdam.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-02-01 08:00:00+00',
    '2026-05-16 07:45:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "E. Bakker", "role_hint": "receptionist"}',
    false,
    false,
    '2026-02-01 08:00:00+00',
    '2026-05-16 07:45:00+00'
  ),

  -- =========================================================================
  -- Amsterdam Patient Auth Users (4 users — initials only in metadata)
  -- =========================================================================

  -- Patient: Lucas van den Berg
  (
    '10000000-0000-0000-0002-000000000001',
    'authenticated',
    'authenticated',
    'l.vandenberg@patient.example.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-02-10 10:15:00+00',
    '2026-05-01 14:22:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "L.V."}',
    false,
    false,
    '2026-02-10 10:15:00+00',
    '2026-05-01 14:22:00+00'
  ),

  -- Patient: Maria de Boer
  (
    '10000000-0000-0000-0002-000000000002',
    'authenticated',
    'authenticated',
    'm.deboer@patient.example.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-02-15 11:00:00+00',
    '2026-05-12 16:30:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "M.B."}',
    false,
    false,
    '2026-02-15 11:00:00+00',
    '2026-05-12 16:30:00+00'
  ),

  -- Patient: Adam Smit
  (
    '10000000-0000-0000-0002-000000000003',
    'authenticated',
    'authenticated',
    'a.smit@patient.example.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-03-01 09:30:00+00',
    '2026-04-22 11:45:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "A.S."}',
    false,
    false,
    '2026-03-01 09:30:00+00',
    '2026-04-22 11:45:00+00'
  ),

  -- Patient: Rosa Willems
  (
    '10000000-0000-0000-0002-000000000004',
    'authenticated',
    'authenticated',
    'r.willems@patient.example.nl',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-03-10 14:00:00+00',
    '2026-05-13 09:55:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "R.W."}',
    false,
    false,
    '2026-03-10 14:00:00+00',
    '2026-05-13 09:55:00+00'
  ),

  -- =========================================================================
  -- Berlin Clinic Staff (4 users)
  -- =========================================================================

  -- Clinic Owner: Klaus Weber
  (
    '20000000-0000-0000-0001-000000000001',
    'authenticated',
    'authenticated',
    'k.weber@berlinmed-zentrum.de',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-02-10 07:00:00+00',
    '2026-05-16 06:45:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "K. Weber", "role_hint": "clinic_owner"}',
    false,
    false,
    '2026-02-10 07:00:00+00',
    '2026-05-16 06:45:00+00'
  ),

  -- Clinic Admin: Lena Hoffmann
  (
    '20000000-0000-0000-0001-000000000002',
    'authenticated',
    'authenticated',
    'l.hoffmann@berlinmed-zentrum.de',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-02-15 08:00:00+00',
    '2026-05-16 07:15:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "L. Hoffmann", "role_hint": "clinic_admin"}',
    false,
    false,
    '2026-02-15 08:00:00+00',
    '2026-05-16 07:15:00+00'
  ),

  -- Doctor: Hans Schmidt (Neurology)
  (
    '20000000-0000-0000-0001-000000000003',
    'authenticated',
    'authenticated',
    'h.schmidt@berlinmed-zentrum.de',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-02-20 08:00:00+00',
    '2026-05-16 07:00:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "H. Schmidt", "role_hint": "doctor"}',
    false,
    false,
    '2026-02-20 08:00:00+00',
    '2026-05-16 07:00:00+00'
  ),

  -- Receptionist: Maria Fischer
  (
    '20000000-0000-0000-0001-000000000004',
    'authenticated',
    'authenticated',
    'm.fischer@berlinmed-zentrum.de',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-03-01 08:00:00+00',
    '2026-05-16 07:20:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "M. Fischer", "role_hint": "receptionist"}',
    false,
    false,
    '2026-03-01 08:00:00+00',
    '2026-05-16 07:20:00+00'
  ),

  -- =========================================================================
  -- Berlin Patient Auth Users (3 users — initials only in metadata)
  -- =========================================================================

  -- Patient: Friedrich Maier
  (
    '20000000-0000-0000-0002-000000000001',
    'authenticated',
    'authenticated',
    'f.maier@patient.example.de',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-03-05 10:00:00+00',
    '2026-05-08 12:30:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "F.M."}',
    false,
    false,
    '2026-03-05 10:00:00+00',
    '2026-05-08 12:30:00+00'
  ),

  -- Patient: Helga Bauer
  (
    '20000000-0000-0000-0002-000000000002',
    'authenticated',
    'authenticated',
    'h.bauer@patient.example.de',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-03-12 09:00:00+00',
    '2026-04-24 14:15:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "H.B."}',
    false,
    false,
    '2026-03-12 09:00:00+00',
    '2026-04-24 14:15:00+00'
  ),

  -- Patient: Kai Lehmann
  (
    '20000000-0000-0000-0002-000000000003',
    'authenticated',
    'authenticated',
    'k.lehmann@patient.example.de',
    crypt('SeedTestPassword@2026!', gen_salt('bf', 10)),
    '2026-04-01 11:00:00+00',
    '2026-05-14 10:05:00+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "K.L."}',
    false,
    false,
    '2026-04-01 11:00:00+00',
    '2026-05-14 10:05:00+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 2: CLINICS
-- =============================================================================
-- UUID allocation:
--   10000000-0000-0000-0000-000000000001  Medisyn Amsterdam
--   20000000-0000-0000-0000-000000000001  BerlinMed Zentrum
-- =============================================================================

INSERT INTO public.clinics (
  id,
  name,
  slug,
  tax_id,
  registration_number,
  email,
  phone,
  website,
  address_line1,
  address_line2,
  city,
  state_province,
  postal_code,
  country_code,
  timezone,
  business_hours,
  dpo_name,
  dpo_email,
  privacy_policy_url,
  terms_url,
  subscription_tier,
  subscription_expires_at,
  is_active,
  is_verified,
  created_at,
  updated_at
)
VALUES

  -- Clinic 1: Medisyn Amsterdam (Netherlands)
  -- General Practice & Cardiology — Professional tier
  (
    '10000000-0000-0000-0000-000000000001',
    'Medisyn Amsterdam',
    'medisyn-amsterdam',
    'NL864512789B01',
    'AGB-12345678',
    'info@medisyn-amsterdam.nl',
    '+31 20 555 0100',
    'https://www.medisyn-amsterdam.nl',
    'Keizersgracht 482',
    '3rd Floor',
    'Amsterdam',
    'Noord-Holland',
    '1017 EH',
    'NL',
    'Europe/Amsterdam',
    '{
      "monday":    {"open": "08:00", "close": "18:00", "closed": false},
      "tuesday":   {"open": "08:00", "close": "18:00", "closed": false},
      "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
      "thursday":  {"open": "08:00", "close": "18:00", "closed": false},
      "friday":    {"open": "08:00", "close": "17:00", "closed": false},
      "saturday":  {"open": "09:00", "close": "13:00", "closed": false},
      "sunday":    {"open": null,    "close": null,    "closed": true}
    }'::jsonb,
    'Thomas de Vries',
    'dpo@medisyn-amsterdam.nl',
    'https://www.medisyn-amsterdam.nl/privacy',
    'https://www.medisyn-amsterdam.nl/terms',
    'professional',
    '2027-01-15 00:00:00+00',
    true,
    true,
    '2026-01-15 08:00:00+00',
    '2026-01-15 08:00:00+00'
  ),

  -- Clinic 2: BerlinMed Zentrum (Germany)
  -- Neurology — Starter tier
  (
    '20000000-0000-0000-0000-000000000001',
    'BerlinMed Zentrum',
    'berlinmed-zentrum',
    'DE254789123',
    'KV-Berlin-00789',
    'kontakt@berlinmed-zentrum.de',
    '+49 30 555 0200',
    'https://www.berlinmed-zentrum.de',
    'Unter den Linden 77',
    NULL,
    'Berlin',
    'Berlin',
    '10117',
    'DE',
    'Europe/Berlin',
    '{
      "monday":    {"open": "08:00", "close": "17:00", "closed": false},
      "tuesday":   {"open": "08:00", "close": "17:00", "closed": false},
      "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
      "thursday":  {"open": "08:00", "close": "17:00", "closed": false},
      "friday":    {"open": "08:00", "close": "15:00", "closed": false},
      "saturday":  {"open": null,    "close": null,    "closed": true},
      "sunday":    {"open": null,    "close": null,    "closed": true}
    }'::jsonb,
    'Klaus Weber',
    'datenschutz@berlinmed-zentrum.de',
    'https://www.berlinmed-zentrum.de/datenschutz',
    'https://www.berlinmed-zentrum.de/agb',
    'starter',
    '2027-02-10 00:00:00+00',
    true,
    true,
    '2026-02-10 07:00:00+00',
    '2026-02-10 07:00:00+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 3: CLINIC MEMBERS
-- =============================================================================
-- Links auth.users to clinics with role assignments.
-- Both staff (owner/admin/doctor/receptionist) and patients are represented,
-- as get_current_clinic_id() relies on clinic_members for all RLS checks.
--
-- UUID allocation:
--   10000000-0000-0000-0011-xxxxxxxxxxxx  Amsterdam memberships
--   20000000-0000-0000-0011-xxxxxxxxxxxx  Berlin memberships
-- =============================================================================

INSERT INTO public.clinic_members (
  id,
  clinic_id,
  user_id,
  role,
  is_active,
  invited_by,
  invited_at,
  accepted_at,
  created_at,
  updated_at
)
VALUES

  -- =========================================================================
  -- Medisyn Amsterdam — Staff Members
  -- =========================================================================

  -- Owner (self-registered — no invitation chain)
  (
    '10000000-0000-0000-0011-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000001',
    'clinic_owner',
    true,
    NULL,
    NULL,
    '2026-01-15 08:05:00+00',
    '2026-01-15 08:05:00+00',
    '2026-01-15 08:05:00+00'
  ),

  -- Admin (invited by owner)
  (
    '10000000-0000-0000-0011-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000002',
    'clinic_admin',
    true,
    '10000000-0000-0000-0001-000000000001',
    '2026-01-18 09:00:00+00',
    '2026-01-20 09:00:00+00',
    '2026-01-20 09:00:00+00',
    '2026-01-20 09:00:00+00'
  ),

  -- Doctor: Anna Muller (invited by owner)
  (
    '10000000-0000-0000-0011-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000003',
    'doctor',
    true,
    '10000000-0000-0000-0001-000000000001',
    '2026-01-22 10:00:00+00',
    '2026-01-25 09:00:00+00',
    '2026-01-25 09:00:00+00',
    '2026-01-25 09:00:00+00'
  ),

  -- Doctor: Pieter Jansen (invited by owner)
  (
    '10000000-0000-0000-0011-000000000004',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000004',
    'doctor',
    true,
    '10000000-0000-0000-0001-000000000001',
    '2026-01-22 10:00:00+00',
    '2026-01-25 09:30:00+00',
    '2026-01-25 09:30:00+00',
    '2026-01-25 09:30:00+00'
  ),

  -- Receptionist: Emma Bakker (invited by admin)
  (
    '10000000-0000-0000-0011-000000000005',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000005',
    'receptionist',
    true,
    '10000000-0000-0000-0001-000000000002',
    '2026-01-29 09:00:00+00',
    '2026-02-01 08:00:00+00',
    '2026-02-01 08:00:00+00',
    '2026-02-01 08:00:00+00'
  ),

  -- =========================================================================
  -- Medisyn Amsterdam — Patient Members
  -- =========================================================================

  -- Lucas van den Berg
  (
    '10000000-0000-0000-0011-000000000006',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000001',
    'patient',
    true,
    NULL,
    NULL,
    '2026-02-10 10:15:00+00',
    '2026-02-10 10:15:00+00',
    '2026-02-10 10:15:00+00'
  ),

  -- Maria de Boer
  (
    '10000000-0000-0000-0011-000000000007',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000002',
    'patient',
    true,
    NULL,
    NULL,
    '2026-02-15 11:00:00+00',
    '2026-02-15 11:00:00+00',
    '2026-02-15 11:00:00+00'
  ),

  -- Adam Smit
  (
    '10000000-0000-0000-0011-000000000008',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000003',
    'patient',
    true,
    NULL,
    NULL,
    '2026-03-01 09:30:00+00',
    '2026-03-01 09:30:00+00',
    '2026-03-01 09:30:00+00'
  ),

  -- Rosa Willems
  (
    '10000000-0000-0000-0011-000000000009',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000004',
    'patient',
    true,
    NULL,
    NULL,
    '2026-03-10 14:00:00+00',
    '2026-03-10 14:00:00+00',
    '2026-03-10 14:00:00+00'
  ),

  -- =========================================================================
  -- BerlinMed Zentrum — Staff Members
  -- =========================================================================

  -- Owner: Klaus Weber (self-registered)
  (
    '20000000-0000-0000-0011-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000001',
    'clinic_owner',
    true,
    NULL,
    NULL,
    '2026-02-10 07:05:00+00',
    '2026-02-10 07:05:00+00',
    '2026-02-10 07:05:00+00'
  ),

  -- Admin: Lena Hoffmann (invited by owner)
  (
    '20000000-0000-0000-0011-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000002',
    'clinic_admin',
    true,
    '20000000-0000-0000-0001-000000000001',
    '2026-02-12 09:00:00+00',
    '2026-02-15 08:00:00+00',
    '2026-02-15 08:00:00+00',
    '2026-02-15 08:00:00+00'
  ),

  -- Doctor: Hans Schmidt (invited by owner)
  (
    '20000000-0000-0000-0011-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000003',
    'doctor',
    true,
    '20000000-0000-0000-0001-000000000001',
    '2026-02-17 10:00:00+00',
    '2026-02-20 08:00:00+00',
    '2026-02-20 08:00:00+00',
    '2026-02-20 08:00:00+00'
  ),

  -- Receptionist: Maria Fischer (invited by admin)
  (
    '20000000-0000-0000-0011-000000000004',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000004',
    'receptionist',
    true,
    '20000000-0000-0000-0001-000000000002',
    '2026-02-26 09:00:00+00',
    '2026-03-01 08:00:00+00',
    '2026-03-01 08:00:00+00',
    '2026-03-01 08:00:00+00'
  ),

  -- =========================================================================
  -- BerlinMed Zentrum — Patient Members
  -- =========================================================================

  -- Friedrich Maier
  (
    '20000000-0000-0000-0011-000000000005',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000001',
    'patient',
    true,
    NULL,
    NULL,
    '2026-03-05 10:00:00+00',
    '2026-03-05 10:00:00+00',
    '2026-03-05 10:00:00+00'
  ),

  -- Helga Bauer
  (
    '20000000-0000-0000-0011-000000000006',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000002',
    'patient',
    true,
    NULL,
    NULL,
    '2026-03-12 09:00:00+00',
    '2026-03-12 09:00:00+00',
    '2026-03-12 09:00:00+00'
  ),

  -- Kai Lehmann
  (
    '20000000-0000-0000-0011-000000000007',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000003',
    'patient',
    true,
    NULL,
    NULL,
    '2026-04-01 11:00:00+00',
    '2026-04-01 11:00:00+00',
    '2026-04-01 11:00:00+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 4: DOCTORS
-- =============================================================================
-- Professional records (not Special Category data — lawful basis: CONTRACT).
-- Linked to auth users via user_id; availability_schedule uses JSONB format:
-- { "day": [{"start": "HH:MM", "end": "HH:MM"}, ...], ... }
--
-- UUID allocation:
--   10000000-0000-0000-0003-xxxxxxxxxxxx  Amsterdam doctor records
--   20000000-0000-0000-0003-xxxxxxxxxxxx  Berlin doctor records
-- =============================================================================

INSERT INTO public.doctors (
  id,
  clinic_id,
  user_id,
  title,
  first_name,
  last_name,
  license_number,
  license_country,
  specialty,
  sub_specialty,
  professional_email,
  professional_phone,
  availability_schedule,
  default_appointment_duration_minutes,
  max_patients_per_day,
  is_active,
  is_accepting_new_patients,
  created_at,
  updated_at
)
VALUES

  -- Dr. Anna Muller — General Practice, Medisyn Amsterdam
  -- Schedule: Mon–Fri mornings + Mon–Thu afternoons (30-min slots, max 20/day)
  (
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000003',
    'Dr.',
    'Anna',
    'Muller',
    'NL-GP-2018-00123',
    'NL',
    'General Practice',
    'Preventive Medicine',
    'a.muller@medisyn-amsterdam.nl',
    '+31 20 555 0110',
    '{
      "monday":    [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "tuesday":   [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "wednesday": [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "thursday":  [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "friday":    [{"start": "09:00", "end": "13:00"}],
      "saturday":  [],
      "sunday":    []
    }'::jsonb,
    30,
    20,
    true,
    true,
    '2026-01-25 09:00:00+00',
    '2026-01-25 09:00:00+00'
  ),

  -- Dr. Pieter Jansen — Cardiology, Medisyn Amsterdam
  -- Schedule: Mon/Wed/Fri mornings + Tue/Thu afternoons (45-min slots, max 12/day)
  (
    '10000000-0000-0000-0003-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000004',
    'Dr.',
    'Pieter',
    'Jansen',
    'NL-CAR-2015-00456',
    'NL',
    'Cardiology',
    'Interventional Cardiology',
    'p.jansen@medisyn-amsterdam.nl',
    '+31 20 555 0120',
    '{
      "monday":    [{"start": "09:00", "end": "13:00"}],
      "tuesday":   [{"start": "14:00", "end": "18:00"}],
      "wednesday": [{"start": "09:00", "end": "13:00"}],
      "thursday":  [{"start": "14:00", "end": "18:00"}],
      "friday":    [{"start": "09:00", "end": "13:00"}],
      "saturday":  [],
      "sunday":    []
    }'::jsonb,
    45,
    12,
    true,
    true,
    '2026-01-25 09:30:00+00',
    '2026-01-25 09:30:00+00'
  ),

  -- Prof. Dr. Hans Schmidt — Neurology, BerlinMed Zentrum
  -- Schedule: Mon–Thu full days (60-min slots, max 10/day)
  (
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000003',
    'Prof. Dr.',
    'Hans',
    'Schmidt',
    'DE-NEU-2010-00789',
    'DE',
    'Neurology',
    'Movement Disorders and Demyelinating Diseases',
    'h.schmidt@berlinmed-zentrum.de',
    '+49 30 555 0210',
    '{
      "monday":    [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "tuesday":   [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "wednesday": [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "thursday":  [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}],
      "friday":    [],
      "saturday":  [],
      "sunday":    []
    }'::jsonb,
    60,
    10,
    true,
    true,
    '2026-02-20 08:00:00+00',
    '2026-02-20 08:00:00+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 5: APPOINTMENT TYPES
-- =============================================================================
-- Clinic-specific appointment catalog. Prices stored as integer euro-cents.
-- color values must match '^#[0-9A-Fa-f]{6}$'.
--
-- UUID allocation:
--   10000000-0000-0000-0005-xxxxxxxxxxxx  Amsterdam appointment types
--   20000000-0000-0000-0005-xxxxxxxxxxxx  Berlin appointment types
-- =============================================================================

INSERT INTO public.appointment_types (
  id,
  clinic_id,
  name,
  description,
  color,
  duration_minutes,
  buffer_before_minutes,
  buffer_after_minutes,
  price_cents,
  currency_code,
  is_active,
  is_online_bookable,
  created_at,
  updated_at
)
VALUES

  -- =========================================================================
  -- Medisyn Amsterdam — Appointment Types (6 types)
  -- =========================================================================

  (
    '10000000-0000-0000-0005-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'General Consultation',
    'Standard GP consultation for acute and chronic conditions (30 min).',
    '#3B82F6',
    30, 0, 5,
    4500, 'EUR',
    true, true,
    '2026-01-25 10:00:00+00', '2026-01-25 10:00:00+00'
  ),

  (
    '10000000-0000-0000-0005-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Follow-up Consultation',
    'Brief follow-up for existing patients to review treatment progress (20 min).',
    '#10B981',
    20, 0, 5,
    3000, 'EUR',
    true, true,
    '2026-01-25 10:00:00+00', '2026-01-25 10:00:00+00'
  ),

  (
    '10000000-0000-0000-0005-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'New Patient Assessment',
    'Comprehensive initial intake for new patients, including full medical history review (60 min).',
    '#8B5CF6',
    60, 5, 10,
    9000, 'EUR',
    true, true,
    '2026-01-25 10:00:00+00', '2026-01-25 10:00:00+00'
  ),

  (
    '10000000-0000-0000-0005-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'Cardiology Assessment',
    'Full cardiac evaluation including clinical examination and cardiovascular risk assessment (45 min).',
    '#EF4444',
    45, 5, 10,
    12000, 'EUR',
    true, true,
    '2026-01-25 10:00:00+00', '2026-01-25 10:00:00+00'
  ),

  (
    '10000000-0000-0000-0005-000000000005',
    '10000000-0000-0000-0000-000000000001',
    'Cardiology Follow-up',
    'Follow-up appointment to review cardiac test results and adjust treatment plans (30 min).',
    '#F97316',
    30, 0, 5,
    8000, 'EUR',
    true, true,
    '2026-01-25 10:00:00+00', '2026-01-25 10:00:00+00'
  ),

  (
    '10000000-0000-0000-0005-000000000006',
    '10000000-0000-0000-0000-000000000001',
    'ECG and Heart Check',
    '12-lead ECG with interpretation and comprehensive cardiovascular assessment (60 min). In-clinic only.',
    '#DC2626',
    60, 5, 10,
    15000, 'EUR',
    true, false,
    '2026-01-25 10:00:00+00', '2026-01-25 10:00:00+00'
  ),

  -- =========================================================================
  -- BerlinMed Zentrum — Appointment Types (4 types)
  -- =========================================================================

  (
    '20000000-0000-0000-0005-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Neurological Assessment',
    'Comprehensive neurological evaluation including clinical examination and cognitive screening (60 min).',
    '#6366F1',
    60, 5, 10,
    15000, 'EUR',
    true, true,
    '2026-02-20 09:00:00+00', '2026-02-20 09:00:00+00'
  ),

  (
    '20000000-0000-0000-0005-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Neurology Follow-up',
    'Follow-up to assess neurological treatment progress and adjust therapy (45 min).',
    '#7C3AED',
    45, 0, 5,
    10000, 'EUR',
    true, true,
    '2026-02-20 09:00:00+00', '2026-02-20 09:00:00+00'
  ),

  (
    '20000000-0000-0000-0005-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'Urgent Neurology Consultation',
    'Priority slot for urgent neurological symptoms requiring prompt evaluation (30 min). In-clinic only.',
    '#DC2626',
    30, 0, 0,
    18000, 'EUR',
    true, false,
    '2026-02-20 09:00:00+00', '2026-02-20 09:00:00+00'
  ),

  (
    '20000000-0000-0000-0005-000000000004',
    '20000000-0000-0000-0000-000000000001',
    'EEG Consultation',
    'Electroencephalogram procedure with neurological consultation and written report (90 min). In-clinic only.',
    '#0EA5E9',
    90, 10, 15,
    25000, 'EUR',
    true, false,
    '2026-02-20 09:00:00+00', '2026-02-20 09:00:00+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 6: PATIENTS (PSEUDONYMIZED — SPECIAL CATEGORY DATA)
-- =============================================================================
-- GDPR Article 9: Health data requires explicit consent (Article 9(2)(a)) or
-- healthcare provision basis (Article 9(2)(h)). RLS is the primary isolation
-- mechanism; all records are scoped to their clinic via clinic_id.
--
-- Pseudonymization applied:
--   - Names are realistic but entirely fictional (no real individuals).
--   - national_id is NULL — requires application-layer encryption before storage.
--   - insurance_policy_number uses a TEST prefix format.
--   - Emergency contact data is fictional.
--   - data_retention_until = 10 years from registration (EU medical record law).
--
-- UUID allocation:
--   10000000-0000-0000-0004-xxxxxxxxxxxx  Amsterdam patient records
--   20000000-0000-0000-0004-xxxxxxxxxxxx  Berlin patient records
-- =============================================================================

INSERT INTO public.patients (
  id,
  clinic_id,
  user_id,
  first_name,
  last_name,
  date_of_birth,
  gender,
  national_id,
  email,
  phone,
  address_line1,
  city,
  postal_code,
  country_code,
  emergency_contact_name,
  emergency_contact_phone,
  clinical_notes,
  insurance_provider,
  insurance_policy_number,
  gdpr_consent_given_at,
  gdpr_consent_version,
  data_retention_until,
  created_at,
  updated_at
)
VALUES

  -- =========================================================================
  -- Medisyn Amsterdam — Patient Records
  -- =========================================================================

  -- Patient 1: Lucas van den Berg
  -- Primary condition: hypertension (managed); GP patient
  (
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000001',
    'Lucas',
    'van den Berg',
    '1985-03-22',
    'male',
    NULL,
    'l.vandenberg@patient.example.nl',
    '+31 6 1234 5001',
    'Prinsengracht 156',
    'Amsterdam',
    '1016 HR',
    'NL',
    'Sophie van den Berg',
    '+31 6 9876 5001',
    'Essential hypertension (I10). On Amlodipine 5mg OD. No known drug allergies. Non-smoker.',
    'CZ Zorgverzekeringen',
    'TEST-CZ-NL-000001',
    '2026-02-10 10:15:00+00',
    'v1.0.0',
    '2036-02-10',
    '2026-02-10 10:15:00+00',
    '2026-02-10 10:15:00+00'
  ),

  -- Patient 2: Maria de Boer
  -- Primary condition: coronary artery disease, angina; cardiology patient
  (
    '10000000-0000-0000-0004-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000002',
    'Maria',
    'de Boer',
    '1972-07-15',
    'female',
    NULL,
    'm.deboer@patient.example.nl',
    '+31 6 1234 5002',
    'Herengracht 212',
    'Amsterdam',
    '1016 BT',
    'NL',
    'Jan de Boer',
    '+31 6 9876 5002',
    'Atherosclerotic coronary artery disease (I25.1). Exertional angina (I20.9). '
    'On aspirin 100mg OD and atorvastatin 40mg nocte. Allergic to penicillin (document in prescriptions).',
    'Zilveren Kruis',
    'TEST-ZK-NL-000002',
    '2026-02-15 11:00:00+00',
    'v1.0.0',
    '2036-02-15',
    '2026-02-15 11:00:00+00',
    '2026-02-15 11:00:00+00'
  ),

  -- Patient 3: Adam Smit
  -- Primary condition: seasonal allergic rhinitis; GP patient
  (
    '10000000-0000-0000-0004-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000003',
    'Adam',
    'Smit',
    '1990-11-08',
    'male',
    NULL,
    'a.smit@patient.example.nl',
    '+31 6 1234 5003',
    'Jordaan 88',
    'Amsterdam',
    '1015 BD',
    'NL',
    'Lisa Smit',
    '+31 6 9876 5003',
    'Seasonal allergic rhinitis (J30.1). No chronic conditions. BMI 23.1. Non-smoker. Occasional alcohol.',
    'VGZ Zorgverzekeraar',
    'TEST-VGZ-NL-000003',
    '2026-03-01 09:30:00+00',
    'v1.0.0',
    '2036-03-01',
    '2026-03-01 09:30:00+00',
    '2026-03-01 09:30:00+00'
  ),

  -- Patient 4: Rosa Willems
  -- Primary condition: atrial fibrillation, hypertension; cardiology patient
  (
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000004',
    'Rosa',
    'Willems',
    '1965-04-30',
    'female',
    NULL,
    'r.willems@patient.example.nl',
    '+31 6 1234 5004',
    'Vondelstraat 34',
    'Amsterdam',
    '1054 GE',
    'NL',
    'Kees Willems',
    '+31 6 9876 5004',
    'Atrial fibrillation (I48.0) — rate controlled. On rivaroxaban 20mg OD (CHA2DS2-VASc: 3). '
    'Mild essential hypertension (I10). Lumbar sciatica (M54.4) — physiotherapy referral issued Apr 2026.',
    'Menzis Zorgverzekeraar',
    'TEST-MZ-NL-000004',
    '2026-03-10 14:00:00+00',
    'v1.0.0',
    '2036-03-10',
    '2026-03-10 14:00:00+00',
    '2026-03-10 14:00:00+00'
  ),

  -- =========================================================================
  -- BerlinMed Zentrum — Patient Records
  -- =========================================================================

  -- Patient 5: Friedrich Maier
  -- Primary condition: Parkinson disease (early-stage); neurology patient
  (
    '20000000-0000-0000-0004-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000001',
    'Friedrich',
    'Maier',
    '1968-09-12',
    'male',
    NULL,
    'f.maier@patient.example.de',
    '+49 30 1234 5001',
    'Friedrichstrasse 121',
    'Berlin',
    '10117',
    'DE',
    'Helga Maier',
    '+49 30 9876 5001',
    'Idiopathic Parkinson disease (G20) — confirmed by DaTscan (Apr 2026). '
    'UPDRS-III: 22 at baseline. On levodopa/carbidopa 100/25mg TDS + ER formulation at bedtime. '
    'Physiotherapy and OT referrals active. Carer: spouse.',
    'Techniker Krankenkasse',
    'TEST-TK-DE-000001',
    '2026-03-05 10:00:00+00',
    'v1.0.0',
    '2036-03-05',
    '2026-03-05 10:00:00+00',
    '2026-03-05 10:00:00+00'
  ),

  -- Patient 6: Helga Bauer
  -- Primary condition: relapsing-remitting multiple sclerosis; neurology patient
  (
    '20000000-0000-0000-0004-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000002',
    'Helga',
    'Bauer',
    '1975-02-28',
    'female',
    NULL,
    'h.bauer@patient.example.de',
    '+49 30 1234 5002',
    'Potsdamer Platz 7',
    'Berlin',
    '10785',
    'DE',
    'Klaus Bauer',
    '+49 30 9876 5002',
    'Relapsing-remitting multiple sclerosis (G35). EDSS: 2.5. '
    '4th relapse Apr 2026 — 3 new T2 lesions on MRI. DMT escalation to natalizumab under discussion. '
    'Optic neuritis episode Apr 2026 (H46).',
    'AOK Nordost',
    'TEST-AOK-DE-000002',
    '2026-03-12 09:00:00+00',
    'v1.0.0',
    '2036-03-12',
    '2026-03-12 09:00:00+00',
    '2026-03-12 09:00:00+00'
  ),

  -- Patient 7: Kai Lehmann
  -- Primary condition: suspected epilepsy — under diagnostic evaluation
  (
    '20000000-0000-0000-0004-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000003',
    'Kai',
    'Lehmann',
    '1988-06-05',
    'male',
    NULL,
    'k.lehmann@patient.example.de',
    '+49 30 1234 5003',
    'Hackescher Markt 5',
    'Berlin',
    '10178',
    'DE',
    'Petra Lehmann',
    '+49 30 9876 5003',
    'Suspected epilepsy — under diagnostic evaluation. GP-referred after witnessed tonic-clonic episode. '
    'EEG and full neurological assessment pending (rescheduled from May 2026 after acute episode). '
    'Currently no antiepileptic medication. Driving licence suspended per legal requirement.',
    'BARMER',
    'TEST-BRM-DE-000003',
    '2026-04-01 11:00:00+00',
    'v1.0.0',
    '2036-04-01',
    '2026-04-01 11:00:00+00',
    '2026-04-01 11:00:00+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 7: APPOINTMENTS
-- =============================================================================
-- 21 appointments across 3 doctors and 7 patients, covering all statuses:
--   completed (7), confirmed (4), pending (4), cancelled (2), no_show (1)
--
-- IMPORTANT: 'ends_at' is a GENERATED ALWAYS AS column and must NOT be
-- included in INSERT statements. It is auto-computed by the database as:
--   scheduled_at + (duration_minutes * interval '1 minute')
--
-- Timestamps use CEST (Central European Summer Time = UTC+02:00), valid
-- from 29 March through 26 October 2026 for both NL and DE.
--
-- Double-booking guard: the partial unique index
--   idx_appointments_no_double_booking ON (doctor_id, scheduled_at)
--   WHERE deleted_at IS NULL AND status NOT IN ('cancelled','no_show','rescheduled')
-- ensures no two active appointments share the same doctor slot. All active
-- appointments below use distinct (doctor_id, scheduled_at) combinations.
--
-- UUID allocation:
--   10000000-0000-0000-0006-xxxxxxxxxxxx  Dr. Muller appointments (Amsterdam)
--   10000000-0000-0000-0007-xxxxxxxxxxxx  Dr. Jansen appointments (Amsterdam)
--   20000000-0000-0000-0006-xxxxxxxxxxxx  Prof. Schmidt appointments (Berlin)
-- =============================================================================

INSERT INTO public.appointments (
  id,
  clinic_id,
  patient_id,
  doctor_id,
  appointment_type_id,
  scheduled_at,
  duration_minutes,
  status,
  cancellation_reason,
  cancellation_by,
  cancelled_at,
  chief_complaint,
  clinical_notes,
  diagnosis_codes,
  prescription_notes,
  follow_up_required,
  follow_up_notes,
  booked_via,
  booked_by,
  data_retention_until,
  created_at,
  updated_at
)
VALUES

  -- ==========================================================================
  -- Dr. Anna Muller (General Practice) — Medisyn Amsterdam
  -- doctor_id: 10000000-0000-0000-0003-000000000001
  -- ==========================================================================

  -- [COMPLETED] Lucas — annual general consultation (2026-04-15 09:00 CEST)
  (
    '10000000-0000-0000-0006-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000001',
    '2026-04-15 09:00:00+02:00',
    30,
    'completed',
    NULL, NULL, NULL,
    'Routine annual check-up. Elevated blood pressure recorded at home over past 3 weeks.',
    'Patient presents with home BP readings averaging 148/92 mmHg. No end-organ damage detected. '
    'Current Amlodipine 2.5mg felt insufficient. Lifestyle modifications reinforced (low-sodium diet, '
    'daily walking). Dosage up-titrated.',
    ARRAY['I10'],
    'Increase Amlodipine to 5mg once daily. Home BP diary requested. '
    'Annual blood panel ordered (FBC, U&E, lipids, HbA1c).',
    true,
    'BP review in 6 weeks; review blood panel results.',
    'dashboard',
    '10000000-0000-0000-0001-000000000005',
    '2036-04-15',
    '2026-04-14 09:30:00+00',
    '2026-04-15 11:05:00+00'
  ),

  -- [COMPLETED] Adam — new patient assessment (2026-04-15 10:00 CEST)
  (
    '10000000-0000-0000-0006-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000003',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000003',
    '2026-04-15 10:00:00+02:00',
    60,
    'completed',
    NULL, NULL, NULL,
    'New patient registration. Seasonal allergies. General health overview requested.',
    'New patient — generally healthy 35-year-old male. Seasonal allergic rhinitis confirmed (Mar–Jun). '
    'No significant PMH, no regular medication. Vaccination records reviewed and up to date. '
    'BMI 23.1 — within normal range. BP 118/74. Advised annual GP review.',
    ARRAY['J30.1'],
    'Cetirizine 10mg once daily during pollen season (March–June). '
    'Nasal saline rinse twice daily as adjunct.',
    false,
    NULL,
    'online',
    '10000000-0000-0000-0002-000000000003',
    '2036-04-15',
    '2026-04-10 14:20:00+00',
    '2026-04-15 12:15:00+00'
  ),

  -- [COMPLETED] Rosa — lower back pain / sciatica (2026-04-22 09:00 CEST)
  (
    '10000000-0000-0000-0006-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000001',
    '2026-04-22 09:00:00+02:00',
    30,
    'completed',
    NULL, NULL, NULL,
    'Worsening lower back pain radiating to the left leg. Onset 3 weeks ago. Aggravated by sitting.',
    'Clinical examination confirms lumbar radiculopathy with left-sided L5/S1 distribution. '
    'SLR positive at 45° on left. No red flags (no bowel/bladder symptoms, no saddle anaesthesia). '
    'Physiotherapy referral issued. Patient advised to continue walking and avoid bed rest.',
    ARRAY['M54.4'],
    'Ibuprofen 400mg three times daily with food (max 10 days — given existing anticoagulation, '
    'use with caution; patient reminded). Physiotherapy referral letter issued.',
    true,
    'Review physiotherapy progress in 4 weeks.',
    'phone',
    '10000000-0000-0000-0001-000000000005',
    '2036-04-22',
    '2026-04-20 11:00:00+00',
    '2026-04-22 10:05:00+00'
  ),

  -- [COMPLETED] Lucas — BP follow-up after dose adjustment (2026-05-06 09:00 CEST)
  (
    '10000000-0000-0000-0006-000000000004',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000002',
    '2026-05-06 09:00:00+02:00',
    20,
    'completed',
    NULL, NULL, NULL,
    'Blood pressure review following Amlodipine up-titration.',
    'Home BP diary reviewed: average now 132/84 mmHg — significant improvement. '
    'Patient reports no side effects from Amlodipine 5mg. Ankle oedema: absent. '
    'Blood panel results reviewed: lipids mildly elevated (LDL 3.4 mmol/L). '
    'Lifestyle advice reinforced.',
    ARRAY['I10'],
    'Continue Amlodipine 5mg once daily. Next formal BP review in 3 months. '
    'Dietary referral for lipid management offered.',
    false,
    NULL,
    'online',
    '10000000-0000-0000-0002-000000000001',
    '2036-05-06',
    '2026-05-01 14:22:00+00',
    '2026-05-06 10:02:00+00'
  ),

  -- [CANCELLED] Adam — general consultation cancelled by patient (2026-05-13 10:00 CEST)
  (
    '10000000-0000-0000-0006-000000000005',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000003',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000001',
    '2026-05-13 10:00:00+02:00',
    30,
    'cancelled',
    'Patient travelling for work. Rescheduled for next available slot.',
    '10000000-0000-0000-0002-000000000003',
    '2026-05-11 16:30:00+00',
    'Seasonal allergy review and general health check.',
    NULL, NULL, NULL,
    false,
    NULL,
    'online',
    '10000000-0000-0000-0002-000000000003',
    '2036-05-13',
    '2026-05-08 09:00:00+00',
    '2026-05-11 16:30:00+00'
  ),

  -- [CONFIRMED] Lucas — upcoming BP and blood panel review (2026-05-20 09:00 CEST)
  (
    '10000000-0000-0000-0006-000000000006',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000002',
    '2026-05-20 09:00:00+02:00',
    20,
    'confirmed',
    NULL, NULL, NULL,
    'Blood pressure monitoring and lipid panel discussion.',
    NULL, NULL, NULL,
    false,
    NULL,
    'online',
    '10000000-0000-0000-0002-000000000001',
    '2036-05-20',
    '2026-05-06 10:05:00+00',
    '2026-05-06 10:05:00+00'
  ),

  -- [PENDING] Rosa — physiotherapy review (2026-05-27 10:30 CEST)
  (
    '10000000-0000-0000-0006-000000000007',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000001',
    '2026-05-27 10:30:00+02:00',
    30,
    'pending',
    NULL, NULL, NULL,
    'Physiotherapy progress review and lower back pain reassessment.',
    NULL, NULL, NULL,
    false,
    NULL,
    'online',
    '10000000-0000-0000-0002-000000000004',
    '2036-05-27',
    '2026-05-16 11:00:00+00',
    '2026-05-16 11:00:00+00'
  ),

  -- [PENDING] Adam — rescheduled allergy and summer check-up (2026-06-03 09:00 CEST)
  (
    '10000000-0000-0000-0006-000000000008',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000003',
    '10000000-0000-0000-0003-000000000001',
    '10000000-0000-0000-0005-000000000001',
    '2026-06-03 09:00:00+02:00',
    30,
    'pending',
    NULL, NULL, NULL,
    'Seasonal allergy review and general summer health check (rescheduled).',
    NULL, NULL, NULL,
    false,
    NULL,
    'online',
    '10000000-0000-0000-0002-000000000003',
    '2036-06-03',
    '2026-05-11 16:35:00+00',
    '2026-05-11 16:35:00+00'
  ),

  -- ==========================================================================
  -- Dr. Pieter Jansen (Cardiology) — Medisyn Amsterdam
  -- doctor_id: 10000000-0000-0000-0003-000000000002
  -- ==========================================================================

  -- [COMPLETED] Maria — initial cardiology assessment (2026-04-08 09:00 CEST)
  (
    '10000000-0000-0000-0007-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000002',
    '10000000-0000-0000-0003-000000000002',
    '10000000-0000-0000-0005-000000000004',
    '2026-04-08 09:00:00+02:00',
    45,
    'completed',
    NULL, NULL, NULL,
    'GP-referred for recurrent chest tightness on exertion, present for 8 weeks.',
    'Exertional angina symptoms confirmed. Resting ECG: minor ST-segment flattening in V4-V6. '
    'Risk stratification: intermediate (GRACE score 112). '
    'Stress echocardiogram ordered. Aspirin and statin continued. '
    'Patient counselled on symptom recognition and when to call emergency services.',
    ARRAY['I25.1', 'I20.9'],
    'Continue aspirin 100mg daily. Atorvastatin 40mg at night continued. '
    'Stress echocardiogram arranged — expect results within 3 weeks.',
    true,
    'Review stress echo results; consider angiography if ischaemia confirmed.',
    'phone',
    '10000000-0000-0000-0001-000000000005',
    '2036-04-08',
    '2026-04-05 11:00:00+00',
    '2026-04-08 10:55:00+00'
  ),

  -- [NO_SHOW] Lucas — cardiology appointment, did not attend (2026-04-08 10:30 CEST)
  -- Note: no_show is excluded from unique index, so coexists with active Maria slot at 09:00
  (
    '10000000-0000-0000-0007-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0003-000000000002',
    '10000000-0000-0000-0005-000000000004',
    '2026-04-08 10:30:00+02:00',
    45,
    'no_show',
    NULL, NULL, NULL,
    'Referred by GP for cardiac evaluation due to newly diagnosed hypertension.',
    NULL, NULL, NULL,
    false,
    NULL,
    'dashboard',
    '10000000-0000-0000-0001-000000000005',
    '2036-04-08',
    '2026-04-04 14:00:00+00',
    '2026-04-08 12:00:00+00'
  ),

  -- [COMPLETED] Rosa — cardiology: AF management review (2026-04-29 14:00 CEST)
  (
    '10000000-0000-0000-0007-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0003-000000000002',
    '10000000-0000-0000-0005-000000000004',
    '2026-04-29 14:00:00+02:00',
    45,
    'completed',
    NULL, NULL, NULL,
    'Atrial fibrillation management review and anticoagulation assessment.',
    'Stable AF on rivaroxaban 20mg with evening meal. Heart rate well-controlled (resting avg 72 bpm). '
    'No thromboembolic events reported. CHA2DS2-VASc score: 3 — anticoagulation appropriate. '
    '24-hour Holter monitor arranged to assess rhythm and rate over daily activities.',
    ARRAY['I48.0'],
    'Continue rivaroxaban 20mg OD with evening meal. '
    'Holter monitor fitted — patient instructed to return device after 24 hours.',
    true,
    'Review Holter results. Assess rhythm control vs rate control strategy.',
    'dashboard',
    '10000000-0000-0000-0001-000000000005',
    '2036-04-29',
    '2026-04-25 10:00:00+00',
    '2026-04-29 15:55:00+00'
  ),

  -- [COMPLETED] Maria — cardiology follow-up: stress echo results (2026-05-12 09:00 CEST)
  (
    '10000000-0000-0000-0007-000000000004',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000002',
    '10000000-0000-0000-0003-000000000002',
    '10000000-0000-0000-0005-000000000005',
    '2026-05-12 09:00:00+02:00',
    30,
    'completed',
    NULL, NULL, NULL,
    'Stress echocardiogram results review.',
    'Stress echo demonstrates moderate inducible ischaemia in the LAD territory at submaximal exercise. '
    'Multidisciplinary cardiology team has reviewed — coronary angiography recommended. '
    'Patient fully informed of risks, benefits and alternatives. Written consent obtained. '
    'Bisoprolol added to reduce myocardial oxygen demand pending intervention.',
    ARRAY['I25.1', 'I20.0'],
    'Add bisoprolol 2.5mg once daily with morning meal. '
    'Glyceryl trinitrate 400mcg sublingual spray — prescribed for symptom relief. '
    'Referral to interventional cardiology for coronary angiography.',
    true,
    'Angiography to be scheduled within 4 weeks. Post-procedure review.',
    'dashboard',
    '10000000-0000-0000-0001-000000000005',
    '2036-05-12',
    '2026-05-10 09:00:00+00',
    '2026-05-12 10:05:00+00'
  ),

  -- [CONFIRMED] Rosa — cardiology: Holter results review (2026-05-19 14:00 CEST)
  (
    '10000000-0000-0000-0007-000000000005',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0003-000000000002',
    '10000000-0000-0000-0005-000000000005',
    '2026-05-19 14:00:00+02:00',
    30,
    'confirmed',
    NULL, NULL, NULL,
    'Holter monitor results review and rhythm control strategy discussion.',
    NULL, NULL, NULL,
    false,
    NULL,
    'dashboard',
    '10000000-0000-0000-0001-000000000005',
    '2036-05-19',
    '2026-04-29 16:00:00+00',
    '2026-04-29 16:00:00+00'
  ),

  -- [CONFIRMED] Maria — ECG and heart check (pre-angiography) (2026-06-02 09:00 CEST)
  (
    '10000000-0000-0000-0007-000000000006',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0004-000000000002',
    '10000000-0000-0000-0003-000000000002',
    '10000000-0000-0000-0005-000000000006',
    '2026-06-02 09:00:00+02:00',
    60,
    'confirmed',
    NULL, NULL, NULL,
    'Pre-angiography ECG and baseline cardiovascular assessment.',
    NULL, NULL, NULL,
    false,
    NULL,
    'dashboard',
    '10000000-0000-0000-0001-000000000005',
    '2036-06-02',
    '2026-05-12 10:10:00+00',
    '2026-05-12 10:10:00+00'
  ),

  -- ==========================================================================
  -- Prof. Dr. Hans Schmidt (Neurology) — BerlinMed Zentrum
  -- doctor_id: 20000000-0000-0000-0003-000000000001
  -- ==========================================================================

  -- [COMPLETED] Friedrich — initial assessment: Parkinson workup (2026-04-10 09:00 CEST)
  (
    '20000000-0000-0000-0006-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0004-000000000001',
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0005-000000000001',
    '2026-04-10 09:00:00+02:00',
    60,
    'completed',
    NULL, NULL, NULL,
    'GP referral for tremor, shuffling gait, and hypomimia — suspected Parkinson disease.',
    'UPDRS-III score at baseline: 22 (mild-moderate). Bradykinesia and resting pill-rolling tremor '
    'confirmed bilaterally, right > left. Hypomimia and reduced arm swing on right. '
    'DaTscan ordered to confirm dopaminergic deficit. Levodopa initiated at low dose. '
    'Physiotherapy, occupational therapy, and speech and language therapy referrals issued. '
    'Carer (spouse) included in consultation. Support group information provided.',
    ARRAY['G20'],
    'Levodopa/carbidopa 100/25mg three times daily with meals (low-dose initiation). '
    'Physiotherapy referral. Follow-up in 6 weeks to review DaTscan and medication tolerance.',
    true,
    'Review DaTscan result. Assess levodopa response and monitor for dyskinesias.',
    'phone',
    '20000000-0000-0000-0001-000000000004',
    '2036-04-10',
    '2026-04-08 09:00:00+00',
    '2026-04-10 10:30:00+00'
  ),

  -- [COMPLETED] Helga — initial assessment: MS relapse (2026-04-24 10:00 CEST)
  (
    '20000000-0000-0000-0006-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0004-000000000002',
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0005-000000000001',
    '2026-04-24 10:00:00+02:00',
    60,
    'completed',
    NULL, NULL, NULL,
    'Relapse episode — new onset right arm weakness and visual disturbance over 5 days.',
    'Fourth clinical relapse in 3 years. Current EDSS: 2.5 (minimal disability). '
    'MRI brain with contrast: 3 new T2/FLAIR lesions compared to baseline (2 periventricular, '
    '1 juxtacortical). Optic neuritis — right eye reduced acuity 6/18. '
    'Current DMT (dimethyl fumarate) deemed insufficient — escalation to high-efficacy therapy discussed. '
    'Natalizumab proposed: patient counselled on JC virus risks; serology requested.',
    ARRAY['G35', 'H46'],
    'IV methylprednisolone 1g daily for 3 days (acute relapse treatment). '
    'JC virus antibody serology requested. DMT escalation to natalizumab pending JC result and consent.',
    true,
    'Review MRI with radiologist. Confirm JC serology. Finalise DMT escalation decision.',
    'dashboard',
    '20000000-0000-0000-0001-000000000004',
    '2036-04-24',
    '2026-04-22 10:00:00+00',
    '2026-04-24 11:45:00+00'
  ),

  -- [COMPLETED] Friedrich — neurology follow-up: DaTscan result (2026-05-08 09:00 CEST)
  (
    '20000000-0000-0000-0006-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0004-000000000001',
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0005-000000000002',
    '2026-05-08 09:00:00+02:00',
    45,
    'completed',
    NULL, NULL, NULL,
    'DaTscan results review and levodopa therapy assessment.',
    'DaTscan confirms dopaminergic deficit in bilateral putamen, right > left — consistent with '
    'idiopathic Parkinson disease. Diagnosis confirmed. '
    'Patient tolerating levodopa/carbidopa TDS well. Wearing-off phenomenon noted in the late afternoon. '
    'Extended-release formulation added at bedtime to provide overnight coverage.',
    ARRAY['G20'],
    'Add levodopa/carbidopa ER 100/25mg at bedtime to address wearing-off phenomenon. '
    'Continue existing TDS dosing. Motor diary given to patient to complete over next 8 weeks.',
    true,
    'Motor diary review in 8 weeks. Discuss deep brain stimulation candidacy criteria.',
    'online',
    '20000000-0000-0000-0002-000000000001',
    '2036-05-08',
    '2026-05-05 12:00:00+00',
    '2026-05-08 10:20:00+00'
  ),

  -- [CANCELLED] Kai — initial assessment cancelled due to acute episode (2026-05-14 10:00 CEST)
  (
    '20000000-0000-0000-0006-000000000004',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0004-000000000003',
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0005-000000000001',
    '2026-05-14 10:00:00+02:00',
    60,
    'cancelled',
    'Patient experiencing acute neurological symptoms on the appointment day. '
    'Redirected to the emergency department by GP on-call. New appointment rescheduled.',
    '20000000-0000-0000-0002-000000000003',
    '2026-05-14 07:45:00+00',
    'GP-referred for first suspected epileptic seizure evaluation.',
    NULL, NULL, NULL,
    false,
    NULL,
    'phone',
    '20000000-0000-0000-0001-000000000004',
    '2036-05-14',
    '2026-04-30 11:00:00+00',
    '2026-05-14 07:45:00+00'
  ),

  -- [CONFIRMED] Friedrich — neurology follow-up: motor diary review (2026-05-21 09:00 CEST)
  (
    '20000000-0000-0000-0006-000000000005',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0004-000000000001',
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0005-000000000002',
    '2026-05-21 09:00:00+02:00',
    45,
    'confirmed',
    NULL, NULL, NULL,
    'Motor diary review and extended-release levodopa assessment.',
    NULL, NULL, NULL,
    false,
    NULL,
    'online',
    '20000000-0000-0000-0002-000000000001',
    '2036-05-21',
    '2026-05-08 10:25:00+00',
    '2026-05-08 10:25:00+00'
  ),

  -- [PENDING] Helga — neurology follow-up: MRI review and DMT decision (2026-05-28 10:00 CEST)
  (
    '20000000-0000-0000-0006-000000000006',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0004-000000000002',
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0005-000000000002',
    '2026-05-28 10:00:00+02:00',
    45,
    'pending',
    NULL, NULL, NULL,
    'MRI results review and finalise DMT escalation decision.',
    NULL, NULL, NULL,
    false,
    NULL,
    'dashboard',
    '20000000-0000-0000-0001-000000000004',
    '2036-05-28',
    '2026-04-24 11:50:00+00',
    '2026-04-24 11:50:00+00'
  ),

  -- [PENDING] Kai — EEG and full assessment (rescheduled) (2026-06-04 09:00 CEST)
  (
    '20000000-0000-0000-0006-000000000007',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0004-000000000003',
    '20000000-0000-0000-0003-000000000001',
    '20000000-0000-0000-0005-000000000004',
    '2026-06-04 09:00:00+02:00',
    90,
    'pending',
    NULL, NULL, NULL,
    'EEG recording and comprehensive neurological assessment for suspected epilepsy (rescheduled appointment).',
    NULL, NULL, NULL,
    false,
    NULL,
    'phone',
    '20000000-0000-0000-0001-000000000004',
    '2036-06-04',
    '2026-05-14 08:00:00+00',
    '2026-05-14 08:00:00+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 8: PATIENT CONSENTS (IMMUTABLE APPEND-ONLY AUDIT TRAIL)
-- =============================================================================
-- Per GDPR Article 7(1), consent records are never updated or deleted.
-- Each row is a discrete consent event (grant or revocation).
-- The immutability rules (no_update_patient_consents, no_delete_patient_consents)
-- are enforced at the database level via PostgreSQL rules.
--
-- Consent types covered per patient:
--   data_processing       — mandatory; all patients (GDPR Art. 6(1)(a) + Art. 9(2)(a))
--   appointment_reminders — most patients granted
--   marketing             — opt-in; only Lucas (denied) to test mixed states
--   analytics             — opt-in; Maria (granted), Rosa (denied)
--   research              — opt-in; Friedrich and Helga (granted, clinical research)
--
-- UUID allocation:
--   10000000-0000-0000-0008-xxxxxxxxxxxx  Amsterdam patient consents
--   20000000-0000-0000-0008-xxxxxxxxxxxx  Berlin patient consents
-- =============================================================================

INSERT INTO public.patient_consents (
  id,
  patient_id,
  clinic_id,
  consent_type,
  is_granted,
  lawful_basis,
  consent_version,
  consent_text_snapshot,
  capture_method,
  ip_address,
  user_agent,
  consented_at,
  created_at
)
VALUES

  -- =========================================================================
  -- Lucas van den Berg (Amsterdam) — 3 consent records
  -- =========================================================================

  (
    '10000000-0000-0000-0008-000000000001',
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'data_processing',
    true,
    'consent',
    'v1.0.0',
    'I consent to Medisyn Amsterdam collecting and processing my personal and health data '
    'for the purpose of providing medical care, managing appointments, and maintaining my '
    'medical records, as described in the Privacy Policy (v1.0.0). '
    'Lawful basis: GDPR Article 6(1)(a) and Article 9(2)(a).',
    'web_form',
    '195.241.10.50',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    '2026-02-10 10:15:00+00',
    '2026-02-10 10:15:00+00'
  ),

  (
    '10000000-0000-0000-0008-000000000002',
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'appointment_reminders',
    true,
    'consent',
    'v1.0.0',
    'I consent to receive appointment reminders and relevant health notifications '
    'from Medisyn Amsterdam via email and SMS.',
    'web_form',
    '195.241.10.50',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    '2026-02-10 10:15:30+00',
    '2026-02-10 10:15:30+00'
  ),

  -- Lucas explicitly declined marketing communications
  (
    '10000000-0000-0000-0008-000000000003',
    '10000000-0000-0000-0004-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'marketing',
    false,
    'consent',
    'v1.0.0',
    'I consent to receive marketing communications about new clinic services and health tips '
    'from Medisyn Amsterdam.',
    'web_form',
    '195.241.10.50',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    '2026-02-10 10:15:45+00',
    '2026-02-10 10:15:45+00'
  ),

  -- =========================================================================
  -- Maria de Boer (Amsterdam) — 3 consent records
  -- =========================================================================

  (
    '10000000-0000-0000-0008-000000000004',
    '10000000-0000-0000-0004-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'data_processing',
    true,
    'consent',
    'v1.0.0',
    'I consent to Medisyn Amsterdam collecting and processing my personal and health data '
    'for the purpose of providing medical care, managing appointments, and maintaining my '
    'medical records, as described in the Privacy Policy (v1.0.0). '
    'Lawful basis: GDPR Article 6(1)(a) and Article 9(2)(a).',
    'web_form',
    '194.109.22.140',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
    '2026-02-15 11:00:00+00',
    '2026-02-15 11:00:00+00'
  ),

  (
    '10000000-0000-0000-0008-000000000005',
    '10000000-0000-0000-0004-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'appointment_reminders',
    true,
    'consent',
    'v1.0.0',
    'I consent to receive appointment reminders and relevant health notifications '
    'from Medisyn Amsterdam via email and SMS.',
    'web_form',
    '194.109.22.140',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
    '2026-02-15 11:00:30+00',
    '2026-02-15 11:00:30+00'
  ),

  -- Maria consented to anonymized analytics
  (
    '10000000-0000-0000-0008-000000000006',
    '10000000-0000-0000-0004-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'analytics',
    true,
    'consent',
    'v1.0.0',
    'I consent to the use of my anonymized and aggregated health data for clinic quality '
    'improvement analytics. No personally identifiable information will be shared.',
    'web_form',
    '194.109.22.140',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
    '2026-02-15 11:01:00+00',
    '2026-02-15 11:01:00+00'
  ),

  -- =========================================================================
  -- Adam Smit (Amsterdam) — 2 consent records
  -- =========================================================================

  (
    '10000000-0000-0000-0008-000000000007',
    '10000000-0000-0000-0004-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'data_processing',
    true,
    'consent',
    'v1.0.0',
    'I consent to Medisyn Amsterdam collecting and processing my personal and health data '
    'for the purpose of providing medical care, managing appointments, and maintaining my '
    'medical records, as described in the Privacy Policy (v1.0.0).',
    'web_form',
    '82.170.133.18',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15',
    '2026-03-01 09:30:00+00',
    '2026-03-01 09:30:00+00'
  ),

  (
    '10000000-0000-0000-0008-000000000008',
    '10000000-0000-0000-0004-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'appointment_reminders',
    true,
    'consent',
    'v1.0.0',
    'I consent to receive appointment reminders and relevant health notifications '
    'from Medisyn Amsterdam via email and SMS.',
    'web_form',
    '82.170.133.18',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15',
    '2026-03-01 09:30:30+00',
    '2026-03-01 09:30:30+00'
  ),

  -- =========================================================================
  -- Rosa Willems (Amsterdam) — 3 consent records (paper capture — in-clinic)
  -- =========================================================================

  (
    '10000000-0000-0000-0008-000000000009',
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'data_processing',
    true,
    'consent',
    'v1.0.0',
    'I consent to Medisyn Amsterdam collecting and processing my personal and health data '
    'for the purpose of providing medical care, managing appointments, and maintaining my '
    'medical records, as described in the Privacy Policy (v1.0.0).',
    'paper',
    NULL,
    NULL,
    '2026-03-10 14:00:00+00',
    '2026-03-10 14:00:00+00'
  ),

  (
    '10000000-0000-0000-0008-000000000010',
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'appointment_reminders',
    true,
    'consent',
    'v1.0.0',
    'I consent to receive appointment reminders from Medisyn Amsterdam via email and SMS.',
    'paper',
    NULL,
    NULL,
    '2026-03-10 14:00:30+00',
    '2026-03-10 14:00:30+00'
  ),

  -- Rosa declined analytics (paper refusal noted)
  (
    '10000000-0000-0000-0008-000000000011',
    '10000000-0000-0000-0004-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'analytics',
    false,
    'consent',
    'v1.0.0',
    'I consent to the use of my anonymized and aggregated health data for clinic quality '
    'improvement analytics. No personally identifiable information will be shared.',
    'paper',
    NULL,
    NULL,
    '2026-03-10 14:01:00+00',
    '2026-03-10 14:01:00+00'
  ),

  -- =========================================================================
  -- Friedrich Maier (Berlin) — 3 consent records
  -- =========================================================================

  (
    '20000000-0000-0000-0008-000000000001',
    '20000000-0000-0000-0004-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'data_processing',
    true,
    'consent',
    'v1.0.0',
    'I consent to BerlinMed Zentrum collecting and processing my personal and health data '
    'for the purpose of providing medical care, managing appointments, and maintaining my '
    'medical records, as described in the Privacy Policy (v1.0.0). '
    'Lawful basis: GDPR Article 6(1)(a) and Article 9(2)(a) / DSGVO Art. 9 Abs. 2 Buchst. a.',
    'web_form',
    '89.204.137.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    '2026-03-05 10:00:00+00',
    '2026-03-05 10:00:00+00'
  ),

  (
    '20000000-0000-0000-0008-000000000002',
    '20000000-0000-0000-0004-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'appointment_reminders',
    true,
    'consent',
    'v1.0.0',
    'I consent to receive appointment reminders and relevant health notifications '
    'from BerlinMed Zentrum via email and SMS.',
    'web_form',
    '89.204.137.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    '2026-03-05 10:00:30+00',
    '2026-03-05 10:00:30+00'
  ),

  -- Friedrich granted research consent (relevant for Parkinson research participation)
  (
    '20000000-0000-0000-0008-000000000003',
    '20000000-0000-0000-0004-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'research',
    true,
    'consent',
    'v1.0.0',
    'I consent to the use of my anonymized clinical data for neurological medical research, '
    'subject to ethical approval. No personally identifiable information will be shared with '
    'third-party researchers.',
    'web_form',
    '89.204.137.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    '2026-03-05 10:01:00+00',
    '2026-03-05 10:01:00+00'
  ),

  -- =========================================================================
  -- Helga Bauer (Berlin) — 3 consent records
  -- =========================================================================

  (
    '20000000-0000-0000-0008-000000000004',
    '20000000-0000-0000-0004-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'data_processing',
    true,
    'consent',
    'v1.0.0',
    'I consent to BerlinMed Zentrum collecting and processing my personal and health data '
    'for the purpose of providing medical care, managing appointments, and maintaining my '
    'medical records, as described in the Privacy Policy (v1.0.0).',
    'web_form',
    '91.65.18.200',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 Safari/605.1.15',
    '2026-03-12 09:00:00+00',
    '2026-03-12 09:00:00+00'
  ),

  (
    '20000000-0000-0000-0008-000000000005',
    '20000000-0000-0000-0004-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'appointment_reminders',
    true,
    'consent',
    'v1.0.0',
    'I consent to receive appointment reminders and relevant health notifications '
    'from BerlinMed Zentrum via email.',
    'web_form',
    '91.65.18.200',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 Safari/605.1.15',
    '2026-03-12 09:00:30+00',
    '2026-03-12 09:00:30+00'
  ),

  -- Helga granted research consent (relevant for MS clinical research)
  (
    '20000000-0000-0000-0008-000000000006',
    '20000000-0000-0000-0004-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'research',
    true,
    'consent',
    'v1.0.0',
    'I consent to the use of my anonymized clinical data for neurological medical research, '
    'including multiple sclerosis registries, subject to ethical approval. '
    'No personally identifiable information will be shared.',
    'web_form',
    '91.65.18.200',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 Safari/605.1.15',
    '2026-03-12 09:01:00+00',
    '2026-03-12 09:01:00+00'
  ),

  -- =========================================================================
  -- Kai Lehmann (Berlin) — 2 consent records
  -- =========================================================================

  (
    '20000000-0000-0000-0008-000000000007',
    '20000000-0000-0000-0004-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'data_processing',
    true,
    'consent',
    'v1.0.0',
    'I consent to BerlinMed Zentrum collecting and processing my personal and health data '
    'for the purpose of providing medical care, managing appointments, and maintaining my '
    'medical records, as described in the Privacy Policy (v1.0.0).',
    'web_form',
    '87.152.44.66',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0 Mobile',
    '2026-04-01 11:00:00+00',
    '2026-04-01 11:00:00+00'
  ),

  (
    '20000000-0000-0000-0008-000000000008',
    '20000000-0000-0000-0004-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'appointment_reminders',
    true,
    'consent',
    'v1.0.0',
    'I consent to receive appointment reminders from BerlinMed Zentrum via SMS.',
    'web_form',
    '87.152.44.66',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0 Mobile',
    '2026-04-01 11:00:30+00',
    '2026-04-01 11:00:30+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SECTION 9: AUDIT LOGS (IMMUTABLE COMPLIANCE TRAIL)
-- =============================================================================
-- GDPR Article 5(2): Accountability principle requires demonstrable compliance.
-- These entries represent a representative sample of audited system events.
-- In production, audit logs are generated server-side by the service role only.
--
-- Covered action types:
--   LOGIN               — clinic owner and doctor authentications
--   INSERT              — patient record creation, appointment booking
--   UPDATE              — appointment status changes (completed, cancelled, no_show)
--   CONSENT_GRANTED     — patient consent recordings
--   SELECT              — sensitive data access by authorised staff
--   DATA_EXPORT_REQUESTED — patient rights exercise (GDPR Article 20)
--
-- session_token_hash: SHA-256 hex representations (64-char lowercase hex).
--   In production these are computed as SHA-256(raw_session_token).
--   Here they are static test values uniquely assigned per audit entry.
--
-- old_values / new_values: contain only non-PII metadata — never raw PII.
--
-- UUID allocation:
--   10000000-0000-0000-0009-xxxxxxxxxxxx  Amsterdam audit entries
--   20000000-0000-0000-0009-xxxxxxxxxxxx  Berlin audit entries
-- =============================================================================

INSERT INTO public.audit_logs (
  id,
  clinic_id,
  actor_user_id,
  actor_ip,
  actor_user_agent,
  action,
  resource_type,
  resource_id,
  old_values,
  new_values,
  session_token_hash,
  http_method,
  api_endpoint,
  success,
  error_code,
  created_at
)
VALUES

  -- =========================================================================
  -- LOGIN EVENTS
  -- =========================================================================

  -- Thomas de Vries (Amsterdam owner) — session login
  (
    '10000000-0000-0000-0009-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000001',
    '195.241.10.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'LOGIN',
    'auth_session',
    NULL,
    NULL,
    NULL,
    'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    'POST',
    '/auth/v1/token?grant_type=password',
    true,
    NULL,
    '2026-05-16 07:32:00+00'
  ),

  -- Klaus Weber (Berlin owner) — session login
  (
    '20000000-0000-0000-0009-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000001',
    '89.204.137.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'LOGIN',
    'auth_session',
    NULL,
    NULL,
    NULL,
    'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    'POST',
    '/auth/v1/token?grant_type=password',
    true,
    NULL,
    '2026-05-16 06:45:00+00'
  ),

  -- Dr. Muller (Amsterdam) — morning session login
  (
    '10000000-0000-0000-0009-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000003',
    '195.241.10.20',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'LOGIN',
    'auth_session',
    NULL,
    NULL,
    NULL,
    'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    'POST',
    '/auth/v1/token?grant_type=password',
    true,
    NULL,
    '2026-05-16 07:55:00+00'
  ),

  -- Prof. Dr. Schmidt (Berlin) — morning session login
  (
    '20000000-0000-0000-0009-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000003',
    '89.204.137.20',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'LOGIN',
    'auth_session',
    NULL,
    NULL,
    NULL,
    'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    'POST',
    '/auth/v1/token?grant_type=password',
    true,
    NULL,
    '2026-05-16 07:00:00+00'
  ),

  -- =========================================================================
  -- PATIENT RECORD CREATION (INSERT)
  -- =========================================================================

  -- Lucas van den Berg — patient record created via self-registration
  (
    '10000000-0000-0000-0009-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000001',
    '195.241.10.50',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'INSERT',
    'patient',
    '10000000-0000-0000-0004-000000000001',
    NULL,
    '{"clinic_id": "10000000-0000-0000-0000-000000000001", "consent_version": "v1.0.0", "registration_method": "web_form"}',
    'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    'POST',
    '/api/v1/patients',
    true,
    NULL,
    '2026-02-10 10:15:00+00'
  ),

  -- Maria de Boer — patient record created via self-registration
  (
    '10000000-0000-0000-0009-000000000004',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000002',
    '194.109.22.140',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
    'INSERT',
    'patient',
    '10000000-0000-0000-0004-000000000002',
    NULL,
    '{"clinic_id": "10000000-0000-0000-0000-000000000001", "consent_version": "v1.0.0", "registration_method": "web_form"}',
    'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
    'POST',
    '/api/v1/patients',
    true,
    NULL,
    '2026-02-15 11:00:00+00'
  ),

  -- Friedrich Maier — patient record created via self-registration (Berlin)
  (
    '20000000-0000-0000-0009-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000001',
    '89.204.137.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'INSERT',
    'patient',
    '20000000-0000-0000-0004-000000000001',
    NULL,
    '{"clinic_id": "20000000-0000-0000-0000-000000000001", "consent_version": "v1.0.0", "registration_method": "web_form"}',
    'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    'POST',
    '/api/v1/patients',
    true,
    NULL,
    '2026-03-05 10:00:00+00'
  ),

  -- Kai Lehmann — patient record created via self-registration (Berlin)
  (
    '20000000-0000-0000-0009-000000000004',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000003',
    '87.152.44.66',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0 Mobile',
    'INSERT',
    'patient',
    '20000000-0000-0000-0004-000000000003',
    NULL,
    '{"clinic_id": "20000000-0000-0000-0000-000000000001", "consent_version": "v1.0.0", "registration_method": "web_form"}',
    'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
    'POST',
    '/api/v1/patients',
    true,
    NULL,
    '2026-04-01 11:00:00+00'
  ),

  -- =========================================================================
  -- APPOINTMENT BOOKING EVENTS (INSERT)
  -- =========================================================================

  -- Appointment booked: Lucas — Dr. Muller (Apr 15, completed)
  (
    '10000000-0000-0000-0009-000000000005',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000005',
    '195.241.10.10',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'INSERT',
    'appointment',
    '10000000-0000-0000-0006-000000000001',
    NULL,
    '{"status": "confirmed", "scheduled_at": "2026-04-15T07:00:00Z", "doctor_id": "10000000-0000-0000-0003-000000000001", "booked_via": "dashboard"}',
    'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    'POST',
    '/api/v1/appointments',
    true,
    NULL,
    '2026-04-14 09:30:00+00'
  ),

  -- Appointment booked: Maria — Dr. Jansen (Apr 8, completed)
  (
    '10000000-0000-0000-0009-000000000006',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000005',
    '195.241.10.10',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'INSERT',
    'appointment',
    '10000000-0000-0000-0007-000000000001',
    NULL,
    '{"status": "confirmed", "scheduled_at": "2026-04-08T07:00:00Z", "doctor_id": "10000000-0000-0000-0003-000000000002", "booked_via": "phone"}',
    'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
    'POST',
    '/api/v1/appointments',
    true,
    NULL,
    '2026-04-05 11:00:00+00'
  ),

  -- Appointment booked: Friedrich — Prof. Schmidt (Apr 10, completed)
  (
    '20000000-0000-0000-0009-000000000005',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000004',
    '89.204.137.10',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'INSERT',
    'appointment',
    '20000000-0000-0000-0006-000000000001',
    NULL,
    '{"status": "confirmed", "scheduled_at": "2026-04-10T07:00:00Z", "doctor_id": "20000000-0000-0000-0003-000000000001", "booked_via": "phone"}',
    'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
    'POST',
    '/api/v1/appointments',
    true,
    NULL,
    '2026-04-08 09:00:00+00'
  ),

  -- =========================================================================
  -- APPOINTMENT STATUS UPDATE EVENTS (UPDATE)
  -- =========================================================================

  -- Lucas appointment Apr 15 — marked completed by Dr. Muller
  (
    '10000000-0000-0000-0009-000000000007',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000003',
    '195.241.10.20',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'UPDATE',
    'appointment',
    '10000000-0000-0000-0006-000000000001',
    '{"status": "confirmed"}',
    '{"status": "completed", "diagnosis_codes_count": 1, "clinical_notes_added": true, "follow_up_required": true}',
    'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
    'PATCH',
    '/api/v1/appointments/10000000-0000-0000-0006-000000000001',
    true,
    NULL,
    '2026-04-15 11:05:00+00'
  ),

  -- Maria appointment Apr 8 — marked completed by Dr. Jansen
  (
    '10000000-0000-0000-0009-000000000008',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000004',
    '195.241.10.20',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'UPDATE',
    'appointment',
    '10000000-0000-0000-0007-000000000001',
    '{"status": "confirmed"}',
    '{"status": "completed", "diagnosis_codes_count": 2, "clinical_notes_added": true, "follow_up_required": true}',
    'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
    'PATCH',
    '/api/v1/appointments/10000000-0000-0000-0007-000000000001',
    true,
    NULL,
    '2026-04-08 10:55:00+00'
  ),

  -- Friedrich appointment Apr 10 — marked completed by Prof. Schmidt
  (
    '20000000-0000-0000-0009-000000000006',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000003',
    '89.204.137.20',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'UPDATE',
    'appointment',
    '20000000-0000-0000-0006-000000000001',
    '{"status": "confirmed"}',
    '{"status": "completed", "diagnosis_codes_count": 1, "clinical_notes_added": true, "follow_up_required": true}',
    'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    'PATCH',
    '/api/v1/appointments/20000000-0000-0000-0006-000000000001',
    true,
    NULL,
    '2026-04-10 10:30:00+00'
  ),

  -- Adam appointment May 13 — cancelled by patient (self-cancellation)
  (
    '10000000-0000-0000-0009-000000000009',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000003',
    '82.170.133.18',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15',
    'UPDATE',
    'appointment',
    '10000000-0000-0000-0006-000000000005',
    '{"status": "confirmed"}',
    '{"status": "cancelled", "cancelled_by_role": "patient", "cancellation_reason_provided": true}',
    'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    'PATCH',
    '/api/v1/appointments/10000000-0000-0000-0006-000000000005',
    true,
    NULL,
    '2026-05-11 16:30:00+00'
  ),

  -- Lucas appointment Apr 8 at Dr. Jansen — marked no-show by receptionist
  (
    '10000000-0000-0000-0009-000000000010',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000005',
    '195.241.10.10',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'UPDATE',
    'appointment',
    '10000000-0000-0000-0007-000000000002',
    '{"status": "confirmed"}',
    '{"status": "no_show", "marked_by_role": "receptionist"}',
    'd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    'PATCH',
    '/api/v1/appointments/10000000-0000-0000-0007-000000000002',
    true,
    NULL,
    '2026-04-08 12:00:00+00'
  ),

  -- Kai appointment May 14 — cancelled by patient due to acute episode
  (
    '20000000-0000-0000-0009-000000000007',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000003',
    '87.152.44.66',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0 Mobile',
    'UPDATE',
    'appointment',
    '20000000-0000-0000-0006-000000000004',
    '{"status": "confirmed"}',
    '{"status": "cancelled", "cancelled_by_role": "patient", "cancellation_reason_provided": true}',
    'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    'PATCH',
    '/api/v1/appointments/20000000-0000-0000-0006-000000000004',
    true,
    NULL,
    '2026-05-14 07:45:00+00'
  ),

  -- =========================================================================
  -- CONSENT GRANTED EVENTS
  -- =========================================================================

  -- Lucas — data_processing consent granted
  (
    '10000000-0000-0000-0009-000000000011',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000001',
    '195.241.10.50',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'CONSENT_GRANTED',
    'patient_consent',
    '10000000-0000-0000-0008-000000000001',
    NULL,
    '{"consent_type": "data_processing", "is_granted": true, "version": "v1.0.0", "capture_method": "web_form"}',
    'f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    'POST',
    '/api/v1/consents',
    true,
    NULL,
    '2026-02-10 10:15:00+00'
  ),

  -- Friedrich — data_processing consent granted (Berlin)
  (
    '20000000-0000-0000-0009-000000000008',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000001',
    '89.204.137.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'CONSENT_GRANTED',
    'patient_consent',
    '20000000-0000-0000-0008-000000000001',
    NULL,
    '{"consent_type": "data_processing", "is_granted": true, "version": "v1.0.0", "capture_method": "web_form"}',
    'a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    'POST',
    '/api/v1/consents',
    true,
    NULL,
    '2026-03-05 10:00:00+00'
  ),

  -- Friedrich — research consent granted (Berlin)
  (
    '20000000-0000-0000-0009-000000000009',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0002-000000000001',
    '89.204.137.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'CONSENT_GRANTED',
    'patient_consent',
    '20000000-0000-0000-0008-000000000003',
    NULL,
    '{"consent_type": "research", "is_granted": true, "version": "v1.0.0", "capture_method": "web_form"}',
    'b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    'POST',
    '/api/v1/consents',
    true,
    NULL,
    '2026-03-05 10:01:00+00'
  ),

  -- =========================================================================
  -- SENSITIVE DATA ACCESS EVENTS (SELECT)
  -- =========================================================================

  -- Thomas de Vries — accessed clinic patient list (Amsterdam)
  (
    '10000000-0000-0000-0009-000000000012',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000001',
    '195.241.10.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'SELECT',
    'patient',
    NULL,
    NULL,
    '{"query_scope": "clinic_patient_list", "row_count": 4, "fields_accessed": ["id", "first_name", "last_name", "date_of_birth"]}',
    'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    'GET',
    '/api/v1/patients',
    true,
    NULL,
    '2026-05-16 07:35:00+00'
  ),

  -- Prof. Dr. Schmidt — accessed Friedrich's patient record (Berlin)
  (
    '20000000-0000-0000-0009-000000000010',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0001-000000000003',
    '89.204.137.20',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'SELECT',
    'patient',
    '20000000-0000-0000-0004-000000000001',
    NULL,
    '{"fields_accessed": ["clinical_notes", "diagnosis_codes", "insurance_provider"], "access_purpose": "pre_appointment_review"}',
    'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    'GET',
    '/api/v1/patients/20000000-0000-0000-0004-000000000001',
    true,
    NULL,
    '2026-05-08 08:55:00+00'
  ),

  -- Dr. Jansen — accessed Maria's appointment history (Amsterdam)
  (
    '10000000-0000-0000-0009-000000000013',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0001-000000000004',
    '195.241.10.20',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Sypho-Dashboard/1.0',
    'SELECT',
    'appointment',
    NULL,
    NULL,
    '{"query_scope": "patient_appointment_history", "patient_id": "10000000-0000-0000-0004-000000000002", "row_count": 3}',
    'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    'GET',
    '/api/v1/appointments?patient_id=10000000-0000-0000-0004-000000000002',
    true,
    NULL,
    '2026-05-12 08:50:00+00'
  ),

  -- =========================================================================
  -- GDPR PATIENT RIGHTS EXERCISE (DATA_EXPORT_REQUESTED)
  -- =========================================================================

  -- Lucas requests data export — GDPR Article 20 (Right to Portability)
  (
    '10000000-0000-0000-0009-000000000014',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0002-000000000001',
    '195.241.10.50',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    'DATA_EXPORT_REQUESTED',
    'patient',
    '10000000-0000-0000-0004-000000000001',
    NULL,
    '{"gdpr_article": "Article 20 — Right to Data Portability", "format_requested": "JSON", "scope": "all_personal_data", "request_outcome": "export_queued"}',
    'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
    'POST',
    '/api/v1/gdpr/data-export',
    true,
    NULL,
    '2026-05-15 14:30:00+00'
  )

ON CONFLICT (id) DO NOTHING;

COMMIT;

-- =============================================================================
-- END OF SEED SCRIPT
-- =============================================================================
-- Summary of seeded data:
--   Auth users       : 16 (9 Amsterdam + 7 Berlin)
--   Clinics          :  2 (Medisyn Amsterdam NL + BerlinMed Zentrum DE)
--   Clinic members   : 16 (staff + patients per clinic)
--   Doctors          :  3 (Dr. Muller GP, Dr. Jansen Cardiology, Prof. Schmidt Neurology)
--   Appointment types: 10 (6 Amsterdam + 4 Berlin)
--   Patients         :  7 (4 Amsterdam + 3 Berlin) — all pseudonymized
--   Appointments     : 21 (8 Dr. Muller + 6 Dr. Jansen + 7 Prof. Schmidt)
--     Status breakdown: completed 10 | confirmed 4 | pending 4 | cancelled 2 | no_show 1
--     Time range      : 2026-04-08 (past) → 2026-06-04 (future)
--   Patient consents : 19 (append-only, GDPR Article 7 compliant)
--   Audit log entries: 20 (LOGIN, INSERT, UPDATE, CONSENT_GRANTED, SELECT, DATA_EXPORT)
-- =============================================================================
