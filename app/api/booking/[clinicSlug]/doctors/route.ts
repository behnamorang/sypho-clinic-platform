/**
 * @file app/api/booking/[clinicSlug]/doctors/route.ts
 * @description Public API: List active, accepting doctors for a clinic.
 *
 * GET /api/booking/:clinicSlug/doctors[?service_id=uuid]
 *
 * Currently returns all active doctors for the clinic regardless of service_id
 * (service-to-doctor association is a future feature). The optional service_id
 * parameter is accepted but not yet used for filtering.
 *
 * No authentication required.
 *
 * @compliance GDPR — Returns only professional/catalog data.
 *             Excludes: license_number, license_country, personal contact info.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient }       from '@/lib/supabase/server';
import { clinicSlugParamSchema }           from '@/lib/validations/booking';
import type { ApiResponse }                from '@/types';
import type { PublicDoctorProfile }        from '@/types/booking';
import type { Json }                       from '@/database/types/database.types';

type ClinicIdRow = { id: string };

type DoctorSelectRow = {
  id:               string;
  clinic_id:        string;
  title:            string | null;
  first_name:       string;
  last_name:        string;
  specialty:        string;
  sub_specialty:    string | null;
  availability_schedule: Json;
  default_appointment_duration_minutes: number;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicSlug: string }> }
): Promise<NextResponse<ApiResponse<PublicDoctorProfile[]>>> {
  const resolvedParams = await params;

  const parsed = clinicSlugParamSchema.safeParse(resolvedParams);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_SLUG', message: 'Invalid clinic slug format.' } },
      { status: 400 }
    );
  }

  const { clinicSlug } = parsed.data;
  const supabase = createSupabaseAdminClient();

  // Optional service_id filter — accepted but reserved for future use
  void request.nextUrl.searchParams.get('service_id');

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

  const { data: rawData, error } = await supabase
    .from('doctors')
    .select(
      'id, clinic_id, title, first_name, last_name, specialty, sub_specialty, ' +
      'availability_schedule, default_appointment_duration_minutes'
    )
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .eq('is_accepting_new_patients', true)
    .is('deleted_at', null)
    .order('last_name', { ascending: true });

  if (error) {
    return NextResponse.json(
      { data: null, error: { code: 'DB_ERROR', message: 'Failed to fetch doctors.' } },
      { status: 500 }
    );
  }

  const rows = rawData as unknown as DoctorSelectRow[];

  const doctors: PublicDoctorProfile[] = (rows ?? []).map((row) => ({
    id:               row.id,
    clinic_id:        row.clinic_id,
    title:            row.title,
    first_name:       row.first_name,
    last_name:        row.last_name,
    specialty:        row.specialty,
    sub_specialty:    row.sub_specialty,
    availability_schedule: row.availability_schedule as Record<string, unknown>,
    default_appointment_duration_minutes: row.default_appointment_duration_minutes,
  }));

  return NextResponse.json({ data: doctors, error: null });
}
