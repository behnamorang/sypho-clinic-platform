/**
 * @file app/api/booking/[clinicSlug]/confirm/route.ts
 * @description Public API: Confirm a patient booking with race-condition protection.
 *
 * POST /api/booking/:clinicSlug/confirm
 *
 * Delegates all atomic work to the `book_appointment_as_patient` PostgreSQL RPC,
 * which uses pg_advisory_xact_lock to prevent double-booking under concurrency.
 *
 * The RPC:
 *   1. Validates clinic, service, and doctor ownership.
 *   2. Acquires a per-(doctor, slot) advisory lock.
 *   3. Checks for overlap AFTER lock acquisition.
 *   4. Creates or reuses the patient record (idempotent by email).
 *   5. Inserts the appointment.
 *   6. Records GDPR consent atomically.
 *
 * Rate limiting: enforced by the middleware layer (future enhancement).
 * CSRF protection: Server Actions / POST-only route with content-type check.
 *
 * @compliance GDPR Article 9(2)(h) — healthcare provision lawful basis.
 *             Explicit consent is validated before any data storage.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient }       from '@/lib/supabase/server';
import {
  clinicSlugParamSchema,
  bookingConfirmSchema,
}                                          from '@/lib/validations/booking';
import type { ApiResponse }                from '@/types';
import type { BookingConfirmationResult }  from '@/types/booking';

type RpcConfirmResult = {
  appointment_id: string;
  patient_id:     string;
  clinic_id:      string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicSlug: string }> }
): Promise<NextResponse<ApiResponse<BookingConfirmationResult>>> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_CONTENT_TYPE', message: 'Content-Type must be application/json.' } },
      { status: 415 }
    );
  }

  const resolvedParams = await params;
  const slugParsed = clinicSlugParamSchema.safeParse(resolvedParams);
  if (!slugParsed.success) {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_SLUG', message: 'Invalid clinic slug format.' } },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_BODY', message: 'Request body must be valid JSON.' } },
      { status: 400 }
    );
  }

  const bodyParsed = bookingConfirmSchema.safeParse(body);
  if (!bodyParsed.success) {
    return NextResponse.json(
      {
        data:  null,
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Request body validation failed.',
          details: bodyParsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 }
    );
  }

  const { clinicSlug } = slugParsed.data;
  const input = bodyParsed.data;

  const ipAddress  = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                  ?? request.headers.get('x-real-ip')
                  ?? '';
  const userAgent  = request.headers.get('user-agent') ?? '';

  const supabase = createSupabaseAdminClient();

  // Double-cast via unknown to bypass Supabase generic rpc() inference issues.
  // PostgrestFilterBuilder is thenable but not declared as a Promise; casting is safe.
  // The function signature and validation are enforced at the Postgres layer via the RPC.
  const rpcFn = supabase.rpc.bind(supabase) as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>;

  const { data: rpcResult, error: rpcError } = await rpcFn(
    'book_appointment_as_patient',
    {
      p_clinic_slug:         clinicSlug,
      p_appointment_type_id: input.appointment_type_id,
      p_doctor_id:           input.doctor_id,
      p_scheduled_at:        input.scheduled_at,
      p_first_name:          input.first_name,
      p_last_name:           input.last_name,
      p_date_of_birth:       input.date_of_birth,
      p_gender:              input.gender,
      p_email:               input.email,
      p_phone:               input.phone,
      p_chief_complaint:     input.chief_complaint ?? '',
      p_gdpr_consent:        input.gdpr_consent,
      p_marketing_consent:   input.marketing_consent ?? false,
      p_consent_version:     input.consent_version,
      p_ip_address:          ipAddress,
      p_user_agent:          userAgent,
    }
  );

  if (rpcError) {
    const message = rpcError.message ?? '';

    if (message.includes('CLINIC_NOT_FOUND')) {
      return NextResponse.json(
        { data: null, error: { code: 'CLINIC_NOT_FOUND', message: 'Clinic not found.' } },
        { status: 404 }
      );
    }
    if (message.includes('SERVICE_NOT_FOUND')) {
      return NextResponse.json(
        { data: null, error: { code: 'SERVICE_NOT_FOUND', message: 'The selected service is no longer available.' } },
        { status: 404 }
      );
    }
    if (message.includes('DOCTOR_NOT_FOUND')) {
      return NextResponse.json(
        { data: null, error: { code: 'DOCTOR_NOT_FOUND', message: 'The selected doctor is no longer available.' } },
        { status: 404 }
      );
    }
    if (message.includes('SLOT_UNAVAILABLE')) {
      return NextResponse.json(
        {
          data:  null,
          error: {
            code:    'SLOT_UNAVAILABLE',
            message: 'This time slot is no longer available. Please select another time.',
          },
        },
        { status: 409 }
      );
    }
    if (message.includes('GDPR_CONSENT_REQUIRED')) {
      return NextResponse.json(
        {
          data:  null,
          error: {
            code:    'GDPR_CONSENT_REQUIRED',
            message: 'You must accept the privacy policy to complete your booking.',
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { data: null, error: { code: 'BOOKING_FAILED', message: 'Booking could not be completed. Please try again.' } },
      { status: 500 }
    );
  }

  if (!rpcResult) {
    return NextResponse.json(
      { data: null, error: { code: 'BOOKING_FAILED', message: 'Booking could not be completed. Please try again.' } },
      { status: 500 }
    );
  }

  const resultObj = rpcResult as RpcConfirmResult;

  const confirmation: BookingConfirmationResult = {
    appointment_id: resultObj.appointment_id,
    patient_id:     resultObj.patient_id,
    clinic_id:      resultObj.clinic_id,
  };

  return NextResponse.json({ data: confirmation, error: null }, { status: 201 });
}
