/**
 * @file lib/validations/appointment.ts
 * @description Zod schemas for all appointment-related server actions.
 *
 * Every mutation that touches the `public.appointments` table MUST validate
 * its input against one of these schemas before reaching the database layer.
 *
 * @compliance GDPR — Validation prevents invalid or malicious data from
 *             entering sensitive appointment records.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared field definitions
// ---------------------------------------------------------------------------

const uuidField       = z.string().uuid('Must be a valid UUID');
const isoDateField    = z.string().datetime({ message: 'Must be a valid ISO 8601 datetime string' });
const durationField   = z.number().int().min(5, 'Minimum duration is 5 minutes').max(480, 'Maximum duration is 8 hours');

// ---------------------------------------------------------------------------
// Create appointment schema
// ---------------------------------------------------------------------------

/**
 * Validates the payload for creating a new appointment.
 * `clinic_id` is NOT included here — it is always derived server-side from
 * the authenticated user's membership, never trusted from the client.
 */
export const CreateAppointmentSchema = z.object({
  patient_id:          uuidField,
  doctor_id:           uuidField,
  appointment_type_id: uuidField.optional(),
  scheduled_at:        isoDateField,
  duration_minutes:    durationField,
  chief_complaint:     z.string().max(500).optional(),
  booked_via:          z.enum(['dashboard', 'online', 'phone', 'walk_in', 'api']).default('dashboard'),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

// ---------------------------------------------------------------------------
// Update appointment status schema
// ---------------------------------------------------------------------------

export const UpdateAppointmentStatusSchema = z.object({
  appointment_id:      uuidField,
  status:              z.enum([
    'pending',
    'confirmed',
    'checked_in',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'rescheduled',
  ]),
  cancellation_reason: z.string().max(500).optional(),
});

export type UpdateAppointmentStatusInput = z.infer<typeof UpdateAppointmentStatusSchema>;

// ---------------------------------------------------------------------------
// Reschedule appointment schema
// ---------------------------------------------------------------------------

export const RescheduleAppointmentSchema = z.object({
  appointment_id: uuidField,
  scheduled_at:   isoDateField,
});

export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentSchema>;

// ---------------------------------------------------------------------------
// Resize appointment (change duration) schema
// ---------------------------------------------------------------------------

export const ResizeAppointmentSchema = z.object({
  appointment_id:   uuidField,
  duration_minutes: durationField,
});

export type ResizeAppointmentInput = z.infer<typeof ResizeAppointmentSchema>;

// ---------------------------------------------------------------------------
// Fetch appointments range schema
// ---------------------------------------------------------------------------

export const FetchAppointmentsRangeSchema = z.object({
  range_start: isoDateField,
  range_end:   isoDateField,
});

export type FetchAppointmentsRangeInput = z.infer<typeof FetchAppointmentsRangeSchema>;
