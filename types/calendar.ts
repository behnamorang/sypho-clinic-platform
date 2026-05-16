/**
 * @file types/calendar.ts
 * @description Calendar-specific TypeScript types for the Sypho.io scheduling engine.
 *
 * These types represent the enriched, view-layer representations of database rows,
 * combining appointment data with joined patient, doctor, and appointment-type records.
 *
 * @compliance GDPR — Only non-sensitive fields needed for display are included.
 *             Full patient records (PHI) are not included in calendar view types.
 */

import type { AppointmentStatus } from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// Slim view types (joined projection for calendar rendering)
// ---------------------------------------------------------------------------

/** Minimal patient fields required for calendar display. */
export interface CalendarPatient {
  id:         string;
  first_name: string;
  last_name:  string;
}

/** Minimal doctor fields required for calendar display. */
export interface CalendarDoctor {
  id:         string;
  first_name: string;
  last_name:  string;
  title:      string | null;
  specialty:  string;
}

/** Minimal appointment-type fields required for calendar display. */
export interface CalendarAppointmentType {
  id:               string;
  name:             string;
  color:            string;
  duration_minutes: number;
}

// ---------------------------------------------------------------------------
// Enriched appointment (appointment row + joined relations)
// ---------------------------------------------------------------------------

/**
 * Full appointment data with resolved patient, doctor, and appointment type.
 * This is the primary type used throughout the calendar components.
 */
export interface AppointmentWithRelations {
  id:                  string;
  patient_id:          string;
  doctor_id:           string;
  appointment_type_id: string | null;
  scheduled_at:        string;          // ISO 8601
  duration_minutes:    number;
  ends_at:             string;          // ISO 8601 (generated column)
  status:              AppointmentStatus;
  chief_complaint:     string | null;
  cancellation_reason: string | null;
  clinical_notes:      string | null;
  follow_up_required:  boolean;
  patient:             CalendarPatient;
  doctor:              CalendarDoctor;
  appointment_type:    CalendarAppointmentType | null;
}

// ---------------------------------------------------------------------------
// Calendar view state
// ---------------------------------------------------------------------------

/** The three supported calendar view modes. */
export type CalendarView = 'day' | 'week' | 'month';

/**
 * Represents a clicked (or dragged-to) time slot in the calendar grid.
 * Used to pre-populate the booking modal.
 */
export interface CalendarSlot {
  date:   Date;
  hour:   number;
  minute: number;
}

// ---------------------------------------------------------------------------
// Drag & resize state
// ---------------------------------------------------------------------------

/** State captured when an appointment drag begins. */
export interface DragState {
  appointmentId:       string;
  originalScheduledAt: string;
}

/** State captured when an appointment resize begins. */
export interface ResizeState {
  appointmentId:           string;
  startY:                  number;
  originalDurationMinutes: number;
}

// ---------------------------------------------------------------------------
// Optimistic UI update payloads
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all possible optimistic state update operations.
 * Used with React's `useOptimistic` hook to apply instant UI feedback.
 */
export type OptimisticUpdate =
  | { type: 'create';     appointment: AppointmentWithRelations }
  | { type: 'status';     id: string; status: AppointmentStatus; cancellationReason?: string }
  | { type: 'reschedule'; id: string; scheduledAt: string }
  | { type: 'resize';     id: string; durationMinutes: number }
  | { type: 'remove';     id: string };

// ---------------------------------------------------------------------------
// Server action result types
// ---------------------------------------------------------------------------

/** Typed result returned from all calendar server actions. */
export type ActionResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: string; field?: string | undefined };

// ---------------------------------------------------------------------------
// Initial server-to-client data bundle
// ---------------------------------------------------------------------------

/**
 * Data bundle passed from the calendar Server Component to the CalendarView
 * Client Component as initial props. Contains everything needed to render
 * the first view without any client-side fetching.
 */
export interface CalendarInitialData {
  clinicId:         string;
  appointments:     AppointmentWithRelations[];
  patients:         CalendarPatient[];
  doctors:          CalendarDoctor[];
  appointmentTypes: CalendarAppointmentType[];
}
