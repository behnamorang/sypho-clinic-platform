/**
 * @file config/supabase.ts
 * @description Supabase project configuration constants for Sypho.io.
 *
 * Central place for Supabase-related configuration values.
 * Keeps magic strings out of business logic and makes EU compliance
 * requirements explicit and auditable.
 *
 * @compliance GDPR — Data residency requirements are explicitly documented here.
 */

/**
 * Supabase Auth configuration.
 * Mirrors settings that should be applied in the Supabase dashboard.
 */
export const SUPABASE_AUTH_CONFIG = {
  /** JWT access token lifetime in seconds (15 minutes — short-lived for security) */
  ACCESS_TOKEN_EXPIRY_SECONDS: 900,

  /** Refresh token lifetime in seconds (7 days) */
  REFRESH_TOKEN_EXPIRY_SECONDS: 604_800,

  /** Number of failed login attempts before rate limiting kicks in */
  MAX_LOGIN_ATTEMPTS: 5,

  /** Lockout duration after max login attempts (seconds) */
  LOCKOUT_DURATION_SECONDS: 300,
} as const;

/**
 * EU data residency configuration.
 * All data must remain within the EU/EEA per GDPR requirements.
 */
export const DATA_RESIDENCY = {
  /** Supabase project region — must be an EU region */
  REGION: 'eu-central-1' as const,

  /** Supported EU/EEA country codes for clinic registration (ISO 3166-1 alpha-2) */
  SUPPORTED_COUNTRIES: [
    'AT', // Austria
    'BE', // Belgium
    'BG', // Bulgaria
    'CY', // Cyprus
    'CZ', // Czech Republic
    'DE', // Germany
    'DK', // Denmark
    'EE', // Estonia
    'ES', // Spain
    'FI', // Finland
    'FR', // France
    'GR', // Greece
    'HR', // Croatia
    'HU', // Hungary
    'IE', // Ireland
    'IT', // Italy
    'LT', // Lithuania
    'LU', // Luxembourg
    'LV', // Latvia
    'MT', // Malta
    'NL', // Netherlands
    'PL', // Poland
    'PT', // Portugal
    'RO', // Romania
    'SE', // Sweden
    'SI', // Slovenia
    'SK', // Slovakia
    // EEA (not EU, but GDPR applies)
    'IS', // Iceland
    'LI', // Liechtenstein
    'NO', // Norway
  ] as const,
} as const;

/**
 * GDPR data retention periods (in days).
 * Based on EU medical record retention requirements by member state.
 * Defaulting to the most conservative requirement (10 years / Germany).
 */
export const GDPR_RETENTION_PERIODS = {
  /** Patient medical records — 10 years from last treatment (German law §630f BGB) */
  PATIENT_RECORDS_DAYS: 3_650,

  /** Appointment records — retained with patient records */
  APPOINTMENT_RECORDS_DAYS: 3_650,

  /** Audit logs — minimum 5 years per EU guidelines */
  AUDIT_LOGS_DAYS: 1_825,

  /** Consent records — retained indefinitely (must be able to prove consent was given) */
  CONSENT_RECORDS_DAYS: Infinity,

  /** Session/auth logs — 90 days */
  SESSION_LOGS_DAYS: 90,
} as const;

/**
 * Database table names — centralized to avoid string literals in query code.
 * Prevents typos and enables refactoring with TypeScript support.
 */
export const DB_TABLES = {
  CLINICS:           'clinics',
  CLINIC_MEMBERS:    'clinic_members',
  DOCTORS:           'doctors',
  PATIENTS:          'patients',
  APPOINTMENT_TYPES: 'appointment_types',
  APPOINTMENTS:      'appointments',
  PATIENT_CONSENTS:  'patient_consents',
  AUDIT_LOGS:        'audit_logs',
} as const;

/** Union type of all valid table names (for type-safe query building) */
export type DbTableName = (typeof DB_TABLES)[keyof typeof DB_TABLES];
