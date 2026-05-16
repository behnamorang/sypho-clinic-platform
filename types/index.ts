/**
 * @file types/index.ts
 * @description Global TypeScript type definitions for Sypho.io.
 *
 * Re-exports all shared types from the database schema and defines
 * additional application-level types used across the codebase.
 *
 * Import from this module for application types:
 * ```ts
 * import type { ApiResponse, ClinicRow, AppointmentStatus } from '@/types';
 * ```
 */

// Re-export all database types for convenient access
export type {
  Database,
  ClinicRow,
  ClinicInsert,
  ClinicUpdate,
  ClinicMemberRow,
  DoctorRow,
  DoctorInsert,
  DoctorUpdate,
  PatientRow,
  PatientInsert,
  PatientUpdate,
  AppointmentTypeRow,
  AppointmentTypeInsert,
  AppointmentTypeUpdate,
  AppointmentRow,
  AppointmentInsert,
  AppointmentUpdate,
  PatientConsentRow,
  PatientConsentInsert,
  AuditLogRow,
  AuditLogInsert,
  AppointmentStatus,
  GenderType,
  GdprLawfulBasis,
  UserRole,
  NotificationChannel,
  AuditAction,
  ConsentType,
  ConsentCaptureMethod,
  BookingChannel,
  SubscriptionTier,
  WeeklySchedule,
  DaySchedule,
  TimeSlot,
} from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// API RESPONSE ENVELOPE
// All API route handlers must return data in this shape.
// ---------------------------------------------------------------------------

/**
 * Standard API response envelope for all Sypho.io API endpoints.
 * Ensures consistent response shapes for frontend consumers.
 */
export type ApiResponse<T = unknown> =
  | { data: T; error: null; meta?: ResponseMeta }
  | { data: null; error: ApiError; meta?: ResponseMeta };

/** Pagination and metadata for list responses. */
export interface ResponseMeta {
  page?:       number;
  per_page?:   number;
  total?:      number;
  total_pages?: number;
}

/** Structured API error following RFC 7807 Problem Details. */
export interface ApiError {
  code:    string;         // Machine-readable error code (e.g., 'UNAUTHORIZED')
  message: string;         // Human-readable error message
  details?: unknown;       // Optional additional context (never include PII)
  field?:   string;        // For validation errors — the offending field name
}

// ---------------------------------------------------------------------------
// PAGINATION
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page:     number;
  per_page: number;
}

export interface PaginatedResult<T> {
  items:       T[];
  total:       number;
  page:        number;
  per_page:    number;
  total_pages: number;
  has_next:    boolean;
  has_prev:    boolean;
}

// ---------------------------------------------------------------------------
// AUTH & SESSION
// ---------------------------------------------------------------------------

/** Authenticated user context, available via Supabase session. */
export interface AuthUser {
  id:        string;
  email:     string | null;
  role:      import('@/database/types/database.types').UserRole;
  clinic_id: string;
}

// ---------------------------------------------------------------------------
// DOCTOR DISPLAY HELPER
// ---------------------------------------------------------------------------

/** Computed display name for a doctor (includes professional title). */
export interface DoctorDisplayName {
  full_name:    string;  // e.g., "Dr. Jane Smith"
  display_name: string;  // e.g., "Dr. Smith"
  initials:     string;  // e.g., "JS"
}

// ---------------------------------------------------------------------------
// CALENDAR / SCHEDULING
// ---------------------------------------------------------------------------

/** A resolved available time slot for booking. */
export interface AvailableSlot {
  starts_at:        string;  // ISO 8601
  ends_at:          string;  // ISO 8601
  doctor_id:        string;
  duration_minutes: number;
}

/** Date range for calendar queries. */
export interface DateRange {
  from: string;  // ISO 8601 date string
  to:   string;  // ISO 8601 date string
}
