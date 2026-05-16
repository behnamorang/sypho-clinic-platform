/**
 * @file app/api/booking/[clinicSlug]/services/route.ts
 * @description Public API: List online-bookable appointment types for a clinic.
 *
 * GET /api/booking/:clinicSlug/services
 *
 * Returns only active, online-bookable appointment types.
 * No authentication required.
 *
 * @compliance GDPR — No personal data is exposed. Appointment types are
 *             organizational catalog data, not patient data.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient }       from '@/lib/supabase/server';
import { clinicSlugParamSchema }           from '@/lib/validations/booking';
import type { ApiResponse }                from '@/types';
import type { PublicServiceProfile }       from '@/types/booking';
import type { AppointmentTypeRow }         from '@/database/types/database.types';

type ServiceSelectRow = Pick<
  AppointmentTypeRow,
  | 'id' | 'clinic_id' | 'name' | 'description' | 'color' | 'duration_minutes'
  | 'buffer_before_minutes' | 'buffer_after_minutes' | 'price_cents' | 'currency_code'
>;

type ClinicIdRow = { id: string };

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicSlug: string }> }
): Promise<NextResponse<ApiResponse<PublicServiceProfile[]>>> {
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

  // Resolve clinic ID from slug (cast via unknown to avoid Supabase generic inference issue)
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
    .from('appointment_types')
    .select(
      'id, clinic_id, name, description, color, duration_minutes, ' +
      'buffer_before_minutes, buffer_after_minutes, price_cents, currency_code'
    )
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .eq('is_online_bookable', true)
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json(
      { data: null, error: { code: 'DB_ERROR', message: 'Failed to fetch services.' } },
      { status: 500 }
    );
  }

  const rows = rawData as unknown as ServiceSelectRow[];

  const services: PublicServiceProfile[] = (rows ?? []).map((row) => ({
    id:                    row.id,
    clinic_id:             row.clinic_id,
    name:                  row.name,
    description:           row.description,
    color:                 row.color,
    duration_minutes:      row.duration_minutes,
    buffer_before_minutes: row.buffer_before_minutes,
    buffer_after_minutes:  row.buffer_after_minutes,
    price_cents:           row.price_cents,
    currency_code:         row.currency_code,
  }));

  return NextResponse.json({ data: services, error: null });
}
