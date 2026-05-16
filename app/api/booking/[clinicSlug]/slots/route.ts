/**
 * @file app/api/booking/[clinicSlug]/slots/route.ts
 * @description Public API: Compute available time slots for a doctor on a date.
 *
 * GET /api/booking/:clinicSlug/slots
 *   ?doctor_id=uuid
 *   &appointment_type_id=uuid
 *   &date=YYYY-MM-DD
 *
 * Workflow:
 *   1. Validate clinic slug and query parameters.
 *   2. Fetch appointment type (duration + buffer times).
 *   3. Fetch doctor's availability_schedule (weekly JSON).
 *   4. Fetch existing booked windows for the doctor on the date (via RPC).
 *   5. Compute available slots using computeAvailableSlots().
 *
 * No authentication required.
 *
 * @compliance GDPR — No personal data is returned. Slot times are organizational
 *             schedule data, not patient data.
 */

import { NextResponse, type NextRequest }         from 'next/server';
import { createSupabaseAdminClient }               from '@/lib/supabase/server';
import { clinicSlugParamSchema, slotsQuerySchema } from '@/lib/validations/booking';
import { computeAvailableSlots }                   from '@/lib/booking/slots';
import type { ApiResponse }                        from '@/types';
import type { BookingTimeSlot }                    from '@/types/booking';
import type { Json }                               from '@/database/types/database.types';

type ClinicIdRow = { id: string };

type ApptTypeRow = {
  id:                    string;
  duration_minutes:      number;
  buffer_before_minutes: number;
  buffer_after_minutes:  number;
};

type DoctorScheduleRow = {
  id:                    string;
  availability_schedule: Json;
};

type BookedSlotRow = {
  scheduled_at: string;
  ends_at:      string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicSlug: string }> }
): Promise<NextResponse<ApiResponse<BookingTimeSlot[]>>> {
  const resolvedParams = await params;

  const slugParsed = clinicSlugParamSchema.safeParse(resolvedParams);
  if (!slugParsed.success) {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_SLUG', message: 'Invalid clinic slug format.' } },
      { status: 400 }
    );
  }

  const { searchParams } = request.nextUrl;
  const queryParsed = slotsQuerySchema.safeParse({
    doctor_id:           searchParams.get('doctor_id'),
    appointment_type_id: searchParams.get('appointment_type_id'),
    date:                searchParams.get('date'),
  });

  if (!queryParsed.success) {
    return NextResponse.json(
      {
        data:  null,
        error: {
          code:    'INVALID_PARAMS',
          message: 'Missing or invalid query parameters.',
          details: queryParsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const { clinicSlug }                           = slugParsed.data;
  const { doctor_id, appointment_type_id, date } = queryParsed.data;
  const supabase = createSupabaseAdminClient();

  // Resolve clinic
  const { data: rawClinic, error: clinicError } = await supabase
    .from('clinics')
    .select('id')
    .eq('slug', clinicSlug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  const clinic = rawClinic as unknown as ClinicIdRow | null;

  if (clinicError || !clinic) {
    return NextResponse.json(
      { data: null, error: { code: 'CLINIC_NOT_FOUND', message: 'Clinic not found.' } },
      { status: 404 }
    );
  }

  // Fetch appointment type
  const { data: rawApptType, error: apptTypeError } = await supabase
    .from('appointment_types')
    .select('id, duration_minutes, buffer_before_minutes, buffer_after_minutes')
    .eq('id', appointment_type_id)
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .eq('is_online_bookable', true)
    .single();

  const apptType = rawApptType as unknown as ApptTypeRow | null;

  if (apptTypeError || !apptType) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVICE_NOT_FOUND', message: 'Appointment type not found.' } },
      { status: 404 }
    );
  }

  // Fetch doctor availability
  const { data: rawDoctor, error: doctorError } = await supabase
    .from('doctors')
    .select('id, availability_schedule')
    .eq('id', doctor_id)
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .eq('is_accepting_new_patients', true)
    .is('deleted_at', null)
    .single();

  const doctor = rawDoctor as unknown as DoctorScheduleRow | null;

  if (doctorError || !doctor) {
    return NextResponse.json(
      { data: null, error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found.' } },
      { status: 404 }
    );
  }

  // Fetch booked windows via RPC
  // Double-cast via unknown to bypass Supabase generic rpc() inference issue.
  // PostgrestFilterBuilder is thenable but not declared as a Promise; casting is safe.
  const rpcFn = supabase.rpc.bind(supabase) as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: BookedSlotRow[] | null; error: { message: string } | null }>;

  const { data: bookedWindows, error: bookedError } = await rpcFn(
    'get_booked_slots',
    { p_doctor_id: doctor_id, p_date: date }
  );

  if (bookedError) {
    return NextResponse.json(
      { data: null, error: { code: 'DB_ERROR', message: 'Failed to fetch schedule.' } },
      { status: 500 }
    );
  }

  const slots = computeAvailableSlots(
    doctor.availability_schedule as Record<string, unknown>,
    bookedWindows ?? [],
    date,
    apptType.duration_minutes,
    apptType.buffer_before_minutes,
    apptType.buffer_after_minutes,
  );

  return NextResponse.json({ data: slots, error: null });
}
