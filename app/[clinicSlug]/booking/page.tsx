/**
 * @file app/[clinicSlug]/booking/page.tsx
 * @description Dynamic public-facing booking page for each clinic.
 *
 * Routing mechanism:
 *   The Next.js App Router dynamic segment `[clinicSlug]` captures the clinic's
 *   unique slug from the URL path (e.g., /my-clinic/booking → clinicSlug = 'my-clinic').
 *   The slug is looked up in the `clinics` table on the server; a 404 is returned if
 *   no matching active clinic exists.
 *
 * Server-side responsibilities:
 *   1. Validates the slug and fetches the clinic profile.
 *   2. Reads CDN/proxy geo headers (CF-IPCountry, x-vercel-ip-country) to derive
 *      the visitor's country, phone prefix, local currency, and date format.
 *   3. Generates the page metadata (title, description, robots indexing).
 *   4. Renders the BookingWizard client component with the resolved data as props.
 *
 * This page intentionally uses NO authentication guard — it is a public-facing
 * landing page for patients who may not have an account.
 *
 * مکانیزم مسیریابی (Persian / فارسی):
 * بخش داینامیک [clinicSlug] در App Router نکست‌جی‌اس، اسلاگ منحصربه‌فرد هر کلینیک را
 * از URL دریافت می‌کند. مثلاً /my-clinic/booking به clinicSlug = 'my-clinic' تبدیل می‌شود.
 * سرور این اسلاگ را در جدول clinics جستجو می‌کند و اگر کلینیک فعالی پیدا نشود، صفحه ۴۰۴
 * نمایش داده می‌شود. اطلاعات جغرافیایی کاربر (کشور، پیش‌شماره تلفن، واحد ارز) از هدرهای
 * CDN مانند CF-IPCountry یا x-vercel-ip-country در middleware خوانده و به کامپوننت
 * BookingWizard ارسال می‌شود تا تجربه محلی‌سازی شده ارائه دهد.
 *
 * @compliance GDPR — No personal data is stored during page render.
 *             IP address is used only for geo detection; it is not logged.
 */

import { headers }                  from 'next/headers';
import { notFound }                 from 'next/navigation';
import type { Metadata }            from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getGeoContextFromHeaders }  from '@/lib/booking/geo';
import { BookingWizard }             from '@/components/booking/booking-wizard';
import type { PublicClinicProfile }  from '@/types/booking';
import type { ClinicRow }            from '@/database/types/database.types';

type ClinicSelectRow = Pick<
  ClinicRow,
  | 'id' | 'name' | 'slug' | 'email' | 'phone' | 'address_line1'
  | 'city' | 'country_code' | 'timezone' | 'privacy_policy_url' | 'terms_url'
>;

// ---------------------------------------------------------------------------
// METADATA
// ---------------------------------------------------------------------------

interface PageParams {
  clinicSlug: string;
}

/**
 * Generates dynamic SEO metadata for each clinic's booking page.
 * Robots are set to index + follow to allow patients to find the page.
 */
export async function generateMetadata(
  { params }: { params: Promise<PageParams> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = createSupabaseAdminClient();

  const { data: rawData } = await supabase
    .from('clinics')
    .select('name, city, country_code')
    .eq('slug', resolvedParams.clinicSlug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  type MetaRow = { name: string; city: string; country_code: string };
  const data = rawData as unknown as MetaRow | null;

  if (!data) {
    return {
      title:  'Book an Appointment',
      robots: { index: false, follow: false },
    };
  }

  return {
    title:       `Book an Appointment | ${data.name}`,
    description: `Book your appointment online at ${data.name} in ${data.city}. Fast, secure, GDPR-compliant booking.`,
    robots: {
      index:  true,
      follow: true,
    },
  };
}

// ---------------------------------------------------------------------------
// PAGE COMPONENT
// ---------------------------------------------------------------------------

/**
 * Dynamic clinic booking page — Server Component.
 *
 * Fetches clinic data and geo context server-side, then renders the
 * BookingWizard client component with all necessary initial props.
 *
 * @param params - Next.js dynamic route params (contains `clinicSlug`).
 */
export default async function BookingPage(
  { params }: { params: Promise<PageParams> }
) {
  const resolvedParams = await params;
  const { clinicSlug } = resolvedParams;

  // -------------------------------------------------------------------------
  // Step 1: Resolve geo context from middleware-injected headers
  // -------------------------------------------------------------------------
  const requestHeaders = await headers();
  const geoContext     = getGeoContextFromHeaders(requestHeaders);

  // -------------------------------------------------------------------------
  // Step 2: Fetch clinic profile
  // -------------------------------------------------------------------------
  const supabase = createSupabaseAdminClient();

  const { data: rawData, error } = await supabase
    .from('clinics')
    .select(
      'id, name, slug, email, phone, address_line1, city, country_code, ' +
      'timezone, privacy_policy_url, terms_url'
    )
    .eq('slug', clinicSlug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  const data = rawData as unknown as ClinicSelectRow | null;

  if (error || !data) {
    notFound();
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

  // -------------------------------------------------------------------------
  // Step 3: Render booking wizard
  // -------------------------------------------------------------------------
  return (
    <BookingWizard
      clinic={clinic}
      geo={geoContext}
    />
  );
}
