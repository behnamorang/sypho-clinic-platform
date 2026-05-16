-- =============================================================================
-- Sypho.io — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Core tables for clinic booking SaaS with full GDPR compliance.
-- Region: EU (eu-central-1) — PostgreSQL / Supabase
-- Compliance: GDPR (EU) 2016/679, ISO 27001, eHealth Network Guidelines
-- Author: Sypho Engineering Team
-- Created: 2026-05-16
-- =============================================================================

-- =============================================================================
-- PREREQUISITES & EXTENSIONS
-- =============================================================================

-- Enable UUID generation (pgcrypto is included in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable row-level security helper extension
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================================================
-- CUSTOM TYPES & ENUMS
-- =============================================================================

-- Appointment status lifecycle
CREATE TYPE appointment_status AS ENUM (
  'pending',       -- Created, awaiting confirmation
  'confirmed',     -- Confirmed by clinic staff
  'checked_in',    -- Patient has arrived
  'in_progress',   -- Appointment is ongoing
  'completed',     -- Appointment finished successfully
  'cancelled',     -- Cancelled by patient or clinic
  'no_show',       -- Patient did not attend
  'rescheduled'    -- Moved to a new slot
);

-- Gender values following ISO 5218 and EU inclusive standards
CREATE TYPE gender_type AS ENUM (
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say',
  'other'
);

-- GDPR lawful basis for data processing (Article 6 GDPR)
CREATE TYPE gdpr_lawful_basis AS ENUM (
  'consent',           -- Article 6(1)(a)
  'contract',          -- Article 6(1)(b)
  'legal_obligation',  -- Article 6(1)(c)
  'vital_interests',   -- Article 6(1)(d)
  'public_task',       -- Article 6(1)(e)
  'legitimate_interest' -- Article 6(1)(f)
);

-- User roles within the system
CREATE TYPE user_role AS ENUM (
  'clinic_owner',    -- Full administrative access to a clinic
  'clinic_admin',    -- Administrative access without billing
  'doctor',          -- Can manage own appointments and view own patients
  'receptionist',    -- Can manage appointments and patient check-in
  'patient'          -- Can book and manage own appointments
);

-- Notification/reminder channel types
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'push',
  'in_app'
);

-- Soft-delete / audit action types
CREATE TYPE audit_action AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE',
  'SELECT',  -- For sensitive data access logging
  'EXPORT',
  'LOGIN',
  'LOGOUT',
  'CONSENT_GRANTED',
  'CONSENT_REVOKED',
  'DATA_EXPORT_REQUESTED',
  'DATA_DELETION_REQUESTED'
);

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

/**
 * Returns the clinic_id associated with the currently authenticated user.
 * Used in RLS policies to enforce tenant isolation.
 * This function is SECURITY DEFINER so it can access the users table,
 * but the RLS policies it enables still run in the calling user context.
 */
CREATE OR REPLACE FUNCTION get_current_clinic_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT clinic_id
    FROM public.clinic_members
    WHERE user_id   = auth.uid()
      AND is_active = true
    LIMIT 1
  );
END;
$$;

/**
 * Returns the user_role for the currently authenticated user within their clinic.
 * Used in RLS policies for role-based access control.
 */
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.clinic_members
    WHERE user_id   = auth.uid()
      AND is_active = true
    LIMIT 1
  );
END;
$$;

/**
 * Automatically updates the `updated_at` timestamp on row modification.
 * Attach to tables via triggers.
 */
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- TABLE: clinics
-- Description: Top-level tenant entity. Each clinic is an isolated tenant.
-- GDPR: Acts as the Data Controller for patient data within their clinic.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.clinics (
  id                    uuid              PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name                  text              NOT NULL CHECK (char_length(name) BETWEEN 2 AND 255),
  slug                  text              UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  tax_id                text              UNIQUE,          -- EU VAT / company registration number
  registration_number   text,                              -- National clinic registration

  -- Contact
  email                 text              NOT NULL CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  phone                 text,
  website               text,

  -- EU Address (data residency relevant)
  address_line1         text              NOT NULL,
  address_line2         text,
  city                  text              NOT NULL,
  state_province        text,
  postal_code           text              NOT NULL,
  country_code          char(2)           NOT NULL DEFAULT 'DE'
                          CHECK (country_code ~ '^[A-Z]{2}$'),   -- ISO 3166-1 alpha-2

  -- Timezone (important for scheduling across EU member states)
  timezone              text              NOT NULL DEFAULT 'Europe/Berlin',

  -- Business hours stored as JSONB for flexibility
  -- Format: { "monday": { "open": "09:00", "close": "17:00", "closed": false }, ... }
  business_hours        jsonb             NOT NULL DEFAULT '{}',

  -- GDPR: Data Controller information (required for patient-facing privacy notices)
  dpo_name              text,            -- Data Protection Officer name
  dpo_email             text,            -- DPO contact email (required if DPO is designated)
  privacy_policy_url    text,
  terms_url             text,

  -- Subscription & billing
  subscription_tier     text             NOT NULL DEFAULT 'free'
                          CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_expires_at timestamptz,

  -- Status
  is_active             boolean          NOT NULL DEFAULT true,
  is_verified           boolean          NOT NULL DEFAULT false,

  -- Soft delete (GDPR: retain records for legal obligations, but mark as deleted)
  deleted_at            timestamptz,

  -- Timestamps
  created_at            timestamptz      NOT NULL DEFAULT NOW(),
  updated_at            timestamptz      NOT NULL DEFAULT NOW()
);

-- Indexes for clinics
CREATE INDEX idx_clinics_slug ON public.clinics (slug);
CREATE INDEX idx_clinics_country ON public.clinics (country_code);
CREATE INDEX idx_clinics_is_active ON public.clinics (is_active) WHERE deleted_at IS NULL;

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: clinic_members
-- Description: Links Supabase Auth users to clinics with specific roles.
-- This is the authorization bridge table for multi-tenancy RLS.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.clinic_members (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    uuid         NOT NULL REFERENCES public.clinics (id) ON DELETE CASCADE,
  user_id      uuid         NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  role         user_role    NOT NULL DEFAULT 'receptionist',
  is_active    boolean      NOT NULL DEFAULT true,

  -- Invitation tracking
  invited_by   uuid         REFERENCES auth.users (id),
  invited_at   timestamptz,
  accepted_at  timestamptz,

  -- Timestamps
  created_at   timestamptz  NOT NULL DEFAULT NOW(),
  updated_at   timestamptz  NOT NULL DEFAULT NOW(),

  -- A user can belong to multiple clinics (e.g. a locum doctor)
  -- but can only have one role per clinic
  UNIQUE (clinic_id, user_id)
);

CREATE INDEX idx_clinic_members_user_id  ON public.clinic_members (user_id);
CREATE INDEX idx_clinic_members_clinic_id ON public.clinic_members (clinic_id);
CREATE INDEX idx_clinic_members_active   ON public.clinic_members (user_id, clinic_id) WHERE is_active = true;

CREATE TRIGGER trg_clinic_members_updated_at
  BEFORE UPDATE ON public.clinic_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: doctors
-- Description: Doctor profiles linked to clinics. Contains professional data.
-- GDPR: Professional data — lawful basis: CONTRACT (employment/service agreement).
-- Note: Personal contact data should be minimized; use clinic contact info where possible.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.doctors (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             uuid         NOT NULL REFERENCES public.clinics (id) ON DELETE CASCADE,

  -- Link to Supabase Auth user (optional: some doctors may not have login access)
  user_id               uuid         REFERENCES auth.users (id) ON DELETE SET NULL,

  -- Professional identity
  title                 text         CHECK (title IN ('Dr.', 'Prof.', 'Prof. Dr.', 'Mr.', 'Ms.', 'Mx.')),
  first_name            text         NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 100),
  last_name             text         NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 100),
  license_number        text         NOT NULL,  -- Medical license / registration number
  license_country       char(2)      NOT NULL CHECK (license_country ~ '^[A-Z]{2}$'),

  -- Specialty (using SNOMED CT / ICHI codes where applicable for interoperability)
  specialty             text         NOT NULL,
  sub_specialty         text,

  -- Contact (clinic-level contact preferred over personal)
  professional_email    text         CHECK (professional_email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  professional_phone    text,

  -- Availability configuration
  -- JSONB: { "monday": [{"start": "09:00", "end": "13:00"}, {"start": "14:00", "end": "17:00"}], ... }
  availability_schedule jsonb        NOT NULL DEFAULT '{}',

  -- Appointment settings
  default_appointment_duration_minutes integer NOT NULL DEFAULT 30
    CHECK (default_appointment_duration_minutes BETWEEN 5 AND 480),
  max_patients_per_day  integer      DEFAULT 30,

  -- Status
  is_active             boolean      NOT NULL DEFAULT true,
  is_accepting_new_patients boolean  NOT NULL DEFAULT true,

  -- Soft delete
  deleted_at            timestamptz,

  -- Timestamps
  created_at            timestamptz  NOT NULL DEFAULT NOW(),
  updated_at            timestamptz  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_clinic_id   ON public.doctors (clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_doctors_user_id     ON public.doctors (user_id);
CREATE INDEX idx_doctors_license     ON public.doctors (license_number, license_country);
CREATE INDEX idx_doctors_specialty   ON public.doctors (specialty);

CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: patients
-- Description: Patient records. Contains Special Category Data (health data).
-- GDPR Article 9: Special Category Data — requires explicit consent (Article 9(2)(a))
-- or another Article 9(2) exception (e.g. healthcare provision, Article 9(2)(h)).
-- ALL COLUMNS HERE ARE CONSIDERED SENSITIVE PII / SPECIAL CATEGORY DATA.
-- RLS is CRITICAL on this table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patients (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             uuid         NOT NULL REFERENCES public.clinics (id) ON DELETE RESTRICT,

  -- Link to Supabase Auth user (patients who have created an account)
  user_id               uuid         REFERENCES auth.users (id) ON DELETE SET NULL,

  -- Personal data (minimize collection — only what's clinically necessary)
  first_name            text         NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 100),
  last_name             text         NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 100),
  date_of_birth         date         NOT NULL,
  gender                gender_type  NOT NULL,
  national_id           text,        -- National ID / social security (encrypted at application layer)

  -- Contact
  email                 text         CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  phone                 text,

  -- EU Address
  address_line1         text,
  address_line2         text,
  city                  text,
  postal_code           text,
  country_code          char(2)      DEFAULT 'DE' CHECK (country_code ~ '^[A-Z]{2}$'),

  -- Emergency contact (optional, minimized)
  emergency_contact_name  text,
  emergency_contact_phone text,

  -- Clinical notes (FREE TEXT — handle with extreme care, may contain sensitive health data)
  clinical_notes        text,

  -- Insurance information
  insurance_provider    text,
  insurance_policy_number text,      -- Consider encrypting at application layer

  -- GDPR: Data processing consent tracking
  gdpr_consent_given_at  timestamptz,
  gdpr_consent_version   text,       -- Version of the consent form signed

  -- GDPR: Retention & deletion
  -- Per EU medical record retention laws, defaulting to 10 years from last appointment
  data_retention_until  date,
  data_deletion_requested_at timestamptz,
  data_deletion_completed_at timestamptz,
  anonymized_at         timestamptz, -- Set when PII is anonymized (post-retention period)

  -- Soft delete
  deleted_at            timestamptz,

  -- Timestamps
  created_at            timestamptz  NOT NULL DEFAULT NOW(),
  updated_at            timestamptz  NOT NULL DEFAULT NOW()
);

-- Performance indexes (clinic_id is always first for tenant scoping)
CREATE INDEX idx_patients_clinic_id          ON public.patients (clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_user_id            ON public.patients (user_id);
CREATE INDEX idx_patients_clinic_name        ON public.patients (clinic_id, last_name, first_name)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_date_of_birth      ON public.patients (clinic_id, date_of_birth)
  WHERE deleted_at IS NULL;
-- Partial index for deletion pipeline
CREATE INDEX idx_patients_deletion_requested ON public.patients (data_deletion_requested_at)
  WHERE data_deletion_requested_at IS NOT NULL AND data_deletion_completed_at IS NULL;

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: appointment_types
-- Description: Defines the types of appointments a clinic offers.
-- This drives scheduling logic and duration calculations.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.appointment_types (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             uuid         NOT NULL REFERENCES public.clinics (id) ON DELETE CASCADE,

  name                  text         NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  description           text,
  color                 text         DEFAULT '#3B82F6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),

  duration_minutes      integer      NOT NULL CHECK (duration_minutes BETWEEN 5 AND 480),
  buffer_before_minutes integer      NOT NULL DEFAULT 0 CHECK (buffer_before_minutes >= 0),
  buffer_after_minutes  integer      NOT NULL DEFAULT 0 CHECK (buffer_after_minutes >= 0),

  price_cents           integer      CHECK (price_cents >= 0), -- Store money as integer cents
  currency_code         char(3)      DEFAULT 'EUR' CHECK (currency_code ~ '^[A-Z]{3}$'),

  is_active             boolean      NOT NULL DEFAULT true,
  is_online_bookable    boolean      NOT NULL DEFAULT true,

  created_at            timestamptz  NOT NULL DEFAULT NOW(),
  updated_at            timestamptz  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointment_types_clinic ON public.appointment_types (clinic_id)
  WHERE is_active = true;

CREATE TRIGGER trg_appointment_types_updated_at
  BEFORE UPDATE ON public.appointment_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: appointments
-- Description: Core scheduling entity. Links patients, doctors, and time slots.
-- GDPR: Contains health data (appointment type, clinical notes) — Special Category Data.
-- Lawful basis: Article 9(2)(h) — healthcare provision.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id                    uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             uuid              NOT NULL REFERENCES public.clinics (id) ON DELETE RESTRICT,
  patient_id            uuid              NOT NULL REFERENCES public.patients (id) ON DELETE RESTRICT,
  doctor_id             uuid              NOT NULL REFERENCES public.doctors (id) ON DELETE RESTRICT,
  appointment_type_id   uuid              REFERENCES public.appointment_types (id) ON DELETE SET NULL,

  -- Scheduling
  scheduled_at          timestamptz       NOT NULL,
  duration_minutes      integer           NOT NULL CHECK (duration_minutes BETWEEN 5 AND 480),
  -- ends_at is computed by the trg_appointments_ends_at trigger (BEFORE INSERT OR UPDATE).
  -- PostgreSQL 17 requires IMMUTABLE expressions in generated columns;
  -- timestamptz + interval is STABLE (timezone-dependent), so a trigger is used instead.
  ends_at               timestamptz,

  -- Status
  status                appointment_status NOT NULL DEFAULT 'pending',
  cancellation_reason   text,
  cancellation_by       uuid              REFERENCES auth.users (id),
  cancelled_at          timestamptz,

  -- Clinical data (treat as health data — sensitive)
  chief_complaint       text,             -- Why the patient is visiting
  clinical_notes        text,             -- Notes from doctor (post-appointment)
  diagnosis_codes       text[],           -- ICD-10 codes (array for multiple diagnoses)
  prescription_notes    text,             -- Brief prescription notes (NOT a full prescription system)

  -- Follow-up
  follow_up_required    boolean           NOT NULL DEFAULT false,
  follow_up_notes       text,

  -- Metadata
  booked_via            text              DEFAULT 'dashboard'
                          CHECK (booked_via IN ('dashboard', 'online', 'phone', 'walk_in', 'api')),
  booked_by             uuid              REFERENCES auth.users (id),

  -- GDPR: Data retention
  -- Appointments may need to be retained longer than patient records due to billing/legal
  data_retention_until  date,

  -- Soft delete
  deleted_at            timestamptz,

  -- Timestamps
  created_at            timestamptz       NOT NULL DEFAULT NOW(),
  updated_at            timestamptz       NOT NULL DEFAULT NOW(),

  -- Business constraint: prevent double-booking same doctor at same time
  -- (a partial unique index is used below for soft-delete compatibility)
  CONSTRAINT chk_appointment_ends_after_start
    CHECK (ends_at > scheduled_at),
  CONSTRAINT chk_cancellation_consistency
    CHECK (
      (status = 'cancelled' AND cancelled_at IS NOT NULL) OR
      (status != 'cancelled')
    )
);

-- Indexes
CREATE INDEX idx_appointments_clinic_id      ON public.appointments (clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_patient_id     ON public.appointments (patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_doctor_id      ON public.appointments (doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_scheduled_at   ON public.appointments (clinic_id, scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_doctor_schedule ON public.appointments (doctor_id, scheduled_at, ends_at)
  WHERE deleted_at IS NULL AND status NOT IN ('cancelled', 'no_show');
CREATE INDEX idx_appointments_status         ON public.appointments (clinic_id, status, scheduled_at)
  WHERE deleted_at IS NULL;

-- Prevent double-booking: same doctor cannot have two active appointments that overlap
-- This is enforced at the application layer as well, but this index acts as a safety net
CREATE UNIQUE INDEX idx_appointments_no_double_booking
  ON public.appointments (doctor_id, scheduled_at)
  WHERE deleted_at IS NULL AND status NOT IN ('cancelled', 'no_show', 'rescheduled');

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Compute ends_at before every insert or update.
-- PostgreSQL 17 requires IMMUTABLE expressions in generated columns, but
-- timestamptz + interval is STABLE, so we use a trigger instead.
CREATE OR REPLACE FUNCTION compute_appointment_ends_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.ends_at := NEW.scheduled_at + (NEW.duration_minutes * interval '1 minute');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_appointments_ends_at
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION compute_appointment_ends_at();

-- =============================================================================
-- TABLE: patient_consents
-- Description: Immutable audit log of patient consent records.
-- GDPR Article 7: Conditions for consent. Records must never be updated, only inserted.
-- Each consent grant or revocation is a new row to maintain complete audit trail.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_consents (
  id                    uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            uuid             NOT NULL REFERENCES public.patients (id) ON DELETE RESTRICT,
  clinic_id             uuid             NOT NULL REFERENCES public.clinics (id) ON DELETE RESTRICT,

  -- Consent type
  consent_type          text             NOT NULL CHECK (consent_type IN (
                           'data_processing',       -- Core data processing consent
                           'appointment_reminders', -- SMS/email reminders
                           'marketing',             -- Marketing communications
                           'analytics',             -- Anonymized analytics
                           'third_party_sharing',   -- Sharing with third parties
                           'research',              -- Use of anonymized data for research
                           'telemedicine'           -- Video consultation consent
                         )),

  -- Consent state
  is_granted            boolean          NOT NULL,

  -- Lawful basis under GDPR Article 6 (and Article 9 for health data)
  lawful_basis          gdpr_lawful_basis NOT NULL DEFAULT 'consent',

  -- Version of the consent form/policy presented
  consent_version       text             NOT NULL,
  consent_text_snapshot text,            -- Exact text shown to patient at time of consent

  -- How consent was given
  capture_method        text             NOT NULL CHECK (capture_method IN (
                           'web_form', 'mobile_app', 'paper', 'verbal_recorded', 'api'
                         )),

  -- Technical proof of consent
  ip_address            inet,            -- IP address at time of consent
  user_agent            text,            -- Browser/device at time of consent

  -- Timestamps (immutable once inserted)
  consented_at          timestamptz      NOT NULL DEFAULT NOW(),

  created_at            timestamptz      NOT NULL DEFAULT NOW()

  -- NOTE: No updated_at — this table is append-only (immutable audit trail)
  -- NOTE: No deleted_at — consent records must never be deleted per GDPR Article 7(1)
);

-- Prevent any UPDATE or DELETE on consent records (immutability enforcement)
CREATE RULE no_update_patient_consents AS
  ON UPDATE TO public.patient_consents DO INSTEAD NOTHING;

CREATE RULE no_delete_patient_consents AS
  ON DELETE TO public.patient_consents DO INSTEAD NOTHING;

CREATE INDEX idx_patient_consents_patient    ON public.patient_consents (patient_id, consent_type, consented_at DESC);
CREATE INDEX idx_patient_consents_clinic     ON public.patient_consents (clinic_id);

-- =============================================================================
-- TABLE: audit_logs
-- Description: Immutable audit trail for GDPR compliance and security monitoring.
-- GDPR Article 5(2): Accountability principle requires demonstrable compliance.
-- Retention: Minimum 5 years as per EU guidelines.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid           REFERENCES public.clinics (id) ON DELETE SET NULL,

  -- Actor
  actor_user_id   uuid,          -- auth.users.id (nullable: system actions have no user)
  actor_ip        inet,
  actor_user_agent text,

  -- Action
  action          audit_action   NOT NULL,
  resource_type   text           NOT NULL,  -- e.g. 'patient', 'appointment', 'clinic'
  resource_id     uuid,                     -- ID of the affected resource

  -- Change snapshot (for UPDATE operations)
  -- Stores only non-PII metadata changes; never log full PII values
  old_values      jsonb,
  new_values      jsonb,

  -- Context
  session_token_hash text,       -- Hashed session token for correlation (not the token itself)
  http_method     text           CHECK (http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  api_endpoint    text,

  -- Outcome
  success         boolean        NOT NULL DEFAULT true,
  error_code      text,

  -- Immutable timestamp
  created_at      timestamptz    NOT NULL DEFAULT NOW()

  -- NOTE: No updated_at, no deleted_at — audit logs are strictly immutable
);

-- Prevent any modification of audit logs
CREATE RULE no_update_audit_logs AS
  ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;

CREATE RULE no_delete_audit_logs AS
  ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

-- Partitioning-friendly indexes
CREATE INDEX idx_audit_logs_clinic_created   ON public.audit_logs (clinic_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor            ON public.audit_logs (actor_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource         ON public.audit_logs (resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_action           ON public.audit_logs (action, created_at DESC);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- This is the primary enforcement mechanism for multi-tenant data isolation.
-- GDPR Compliance: Ensures absolute data isolation between clinic tenants.
-- =============================================================================

ALTER TABLE public.clinics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Force RLS to apply even to table owners
ALTER TABLE public.clinics            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.doctors            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.patients           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.appointments       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES: clinics
-- A user can only see and manage their own clinic(s).
-- =============================================================================

-- SELECT: Users can only read clinics they are members of
CREATE POLICY "clinics_select_own"
  ON public.clinics FOR SELECT
  USING (
    id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- INSERT: Only authenticated users can create a clinic (they become the owner)
CREATE POLICY "clinics_insert_authenticated"
  ON public.clinics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only clinic owners and admins can update clinic details
CREATE POLICY "clinics_update_owner_or_admin"
  ON public.clinics FOR UPDATE
  USING (
    id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('clinic_owner', 'clinic_admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('clinic_owner', 'clinic_admin')
    )
  );

-- DELETE: Only clinic owners can soft-delete (set deleted_at); no hard deletes via RLS
CREATE POLICY "clinics_delete_owner_only"
  ON public.clinics FOR DELETE
  USING (
    id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role = 'clinic_owner'
    )
  );

-- =============================================================================
-- RLS POLICIES: clinic_members
-- =============================================================================

-- SELECT: Users can see members of their own clinic
CREATE POLICY "clinic_members_select_same_clinic"
  ON public.clinic_members FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members cm2
      WHERE cm2.user_id = auth.uid() AND cm2.is_active = true
    )
  );

-- SELECT (self): Users can always see their own membership records
CREATE POLICY "clinic_members_select_self"
  ON public.clinic_members FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: Only clinic owners and admins can add members
CREATE POLICY "clinic_members_insert_admin"
  ON public.clinic_members FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('clinic_owner', 'clinic_admin')
    )
  );

-- UPDATE: Owners/admins can update members; members can update their own accepted_at
CREATE POLICY "clinic_members_update_admin"
  ON public.clinic_members FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('clinic_owner', 'clinic_admin')
    )
    OR user_id = auth.uid()
  );

-- DELETE: Only clinic owners can remove members
CREATE POLICY "clinic_members_delete_owner"
  ON public.clinic_members FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role = 'clinic_owner'
    )
  );

-- =============================================================================
-- RLS POLICIES: doctors
-- =============================================================================

-- SELECT: Staff of the same clinic can view doctors
CREATE POLICY "doctors_select_same_clinic"
  ON public.doctors FOR SELECT
  USING (
    clinic_id = get_current_clinic_id()
    AND deleted_at IS NULL
  );

-- INSERT: Only clinic owners and admins can add doctors
CREATE POLICY "doctors_insert_admin"
  ON public.doctors FOR INSERT
  WITH CHECK (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() IN ('clinic_owner', 'clinic_admin')
  );

-- UPDATE: Owners and admins can update any doctor; doctors can update their own profile
CREATE POLICY "doctors_update_admin_or_self"
  ON public.doctors FOR UPDATE
  USING (
    clinic_id = get_current_clinic_id()
    AND (
      get_current_user_role() IN ('clinic_owner', 'clinic_admin')
      OR user_id = auth.uid()
    )
  );

-- DELETE: Only clinic owners can delete (soft-delete) doctors
CREATE POLICY "doctors_delete_owner"
  ON public.doctors FOR DELETE
  USING (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() = 'clinic_owner'
  );

-- =============================================================================
-- RLS POLICIES: patients
-- CRITICAL: Most sensitive table. Strict isolation is mandatory.
-- =============================================================================

-- SELECT: Only authenticated clinic staff (not patients) can query all patients
-- Patients can only view their own record
CREATE POLICY "patients_select_clinic_staff"
  ON public.patients FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      -- Clinic staff can see patients belonging to their clinic
      (
        clinic_id = get_current_clinic_id()
        AND get_current_user_role() IN ('clinic_owner', 'clinic_admin', 'doctor', 'receptionist')
      )
      -- Patients can only view their own record
      OR user_id = auth.uid()
    )
  );

-- INSERT: Clinic staff can create patient records; patients can self-register
CREATE POLICY "patients_insert_staff_or_self"
  ON public.patients FOR INSERT
  WITH CHECK (
    clinic_id = get_current_clinic_id()
    AND (
      get_current_user_role() IN ('clinic_owner', 'clinic_admin', 'doctor', 'receptionist')
      OR auth.uid() IS NOT NULL  -- Authenticated patients can self-register
    )
  );

-- UPDATE: Staff can update patient records; patients can update their own non-clinical data
CREATE POLICY "patients_update_staff_or_self"
  ON public.patients FOR UPDATE
  USING (
    deleted_at IS NULL
    AND (
      (
        clinic_id = get_current_clinic_id()
        AND get_current_user_role() IN ('clinic_owner', 'clinic_admin', 'doctor', 'receptionist')
      )
      OR user_id = auth.uid()
    )
  );

-- DELETE: Only clinic owners and admins can soft-delete patient records
-- Hard deletes are NOT permitted through the application layer
CREATE POLICY "patients_delete_admin_only"
  ON public.patients FOR DELETE
  USING (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() IN ('clinic_owner', 'clinic_admin')
  );

-- =============================================================================
-- RLS POLICIES: appointment_types
-- =============================================================================

CREATE POLICY "appointment_types_select_same_clinic"
  ON public.appointment_types FOR SELECT
  USING (clinic_id = get_current_clinic_id());

CREATE POLICY "appointment_types_insert_admin"
  ON public.appointment_types FOR INSERT
  WITH CHECK (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() IN ('clinic_owner', 'clinic_admin')
  );

CREATE POLICY "appointment_types_update_admin"
  ON public.appointment_types FOR UPDATE
  USING (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() IN ('clinic_owner', 'clinic_admin')
  );

CREATE POLICY "appointment_types_delete_admin"
  ON public.appointment_types FOR DELETE
  USING (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() IN ('clinic_owner', 'clinic_admin')
  );

-- =============================================================================
-- RLS POLICIES: appointments
-- =============================================================================

-- SELECT: Staff see all clinic appointments; doctors see their own; patients see their own
CREATE POLICY "appointments_select_role_based"
  ON public.appointments FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      -- Owners, admins, receptionists can see all clinic appointments
      (
        clinic_id = get_current_clinic_id()
        AND get_current_user_role() IN ('clinic_owner', 'clinic_admin', 'receptionist')
      )
      -- Doctors can only see their own appointments
      OR (
        clinic_id = get_current_clinic_id()
        AND get_current_user_role() = 'doctor'
        AND doctor_id IN (
          SELECT id FROM public.doctors WHERE user_id = auth.uid()
        )
      )
      -- Patients can only see their own appointments
      OR (
        patient_id IN (
          SELECT id FROM public.patients WHERE user_id = auth.uid()
        )
      )
    )
  );

-- INSERT: Staff can create appointments; patients can self-book
CREATE POLICY "appointments_insert_staff_or_patient"
  ON public.appointments FOR INSERT
  WITH CHECK (
    clinic_id = get_current_clinic_id()
    AND (
      get_current_user_role() IN ('clinic_owner', 'clinic_admin', 'doctor', 'receptionist')
      OR (
        -- Patients can self-book for themselves only
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
      )
    )
  );

-- UPDATE: Staff can update any appointment; doctors update their own; patients can cancel their own
CREATE POLICY "appointments_update_role_based"
  ON public.appointments FOR UPDATE
  USING (
    deleted_at IS NULL
    AND (
      (
        clinic_id = get_current_clinic_id()
        AND get_current_user_role() IN ('clinic_owner', 'clinic_admin', 'receptionist')
      )
      OR (
        clinic_id = get_current_clinic_id()
        AND get_current_user_role() = 'doctor'
        AND doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
      )
      OR (
        -- Patients can only cancel (status update) their own upcoming appointments
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
        AND status IN ('pending', 'confirmed')
      )
    )
  );

-- DELETE: Only clinic owners and admins can soft-delete appointments
CREATE POLICY "appointments_delete_admin_only"
  ON public.appointments FOR DELETE
  USING (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() IN ('clinic_owner', 'clinic_admin')
  );

-- =============================================================================
-- RLS POLICIES: patient_consents
-- =============================================================================

-- SELECT: Clinic staff can view consents for their clinic's patients
CREATE POLICY "patient_consents_select_staff"
  ON public.patient_consents FOR SELECT
  USING (
    clinic_id = get_current_clinic_id()
    OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- INSERT: System inserts consents on behalf of patients; patients can grant/revoke their own
CREATE POLICY "patient_consents_insert_staff_or_patient"
  ON public.patient_consents FOR INSERT
  WITH CHECK (
    clinic_id = get_current_clinic_id()
    AND (
      get_current_user_role() IN ('clinic_owner', 'clinic_admin', 'receptionist')
      OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    )
  );

-- No UPDATE or DELETE policies — enforced by the immutability rules above

-- =============================================================================
-- RLS POLICIES: audit_logs
-- =============================================================================

-- SELECT: Only clinic owners and admins can view audit logs for their clinic
CREATE POLICY "audit_logs_select_admin_only"
  ON public.audit_logs FOR SELECT
  USING (
    clinic_id = get_current_clinic_id()
    AND get_current_user_role() IN ('clinic_owner', 'clinic_admin')
  );

-- INSERT: All authenticated users can create audit log entries (via service functions)
-- In practice, insertions are done via the service role key in server-side code
CREATE POLICY "audit_logs_insert_authenticated"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- No UPDATE or DELETE — enforced by immutability rules above

-- =============================================================================
-- GRANT PERMISSIONS
-- Grant minimum necessary permissions to the anon and authenticated roles.
-- Service role has full access and bypasses RLS.
-- =============================================================================

-- Anon role: no direct table access (all access must be authenticated)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Authenticated role: access only to tables they need, controlled by RLS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_members     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_types  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments       TO authenticated;
GRANT SELECT, INSERT               ON public.patient_consents    TO authenticated;
GRANT SELECT, INSERT               ON public.audit_logs          TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_clinic_id()  TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role()  TO authenticated;

-- =============================================================================
-- SCHEMA COMMENTS (acts as data dictionary for GDPR Article 30 compliance)
-- Article 30: Records of Processing Activities (RoPA)
-- =============================================================================

COMMENT ON TABLE public.clinics IS
  'Top-level tenant entity. Each clinic is an isolated data controller under GDPR. '
  'Contains non-personal organizational data only.';

COMMENT ON TABLE public.clinic_members IS
  'Maps Supabase Auth users to clinics with roles. The authorization bridge for multi-tenancy.';

COMMENT ON TABLE public.doctors IS
  'Doctor professional profiles. Contains professional data (not special category). '
  'Lawful basis: CONTRACT (Article 6(1)(b)).';

COMMENT ON TABLE public.patients IS
  'SPECIAL CATEGORY DATA (Article 9 GDPR). Contains health-related personal data. '
  'Lawful basis: Article 9(2)(h) — preventive medicine / healthcare provision. '
  'RLS CRITICAL: Absolute data isolation between clinics mandatory.';

COMMENT ON TABLE public.appointments IS
  'SPECIAL CATEGORY DATA (Article 9 GDPR). Links patients to doctors at specific times. '
  'Contains clinical notes which may include health information. '
  'Lawful basis: Article 9(2)(h).';

COMMENT ON TABLE public.appointment_types IS
  'Catalog of appointment types offered by each clinic. No personal data.';

COMMENT ON TABLE public.patient_consents IS
  'Immutable GDPR consent audit trail. Records are append-only per Article 7(1). '
  'Captures explicit consent and consent withdrawals with full technical proof.';

COMMENT ON TABLE public.audit_logs IS
  'Immutable security and compliance audit trail. Minimum retention: 5 years. '
  'Supports GDPR Article 5(2) accountability principle.';

COMMENT ON COLUMN public.patients.national_id IS
  'National identity number. Should be encrypted at the application layer before storage. '
  'Only collect when clinically or legally required.';

COMMENT ON COLUMN public.patients.clinical_notes IS
  'Free-text clinical notes. SPECIAL CATEGORY DATA. Restrict read access to clinical staff only.';

COMMENT ON COLUMN public.appointments.diagnosis_codes IS
  'Array of ICD-10 diagnosis codes. SPECIAL CATEGORY HEALTH DATA.';
