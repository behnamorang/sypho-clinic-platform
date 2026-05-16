/**
 * @file app/(dashboard)/bookings/actions.ts
 * @description Server Actions for online booking management from the clinic dashboard.
 *
 * Available actions:
 * - confirmBooking: Transition a pending appointment to 'confirmed'.
 * - cancelBooking:  Transition an appointment to 'cancelled' with a reason.
 *
 * All mutations are guarded by:
 * 1. Authentication — user must be signed in.
 * 2. Clinic membership — user must belong to the appointment's clinic.
 * 3. Role check — only clinic_owner, clinic_admin, or receptionist may confirm/cancel.
 *
 * @compliance GDPR — No patient PII is returned from these actions.
 *             All mutations are scoped to the authenticated user's clinic (RLS).
 */

'use server';

import { revalidatePath }               from 'next/cache';
import { createSupabaseServerClient }   from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  getClinicMembership,
  requireRole,
}                                       from '@/lib/auth/helpers';

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export type ActionResult =
  | { ok: true;  message: string }
  | { ok: false; code: string; message: string };

const MANAGEMENT_ROLES = ['clinic_owner', 'clinic_admin', 'receptionist'] as const;

// ---------------------------------------------------------------------------
// confirmBooking
// ---------------------------------------------------------------------------

/**
 * Confirms a pending online appointment booking.
 * Allowed by: clinic_owner, clinic_admin, receptionist.
 *
 * @param appointmentId - UUID of the appointment to confirm.
 */
export async function confirmBooking(appointmentId: string): Promise<ActionResult> {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);
  if (!authResult.ok) return authResult;

  const membershipResult = await getClinicMembership(supabase, authResult.data.id);
  if (!membershipResult.ok) return membershipResult;

  const membership = membershipResult.data;
  const roleResult = requireRole(membership.role, MANAGEMENT_ROLES);
  if (!roleResult.ok) return roleResult;

  // The Supabase generic update() call infers 'never' when our custom Database type
  // doesn't exactly satisfy the library's constraint. We bypass via an untyped builder
  // while still enforcing tenant isolation with explicit eq('clinic_id', ...) filters.
  type FlexQueryBuilder = {
    update(values: Record<string, unknown>): FlexQueryBuilder;
    eq(col: string, val: unknown): FlexQueryBuilder;
    is(col: string, val: null): Promise<{ error: { message: string } | null }>;
  };
  const apptQuery = supabase.from('appointments') as unknown as FlexQueryBuilder;
  const { error } = await apptQuery
    .update({ status: 'confirmed' })
    .eq('id', appointmentId)
    .eq('clinic_id', membership.clinic_id)
    .eq('status', 'pending')
    .is('deleted_at', null);

  if (error) {
    return { ok: false, code: 'DB_ERROR', message: 'Failed to confirm appointment.' };
  }

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard');

  return { ok: true, message: 'Appointment confirmed successfully.' };
}

// ---------------------------------------------------------------------------
// cancelBooking
// ---------------------------------------------------------------------------

/**
 * Cancels an active online appointment booking.
 * Allowed by: clinic_owner, clinic_admin, receptionist.
 *
 * @param appointmentId     - UUID of the appointment to cancel.
 * @param cancellationReason - Brief reason for cancellation (shown to patient).
 */
export async function cancelBooking(
  appointmentId:      string,
  cancellationReason: string,
): Promise<ActionResult> {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);
  if (!authResult.ok) return authResult;

  const membershipResult = await getClinicMembership(supabase, authResult.data.id);
  if (!membershipResult.ok) return membershipResult;

  const membership = membershipResult.data;
  const roleResult = requireRole(membership.role, MANAGEMENT_ROLES);
  if (!roleResult.ok) return roleResult;

  type FlexQueryBuilder = {
    update(values: Record<string, unknown>): FlexQueryBuilder;
    eq(col: string, val: unknown): FlexQueryBuilder;
    in(col: string, vals: unknown[]): FlexQueryBuilder;
    is(col: string, val: null): Promise<{ error: { message: string } | null }>;
  };
  const apptQuery = supabase.from('appointments') as unknown as FlexQueryBuilder;
  const { error } = await apptQuery
    .update({
      status:              'cancelled',
      cancellation_reason: cancellationReason.trim() || 'Cancelled by clinic',
      cancelled_at:        new Date().toISOString(),
      cancellation_by:     authResult.data.id,
    })
    .eq('id', appointmentId)
    .eq('clinic_id', membership.clinic_id)
    .in('status', ['pending', 'confirmed'])
    .is('deleted_at', null);

  if (error) {
    return { ok: false, code: 'DB_ERROR', message: 'Failed to cancel appointment.' };
  }

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard');

  return { ok: true, message: 'Appointment cancelled.' };
}
