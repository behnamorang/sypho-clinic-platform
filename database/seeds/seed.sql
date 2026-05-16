-- =============================================================================
-- Sypho.io — Development Seed Data
-- File: database/seeds/seed.sql
-- Description: Realistic EU clinic simulation for local development and testing.
--              Covers two isolated clinic tenants to validate multi-tenancy.
-- Region: EU — Amsterdam (NL) & Berlin (DE)
-- Compliance: GDPR pseudonymization per Article 4(5) — patient names and
--             identifiers are fictional; no real personal data is used.
-- Author: Sypho Engineering Team
-- Created: 2026-05-16
--
-- IMPORTANT: Run AFTER 001_initial_schema.sql.
--            This script is idempotent — re-running truncates and re-inserts.
--            DO NOT run against production.
-- =============================================================================

-- =============================================================================
-- SAFETY GUARD
-- =============================================================================

DO $$
BEGIN
  IF current_setting('app.environment', true) = 'production' THEN
    RAISE EXCEPTION 'Seed script must NEVER be run in production. '
      'Set app.environment to ''development'' or ''test'' to proceed.';
  END IF;
END;
$$;

-- =============================================================================
-- DISABLE RLS FOR SEEDING
-- The service role bypasses RLS, but we make this explicit for clarity.
-- In Supabase, run this seed via the service role or the SQL editor.
-- =============================================================================

SET session_replication_role = replica; -- Temporarily disable FK triggers for clean truncation

-- =============================================================================
-- CLEAN SLATE — Truncate in reverse FK dependency order
-- =============================================================================

TRUNCATE TABLE public.audit_logs        RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.patient_consents  RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.appointments      RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.appointment_types RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.patients          RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.doctors           RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.clinic_members    RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.clinics           RESTART IDENTITY CASCADE;

-- Note: We cannot truncate auth.users here (Supabase-managed).
-- In development, create the auth users manually via Supabase Dashboard
-- or the Auth API, then reference their UUIDs in the DO block below.

SET session_replication_role = DEFAULT; -- Re-enable FK triggers

-- =============================================================================
-- DETERMINISTIC UUIDs
-- Using fixed UUIDs so the seed is idempotent and foreign keys are stable
-- across re-runs. These are pseudo-random UUIDs with no real-world meaning.
-- =============================================================================

DO $$
DECLARE
  -- -------------------------------------------------------------------------
  -- AUTH USER UUIDs (must exist in auth.users before running the seed)
  -- Create these users in Supabase Auth dashboard or via the Auth API.
  -- Passwords for all dev accounts: Sypho@Dev2026!
  -- -------------------------------------------------------------------------

  -- Clinic 1 (Amsterdam) — staff
  u_clinic1_owner       uuid := 'a1000000-0000-0000-0000-000000000001';
  u_clinic1_admin       uuid := 'a1000000-0000-0000-0000-000000000002';
  u_clinic1_doctor1     uuid := 'a1000000-0000-0000-0000-000000000003';
  u_clinic1_doctor2     uuid := 'a1000000-0000-0000-0000-000000000004';
  u_clinic1_receptionist uuid := 'a1000000-0000-0000-0000-000000000005';

  -- Clinic 2 (Berlin) — staff
  u_clinic2_owner       uuid := 'b2000000-0000-0000-0000-000000000001';
  u_clinic2_admin       uuid := 'b2000000-0000-0000-0000-000000000002';
  u_clinic2_doctor1     uuid := 'b2000000-0000-0000-0000-000000000003';
  u_clinic2_doctor2     uuid := 'b2000000-0000-0000-0000-000000000004';
  u_clinic2_receptionist uuid := 'b2000000-0000-0000-0000-000000000005';

  -- Patient auth accounts (patients who self-registered online)
  u_patient1            uuid := 'c3000000-0000-0000-0000-000000000001';
  u_patient2            uuid := 'c3000000-0000-0000-0000-000000000002';
  u_patient3            uuid := 'c3000000-0000-0000-0000-000000000003';
  u_patient4            uuid := 'c3000000-0000-0000-0000-000000000004';

  -- -------------------------------------------------------------------------
  -- ENTITY UUIDs
  -- -------------------------------------------------------------------------

  -- Clinics
  clinic1_id            uuid := 'd4000000-0000-0000-0000-000000000001';
  clinic2_id            uuid := 'd4000000-0000-0000-0000-000000000002';

  -- Doctors
  doc1_id               uuid := 'e5000000-0000-0000-0000-000000000001'; -- Clinic 1, GP
  doc2_id               uuid := 'e5000000-0000-0000-0000-000000000002'; -- Clinic 1, Cardiologist
  doc3_id               uuid := 'e5000000-0000-0000-0000-000000000003'; -- Clinic 2, Neurologist
  doc4_id               uuid := 'e5000000-0000-0000-0000-000000000004'; -- Clinic 2, Pediatrician

  -- Patients (pseudonymized — fictional names, plausible EU data)
  pat1_id               uuid := 'f6000000-0000-0000-0000-000000000001'; -- Clinic 1 patient
  pat2_id               uuid := 'f6000000-0000-0000-0000-000000000002'; -- Clinic 1 patient
  pat3_id               uuid := 'f6000000-0000-0000-0000-000000000003'; -- Clinic 1 patient
  pat4_id               uuid := 'f6000000-0000-0000-0000-000000000004'; -- Clinic 2 patient
  pat5_id               uuid := 'f6000000-0000-0000-0000-000000000005'; -- Clinic 2 patient
  pat6_id               uuid := 'f6000000-0000-0000-0000-000000000006'; -- Clinic 2 patient

  -- Appointment types
  appt_type1_id         uuid := '17000000-0000-0000-0000-000000000001'; -- Clinic 1: General Consultation
  appt_type2_id         uuid := '17000000-0000-0000-0000-000000000002'; -- Clinic 1: Follow-up
  appt_type3_id         uuid := '17000000-0000-0000-0000-000000000003'; -- Clinic 1: Cardiac Check
  appt_type4_id         uuid := '17000000-0000-0000-0000-000000000004'; -- Clinic 2: Neurology Consultation
  appt_type5_id         uuid := '17000000-0000-0000-0000-000000000005'; -- Clinic 2: Pediatric Check-up
  appt_type6_id         uuid := '17000000-0000-0000-0000-000000000006'; -- Clinic 2: Follow-up

  -- Appointments
  appt1_id              uuid := '28000000-0000-0000-0000-000000000001';
  appt2_id              uuid := '28000000-0000-0000-0000-000000000002';
  appt3_id              uuid := '28000000-0000-0000-0000-000000000003';
  appt4_id              uuid := '28000000-0000-0000-0000-000000000004';
  appt5_id              uuid := '28000000-0000-0000-0000-000000000005';
  appt6_id              uuid := '28000000-0000-0000-0000-000000000006';
  appt7_id              uuid := '28000000-0000-0000-0000-000000000007';
  appt8_id              uuid := '28000000-0000-0000-0000-000000000008';
  appt9_id              uuid := '28000000-0000-0000-0000-000000000009';
  appt10_id             uuid := '28000000-0000-0000-0000-000000000010';
  appt11_id             uuid := '28000000-0000-0000-0000-000000000011';
  appt12_id             uuid := '28000000-0000-0000-0000-000000000012';

BEGIN

-- ============================================================================
-- SECTION 1: CLINICS
-- Two fully isolated tenants in different EU member states.
-- ============================================================================

INSERT INTO public.clinics (
  id, name, slug, tax_id, registration_number,
  email, phone, website,
  address_line1, city, postal_code, country_code, timezone,
  business_hours,
  dpo_name, dpo_email, privacy_policy_url, terms_url,
  subscription_tier, subscription_expires_at,
  is_active, is_verified,
  created_at, updated_at
) VALUES
-- ----------------------------------------------------------------------------
-- CLINIC 1: Centrum Medisch Centrum, Amsterdam, Netherlands
-- A professional multi-specialty private clinic in the center of Amsterdam.
-- ----------------------------------------------------------------------------
(
  clinic1_id,
  'Centrum Medisch Centrum',
  'centrum-medisch-centrum',
  'NL004567890B01',                        -- Dutch VAT number
  'NL-AMS-2018-04521',                     -- Dutch BIG / KvK registration
  'info@centrum-medisch.nl',
  '+31 20 555 0142',
  'https://www.centrum-medisch.nl',
  'Prinsengracht 412',
  'Amsterdam',
  '1016 JB',
  'NL',
  'Europe/Amsterdam',
  '{
    "monday":    {"open": "08:00", "close": "18:00", "closed": false},
    "tuesday":   {"open": "08:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "20:00", "closed": false},
    "thursday":  {"open": "08:00", "close": "18:00", "closed": false},
    "friday":    {"open": "08:00", "close": "17:00", "closed": false},
    "saturday":  {"open": "09:00", "close": "13:00", "closed": false},
    "sunday":    {"open": null,    "close": null,     "closed": true}
  }'::jsonb,
  'Dhr. P. van den Berg',
  'dpo@centrum-medisch.nl',
  'https://www.centrum-medisch.nl/privacy',
  'https://www.centrum-medisch.nl/terms',
  'professional',
  NOW() + interval '1 year',
  true, true,
  NOW() - interval '3 years',
  NOW() - interval '3 years'
),
-- ----------------------------------------------------------------------------
-- CLINIC 2: Berliner Gesundheitszentrum, Berlin, Germany
-- A modern urban health center in Mitte, Berlin.
-- ----------------------------------------------------------------------------
(
  clinic2_id,
  'Berliner Gesundheitszentrum',
  'berliner-gesundheitszentrum',
  'DE287654321',                           -- German VAT (Umsatzsteuer-ID)
  'DE-BLN-2019-11234',                     -- German registration (Ärztekammer)
  'kontakt@berliner-gesundheit.de',
  '+49 30 555 7890',
  'https://www.berliner-gesundheit.de',
  'Unter den Linden 78',
  'Berlin',
  '10117',
  'DE',
  'Europe/Berlin',
  '{
    "monday":    {"open": "07:30", "close": "19:00", "closed": false},
    "tuesday":   {"open": "07:30", "close": "19:00", "closed": false},
    "wednesday": {"open": "07:30", "close": "15:00", "closed": false},
    "thursday":  {"open": "07:30", "close": "19:00", "closed": false},
    "friday":    {"open": "07:30", "close": "17:00", "closed": false},
    "saturday":  {"open": "09:00", "close": "12:00", "closed": false},
    "sunday":    {"open": null,    "close": null,     "closed": true}
  }'::jsonb,
  'Fr. Dr. Ingeborg Schäfer',
  'datenschutz@berliner-gesundheit.de',
  'https://www.berliner-gesundheit.de/datenschutz',
  'https://www.berliner-gesundheit.de/agb',
  'enterprise',
  NOW() + interval '2 years',
  true, true,
  NOW() - interval '2 years 6 months',
  NOW() - interval '2 years 6 months'
);

-- ============================================================================
-- SECTION 2: CLINIC MEMBERS
-- Staff roles for both clinics. Each user_id maps to an auth.users record.
-- In a real Supabase project these UUIDs come from auth.users after signup.
-- ============================================================================

INSERT INTO public.clinic_members (
  id, clinic_id, user_id, role, is_active,
  invited_by, invited_at, accepted_at,
  created_at, updated_at
) VALUES

-- ── Clinic 1 (Amsterdam) ────────────────────────────────────────────────────

(
  gen_random_uuid(), clinic1_id, u_clinic1_owner, 'clinic_owner', true,
  NULL, NULL, NOW() - interval '3 years',
  NOW() - interval '3 years', NOW() - interval '3 years'
),
(
  gen_random_uuid(), clinic1_id, u_clinic1_admin, 'clinic_admin', true,
  u_clinic1_owner, NOW() - interval '3 years', NOW() - interval '3 years',
  NOW() - interval '3 years', NOW() - interval '3 years'
),
(
  gen_random_uuid(), clinic1_id, u_clinic1_doctor1, 'doctor', true,
  u_clinic1_owner, NOW() - interval '2 years 8 months', NOW() - interval '2 years 8 months',
  NOW() - interval '2 years 8 months', NOW() - interval '2 years 8 months'
),
(
  gen_random_uuid(), clinic1_id, u_clinic1_doctor2, 'doctor', true,
  u_clinic1_admin, NOW() - interval '2 years', NOW() - interval '2 years',
  NOW() - interval '2 years', NOW() - interval '2 years'
),
(
  gen_random_uuid(), clinic1_id, u_clinic1_receptionist, 'receptionist', true,
  u_clinic1_admin, NOW() - interval '1 year 6 months', NOW() - interval '1 year 6 months',
  NOW() - interval '1 year 6 months', NOW() - interval '1 year 6 months'
),

-- ── Clinic 2 (Berlin) ───────────────────────────────────────────────────────

(
  gen_random_uuid(), clinic2_id, u_clinic2_owner, 'clinic_owner', true,
  NULL, NULL, NOW() - interval '2 years 6 months',
  NOW() - interval '2 years 6 months', NOW() - interval '2 years 6 months'
),
(
  gen_random_uuid(), clinic2_id, u_clinic2_admin, 'clinic_admin', true,
  u_clinic2_owner, NOW() - interval '2 years 4 months', NOW() - interval '2 years 4 months',
  NOW() - interval '2 years 4 months', NOW() - interval '2 years 4 months'
),
(
  gen_random_uuid(), clinic2_id, u_clinic2_doctor1, 'doctor', true,
  u_clinic2_owner, NOW() - interval '2 years', NOW() - interval '2 years',
  NOW() - interval '2 years', NOW() - interval '2 years'
),
(
  gen_random_uuid(), clinic2_id, u_clinic2_doctor2, 'doctor', true,
  u_clinic2_admin, NOW() - interval '1 year 8 months', NOW() - interval '1 year 8 months',
  NOW() - interval '1 year 8 months', NOW() - interval '1 year 8 months'
),
(
  gen_random_uuid(), clinic2_id, u_clinic2_receptionist, 'receptionist', true,
  u_clinic2_admin, NOW() - interval '1 year 2 months', NOW() - interval '1 year 2 months',
  NOW() - interval '1 year 2 months', NOW() - interval '1 year 2 months'
);

-- ============================================================================
-- SECTION 3: DOCTORS
-- Four doctors across two clinics with realistic EU medical professional data.
-- GDPR: Professional credentials are not special category data.
-- Availability schedules use JSONB arrays of time slots per weekday.
-- ============================================================================

INSERT INTO public.doctors (
  id, clinic_id, user_id,
  title, first_name, last_name,
  license_number, license_country,
  specialty, sub_specialty,
  professional_email, professional_phone,
  availability_schedule,
  default_appointment_duration_minutes, max_patients_per_day,
  is_active, is_accepting_new_patients,
  created_at, updated_at
) VALUES

-- ── Doctor 1 — Clinic 1 (Amsterdam): General Practitioner ───────────────────
-- Dr. Sophie van der Berg — GP with morning and afternoon slots Mon–Fri
(
  doc1_id, clinic1_id, u_clinic1_doctor1,
  'Dr.', 'Sophie', 'van der Berg',
  'NL-BIG-19850412-001', 'NL',
  'General Practice', 'Preventive Medicine',
  'sophie.vanderberg@centrum-medisch.nl', '+31 20 555 0143',
  '{
    "monday":    [{"start": "08:00", "end": "12:00"}, {"start": "13:00", "end": "17:00"}],
    "tuesday":   [{"start": "08:00", "end": "12:00"}, {"start": "13:00", "end": "17:00"}],
    "wednesday": [{"start": "08:00", "end": "12:00"}],
    "thursday":  [{"start": "08:00", "end": "12:00"}, {"start": "13:00", "end": "17:00"}],
    "friday":    [{"start": "08:00", "end": "12:00"}, {"start": "13:00", "end": "16:00"}],
    "saturday":  [],
    "sunday":    []
  }'::jsonb,
  20, 28,
  true, true,
  NOW() - interval '2 years 8 months',
  NOW() - interval '2 years 8 months'
),

-- ── Doctor 2 — Clinic 1 (Amsterdam): Cardiologist ───────────────────────────
-- Dr. James Okonkwo — Cardiologist, 45-min appointments, Tue–Thu + Sat morning
(
  doc2_id, clinic1_id, u_clinic1_doctor2,
  'Dr.', 'James', 'Okonkwo',
  'NL-BIG-20010905-007', 'NL',
  'Cardiology', 'Interventional Cardiology',
  'james.okonkwo@centrum-medisch.nl', '+31 20 555 0144',
  '{
    "monday":    [],
    "tuesday":   [{"start": "09:00", "end": "12:30"}, {"start": "14:00", "end": "17:00"}],
    "wednesday": [{"start": "09:00", "end": "12:30"}],
    "thursday":  [{"start": "09:00", "end": "12:30"}, {"start": "14:00", "end": "18:00"}],
    "friday":    [{"start": "09:00", "end": "12:30"}],
    "saturday":  [{"start": "09:00", "end": "12:00"}],
    "sunday":    []
  }'::jsonb,
  45, 12,
  true, true,
  NOW() - interval '2 years',
  NOW() - interval '2 years'
),

-- ── Doctor 3 — Clinic 2 (Berlin): Neurologist ───────────────────────────────
-- Prof. Dr. Katarina Müller — Senior neurologist, longer consultation slots
(
  doc3_id, clinic2_id, u_clinic2_doctor1,
  'Prof. Dr.', 'Katarina', 'Müller',
  'DE-AEKB-19920318-042', 'DE',
  'Neurology', 'Cognitive Neurology',
  'katarina.mueller@berliner-gesundheit.de', '+49 30 555 7891',
  '{
    "monday":    [{"start": "08:00", "end": "12:00"}, {"start": "13:30", "end": "17:00"}],
    "tuesday":   [{"start": "08:00", "end": "13:00"}],
    "wednesday": [{"start": "08:00", "end": "12:00"}, {"start": "13:30", "end": "15:00"}],
    "thursday":  [{"start": "08:00", "end": "12:00"}, {"start": "13:30", "end": "17:00"}],
    "friday":    [{"start": "08:00", "end": "12:00"}],
    "saturday":  [],
    "sunday":    []
  }'::jsonb,
  60, 10,
  true, true,
  NOW() - interval '2 years',
  NOW() - interval '2 years'
),

-- ── Doctor 4 — Clinic 2 (Berlin): Pediatrician ──────────────────────────────
-- Dr. Lucas Brandão — Pediatrician, accepting new child patients
(
  doc4_id, clinic2_id, u_clinic2_doctor2,
  'Dr.', 'Lucas', 'Brandão',
  'DE-AEKB-20051127-089', 'DE',
  'Pediatrics', 'Developmental Pediatrics',
  'lucas.brandao@berliner-gesundheit.de', '+49 30 555 7892',
  '{
    "monday":    [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
    "tuesday":   [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
    "wednesday": [],
    "thursday":  [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
    "friday":    [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "16:30"}],
    "saturday":  [{"start": "09:00", "end": "11:30"}],
    "sunday":    []
  }'::jsonb,
  30, 22,
  true, true,
  NOW() - interval '1 year 8 months',
  NOW() - interval '1 year 8 months'
);

-- ============================================================================
-- SECTION 4: APPOINTMENT TYPES
-- Each clinic defines its own service catalog.
-- ============================================================================

INSERT INTO public.appointment_types (
  id, clinic_id, name, description, color,
  duration_minutes, buffer_before_minutes, buffer_after_minutes,
  price_cents, currency_code,
  is_active, is_online_bookable,
  created_at, updated_at
) VALUES

-- ── Clinic 1 (Amsterdam) ────────────────────────────────────────────────────
(
  appt_type1_id, clinic1_id,
  'General Consultation',
  'Standard GP consultation for diagnosis and treatment planning.',
  '#3B82F6',
  20, 0, 5,
  9500, 'EUR',
  true, true,
  NOW() - interval '2 years', NOW() - interval '2 years'
),
(
  appt_type2_id, clinic1_id,
  'Follow-up Consultation',
  'Brief follow-up appointment to review progress and adjust treatment.',
  '#10B981',
  15, 0, 5,
  5500, 'EUR',
  true, true,
  NOW() - interval '2 years', NOW() - interval '2 years'
),
(
  appt_type3_id, clinic1_id,
  'Cardiac Check-up',
  'Comprehensive cardiovascular assessment including ECG evaluation.',
  '#EF4444',
  45, 5, 10,
  18500, 'EUR',
  true, true,
  NOW() - interval '2 years', NOW() - interval '2 years'
),

-- ── Clinic 2 (Berlin) ───────────────────────────────────────────────────────
(
  appt_type4_id, clinic2_id,
  'Neurology Consultation',
  'Initial or recurring neurology assessment and care plan.',
  '#8B5CF6',
  60, 5, 15,
  22000, 'EUR',
  true, true,
  NOW() - interval '2 years', NOW() - interval '2 years'
),
(
  appt_type5_id, clinic2_id,
  'Pediatric Check-up',
  'Routine child health assessment including growth and development screening.',
  '#F59E0B',
  30, 0, 10,
  8500, 'EUR',
  true, true,
  NOW() - interval '1 year 6 months', NOW() - interval '1 year 6 months'
),
(
  appt_type6_id, clinic2_id,
  'Follow-up Visit',
  'Short follow-up for ongoing treatment monitoring.',
  '#6EE7B7',
  20, 0, 5,
  6000, 'EUR',
  true, true,
  NOW() - interval '1 year 6 months', NOW() - interval '1 year 6 months'
);

-- ============================================================================
-- SECTION 5: PATIENTS
-- Six pseudonymized patient profiles — fictional identities, plausible EU data.
-- GDPR Article 4(5): Pseudonymization applied — no real personal data used.
-- GDPR Article 9: Special Category Data — health info stored with strict controls.
-- Retention: medical records retained 10 years from creation per EU guidelines.
-- Three patients per clinic to test tenant isolation.
-- ============================================================================

INSERT INTO public.patients (
  id, clinic_id, user_id,
  first_name, last_name, date_of_birth, gender,
  email, phone,
  address_line1, city, postal_code, country_code,
  emergency_contact_name, emergency_contact_phone,
  insurance_provider, insurance_policy_number,
  gdpr_consent_given_at, gdpr_consent_version,
  data_retention_until,
  created_at, updated_at
) VALUES

-- ── Clinic 1 (Amsterdam) Patients ───────────────────────────────────────────

-- Patient 1: Middle-aged male, registered online, linked to auth account
(
  pat1_id, clinic1_id, u_patient1,
  'Martijn', 'de Vries',
  '1978-03-14', 'male',
  'martijn.devries.p1@sypho-dev.test', '+31 6 2012 3456',
  'Herengracht 228', 'Amsterdam', '1016 BV', 'NL',
  'Anke de Vries', '+31 6 2012 3457',
  'CZ Zorgverzekering', 'CZ-NL-2024-7841023',
  NOW() - interval '1 year 2 months', 'v1.2',
  (NOW() + interval '10 years')::date,
  NOW() - interval '1 year 2 months',
  NOW() - interval '1 year 2 months'
),

-- Patient 2: Young female, registered online
(
  pat2_id, clinic1_id, u_patient2,
  'Emma', 'Bakker',
  '1995-11-28', 'female',
  'emma.bakker.p2@sypho-dev.test', '+31 6 3345 6789',
  'Keizersgracht 512', 'Amsterdam', '1017 EH', 'NL',
  'Thomas Bakker', '+31 6 3345 6790',
  'VGZ Zorgverzekering', 'VGZ-NL-2025-3302917',
  NOW() - interval '8 months', 'v1.2',
  (NOW() + interval '10 years')::date,
  NOW() - interval '8 months',
  NOW() - interval '8 months'
),

-- Patient 3: Elderly male, registered by receptionist (no auth account)
(
  pat3_id, clinic1_id, NULL,
  'Henk', 'Visser',
  '1948-06-05', 'male',
  'henk.visser.p3@sypho-dev.test', '+31 6 4456 7890',
  'Jordaan 34', 'Amsterdam', '1015 NZ', 'NL',
  'Maria Visser', '+31 6 4456 7891',
  'Menzis', 'MEN-NL-2024-5512309',
  NOW() - interval '2 years', 'v1.0',
  (NOW() + interval '10 years')::date,
  NOW() - interval '2 years',
  NOW() - interval '2 years'
),

-- ── Clinic 2 (Berlin) Patients ───────────────────────────────────────────────

-- Patient 4: Young female, chronic migraine patient, registered online
(
  pat4_id, clinic2_id, u_patient3,
  'Lena', 'Hoffmann',
  '1990-07-22', 'female',
  'lena.hoffmann.p4@sypho-dev.test', '+49 151 2200 3344',
  'Friedrichstraße 120', 'Berlin', '10117', 'DE',
  'Klaus Hoffmann', '+49 151 2200 3345',
  'Techniker Krankenkasse', 'TK-DE-2024-8823401',
  NOW() - interval '1 year 6 months', 'v1.1',
  (NOW() + interval '10 years')::date,
  NOW() - interval '1 year 6 months',
  NOW() - interval '1 year 6 months'
),

-- Patient 5: Child patient (pediatric), registered by parent (no auth account for child)
(
  pat5_id, clinic2_id, NULL,
  'Felix', 'Schmidt',
  '2019-04-10', 'male',
  'familie.schmidt.p5@sypho-dev.test', '+49 151 3311 4455',
  'Potsdamer Strasse 88', 'Berlin', '10785', 'DE',
  'Julia Schmidt (Mutter)', '+49 151 3311 4455',
  'AOK Nordost', 'AOK-DE-2025-4412001',
  NOW() - interval '1 year', 'v1.1',
  (NOW() + interval '10 years')::date,
  NOW() - interval '1 year',
  NOW() - interval '1 year'
),

-- Patient 6: Middle-aged female, registered online
(
  pat6_id, clinic2_id, u_patient4,
  'Ingrid', 'Weber',
  '1971-09-03', 'female',
  'ingrid.weber.p6@sypho-dev.test', '+49 151 4422 5566',
  'Alexanderplatz 4', 'Berlin', '10178', 'DE',
  'Dieter Weber', '+49 151 4422 5567',
  'Barmer',  'BAR-DE-2024-6670912',
  NOW() - interval '9 months', 'v1.2',
  (NOW() + interval '10 years')::date,
  NOW() - interval '9 months',
  NOW() - interval '9 months'
);

-- ============================================================================
-- SECTION 6: APPOINTMENTS
-- 12 appointments across both clinics covering all status types:
-- completed (past), confirmed & pending (upcoming), cancelled, no_show.
-- Dates are relative to NOW() for long-term seed relevance.
-- ============================================================================

INSERT INTO public.appointments (
  id, clinic_id, patient_id, doctor_id, appointment_type_id,
  scheduled_at, duration_minutes,
  status,
  cancellation_reason, cancellation_by, cancelled_at,
  chief_complaint, clinical_notes, diagnosis_codes,
  follow_up_required, follow_up_notes,
  booked_via, booked_by,
  data_retention_until,
  created_at, updated_at
) VALUES

-- ── Clinic 1 (Amsterdam) — Completed appointments (past) ────────────────────

-- Appt 1: Completed GP visit, Martijn, 3 weeks ago
(
  appt1_id, clinic1_id, pat1_id, doc1_id, appt_type1_id,
  NOW() - interval '3 weeks' + interval '10 hours',
  20,
  'completed',
  NULL, NULL, NULL,
  'Persistent fatigue and mild headaches for two weeks.',
  'Patient presents with fatigue and tension-type headaches. '
  'BP 128/82 mmHg. Advised lifestyle adjustments and adequate sleep hygiene. '
  'Bloodwork ordered. Ibuprofen 400mg PRN prescribed.',
  ARRAY['R53.83', 'G44.309'],   -- ICD-10: Fatigue, tension headache
  true,
  'Review bloodwork results in 2 weeks.',
  'dashboard', u_clinic1_receptionist,
  (NOW() + interval '10 years')::date,
  NOW() - interval '3 weeks' - interval '2 days',
  NOW() - interval '3 weeks' + interval '10 hours 20 minutes'
),

-- Appt 2: Completed cardiac check, Emma, 5 weeks ago
(
  appt2_id, clinic1_id, pat2_id, doc2_id, appt_type3_id,
  NOW() - interval '5 weeks' + interval '9 hours 30 minutes',
  45,
  'completed',
  NULL, NULL, NULL,
  'Palpitations during exercise, occasional shortness of breath.',
  'ECG performed — sinus rhythm, normal axis, no ST changes observed. '
  'Echo scheduled for further evaluation. Patient reassured. '
  'Advised to limit caffeine and track episodes in a symptom diary.',
  ARRAY['R00.2', 'R06.09'],     -- ICD-10: Palpitations, dyspnea
  true,
  'Echocardiogram follow-up in 4 weeks.',
  'online', u_patient2,
  (NOW() + interval '10 years')::date,
  NOW() - interval '5 weeks' - interval '1 day',
  NOW() - interval '5 weeks' + interval '9 hours 30 minutes' + interval '45 minutes'
),

-- Appt 3: Completed follow-up GP visit, Martijn, 1 week ago (bloodwork review)
(
  appt3_id, clinic1_id, pat1_id, doc1_id, appt_type2_id,
  NOW() - interval '1 week' + interval '11 hours',
  15,
  'completed',
  NULL, NULL, NULL,
  'Follow-up: bloodwork results review.',
  'Bloodwork results normal. Hemoglobin 14.2 g/dL, TSH within range. '
  'Fatigue improving with sleep hygiene measures. '
  'Headaches resolved. No further action required.',
  ARRAY['Z00.00'],              -- ICD-10: Routine health exam
  false,
  NULL,
  'dashboard', u_clinic1_receptionist,
  (NOW() + interval '10 years')::date,
  NOW() - interval '10 days',
  NOW() - interval '1 week' + interval '11 hours 15 minutes'
),

-- ── Clinic 1 (Amsterdam) — Upcoming confirmed appointments ──────────────────

-- Appt 4: Confirmed cardiac follow-up, Emma, in 3 days
(
  appt4_id, clinic1_id, pat2_id, doc2_id, appt_type2_id,
  NOW() + interval '3 days' + interval '14 hours',
  15,
  'confirmed',
  NULL, NULL, NULL,
  'Follow-up: echocardiogram results review.',
  NULL,
  NULL,
  false, NULL,
  'online', u_patient2,
  (NOW() + interval '10 years')::date,
  NOW() - interval '2 days',
  NOW() - interval '2 days'
),

-- Appt 5: Pending GP appointment, Henk, in 1 week
(
  appt5_id, clinic1_id, pat3_id, doc1_id, appt_type1_id,
  NOW() + interval '1 week' + interval '9 hours',
  20,
  'pending',
  NULL, NULL, NULL,
  'Annual check-up and blood pressure monitoring.',
  NULL,
  NULL,
  false, NULL,
  'phone', u_clinic1_receptionist,
  (NOW() + interval '10 years')::date,
  NOW() - interval '3 days',
  NOW() - interval '3 days'
),

-- ── Clinic 1 (Amsterdam) — Cancelled appointment ────────────────────────────

-- Appt 6: Cancelled — Emma cancelled cardiac appointment, 2 weeks ago
(
  appt6_id, clinic1_id, pat2_id, doc2_id, appt_type3_id,
  NOW() - interval '2 weeks' + interval '10 hours',
  45,
  'cancelled',
  'Patient unable to attend due to work commitments. Rescheduled for a later date.',
  u_patient2,
  NOW() - interval '2 weeks' - interval '1 day 2 hours',
  'Cardiac check-up — rescheduled.',
  NULL,
  NULL,
  false, NULL,
  'online', u_patient2,
  (NOW() + interval '10 years')::date,
  NOW() - interval '3 weeks',
  NOW() - interval '2 weeks' - interval '1 day 2 hours'
),

-- ── Clinic 2 (Berlin) — Completed appointments (past) ───────────────────────

-- Appt 7: Completed neurology consultation, Lena, 4 weeks ago
(
  appt7_id, clinic2_id, pat4_id, doc3_id, appt_type4_id,
  NOW() - interval '4 weeks' + interval '10 hours',
  60,
  'completed',
  NULL, NULL, NULL,
  'Chronic migraines — increasing frequency, 3–4 episodes per month.',
  'Patient reports migraines lasting 12–24h with photophobia and nausea. '
  'MRI Brain ordered to exclude secondary causes. '
  'Sumatriptan 50mg prescribed for acute episodes. '
  'Prophylactic therapy (topiramate) to be considered pending MRI results.',
  ARRAY['G43.909'],             -- ICD-10: Migraine, unspecified
  true,
  'Review MRI results and discuss prophylaxis in 6 weeks.',
  'online', u_patient3,
  (NOW() + interval '10 years')::date,
  NOW() - interval '4 weeks' - interval '5 days',
  NOW() - interval '4 weeks' + interval '10 hours 60 minutes'
),

-- Appt 8: Completed pediatric check-up, Felix, 3 months ago
(
  appt8_id, clinic2_id, pat5_id, doc4_id, appt_type5_id,
  NOW() - interval '3 months' + interval '9 hours',
  30,
  'completed',
  NULL, NULL, NULL,
  'Routine 5-year developmental screening and vaccination update.',
  'Child alert and cooperative. Weight 18.2 kg (50th percentile), '
  'Height 109 cm (60th percentile). Developmental milestones on track. '
  'MMR booster administered. Vision and hearing screening normal.',
  ARRAY['Z00.121'],             -- ICD-10: Routine child health examination
  false,
  NULL,
  'phone', u_clinic2_receptionist,
  (NOW() + interval '10 years')::date,
  NOW() - interval '3 months' - interval '3 days',
  NOW() - interval '3 months' + interval '9 hours 30 minutes'
),

-- Appt 9: Completed follow-up neurology, Lena, 2 weeks ago (MRI review)
(
  appt9_id, clinic2_id, pat4_id, doc3_id, appt_type6_id,
  NOW() - interval '2 weeks' + interval '11 hours',
  20,
  'completed',
  NULL, NULL, NULL,
  'Follow-up: MRI brain review for migraine management.',
  'MRI Brain: no structural abnormalities detected. Normal study. '
  'Initiated topiramate 25mg OD for migraine prophylaxis with titration plan. '
  'Patient tolerating sumatriptan well. Migraine diary to be maintained.',
  ARRAY['G43.909', 'Z01.89'],   -- ICD-10: Migraine; Routine exam
  true,
  'Review topiramate tolerability and titration in 8 weeks.',
  'dashboard', u_clinic2_receptionist,
  (NOW() + interval '10 years')::date,
  NOW() - interval '2 weeks' - interval '1 day',
  NOW() - interval '2 weeks' + interval '11 hours 20 minutes'
),

-- ── Clinic 2 (Berlin) — Upcoming confirmed appointments ─────────────────────

-- Appt 10: Confirmed neurology follow-up, Lena, in 6 weeks (topiramate review)
(
  appt10_id, clinic2_id, pat4_id, doc3_id, appt_type4_id,
  NOW() + interval '6 weeks' + interval '10 hours',
  60,
  'confirmed',
  NULL, NULL, NULL,
  'Follow-up: topiramate dose review and migraine frequency assessment.',
  NULL,
  NULL,
  false, NULL,
  'dashboard', u_clinic2_receptionist,
  (NOW() + interval '10 years')::date,
  NOW() - interval '1 week',
  NOW() - interval '1 week'
),

-- Appt 11: Pending pediatric check-up, Felix, in 2 weeks
(
  appt11_id, clinic2_id, pat5_id, doc4_id, appt_type5_id,
  NOW() + interval '2 weeks' + interval '9 hours 30 minutes',
  30,
  'pending',
  NULL, NULL, NULL,
  'Annual check-up and pre-school health screening.',
  NULL,
  NULL,
  false, NULL,
  'phone', u_clinic2_receptionist,
  (NOW() + interval '10 years')::date,
  NOW() - interval '4 days',
  NOW() - interval '4 days'
),

-- ── Clinic 2 (Berlin) — No-show ─────────────────────────────────────────────

-- Appt 12: No-show — Ingrid did not attend first consultation, 10 days ago
(
  appt12_id, clinic2_id, pat6_id, doc4_id, appt_type5_id,
  NOW() - interval '10 days' + interval '14 hours',
  30,
  'no_show',
  NULL, NULL, NULL,
  'Initial consultation for general health assessment.',
  'Patient did not attend. No prior notice given. '
  'Receptionist attempted contact via phone — no answer. '
  'Follow-up letter to be sent per clinic protocol.',
  NULL,
  false, NULL,
  'online', u_patient4,
  (NOW() + interval '10 years')::date,
  NOW() - interval '14 days',
  NOW() - interval '10 days' + interval '14 hours 30 minutes'
);

-- ============================================================================
-- SECTION 7: PATIENT CONSENTS
-- Immutable append-only consent records per GDPR Article 7.
-- Each patient has consented to data processing; some have additional consents.
-- Captured with IP addresses and user agents for technical proof of consent.
-- ============================================================================

INSERT INTO public.patient_consents (
  id, patient_id, clinic_id,
  consent_type, is_granted,
  lawful_basis, consent_version, consent_text_snapshot,
  capture_method, ip_address, user_agent,
  consented_at, created_at
) VALUES

-- ── Clinic 1 — Patient 1 (Martijn de Vries) ─────────────────────────────────

-- Core data processing consent — granted at registration
(
  gen_random_uuid(), pat1_id, clinic1_id,
  'data_processing', true,
  'consent', 'v1.2',
  'I consent to Centrum Medisch Centrum processing my personal and health data '
  'for the purpose of providing medical care, as described in the Privacy Policy v1.2.',
  'web_form', '87.233.12.45'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  'Chrome/124.0.0.0 Safari/537.36',
  NOW() - interval '1 year 2 months',
  NOW() - interval '1 year 2 months'
),
-- Appointment reminders consent — granted at registration
(
  gen_random_uuid(), pat1_id, clinic1_id,
  'appointment_reminders', true,
  'consent', 'v1.2',
  'I consent to receiving appointment reminders by email and SMS.',
  'web_form', '87.233.12.45'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  'Chrome/124.0.0.0 Safari/537.36',
  NOW() - interval '1 year 2 months',
  NOW() - interval '1 year 2 months'
),

-- ── Clinic 1 — Patient 2 (Emma Bakker) ──────────────────────────────────────

-- Core data processing consent
(
  gen_random_uuid(), pat2_id, clinic1_id,
  'data_processing', true,
  'consent', 'v1.2',
  'I consent to Centrum Medisch Centrum processing my personal and health data '
  'for the purpose of providing medical care, as described in the Privacy Policy v1.2.',
  'web_form', '145.58.201.77'::inet,
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 '
  '(KHTML, like Gecko) Mobile/15E148',
  NOW() - interval '8 months',
  NOW() - interval '8 months'
),
-- Appointment reminders consent
(
  gen_random_uuid(), pat2_id, clinic1_id,
  'appointment_reminders', true,
  'consent', 'v1.2',
  'I consent to receiving appointment reminders by email and SMS.',
  'web_form', '145.58.201.77'::inet,
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 '
  '(KHTML, like Gecko) Mobile/15E148',
  NOW() - interval '8 months',
  NOW() - interval '8 months'
),
-- Research consent — explicitly declined by Emma
(
  gen_random_uuid(), pat2_id, clinic1_id,
  'research', false,
  'consent', 'v1.2',
  'I consent to my anonymized data being used for medical research purposes.',
  'web_form', '145.58.201.77'::inet,
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 '
  '(KHTML, like Gecko) Mobile/15E148',
  NOW() - interval '8 months',
  NOW() - interval '8 months'
),

-- ── Clinic 1 — Patient 3 (Henk Visser) ──────────────────────────────────────

-- Core data processing consent — captured on paper by receptionist
(
  gen_random_uuid(), pat3_id, clinic1_id,
  'data_processing', true,
  'consent', 'v1.0',
  'I consent to Centrum Medisch Centrum processing my personal and health data '
  'for the purpose of providing medical care, as described in the Privacy Policy v1.0.',
  'paper', NULL,
  NULL,
  NOW() - interval '2 years',
  NOW() - interval '2 years'
),

-- ── Clinic 2 — Patient 4 (Lena Hoffmann) ────────────────────────────────────

-- Core data processing consent
(
  gen_random_uuid(), pat4_id, clinic2_id,
  'data_processing', true,
  'consent', 'v1.1',
  'I consent to Berliner Gesundheitszentrum processing my personal and health data '
  'for the purpose of providing medical care, as described in the Datenschutzerklärung v1.1.',
  'web_form', '91.47.102.233'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
  'Chrome/125.0.0.0 Safari/537.36',
  NOW() - interval '1 year 6 months',
  NOW() - interval '1 year 6 months'
),
-- Appointment reminders consent
(
  gen_random_uuid(), pat4_id, clinic2_id,
  'appointment_reminders', true,
  'consent', 'v1.1',
  'I consent to receiving appointment reminders by email and SMS.',
  'web_form', '91.47.102.233'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
  'Chrome/125.0.0.0 Safari/537.36',
  NOW() - interval '1 year 6 months',
  NOW() - interval '1 year 6 months'
),
-- Analytics consent — Lena consented, then later revoked it
(
  gen_random_uuid(), pat4_id, clinic2_id,
  'analytics', true,
  'consent', 'v1.1',
  'I consent to my anonymized usage data being used for service analytics.',
  'web_form', '91.47.102.233'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
  'Chrome/125.0.0.0 Safari/537.36',
  NOW() - interval '1 year 6 months',
  NOW() - interval '1 year 6 months'
),
-- Analytics consent revoked 3 months later (new immutable row for revocation)
(
  gen_random_uuid(), pat4_id, clinic2_id,
  'analytics', false,
  'consent', 'v1.1',
  'I withdraw my consent for my anonymized usage data to be used for analytics.',
  'web_form', '91.47.102.233'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
  'Chrome/125.0.0.0 Safari/537.36',
  NOW() - interval '1 year 3 months',
  NOW() - interval '1 year 3 months'
),

-- ── Clinic 2 — Patient 5 (Felix Schmidt — pediatric, consent by parent) ─────

-- Core data processing consent — given by parent via paper
(
  gen_random_uuid(), pat5_id, clinic2_id,
  'data_processing', true,
  'consent', 'v1.1',
  'As the legal guardian of Felix Schmidt (DOB 10.04.2019), I consent to '
  'Berliner Gesundheitszentrum processing personal and health data for medical care '
  'as described in the Datenschutzerklärung v1.1.',
  'paper', NULL, NULL,
  NOW() - interval '1 year',
  NOW() - interval '1 year'
),
-- Appointment reminders consent — captured on paper by parent
(
  gen_random_uuid(), pat5_id, clinic2_id,
  'appointment_reminders', true,
  'consent', 'v1.1',
  'I consent on behalf of Felix Schmidt to receiving appointment reminders by email and SMS.',
  'paper', NULL, NULL,
  NOW() - interval '1 year',
  NOW() - interval '1 year'
),

-- ── Clinic 2 — Patient 6 (Ingrid Weber) ─────────────────────────────────────

-- Core data processing consent
(
  gen_random_uuid(), pat6_id, clinic2_id,
  'data_processing', true,
  'consent', 'v1.2',
  'I consent to Berliner Gesundheitszentrum processing my personal and health data '
  'for the purpose of providing medical care, as described in the Datenschutzerklärung v1.2.',
  'web_form', '195.200.87.12'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  NOW() - interval '9 months',
  NOW() - interval '9 months'
),
-- Appointment reminders consent
(
  gen_random_uuid(), pat6_id, clinic2_id,
  'appointment_reminders', true,
  'consent', 'v1.2',
  'I consent to receiving appointment reminders by email and SMS.',
  'web_form', '195.200.87.12'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  NOW() - interval '9 months',
  NOW() - interval '9 months'
);

-- ============================================================================
-- SECTION 8: AUDIT LOGS
-- Immutable compliance audit trail for representative system events.
-- Captures: staff logins, patient record accesses, appointment mutations,
-- consent events, and one data export request.
-- NOTE: PII is NEVER stored in old_values/new_values — only metadata.
-- ============================================================================

INSERT INTO public.audit_logs (
  id, clinic_id,
  actor_user_id, actor_ip, actor_user_agent,
  action, resource_type, resource_id,
  old_values, new_values,
  session_token_hash, http_method, api_endpoint,
  success, error_code,
  created_at
) VALUES

-- ── Staff Login Events ───────────────────────────────────────────────────────

-- Clinic 1 owner login
(
  gen_random_uuid(), clinic1_id,
  u_clinic1_owner, '87.233.10.101'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
  'LOGIN', 'auth_session', NULL,
  NULL, '{"method": "email_password", "mfa": false}'::jsonb,
  'sha256:' || encode(digest('session_token_c1_owner_1', 'sha256'), 'hex'),
  'POST', '/auth/v1/token',
  true, NULL,
  NOW() - interval '3 weeks' - interval '8 hours'
),

-- Clinic 2 doctor (Katarina) login
(
  gen_random_uuid(), clinic2_id,
  u_clinic2_doctor1, '91.47.105.22'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0',
  'LOGIN', 'auth_session', NULL,
  NULL, '{"method": "email_password", "mfa": true}'::jsonb,
  'sha256:' || encode(digest('session_token_c2_doc1_1', 'sha256'), 'hex'),
  'POST', '/auth/v1/token',
  true, NULL,
  NOW() - interval '4 weeks' - interval '9 hours 30 minutes'
),

-- Failed login attempt (wrong password)
(
  gen_random_uuid(), NULL,
  NULL, '103.45.67.89'::inet,
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123.0.0.0',
  'LOGIN', 'auth_session', NULL,
  NULL, '{"method": "email_password", "reason": "invalid_credentials"}'::jsonb,
  NULL,
  'POST', '/auth/v1/token',
  false, 'INVALID_CREDENTIALS',
  NOW() - interval '2 weeks' - interval '3 hours'
),

-- ── Patient Record Access (READ) ─────────────────────────────────────────────

-- Doctor 1 accessed patient 1 record before appointment
(
  gen_random_uuid(), clinic1_id,
  u_clinic1_doctor1, '87.233.10.200'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
  'SELECT', 'patient', pat1_id,
  NULL, '{"columns_accessed": ["id", "first_name", "last_name", "date_of_birth", "clinical_notes"]}'::jsonb,
  'sha256:' || encode(digest('session_token_c1_doc1_appt1', 'sha256'), 'hex'),
  'GET', '/api/patients/' || pat1_id::text,
  true, NULL,
  NOW() - interval '3 weeks' + interval '9 hours 55 minutes'
),

-- Doctor 3 accessed patient 4 record before neurology appointment
(
  gen_random_uuid(), clinic2_id,
  u_clinic2_doctor1, '91.47.105.22'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0',
  'SELECT', 'patient', pat4_id,
  NULL, '{"columns_accessed": ["id", "first_name", "last_name", "date_of_birth", "clinical_notes"]}'::jsonb,
  'sha256:' || encode(digest('session_token_c2_doc1_appt7', 'sha256'), 'hex'),
  'GET', '/api/patients/' || pat4_id::text,
  true, NULL,
  NOW() - interval '4 weeks' + interval '9 hours 55 minutes'
),

-- ── Appointment INSERT Events ─────────────────────────────────────────────────

-- Receptionist created appointment 1 for Martijn
(
  gen_random_uuid(), clinic1_id,
  u_clinic1_receptionist, '87.233.10.150'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
  'INSERT', 'appointment', appt1_id,
  NULL,
  jsonb_build_object(
    'clinic_id', clinic1_id,
    'patient_id', pat1_id,
    'doctor_id', doc1_id,
    'status', 'pending',
    'booked_via', 'dashboard'
  ),
  'sha256:' || encode(digest('session_token_c1_rec_create_appt1', 'sha256'), 'hex'),
  'POST', '/api/appointments',
  true, NULL,
  NOW() - interval '3 weeks' - interval '2 days'
),

-- Patient Emma self-booked appointment 2 online
(
  gen_random_uuid(), clinic1_id,
  u_patient2, '145.58.201.77'::inet,
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'INSERT', 'appointment', appt2_id,
  NULL,
  jsonb_build_object(
    'clinic_id', clinic1_id,
    'patient_id', pat2_id,
    'doctor_id', doc2_id,
    'status', 'pending',
    'booked_via', 'online'
  ),
  'sha256:' || encode(digest('session_token_pat2_book_appt2', 'sha256'), 'hex'),
  'POST', '/api/appointments',
  true, NULL,
  NOW() - interval '5 weeks' - interval '1 day'
),

-- ── Appointment UPDATE Events ─────────────────────────────────────────────────

-- Appointment 1 status changed from pending to confirmed by receptionist
(
  gen_random_uuid(), clinic1_id,
  u_clinic1_receptionist, '87.233.10.150'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
  'UPDATE', 'appointment', appt1_id,
  '{"status": "pending"}'::jsonb,
  '{"status": "confirmed"}'::jsonb,
  'sha256:' || encode(digest('session_token_c1_rec_confirm_appt1', 'sha256'), 'hex'),
  'PATCH', '/api/appointments/' || appt1_id::text,
  true, NULL,
  NOW() - interval '3 weeks' - interval '2 days' + interval '5 minutes'
),

-- Appointment 1 status changed to completed by doctor after visit
(
  gen_random_uuid(), clinic1_id,
  u_clinic1_doctor1, '87.233.10.200'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
  'UPDATE', 'appointment', appt1_id,
  '{"status": "confirmed"}'::jsonb,
  '{"status": "completed"}'::jsonb,
  'sha256:' || encode(digest('session_token_c1_doc1_complete_appt1', 'sha256'), 'hex'),
  'PATCH', '/api/appointments/' || appt1_id::text,
  true, NULL,
  NOW() - interval '3 weeks' + interval '10 hours 20 minutes'
),

-- Appointment 6 cancelled by patient (Emma)
(
  gen_random_uuid(), clinic1_id,
  u_patient2, '145.58.201.77'::inet,
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'UPDATE', 'appointment', appt6_id,
  '{"status": "confirmed"}'::jsonb,
  '{"status": "cancelled", "cancellation_reason": "work_commitment"}'::jsonb,
  'sha256:' || encode(digest('session_token_pat2_cancel_appt6', 'sha256'), 'hex'),
  'PATCH', '/api/appointments/' || appt6_id::text,
  true, NULL,
  NOW() - interval '2 weeks' - interval '1 day 2 hours'
),

-- ── Consent Events ────────────────────────────────────────────────────────────

-- Patient 4 (Lena) granted analytics consent during registration
(
  gen_random_uuid(), clinic2_id,
  u_patient3, '91.47.102.233'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0',
  'CONSENT_GRANTED', 'patient_consent', pat4_id,
  NULL,
  '{"consent_type": "analytics", "consent_version": "v1.1", "is_granted": true}'::jsonb,
  'sha256:' || encode(digest('session_token_pat4_consent_analytics', 'sha256'), 'hex'),
  'POST', '/api/consents',
  true, NULL,
  NOW() - interval '1 year 6 months'
),

-- Patient 4 (Lena) revoked analytics consent 3 months later
(
  gen_random_uuid(), clinic2_id,
  u_patient3, '91.47.102.233'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0',
  'CONSENT_REVOKED', 'patient_consent', pat4_id,
  '{"consent_type": "analytics", "was_granted": true}'::jsonb,
  '{"consent_type": "analytics", "is_granted": false}'::jsonb,
  'sha256:' || encode(digest('session_token_pat4_revoke_analytics', 'sha256'), 'hex'),
  'POST', '/api/consents',
  true, NULL,
  NOW() - interval '1 year 3 months'
),

-- ── GDPR Rights Exercise Event ────────────────────────────────────────────────

-- Patient 1 (Martijn) requested data export (Right to Portability, Article 20)
(
  gen_random_uuid(), clinic1_id,
  u_patient1, '87.233.12.45'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
  'DATA_EXPORT_REQUESTED', 'patient', pat1_id,
  NULL,
  '{"requested_format": "json", "scope": "all_personal_data", "gdpr_article": "Article 20"}'::jsonb,
  'sha256:' || encode(digest('session_token_pat1_export_request', 'sha256'), 'hex'),
  'POST', '/api/patients/' || pat1_id::text || '/export',
  true, NULL,
  NOW() - interval '6 months'
),

-- System fulfilled the export request (logged by background job, no actor_user_id)
(
  gen_random_uuid(), clinic1_id,
  NULL, NULL, NULL,
  'EXPORT', 'patient', pat1_id,
  NULL,
  '{"format": "json", "file_size_bytes": 14820, "records_included": ["profile", "appointments", "consents"]}'::jsonb,
  NULL,
  'POST', '/internal/export-pipeline',
  true, NULL,
  NOW() - interval '6 months' + interval '2 hours 15 minutes'
),

-- ── Clinic 2 Receptionist Logout ─────────────────────────────────────────────

(
  gen_random_uuid(), clinic2_id,
  u_clinic2_receptionist, '79.203.55.11'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'LOGOUT', 'auth_session', NULL,
  NULL, '{"session_duration_minutes": 247}'::jsonb,
  'sha256:' || encode(digest('session_token_c2_rec_logout', 'sha256'), 'hex'),
  'POST', '/auth/v1/logout',
  true, NULL,
  NOW() - interval '1 year 1 month'
);

-- ============================================================================
-- SEED COMPLETE
-- ============================================================================

END;
$$;

-- =============================================================================
-- SEED VERIFICATION QUERIES
-- Run these after seeding to confirm data integrity.
-- =============================================================================

-- Summary counts per table
SELECT 'clinics'           AS table_name, COUNT(*) AS row_count FROM public.clinics
UNION ALL
SELECT 'clinic_members',    COUNT(*) FROM public.clinic_members
UNION ALL
SELECT 'doctors',           COUNT(*) FROM public.doctors
UNION ALL
SELECT 'appointment_types', COUNT(*) FROM public.appointment_types
UNION ALL
SELECT 'patients',          COUNT(*) FROM public.patients
UNION ALL
SELECT 'appointments',      COUNT(*) FROM public.appointments
UNION ALL
SELECT 'patient_consents',  COUNT(*) FROM public.patient_consents
UNION ALL
SELECT 'audit_logs',        COUNT(*) FROM public.audit_logs
ORDER BY table_name;

-- Appointment status distribution
SELECT
  c.name AS clinic_name,
  a.status,
  COUNT(*) AS count
FROM public.appointments a
JOIN public.clinics c ON c.id = a.clinic_id
GROUP BY c.name, a.status
ORDER BY c.name, a.status;

-- Tenant isolation check: confirm no cross-clinic data leakage in patients
SELECT
  c.name   AS clinic_name,
  c.country_code,
  COUNT(p.id) AS patient_count
FROM public.patients p
JOIN public.clinics c ON c.id = p.clinic_id
GROUP BY c.name, c.country_code
ORDER BY c.name;

-- Latest consent state per patient per consent type
SELECT
  p.first_name || ' ' || p.last_name AS patient_name,
  pc.consent_type,
  pc.is_granted,
  pc.consented_at
FROM public.patient_consents pc
JOIN public.patients p ON p.id = pc.patient_id
ORDER BY p.last_name, pc.consent_type, pc.consented_at DESC;
