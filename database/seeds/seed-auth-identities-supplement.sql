-- =============================================================================
-- Sypho.io — Supabase Auth identities supplement for database/seeds/seed.sql
-- =============================================================================
-- Run this in the Supabase SQL Editor AFTER the full seed.sql script has been
-- applied successfully (auth.users + public.* rows must already exist).
--
-- Why: GoTrue email/password sign-in expects an `email` provider row in
-- `auth.identities` for each user. The main seed only inserts `auth.users`;
-- without identities, `signInWithPassword` returns "Invalid login credentials".
--
-- Idempotent: safe to re-run; skips users who already have an `email` identity.
--
-- Also sets `instance_id` on seeded users when it is NULL (required on many
-- hosted Supabase projects for Auth to resolve the user).
--
-- @compliance For staging / controlled testing only. Do not use shared test
--             passwords on a production system that holds real patient data.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Ensure instance_id for all Sypho seed auth users (fixed UUID namespace)
-- ---------------------------------------------------------------------------
UPDATE auth.users AS u
SET instance_id = '00000000-0000-0000-0000-000000000000'::uuid
WHERE u.instance_id IS NULL
  AND u.id IN (
    '10000000-0000-0000-0001-000000000001'::uuid,
    '10000000-0000-0000-0001-000000000002'::uuid,
    '10000000-0000-0000-0001-000000000003'::uuid,
    '10000000-0000-0000-0001-000000000004'::uuid,
    '10000000-0000-0000-0001-000000000005'::uuid,
    '10000000-0000-0000-0002-000000000001'::uuid,
    '10000000-0000-0000-0002-000000000002'::uuid,
    '10000000-0000-0000-0002-000000000003'::uuid,
    '10000000-0000-0000-0002-000000000004'::uuid,
    '20000000-0000-0000-0001-000000000001'::uuid,
    '20000000-0000-0000-0001-000000000002'::uuid,
    '20000000-0000-0000-0001-000000000003'::uuid,
    '20000000-0000-0000-0001-000000000004'::uuid,
    '20000000-0000-0000-0002-000000000001'::uuid,
    '20000000-0000-0000-0002-000000000002'::uuid,
    '20000000-0000-0000-0002-000000000003'::uuid
  );

-- ---------------------------------------------------------------------------
-- 2) Email identities (provider `email`) for password login
-- ---------------------------------------------------------------------------
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email
  ),
  'email',
  u.id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users AS u
WHERE u.id IN (
  '10000000-0000-0000-0001-000000000001'::uuid,
  '10000000-0000-0000-0001-000000000002'::uuid,
  '10000000-0000-0000-0001-000000000003'::uuid,
  '10000000-0000-0000-0001-000000000004'::uuid,
  '10000000-0000-0000-0001-000000000005'::uuid,
  '10000000-0000-0000-0002-000000000001'::uuid,
  '10000000-0000-0000-0002-000000000002'::uuid,
  '10000000-0000-0000-0002-000000000003'::uuid,
  '10000000-0000-0000-0002-000000000004'::uuid,
  '20000000-0000-0000-0001-000000000001'::uuid,
  '20000000-0000-0000-0001-000000000002'::uuid,
  '20000000-0000-0000-0001-000000000003'::uuid,
  '20000000-0000-0000-0001-000000000004'::uuid,
  '20000000-0000-0000-0002-000000000001'::uuid,
  '20000000-0000-0000-0002-000000000002'::uuid,
  '20000000-0000-0000-0002-000000000003'::uuid
)
AND NOT EXISTS (
  SELECT 1
  FROM auth.identities AS i
  WHERE i.user_id = u.id
    AND i.provider = 'email'
);

COMMIT;
