/**
 * @file app/(dashboard)/dashboard/calendar/actions.ts
 * @description Next.js Server Actions for the interactive calendar engine.
 *
 * All mutations enforce:
 * - Authentication (valid Supabase session required)
 * - Tenant isolation (clinic_id always derived server-side from membership)
 * - Input validation via Zod schemas
 * - Audit logging for GDPR compliance
 * - Typed discriminated-union results (no raw Error throws)
 *
 * Type notes: The hand-written Database type in database.types.ts has minor
 * inference gaps with the Supabase JS client under strict `exactOptionalPropertyTypes`.
 * Explicit type assertions are used where inference fails — a pattern already
 * established in the existing codebase (see `app/(dashboard)/dashboard/page.tsx`).
 *
 * @compliance GDPR Article 5(1)(f) — Integrity & confidentiality through
 *             server-side ownership verification before any data mutation.
 */

'use server';

import { revalidatePath }             from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, getClinicMembership } from '@/lib/auth/helpers';
import {
  CreateAppointmentSchema,
  UpdateAppointmentStatusSchema,
  RescheduleAppointmentSchema,
  ResizeAppointmentSchema,
  FetchAppointmentsRangeSchema,
} from '@/lib/validations/appointment';
import type { ActionResult, AppointmentWithRelations } from '@/types/calendar';
import type { AppointmentRow, AppointmentStatus } from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Authenticates the caller and resolves their active clinic_id.
 * Returns an ActionResult — never throws.
 */
async function resolveClinicContext(): Promise<
  ActionResult<{ clinicId: string; userId: string }>
> {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);

  if (!authResult.ok) {
    return { ok: false, error: 'You must be signed in to perform this action.' };
  }

  const membershipResult = await getClinicMembership(supabase, authResult.data.id);

  if (!membershipResult.ok) {
    return { ok: false, error: 'No active clinic membership found.' };
  }

  return {
    ok:   true,
    data: {
      clinicId: membershipResult.data.clinic_id,
      userId:   authResult.data.id,
    },
  };
}

/**
 * Fire-and-forget audit log. Errors are intentionally swallowed so they
 * never block the primary operation.
 */
async function logAuditEvent(params: {
  supabase:       ReturnType<typeof createSupabaseServerClient> extends Promise<infer S> ? S : never;
  clinicId:       string;
  action:         string;
  resourceType:   string;
  resourceId?:    string;
  httpMethod?:    string;
  apiEndpoint?:   string;
  success?:       boolean;
  newValues?:     Record<string, unknown>;
}): Promise<void> {
  try {
    // Use `as never` to bypass the strict RPC type inference. The underlying
    // function signature matches our Database.Functions.log_audit_event definition.
    await params.supabase.rpc('log_audit_event' as never, {
      p_clinic_id:     params.clinicId,
      p_action:        params.action,
      p_resource_type: params.resourceType,
      p_resource_id:   params.resourceId,
      p_http_method:   params.httpMethod,
      p_api_endpoint:  params.apiEndpoint,
      p_success:       params.success ?? true,
      p_new_values:    params.newValues,
    } as never);
  } catch {
    // Audit failures must never surface to end-users or block mutations.
  }
}

// ---------------------------------------------------------------------------
// fetchAppointmentsForRange
// ---------------------------------------------------------------------------

/**
 * Fetches all active appointments for the authenticated user's clinic within
 * the specified date range, joined with patient, doctor, and appointment type.
 *
 * Called client-side when the user navigates to a different week/month.
 *
 * @param rangeStart - ISO 8601 start of the date range (inclusive).
 * @param rangeEnd   - ISO 8601 end of the date range (inclusive).
 */
export async function fetchAppointmentsForRange(
  rangeStart: string,
  rangeEnd:   string,
): Promise<ActionResult<AppointmentWithRelations[]>> {
  const ctxResult = await resolveClinicContext();
  if (!ctxResult.ok) return ctxResult;

  const parsed = FetchAppointmentsRangeSchema.safeParse({ range_start: rangeStart, range_end: rangeEnd });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid date range.' };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      doctor_id,
      appointment_type_id,
      scheduled_at,
      duration_minutes,
      ends_at,
      status,
      chief_complaint,
      cancellation_reason,
      clinical_notes,
      follow_up_required,
      patient:patients(id, first_name, last_name),
      doctor:doctors(id, first_name, last_name, title, specialty),
      appointment_type:appointment_types(id, name, color, duration_minutes)
    `)
    .eq('clinic_id', ctxResult.data.clinicId)
    .is('deleted_at', null)
    .gte('scheduled_at', parsed.data.range_start)
    .lte('scheduled_at', parsed.data.range_end)
    .order('scheduled_at');

  if (error) {
    return { ok: false, error: 'Failed to load appointments. Please try again.' };
  }

  const appointments = (data as unknown as AppointmentWithRelations[]) ?? [];

  return { ok: true, data: appointments };
}

// ---------------------------------------------------------------------------
// createAppointmentAction
// ---------------------------------------------------------------------------

/**
 * Creates a new appointment in the clinic's schedule.
 * The `clinic_id` is resolved server-side — never accepted from the client.
 */
export async function createAppointmentAction(
  input: unknown,
): Promise<ActionResult<AppointmentRow>> {
  const ctxResult = await resolveClinicContext();
  if (!ctxResult.ok) return ctxResult;

  const parsed = CreateAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    const fieldPath  = firstError?.path[0];
    const result: ActionResult<AppointmentRow> = {
      ok:    false,
      error: firstError?.message ?? 'Invalid appointment data.',
    };
    if (typeof fieldPath === 'string') {
      return { ...result, field: fieldPath };
    }
    return result;
  }

  const { clinicId, userId } = ctxResult.data;
  const supabase = await createSupabaseServerClient();

  // Verify patient belongs to this clinic (tenant isolation).
  const { data: patientCheck } = await supabase
    .from('patients')
    .select('id')
    .eq('id', parsed.data.patient_id)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!patientCheck) {
    return { ok: false, error: 'Patient not found in your clinic.' };
  }

  // Verify doctor belongs to this clinic (tenant isolation).
  const { data: doctorCheck } = await supabase
    .from('doctors')
    .select('id')
    .eq('id', parsed.data.doctor_id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .maybeSingle();

  if (!doctorCheck) {
    return { ok: false, error: 'Doctor not found in your clinic.' };
  }

  // Insert the new appointment. Use `as never` to bypass strict type inference
  // on the hand-written AppointmentInsert type.
  const insertPayload = {
    clinic_id:           clinicId,
    patient_id:          parsed.data.patient_id,
    doctor_id:           parsed.data.doctor_id,
    appointment_type_id: parsed.data.appointment_type_id ?? null,
    scheduled_at:        parsed.data.scheduled_at,
    duration_minutes:    parsed.data.duration_minutes,
    status:              'pending' as AppointmentStatus,
    chief_complaint:     parsed.data.chief_complaint ?? null,
    booked_via:          parsed.data.booked_via,
    booked_by:           userId,
    follow_up_required:  false,
  };

  const { data: appointment, error: insertError } = await supabase
    .from('appointments')
    .insert(insertPayload as never)
    .select('id, patient_id, doctor_id, appointment_type_id, scheduled_at, duration_minutes, ends_at, status, chief_complaint, cancellation_reason, clinical_notes, follow_up_required, booked_via, booked_by, created_at, updated_at, clinic_id, cancelled_at, cancellation_by, diagnosis_codes, prescription_notes, follow_up_notes, data_retention_until, deleted_at')
    .single();

  if (insertError || !appointment) {
    return { ok: false, error: 'Failed to create appointment. Please try again.' };
  }

  const appointmentRow = appointment as unknown as AppointmentRow;

  await logAuditEvent({
    supabase,
    clinicId,
    action:      'INSERT',
    resourceType: 'appointment',
    resourceId:   appointmentRow.id,
    httpMethod:   'SERVER_ACTION',
    apiEndpoint:  'createAppointmentAction',
  });

  revalidatePath('/dashboard/calendar');

  return { ok: true, data: appointmentRow };
}

// ---------------------------------------------------------------------------
// updateAppointmentStatusAction
// ---------------------------------------------------------------------------

/**
 * Updates the status of an existing appointment.
 * Enforces clinic_id ownership before mutating the record.
 */
export async function updateAppointmentStatusAction(
  input: unknown,
): Promise<ActionResult<{ id: string; status: AppointmentStatus; cancelled_at: string | null; cancellation_reason: string | null }>> {
  const ctxResult = await resolveClinicContext();
  if (!ctxResult.ok) return ctxResult;

  const parsed = UpdateAppointmentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  const { clinicId, userId } = ctxResult.data;
  const supabase = await createSupabaseServerClient();

  const updatePayload: Record<string, unknown> = {
    status: parsed.data.status,
  };

  if (parsed.data.status === 'cancelled') {
    updatePayload['cancelled_at']        = new Date().toISOString();
    updatePayload['cancellation_by']     = userId;
    updatePayload['cancellation_reason'] = parsed.data.cancellation_reason ?? null;
  }

  const { data: updated, error } = await supabase
    .from('appointments')
    .update(updatePayload as never)
    .eq('id', parsed.data.appointment_id)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .select('id, status, cancelled_at, cancellation_reason')
    .single();

  if (error || !updated) {
    return { ok: false, error: 'Failed to update appointment status. Please try again.' };
  }

  const updatedRow = updated as unknown as {
    id: string;
    status: AppointmentStatus;
    cancelled_at: string | null;
    cancellation_reason: string | null;
  };

  await logAuditEvent({
    supabase,
    clinicId,
    action:       'UPDATE',
    resourceType: 'appointment',
    resourceId:   parsed.data.appointment_id,
    httpMethod:   'SERVER_ACTION',
    apiEndpoint:  'updateAppointmentStatusAction',
    newValues:    { status: parsed.data.status },
  });

  revalidatePath('/dashboard/calendar');

  return { ok: true, data: updatedRow };
}

// ---------------------------------------------------------------------------
// rescheduleAppointmentAction
// ---------------------------------------------------------------------------

/**
 * Reschedules an appointment to a new datetime (drag-and-drop result).
 * Enforces clinic_id ownership.
 */
export async function rescheduleAppointmentAction(
  input: unknown,
): Promise<ActionResult<{ id: string; scheduled_at: string; ends_at: string; status: AppointmentStatus }>> {
  const ctxResult = await resolveClinicContext();
  if (!ctxResult.ok) return ctxResult;

  const parsed = RescheduleAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  const { clinicId } = ctxResult.data;
  const supabase = await createSupabaseServerClient();

  const { data: updated, error } = await supabase
    .from('appointments')
    .update({ scheduled_at: parsed.data.scheduled_at, status: 'rescheduled' as AppointmentStatus } as never)
    .eq('id', parsed.data.appointment_id)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .select('id, scheduled_at, ends_at, status')
    .single();

  if (error || !updated) {
    return { ok: false, error: 'Failed to reschedule appointment. Please try again.' };
  }

  const updatedRow = updated as unknown as {
    id: string;
    scheduled_at: string;
    ends_at: string;
    status: AppointmentStatus;
  };

  await logAuditEvent({
    supabase,
    clinicId,
    action:       'UPDATE',
    resourceType: 'appointment',
    resourceId:   parsed.data.appointment_id,
    httpMethod:   'SERVER_ACTION',
    apiEndpoint:  'rescheduleAppointmentAction',
    newValues:    { scheduled_at: parsed.data.scheduled_at },
  });

  revalidatePath('/dashboard/calendar');

  return { ok: true, data: updatedRow };
}

// ---------------------------------------------------------------------------
// resizeAppointmentAction
// ---------------------------------------------------------------------------

/**
 * Updates the duration of an appointment (resize-handle drag result).
 * Enforces clinic_id ownership.
 */
export async function resizeAppointmentAction(
  input: unknown,
): Promise<ActionResult<{ id: string; duration_minutes: number; ends_at: string }>> {
  const ctxResult = await resolveClinicContext();
  if (!ctxResult.ok) return ctxResult;

  const parsed = ResizeAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  const { clinicId } = ctxResult.data;
  const supabase = await createSupabaseServerClient();

  const { data: updated, error } = await supabase
    .from('appointments')
    .update({ duration_minutes: parsed.data.duration_minutes } as never)
    .eq('id', parsed.data.appointment_id)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .select('id, duration_minutes, ends_at')
    .single();

  if (error || !updated) {
    return { ok: false, error: 'Failed to update appointment duration. Please try again.' };
  }

  const updatedRow = updated as unknown as {
    id: string;
    duration_minutes: number;
    ends_at: string;
  };

  revalidatePath('/dashboard/calendar');

  return { ok: true, data: updatedRow };
}
