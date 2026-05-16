/**
 * @file types/booking.ts
 * @description TypeScript types for the public patient booking portal.
 *
 * These types represent the public-safe shape of data exposed to unauthenticated
 * patients browsing a clinic's booking page. They intentionally omit or restrict
 * sensitive fields present in the full database row types.
 *
 * @compliance GDPR — Only non-sensitive catalog data is exposed publicly.
 *             Patient PII is never included in these public-facing types.
 */

import type { GenderType } from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// GEO CONTEXT — Location-based personalization (derived from IP/CDN headers)
// ---------------------------------------------------------------------------

/**
 * Localization context derived from the visitor's detected country.
 * Used to pre-fill phone country codes, display local currency, and
 * format dates according to regional conventions.
 */
export interface GeoContext {
  /** ISO 3166-1 alpha-2 country code (e.g., 'OM', 'GB', 'DE'). */
  countryCode:    string;
  /** ITU E.164 phone prefix including '+' (e.g., '+968', '+44', '+49'). */
  phonePrefix:    string;
  /** ISO 4217 currency code (e.g., 'OMR', 'GBP', 'EUR'). */
  currencyCode:   string;
  /** Localized currency display symbol (e.g., 'OMR', '£', '€'). */
  currencySymbol: string;
  /** Regional date format convention. */
  dateFormat:     'DD/MM/YYYY' | 'MM/DD/YYYY';
}

// ---------------------------------------------------------------------------
// PUBLIC CLINIC PROFILE — Safe subset of ClinicRow for public display
// ---------------------------------------------------------------------------

/**
 * Public-safe clinic profile for the booking portal header/branding.
 * Excludes: tax_id, registration_number, subscription details, internal flags.
 */
export interface PublicClinicProfile {
  id:                 string;
  name:               string;
  slug:               string;
  email:              string;
  phone:              string | null;
  address_line1:      string;
  city:               string;
  country_code:       string;
  timezone:           string;
  privacy_policy_url: string | null;
  terms_url:          string | null;
}

// ---------------------------------------------------------------------------
// PUBLIC SERVICE PROFILE — Safe subset of AppointmentTypeRow
// ---------------------------------------------------------------------------

/**
 * Public-safe appointment type profile for the service selection step.
 * Includes price and duration (needed for patient-facing display).
 */
export interface PublicServiceProfile {
  id:                    string;
  clinic_id:             string;
  name:                  string;
  description:           string | null;
  color:                 string;
  duration_minutes:      number;
  buffer_before_minutes: number;
  buffer_after_minutes:  number;
  price_cents:           number | null;
  currency_code:         string;
}

// ---------------------------------------------------------------------------
// PUBLIC DOCTOR PROFILE — Safe subset of DoctorRow
// ---------------------------------------------------------------------------

/**
 * Public-safe doctor profile for the doctor selection step.
 * Excludes: license_number, license_country, professional contact details,
 * availability_schedule (JSONB), and all internal configuration fields.
 */
export interface PublicDoctorProfile {
  id:               string;
  clinic_id:        string;
  title:            string | null;
  first_name:       string;
  last_name:        string;
  specialty:        string;
  sub_specialty:    string | null;
  /** Doctor's availability schedule (JSON) — used client-side for calendar rendering. */
  availability_schedule: Record<string, unknown>;
  default_appointment_duration_minutes: number;
}

// ---------------------------------------------------------------------------
// BOOKING WIZARD STATE
// ---------------------------------------------------------------------------

/**
 * The discrete steps of the multi-step booking wizard.
 */
export type BookingStep =
  | 'service'       // Step 1: Choose appointment type
  | 'doctor'        // Step 2: Choose doctor
  | 'schedule'      // Step 3: Choose date and time slot
  | 'patient_info'  // Step 4: Enter patient details + GDPR consent
  | 'confirming'    // Intermediate: submitting booking
  | 'confirmed';    // Terminal: booking successful

/**
 * Full wizard state — managed by the BookingWizard client component.
 */
export interface BookingWizardState {
  step:             BookingStep;
  selectedService:  PublicServiceProfile | null;
  selectedDoctor:   PublicDoctorProfile | null;
  selectedDate:     string | null;             // YYYY-MM-DD
  selectedSlot:     string | null;             // ISO 8601 datetime (UTC)
  patientInfo:      PatientBookingFormData | null;
  confirmation:     BookingConfirmationResult | null;
  errorMessage:     string | null;
}

// ---------------------------------------------------------------------------
// PATIENT BOOKING FORM
// ---------------------------------------------------------------------------

/**
 * Form data collected in Step 4 (patient information).
 * Designed to meet GDPR data minimization requirements:
 * only fields strictly necessary for healthcare provision are collected.
 */
export interface PatientBookingFormData {
  first_name:          string;
  last_name:           string;
  date_of_birth:       string;   // YYYY-MM-DD
  gender:              GenderType;
  email:               string;
  phone_country_code:  string;   // E.164 prefix, e.g., '+968'
  phone:               string;   // Local number without prefix
  chief_complaint:     string;
  gdpr_consent:        boolean;  // Mandatory — must be true to proceed
  marketing_consent:   boolean;  // Optional — separate explicit checkbox
}

// ---------------------------------------------------------------------------
// AVAILABLE TIME SLOT
// ---------------------------------------------------------------------------

/**
 * A single bookable time slot returned by the slots API.
 */
export interface BookingTimeSlot {
  /** ISO 8601 UTC datetime string for the slot start. */
  starts_at:  string;
  /** ISO 8601 UTC datetime string for the slot end. */
  ends_at:    string;
  /** Slot start time in "HH:MM" format (clinic local time). */
  label:      string;
}

// ---------------------------------------------------------------------------
// BOOKING CONFIRMATION
// ---------------------------------------------------------------------------

/**
 * Successful booking confirmation payload returned by the confirm API.
 */
export interface BookingConfirmationResult {
  appointment_id: string;
  patient_id:     string;
  clinic_id:      string;
}

// ---------------------------------------------------------------------------
// API REQUEST / RESPONSE SHAPES
// ---------------------------------------------------------------------------

/** Request body for POST /api/booking/[clinicSlug]/confirm */
export interface BookingConfirmRequest {
  appointment_type_id: string;
  doctor_id:           string;
  scheduled_at:        string;  // ISO 8601 UTC
  first_name:          string;
  last_name:           string;
  date_of_birth:       string;  // YYYY-MM-DD
  gender:              GenderType;
  email:               string;
  phone:               string;  // Full number including country code prefix
  chief_complaint:     string;
  gdpr_consent:        true;    // Must always be true
  marketing_consent:   boolean;
  consent_version:     string;
}

/** Query parameters for GET /api/booking/[clinicSlug]/slots */
export interface BookingSlotsQuery {
  doctor_id:            string;
  appointment_type_id:  string;
  date:                 string;  // YYYY-MM-DD
}
