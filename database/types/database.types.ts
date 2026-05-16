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
// JSONB SHAPE TYPES
// ---------------------------------------------------------------------------

/** Business hours configuration for a clinic or doctor. */
export interface TimeSlot {
  start: string; // "HH:MM" 24-hour format
  end: string;   // "HH:MM" 24-hour format
}

export interface DaySchedule {
  open?: string;   // For clinic: "HH:MM"
  close?: string;  // For clinic: "HH:MM"
  closed?: boolean;
  slots?: TimeSlot[]; // For doctor: array of available time ranges
}

export type WeeklySchedule = {
  monday?:    DaySchedule;
  tuesday?:   DaySchedule;
  wednesday?: DaySchedule;
  thursday?:  DaySchedule;
  friday?:    DaySchedule;
  saturday?:  DaySchedule;
  sunday?:    DaySchedule;
};

// ---------------------------------------------------------------------------
// ROW TYPES — Direct mapping to database table rows
// These represent the shape of a row as returned from the database.
// ---------------------------------------------------------------------------

/** Represents a row in the `clinics` table. */
export interface ClinicRow {
  id:                   string;
  name:                 string;
  slug:                 string;
  tax_id:               string | null;
  registration_number:  string | null;
  email:                string;
  phone:                string | null;
  website:              string | null;
  address_line1:        string;
  address_line2:        string | null;
  city:                 string;
  state_province:       string | null;
  postal_code:          string;
  country_code:         string;
  timezone:             string;
  business_hours:       WeeklySchedule;
  dpo_name:             string | null;
  dpo_email:            string | null;
  privacy_policy_url:   string | null;
  terms_url:            string | null;
  subscription_tier:    SubscriptionTier;
  subscription_expires_at: string | null;
  is_active:            boolean;
  is_verified:          boolean;
  deleted_at:           string | null;
  created_at:           string;
  updated_at:           string;
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
  availability_schedule:           WeeklySchedule;
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
  'id' | 'created_at' | 'updated_at' | 'is_verified' | 'deleted_at'
> & {
  id?: string;
};

export type DoctorInsert = Omit<DoctorRow,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
};

export type PatientInsert = Omit<PatientRow,
  | 'id' | 'created_at' | 'updated_at' | 'deleted_at'
  | 'data_deletion_completed_at' | 'anonymized_at'
> & {
  id?: string;
};

export type AppointmentTypeInsert = Omit<AppointmentTypeRow,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

export type AppointmentInsert = Omit<AppointmentRow,
  'id' | 'ends_at' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
};

export type PatientConsentInsert = Omit<PatientConsentRow,
  'id' | 'created_at'
> & {
  id?: string;
};

export type AuditLogInsert = Omit<AuditLogRow, 'id' | 'created_at'> & {
  id?: string;
};

// ---------------------------------------------------------------------------
// UPDATE TYPES — Only updatable fields (excludes immutable fields)
// ---------------------------------------------------------------------------

export type ClinicUpdate = Partial<Omit<ClinicRow,
  'id' | 'created_at' | 'updated_at'
>>;

export type DoctorUpdate = Partial<Omit<DoctorRow,
  'id' | 'clinic_id' | 'created_at' | 'updated_at'
>>;

export type PatientUpdate = Partial<Omit<PatientRow,
  'id' | 'clinic_id' | 'created_at' | 'updated_at'
>>;

export type AppointmentTypeUpdate = Partial<Omit<AppointmentTypeRow,
  'id' | 'clinic_id' | 'created_at' | 'updated_at'
>>;

export type AppointmentUpdate = Partial<Omit<AppointmentRow,
  'id' | 'clinic_id' | 'ends_at' | 'created_at' | 'updated_at'
>>;

// ---------------------------------------------------------------------------
// SUPABASE DATABASE SCHEMA TYPE
// This is the master type consumed by the Supabase client for full type safety.
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row:    ClinicRow;
        Insert: ClinicInsert;
        Update: ClinicUpdate;
      };
      clinic_members: {
        Row:    ClinicMemberRow;
        Insert: Omit<ClinicMemberRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<ClinicMemberRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      doctors: {
        Row:    DoctorRow;
        Insert: DoctorInsert;
        Update: DoctorUpdate;
      };
      patients: {
        Row:    PatientRow;
        Insert: PatientInsert;
        Update: PatientUpdate;
      };
      appointment_types: {
        Row:    AppointmentTypeRow;
        Insert: AppointmentTypeInsert;
        Update: AppointmentTypeUpdate;
      };
      appointments: {
        Row:    AppointmentRow;
        Insert: AppointmentInsert;
        Update: AppointmentUpdate;
      };
      patient_consents: {
        Row:    PatientConsentRow;
        Insert: PatientConsentInsert;
        Update: never; // Immutable — no updates allowed
      };
      audit_logs: {
        Row:    AuditLogRow;
        Insert: AuditLogInsert;
        Update: never; // Immutable — no updates allowed
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
    };
    Enums: {
      appointment_status: AppointmentStatus;
      gender_type:        GenderType;
      gdpr_lawful_basis:  GdprLawfulBasis;
      user_role:          UserRole;
      notification_channel: NotificationChannel;
      audit_action:       AuditAction;
    };
  };
};
