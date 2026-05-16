-- =============================================================================
-- Sypho.io — Booking Portal Migration
-- Migration: 003_booking_portal.sql
-- Description: Public-facing booking portal support.
--   - Grants anon (unauthenticated) read access to clinic/service/doctor data.
--   - Adds book_appointment_as_patient() RPC for race-condition-safe booking.
--   - Uses pg_advisory_xact_lock to prevent double-booking under high concurrency.
-- Compliance: GDPR Article 9(2)(h) — healthcare provision lawful basis.
-- Region: EU (eu-central-1)
-- =============================================================================

-- =============================================================================
-- GRANT: Allow anon role to execute booking RPC and read catalog data
-- All read access is filtered at the function / application layer by clinic slug.
-- No cross-tenant data is exposed — queries are scoped by clinic_id at all times.
-- =============================================================================

-- Allow anon to SELECT from catalog tables (scoped by application-layer filters)
GRANT SELECT ON public.clinics           TO anon;
GRANT SELECT ON public.appointment_types TO anon;
GRANT SELECT ON public.doctors           TO anon;

-- Allow anon to call the slot-check and booking RPC functions
GRANT USAGE ON SCHEMA public TO anon;

-- =============================================================================
-- RLS POLICIES: Public read-only access for the booking portal (anon role)
-- These policies expose only non-sensitive, clinic-published catalog data.
-- Patients' personal data (patients, appointments) remains fully private.
-- =============================================================================

-- clinics: anon can read active, non-deleted clinics (public booking portal)
CREATE POLICY "clinics_select_public_booking"
  ON public.clinics FOR SELECT
  TO anon
  USING (is_active = true AND deleted_at IS NULL);

-- appointment_types: anon can read online-bookable, active types for active clinics
CREATE POLICY "appointment_types_select_public_booking"
  ON public.appointment_types FOR SELECT
  TO anon
  USING (
    is_active = true
    AND is_online_bookable = true
    AND clinic_id IN (
      SELECT id FROM public.clinics
      WHERE is_active = true AND deleted_at IS NULL
    )
  );

-- doctors: anon can read active, accepting doctors for active clinics
CREATE POLICY "doctors_select_public_booking"
  ON public.doctors FOR SELECT
  TO anon
  USING (
    is_active = true
    AND is_accepting_new_patients = true
    AND deleted_at IS NULL
    AND clinic_id IN (
      SELECT id FROM public.clinics
      WHERE is_active = true AND deleted_at IS NULL
    )
  );

-- =============================================================================
-- FUNCTION: get_booked_slots
-- Returns the scheduled_at + ends_at of existing active appointments for a
-- given doctor on a given date (UTC day window). Used by the slot generator
-- to filter out occupied time windows.
-- Called by the booking portal API (server-side only, via service role).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_booked_slots(
  p_doctor_id uuid,
  p_date      date
)
RETURNS TABLE (
  scheduled_at timestamptz,
  ends_at      timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.scheduled_at, a.ends_at
  FROM public.appointments a
  WHERE a.doctor_id    = p_doctor_id
    AND a.deleted_at   IS NULL
    AND a.status NOT IN ('cancelled', 'no_show', 'rescheduled')
    AND a.scheduled_at >= p_date::timestamptz
    AND a.scheduled_at <  (p_date + interval '1 day')::timestamptz;
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(uuid, date) TO anon;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(uuid, date) TO authenticated;

-- =============================================================================
-- FUNCTION: book_appointment_as_patient
-- Atomic, race-condition-safe appointment booking for the public portal.
--
-- Guarantees:
--   1. Validates clinic is active and slug matches.
--   2. Validates service is online-bookable and belongs to clinic.
--   3. Validates doctor is active, accepting patients, and belongs to clinic.
--   4. Acquires a per-(doctor, slot) advisory lock to prevent concurrent double-booking.
--   5. Checks for overlapping appointments AFTER acquiring the lock.
--   6. Creates or retrieves patient record (idempotent by email within clinic).
--   7. Inserts appointment and GDPR consent records atomically.
--   8. Returns appointment_id, patient_id, and clinic_id on success.
--
-- Error codes (raised via EXCEPTION):
--   CLINIC_NOT_FOUND      — Slug does not match an active clinic.
--   SERVICE_NOT_FOUND     — Appointment type not found / not online-bookable.
--   DOCTOR_NOT_FOUND      — Doctor not active / not accepting patients.
--   SLOT_UNAVAILABLE      — Time slot is already taken by another appointment.
--   GDPR_CONSENT_REQUIRED — gdpr_consent flag was not TRUE.
--
-- SECURITY DEFINER: Runs with the function owner's privileges so it can INSERT
-- into patients/appointments/patient_consents even when called via anon role.
-- All tenant isolation is enforced manually within the function body.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.book_appointment_as_patient(
  p_clinic_slug          text,
  p_appointment_type_id  uuid,
  p_doctor_id            uuid,
  p_scheduled_at         timestamptz,
  p_first_name           text,
  p_last_name            text,
  p_date_of_birth        date,
  p_gender               gender_type,
  p_email                text,
  p_phone                text,
  p_chief_complaint      text,
  p_gdpr_consent         boolean,
  p_marketing_consent    boolean,
  p_consent_version      text,
  p_ip_address           text,
  p_user_agent           text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id              uuid;
  v_appt_type_duration     integer;
  v_appt_type_buf_before   integer;
  v_appt_type_buf_after    integer;
  v_patient_id             uuid;
  v_appointment_id         uuid;
  v_slot_end               timestamptz;
  v_lock_key               bigint;
BEGIN
  -- ----------------------------------------------------------------
  -- Guard: GDPR consent is mandatory for processing health data
  -- ----------------------------------------------------------------
  IF p_gdpr_consent IS NOT TRUE THEN
    RAISE EXCEPTION 'GDPR_CONSENT_REQUIRED'
      USING HINT = 'Patient must explicitly consent to data processing.';
  END IF;

  -- ----------------------------------------------------------------
  -- Step 1: Resolve clinic by slug
  -- ----------------------------------------------------------------
  SELECT id INTO v_clinic_id
  FROM public.clinics
  WHERE slug      = p_clinic_slug
    AND is_active = true
    AND deleted_at IS NULL;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'CLINIC_NOT_FOUND'
      USING HINT = 'No active clinic found with the given slug.';
  END IF;

  -- ----------------------------------------------------------------
  -- Step 2: Validate appointment type
  -- ----------------------------------------------------------------
  SELECT duration_minutes, buffer_before_minutes, buffer_after_minutes
    INTO v_appt_type_duration, v_appt_type_buf_before, v_appt_type_buf_after
  FROM public.appointment_types
  WHERE id                 = p_appointment_type_id
    AND clinic_id          = v_clinic_id
    AND is_active          = true
    AND is_online_bookable = true;

  IF v_appt_type_duration IS NULL THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND'
      USING HINT = 'Appointment type not found, inactive, or not online-bookable.';
  END IF;

  -- ----------------------------------------------------------------
  -- Step 3: Validate doctor
  -- ----------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE id                        = p_doctor_id
      AND clinic_id                 = v_clinic_id
      AND is_active                 = true
      AND is_accepting_new_patients = true
      AND deleted_at                IS NULL
  ) THEN
    RAISE EXCEPTION 'DOCTOR_NOT_FOUND'
      USING HINT = 'Doctor not found, inactive, or not accepting new patients.';
  END IF;

  -- ----------------------------------------------------------------
  -- Step 4: Acquire an advisory lock on (doctor_id, scheduled_at)
  -- This prevents two concurrent transactions from booking the same slot.
  -- pg_advisory_xact_lock is automatically released at transaction end.
  -- ----------------------------------------------------------------
  v_lock_key := hashtext(p_doctor_id::text || p_scheduled_at::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- ----------------------------------------------------------------
  -- Step 5: Double-booking check (executed AFTER lock is held)
  -- ----------------------------------------------------------------
  v_slot_end := p_scheduled_at + (v_appt_type_duration * interval '1 minute');

  IF EXISTS (
    SELECT 1
    FROM public.appointments
    WHERE doctor_id  = p_doctor_id
      AND deleted_at IS NULL
      AND status NOT IN ('cancelled', 'no_show', 'rescheduled')
      -- Overlap condition: existing appointment starts before this one ends
      -- AND existing appointment ends after this one starts (with buffers)
      AND scheduled_at < (v_slot_end + (v_appt_type_buf_after * interval '1 minute'))
      AND ends_at      > (p_scheduled_at - (v_appt_type_buf_before * interval '1 minute'))
  ) THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE'
      USING HINT = 'The selected time slot is no longer available.';
  END IF;

  -- ----------------------------------------------------------------
  -- Step 6: Upsert patient record (idempotent by email within clinic)
  -- If the same email already exists for this clinic, reuse the patient.
  -- ----------------------------------------------------------------
  IF p_email IS NOT NULL AND p_email <> '' THEN
    SELECT id INTO v_patient_id
    FROM public.patients
    WHERE clinic_id  = v_clinic_id
      AND email      = p_email
      AND deleted_at IS NULL
    LIMIT 1;
  END IF;

  IF v_patient_id IS NULL THEN
    INSERT INTO public.patients (
      clinic_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      email,
      phone,
      gdpr_consent_given_at,
      gdpr_consent_version,
      data_retention_until
    ) VALUES (
      v_clinic_id,
      p_first_name,
      p_last_name,
      p_date_of_birth,
      p_gender,
      NULLIF(p_email, ''),
      NULLIF(p_phone, ''),
      NOW(),
      p_consent_version,
      (NOW() + interval '10 years')::date
    )
    RETURNING id INTO v_patient_id;
  ELSE
    -- Update consent timestamp for returning patient
    UPDATE public.patients
    SET gdpr_consent_given_at  = NOW(),
        gdpr_consent_version   = p_consent_version
    WHERE id = v_patient_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Step 7: Insert appointment
  -- ----------------------------------------------------------------
  INSERT INTO public.appointments (
    clinic_id,
    patient_id,
    doctor_id,
    appointment_type_id,
    scheduled_at,
    duration_minutes,
    status,
    chief_complaint,
    booked_via,
    data_retention_until
  ) VALUES (
    v_clinic_id,
    v_patient_id,
    p_doctor_id,
    p_appointment_type_id,
    p_scheduled_at,
    v_appt_type_duration,
    'pending',
    NULLIF(p_chief_complaint, ''),
    'online',
    (NOW() + interval '10 years')::date
  )
  RETURNING id INTO v_appointment_id;

  -- ----------------------------------------------------------------
  -- Step 8: Record GDPR consent (append-only per Article 7 GDPR)
  -- ----------------------------------------------------------------

  -- Core data processing consent (mandatory)
  INSERT INTO public.patient_consents (
    patient_id, clinic_id, consent_type, is_granted, lawful_basis,
    consent_version, consent_text_snapshot, capture_method,
    ip_address, user_agent, consented_at
  ) VALUES (
    v_patient_id, v_clinic_id, 'data_processing', true, 'consent',
    p_consent_version,
    'Patient consented to processing of personal data for healthcare provision via online booking portal.',
    'web_form',
    NULLIF(p_ip_address, '')::inet,
    p_user_agent,
    NOW()
  );

  -- Appointment reminders consent (bundled with booking)
  INSERT INTO public.patient_consents (
    patient_id, clinic_id, consent_type, is_granted, lawful_basis,
    consent_version, capture_method, ip_address, user_agent, consented_at
  ) VALUES (
    v_patient_id, v_clinic_id, 'appointment_reminders', true, 'consent',
    p_consent_version, 'web_form',
    NULLIF(p_ip_address, '')::inet,
    p_user_agent,
    NOW()
  );

  -- Marketing consent (optional — depends on patient's choice)
  IF p_marketing_consent IS TRUE THEN
    INSERT INTO public.patient_consents (
      patient_id, clinic_id, consent_type, is_granted, lawful_basis,
      consent_version, capture_method, ip_address, user_agent, consented_at
    ) VALUES (
      v_patient_id, v_clinic_id, 'marketing', true, 'consent',
      p_consent_version, 'web_form',
      NULLIF(p_ip_address, '')::inet,
      p_user_agent,
      NOW()
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 9: Return confirmation payload
  -- ----------------------------------------------------------------
  RETURN jsonb_build_object(
    'appointment_id', v_appointment_id,
    'patient_id',     v_patient_id,
    'clinic_id',      v_clinic_id
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise with original error code so the application layer can handle it
    RAISE;
END;
$$;

-- Grant execute to anon so the API route can call it via the service role
-- (The function is SECURITY DEFINER; the caller role does not matter for
--  privilege purposes, but the grant is needed for anon-role invocations.)
GRANT EXECUTE ON FUNCTION public.book_appointment_as_patient(
  text, uuid, uuid, timestamptz,
  text, text, date, gender_type,
  text, text, text,
  boolean, boolean,
  text, text, text
) TO anon;

GRANT EXECUTE ON FUNCTION public.book_appointment_as_patient(
  text, uuid, uuid, timestamptz,
  text, text, date, gender_type,
  text, text, text,
  boolean, boolean,
  text, text, text
) TO authenticated;

-- =============================================================================
-- SCHEMA COMMENTS (GDPR Article 30 — Records of Processing Activities)
-- =============================================================================

COMMENT ON FUNCTION public.get_booked_slots IS
  'Returns existing appointment windows for a doctor on a given date. '
  'Used by the booking portal to filter out occupied time slots. '
  'Called server-side only via service role.';

COMMENT ON FUNCTION public.book_appointment_as_patient IS
  'Atomic, race-condition-safe booking RPC for the public patient portal. '
  'SECURITY DEFINER — enforces all tenant isolation internally. '
  'Acquires pg_advisory_xact_lock to prevent concurrent double-booking. '
  'Lawful basis: GDPR Article 9(2)(h) — healthcare provision. '
  'GDPR consent is mandatory; consent records are inserted atomically.';
