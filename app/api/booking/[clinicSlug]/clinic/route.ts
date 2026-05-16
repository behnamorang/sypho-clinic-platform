/**
 * @file app/api/booking/[clinicSlug]/clinic/route.ts
 * @description Public API: Get clinic profile by slug for the booking portal.
 *
 * Returns a safe, public-facing subset of the clinic's data.
 * No authentication required — this is intentionally a public endpoint.
 *
 * GET /api/booking/:clinicSlug/clinic
 *
 * @compliance GDPR — Exposes only non-personal organizational data.
 *             Excludes: tax_id, registration_number, subscription info.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient }       from '@/lib/supabase/server';
import { clinicSlugParamSchema }           from '@/lib/validations/booking';
import type { ApiResponse }                from '@/types';
import type { PublicClinicProfile }        from '@/types/booking';
import type { ClinicRow }                  from '@/database/types/database.types';

type ClinicSelectRow = Pick<
  ClinicRow,
  | 'id' | 'name' | 'slug' | 'email' | 'phone' | 'address_line1'
  | 'city' | 'country_code' | 'timezone' | 'privacy_policy_url' | 'terms_url'
>;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicSlug: string }> }
): Promise<NextResponse<ApiResponse<PublicClinicProfile>>> {
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

  // Supabase JS typed client inference can return `never` with our custom
  // Database type when using partial column selection; we cast via `unknown`.
  const { data: rawData, error } = await supabase
    .from('clinics')
    .select('id, name, slug, email, phone, address_line1, city, country_code, timezone, privacy_policy_url, terms_url')
    .eq('slug', clinicSlug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  const data = rawData as unknown as ClinicSelectRow | null;

  if (error || !data) {
    return NextResponse.json(
      { data: null, error: { code: 'CLINIC_NOT_FOUND', message: 'Clinic not found.' } },
      { status: 404 }
    );
  }

  const clinic: PublicClinicProfile = {
    id:                 data.id,
    name:               data.name,
    slug:               data.slug,
    email:              data.email,
    phone:              data.phone,
    address_line1:      data.address_line1,
    city:               data.city,
    country_code:       data.country_code,
    timezone:           data.timezone,
    privacy_policy_url: data.privacy_policy_url,
    terms_url:          data.terms_url,
  };

  return NextResponse.json({ data: clinic, error: null });
}
