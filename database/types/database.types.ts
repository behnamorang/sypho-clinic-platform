/**
 * @file database.types.ts
 * @description Auto-generated Supabase TypeScript definitions for Sypho.io.
 *
 * HOW TO REGENERATE:
 * Run the following command after any schema migration:
 *   npx supabase gen types typescript --project-id <project-id> --schema public > database/types/database.types.ts
 *
 * @see https://supabase.com/docs/guides/api/rest/generating-types
 * @compliance GDPR — Type definitions map directly to schema table structure.
 */

// ---------------------------------------------------------------------------
// ENUM TYPES
// These mirror the PostgreSQL enum types defined in 001_initial_schema.sql
// ---------------------------------------------------------------------------

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type GenderType =
  | 'male'
  | 'female'
  | 'non_binary'
  | 'prefer_not_to_say'
  | 'other';

export type GdprLawfulBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interest';

export type UserRole =
  | 'clinic_owner'
  | 'clinic_admin'
  | 'doctor'
  | 'receptionist'
  | 'patient';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type AuditAction =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'SELECT'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'DATA_EXPORT_REQUESTED'
  | 'DATA_DELETION_REQUESTED';

export type ConsentType =
  | 'data_processing'
  | 'appointment_reminders'
  | 'marketing'
  | 'analytics'
  | 'third_party_sharing'
  | 'research'
  | 'telemedicine';

export type ConsentCaptureMethod =
  | 'web_form'
  | 'mobile_app'
  | 'paper'
  | 'verbal_recorded'
  | 'api';

export type BookingChannel = 'dashboard' | 'online' | 'phone' | 'walk_in' | 'api';

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

// ---------------------------------------------------------------------------
// JSON type — used for JSONB columns in Row types
// Matches the Supabase-generated `Json` type for compatibility with
// the `Record<string, unknown>` constraint on GenericTable.
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

// ---------------------------------------------------------------------------
// JSONB SHAPE TYPES — Application-layer typed overlays for JSONB columns.
// These are used when you need to work with structured JSONB data.
// Cast from `Json` when needed: `row.business_hours as WeeklySchedule`.
// ---------------------------------------------------------------------------

/** Business hours configuration for a clinic or doctor. */
export interface TimeSlot {
  start: string; // "HH:MM" 24-hour format
  end: string;   // "HH:MM" 24-hour format
}

export interface DaySchedule {
  open?: string | undefined;    // For clinic: "HH:MM"
  close?: string | undefined;   // For clinic: "HH:MM"
  closed?: boolean | undefined;
  slots?: TimeSlot[] | undefined; // For doctor: array of available time ranges
}

export type WeeklySchedule = {
  monday?:    DaySchedule | undefined;
  tuesday?:   DaySchedule | undefined;
  wednesday?: DaySchedule | undefined;
  thursday?:  DaySchedule | undefined;
  friday?:    DaySchedule | undefined;
  saturday?:  DaySchedule | undefined;
  sunday?:    DaySchedule | undefined;
};

// ---------------------------------------------------------------------------
// ROW TYPES — Direct mapping to database table rows
// These represent the shape of a row as returned from the database.
// ---------------------------------------------------------------------------

/** Represents a row in the `clinics` table. */
export interface ClinicRow {
  id:                      string;
  name:                    string;
  slug:                    string;
  tax_id:                  string | null;
  registration_number:     string | null;
  email:                   string;
  phone:                   string | null;
  website:                 string | null;
  address_line1:           string;
  address_line2:           string | null;
  city:                    string;
  state_province:          string | null;
  postal_code:             string;
  country_code:            string;
  timezone:                string;
  /** JSONB column — cast to `WeeklySchedule` when reading structured data. */
  business_hours:          Json;
  dpo_name:                string | null;
  dpo_email:               string | null;
  privacy_policy_url:      string | null;
  terms_url:               string | null;
  subscription_tier:       SubscriptionTier;
  subscription_expires_at: string | null;
  is_active:               boolean;
  is_verified:             boolean;
  deleted_at:              string | null;
  created_at:              string;
  updated_at:              string;
}

/** Represents a row in the `clinic_members` table. */
export interface ClinicMemberRow {
  id:          string;
  clinic_id:   string;
  user_id:     string;
  role:        UserRole;
  is_active:   boolean;
  invited_by:  string | null;
  invited_at:  string | null;
  accepted_at: string | null;
  created_at:  string;
  updated_at:  string;
}

/** Represents a row in the `doctors` table. */
export interface DoctorRow {
  id:                              string;
  clinic_id:                       string;
  user_id:                         string | null;
  title:                           string | null;
  first_name:                      string;
  last_name:                       string;
  license_number:                  string;
  license_country:                 string;
  specialty:                       string;
  sub_specialty:                   string | null;
  professional_email:              string | null;
  professional_phone:              string | null;
  /** JSONB column — cast to `WeeklySchedule` when reading structured data. */
  availability_schedule:           Json;
  default_appointment_duration_minutes: number;
  max_patients_per_day:            number | null;
  is_active:                       boolean;
  is_accepting_new_patients:       boolean;
  deleted_at:                      string | null;
  created_at:                      string;
  updated_at:                      string;
}

/** Represents a row in the `patients` table. Contains Special Category Data. */
export interface PatientRow {
  id:                          string;
  clinic_id:                   string;
  user_id:                     string | null;
  first_name:                  string;
  last_name:                   string;
  date_of_birth:               string;
  gender:                      GenderType;
  national_id:                 string | null;
  email:                       string | null;
  phone:                       string | null;
  address_line1:               string | null;
  address_line2:               string | null;
  city:                        string | null;
  postal_code:                 string | null;
  country_code:                string | null;
  emergency_contact_name:      string | null;
  emergency_contact_phone:     string | null;
  clinical_notes:              string | null;
  insurance_provider:          string | null;
  insurance_policy_number:     string | null;
  gdpr_consent_given_at:       string | null;
  gdpr_consent_version:        string | null;
  data_retention_until:        string | null;
  data_deletion_requested_at:  string | null;
  data_deletion_completed_at:  string | null;
  anonymized_at:               string | null;
  deleted_at:                  string | null;
  created_at:                  string;
  updated_at:                  string;
}

/** Represents a row in the `appointment_types` table. */
export interface AppointmentTypeRow {
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
  is_active:             boolean;
  is_online_bookable:    boolean;
  created_at:            string;
  updated_at:            string;
}

/** Represents a row in the `appointments` table. Contains Special Category Data. */
export interface AppointmentRow {
  id:                   string;
  clinic_id:            string;
  patient_id:           string;
  doctor_id:            string;
  appointment_type_id:  string | null;
  scheduled_at:         string;
  duration_minutes:     number;
  ends_at:              string; // Generated column
  status:               AppointmentStatus;
  cancellation_reason:  string | null;
  cancellation_by:      string | null;
  cancelled_at:         string | null;
  chief_complaint:      string | null;
  clinical_notes:       string | null;
  diagnosis_codes:      string[] | null;
  prescription_notes:   string | null;
  follow_up_required:   boolean;
  follow_up_notes:      string | null;
  booked_via:           BookingChannel;
  booked_by:            string | null;
  data_retention_until: string | null;
  deleted_at:           string | null;
  created_at:           string;
  updated_at:           string;
}

/** Represents a row in the `patient_consents` table. Immutable. */
export interface PatientConsentRow {
  id:                   string;
  patient_id:           string;
  clinic_id:            string;
  consent_type:         ConsentType;
  is_granted:           boolean;
  lawful_basis:         GdprLawfulBasis;
  consent_version:      string;
  consent_text_snapshot: string | null;
  capture_method:       ConsentCaptureMethod;
  ip_address:           string | null;
  user_agent:           string | null;
  consented_at:         string;
  created_at:           string;
}

/** Represents a row in the `leads` table (marketing consultation captures). */
export interface LeadRow {
  id:             string;
  full_name:      string;
  email:          string;
  phone:          string;
  clinic_name:    string;
  location:       string;
  booking_volume: string;
  pain_points:    string[];
  created_at:     string;
  updated_at:     string;
}

/** Represents a row in the `audit_logs` table. Immutable. */
export interface AuditLogRow {
  id:                string;
  clinic_id:         string | null;
  actor_user_id:     string | null;
  actor_ip:          string | null;
  actor_user_agent:  string | null;
  action:            AuditAction;
  resource_type:     string;
  resource_id:       string | null;
  old_values:        Record<string, unknown> | null;
  new_values:        Record<string, unknown> | null;
  session_token_hash: string | null;
  http_method:       string | null;
  api_endpoint:      string | null;
  success:           boolean;
  error_code:        string | null;
  created_at:        string;
}

// ---------------------------------------------------------------------------
// INSERT TYPES — Shape of data required when inserting new rows
// ---------------------------------------------------------------------------

export type ClinicInsert = Omit<ClinicRow,
  'id' | 'created_at' | 'updated_at' | 'is_verified' | 'deleted_at' | 'subscription_expires_at'
> & {
  id?: string | undefined;
  subscription_expires_at?: string | null | undefined;
};

export type DoctorInsert = Omit<DoctorRow,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string | undefined;
};

export type PatientInsert = Omit<PatientRow,
  | 'id' | 'created_at' | 'updated_at' | 'deleted_at'
  | 'data_deletion_completed_at' | 'anonymized_at'
> & {
  id?: string | undefined;
};

export type AppointmentTypeInsert = Omit<AppointmentTypeRow,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string | undefined;
};

export type AppointmentInsert = Omit<AppointmentRow,
  'id' | 'ends_at' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string | undefined;
};

export type PatientConsentInsert = Omit<PatientConsentRow,
  'id' | 'created_at'
> & {
  id?: string | undefined;
};

export type AuditLogInsert = Omit<AuditLogRow, 'id' | 'created_at'> & {
  id?: string | undefined;
};

export type LeadInsert = Omit<LeadRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string | undefined;
};

// ---------------------------------------------------------------------------
// UPDATE TYPES — Only updatable fields (excludes immutable fields).
//
// These use explicit `| undefined` on each optional property to satisfy
// Supabase's `Record<string, unknown>` generic constraint under the strict
// `exactOptionalPropertyTypes: true` TypeScript compiler option.
// ---------------------------------------------------------------------------

type OptionalWithUndefined<T> = {
  [K in keyof T]?: T[K] | undefined;
};

export type ClinicUpdate = OptionalWithUndefined<Omit<ClinicRow,
  'id' | 'created_at' | 'updated_at'
>>;

export type DoctorUpdate = OptionalWithUndefined<Omit<DoctorRow,
  'id' | 'clinic_id' | 'created_at' | 'updated_at'
>>;

export type PatientUpdate = OptionalWithUndefined<Omit<PatientRow,
  'id' | 'clinic_id' | 'created_at' | 'updated_at'
>>;

export type AppointmentTypeUpdate = OptionalWithUndefined<Omit<AppointmentTypeRow,
  'id' | 'clinic_id' | 'created_at' | 'updated_at'
>>;

export type AppointmentUpdate = OptionalWithUndefined<Omit<AppointmentRow,
  'id' | 'clinic_id' | 'ends_at' | 'created_at' | 'updated_at'
>>;

export type LeadUpdate = OptionalWithUndefined<Omit<LeadRow,
  'id' | 'created_at' | 'updated_at'
>>;

// ---------------------------------------------------------------------------
// SUPABASE DATABASE SCHEMA TYPE
// This is the master type consumed by the Supabase client for full type safety.
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row:           ClinicRow;
        Insert:        ClinicInsert;
        Update:        ClinicUpdate;
        Relationships: [];
      };
      clinic_members: {
        Row:           ClinicMemberRow;
        Insert:        Omit<ClinicMemberRow, 'id' | 'created_at' | 'updated_at'> & { id?: string | undefined };
        Update:        OptionalWithUndefined<Omit<ClinicMemberRow, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      doctors: {
        Row:           DoctorRow;
        Insert:        DoctorInsert;
        Update:        DoctorUpdate;
        Relationships: [];
      };
      patients: {
        Row:           PatientRow;
        Insert:        PatientInsert;
        Update:        PatientUpdate;
        Relationships: [];
      };
      appointment_types: {
        Row:           AppointmentTypeRow;
        Insert:        AppointmentTypeInsert;
        Update:        AppointmentTypeUpdate;
        Relationships: [];
      };
      appointments: {
        Row:           AppointmentRow;
        Insert:        AppointmentInsert;
        Update:        AppointmentUpdate;
        Relationships: [];
      };
      patient_consents: {
        Row:           PatientConsentRow;
        Insert:        PatientConsentInsert;
        Update:        Record<string, never>; // Immutable — no updates allowed
        Relationships: [];
      };
      audit_logs: {
        Row:           AuditLogRow;
        Insert:        AuditLogInsert;
        Update:        Record<string, never>; // Immutable — no updates allowed
        Relationships: [];
      };
      leads: {
        Row:           LeadRow;
        Insert:        LeadInsert;
        Update:        LeadUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_current_clinic_id: {
        Args:    Record<string, never>;
        Returns: string;
      };
      get_current_user_role: {
        Args:    Record<string, never>;
        Returns: UserRole;
      };
      has_completed_onboarding: {
        Args:    Record<string, never>;
        Returns: boolean;
      };
      is_clinic_owner_or_admin: {
        Args:    { p_clinic_id: string };
        Returns: boolean;
      };
      get_user_clinics: {
        Args:    Record<string, never>;
        Returns: {
          clinic_id:   string;
          clinic_name: string;
          role:        UserRole;
          is_active:   boolean;
        }[];
      };
      log_audit_event: {
        Args: {
          p_clinic_id:     string;
          p_action:        AuditAction;
          p_resource_type: string;
          p_resource_id?:  string;
          p_http_method?:  string;
          p_api_endpoint?: string;
          p_success?:      boolean;
          p_error_code?:   string;
          p_old_values?:   Record<string, unknown>;
          p_new_values?:   Record<string, unknown>;
        };
        Returns: string;
      };
      get_clinic_member_count: {
        Args:    { p_clinic_id: string };
        Returns: number;
      };
      get_booked_slots: {
        Args: {
          p_doctor_id: string;
          p_date:      string;  // ISO date string 'YYYY-MM-DD'
        };
        Returns: {
          scheduled_at: string;
          ends_at:      string;
        }[];
      };
      book_appointment_as_patient: {
        Args: {
          p_clinic_slug:         string;
          p_appointment_type_id: string;
          p_doctor_id:           string;
          p_scheduled_at:        string;  // ISO 8601 datetime
          p_first_name:          string;
          p_last_name:           string;
          p_date_of_birth:       string;  // ISO date 'YYYY-MM-DD'
          p_gender:              GenderType;
          p_email:               string;
          p_phone:               string;
          p_chief_complaint:     string;
          p_gdpr_consent:        boolean;
          p_marketing_consent:   boolean;
          p_consent_version:     string;
          p_ip_address:          string;
          p_user_agent:          string;
        };
        Returns: {
          appointment_id: string;
          patient_id:     string;
          clinic_id:      string;
        };
      };
    };
    Enums: {
      appointment_status:  AppointmentStatus;
      gender_type:         GenderType;
      gdpr_lawful_basis:   GdprLawfulBasis;
      user_role:           UserRole;
      notification_channel: NotificationChannel;
      audit_action:        AuditAction;
    };
    CompositeTypes: Record<string, never>;
  };
};
