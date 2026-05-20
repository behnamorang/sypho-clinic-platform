/**
 * @file lib/sypho-med/submit-consultation-lead.ts
 * @description Persists consultation lead data to Supabase `leads` table.
 */

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { LeadInsert } from '@/database/types/database.types';
import type { ConsultationLeadFormData } from '@/lib/sypho-med/book-demo-types';

export type SubmitConsultationLeadResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Inserts a validated consultation lead into Supabase.
 * Does not log PII — only error codes/messages on failure.
 */
export async function submitConsultationLeadToSupabase(
  data: ConsultationLeadFormData,
): Promise<SubmitConsultationLeadResult> {
  try {
    const supabase = createSupabaseBrowserClient();

    const leadInsertPayload: LeadInsert = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      clinic_name: data.clinicName,
      location: data.location,
      booking_volume: data.bookingVolume,
      pain_points: data.painPoints,
    };

    // @ts-expect-error — Supabase Insert inference resolves to `never[]` under exactOptionalPropertyTypes.
    const { error } = await supabase.from('leads').insert(leadInsertPayload);

    if (error) {
      console.error(
        '[submitConsultationLead] Supabase insert failed:',
        error.code ?? 'unknown',
        error.message,
      );
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected submission error';
    console.error('[submitConsultationLead] Unexpected error:', message);
    return { success: false, error: message };
  }
}
