/**
 * @file app/(dashboard)/bookings/page.tsx
 * @description Online Bookings management dashboard — Phase 4.
 *
 * Shows all appointments that arrived via the patient-facing booking portal
 * (booked_via = 'online'). Clinic staff can:
 *   - Filter by status (All / Pending / Confirmed / Cancelled)
 *   - Confirm pending bookings (inline Server Action)
 *   - Cancel any active booking with a reason
 *   - Copy and share the clinic's public booking URL
 *
 * @compliance GDPR — Patient PII is displayed only to authenticated clinic staff
 *             who have a valid clinic membership (enforced via RLS + server auth).
 *             No sensitive clinical notes or health data are shown in this view.
 */

import type { Metadata }                from 'next';
import { redirect }                     from 'next/navigation';
import { createSupabaseServerClient }   from '@/lib/supabase/server';
import { getAuthenticatedUser, getClinicMembership } from '@/lib/auth/helpers';
import { BookingLinkBanner }            from '@/components/bookings/booking-link-banner';
import { OnlineBookingsList }           from '@/components/bookings/online-bookings-list';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookingStatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled';

export interface OnlineBookingRow {
  id:             string;
  scheduled_at:   string;
  status:         string;
  created_at:     string;
  duration_minutes: number;
  chief_complaint: string | null;
  patient_first_name: string;
  patient_last_name:  string;
  patient_email:      string | null;
  patient_phone:      string | null;
  doctor_title:       string | null;
  doctor_first_name:  string;
  doctor_last_name:   string;
  service_name:       string | null;
  service_color:      string | null;
  service_duration:   number | null;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Online Bookings',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface BookingsPageProps {
  searchParams: Promise<{ status?: string }>;
}

/**
 * Online Bookings page — Server Component.
 * Fetches all online-submitted appointments for the authenticated clinic.
 */
export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);
  if (!authResult.ok) redirect('/login?error=session_expired');

  const membershipResult = await getClinicMembership(supabase, authResult.data.id);
  if (!membershipResult.ok) redirect('/onboarding');

  const membership = membershipResult.data;
  const clinicId   = membership.clinic_id;

  // Resolve filter from searchParams
  const resolvedParams = await searchParams;
  const rawStatus = resolvedParams.status;
  const statusFilter: BookingStatusFilter =
    rawStatus === 'pending'   ? 'pending'   :
    rawStatus === 'confirmed' ? 'confirmed' :
    rawStatus === 'cancelled' ? 'cancelled' :
    'all';

  // -------------------------------------------------------------------------
  // Fetch clinic slug for the booking link
  // -------------------------------------------------------------------------
  const { data: rawClinic } = await supabase
    .from('clinics')
    .select('name, slug')
    .eq('id', clinicId)
    .maybeSingle();

  const clinic = rawClinic as { name: string; slug: string } | null;

  // -------------------------------------------------------------------------
  // Fetch online bookings with related data
  // Using a JOIN-style select via Supabase relational queries.
  // Result cast via unknown due to custom Database type inference limitation.
  // -------------------------------------------------------------------------
  let query = supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      created_at,
      duration_minutes,
      chief_complaint,
      patients!appointments_patient_id_fkey(first_name, last_name, email, phone),
      doctors!appointments_doctor_id_fkey(title, first_name, last_name),
      appointment_types!appointments_appointment_type_id_fkey(name, color, duration_minutes)
    `)
    .eq('clinic_id', clinicId)
    .eq('booked_via', 'online')
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false })
    .limit(100);

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: rawBookings } = await query;

  // Normalize the nested relational data
  type RawBookingRow = {
    id:               string;
    scheduled_at:     string;
    status:           string;
    created_at:       string;
    duration_minutes: number;
    chief_complaint:  string | null;
    patients:         { first_name: string; last_name: string; email: string | null; phone: string | null } | null;
    doctors:          { title: string | null; first_name: string; last_name: string } | null;
    appointment_types: { name: string; color: string; duration_minutes: number } | null;
  };

  const rawRows = rawBookings as unknown as RawBookingRow[] | null;

  const bookings: OnlineBookingRow[] = (rawRows ?? []).map((row) => ({
    id:               row.id,
    scheduled_at:     row.scheduled_at,
    status:           row.status,
    created_at:       row.created_at,
    duration_minutes: row.duration_minutes,
    chief_complaint:  row.chief_complaint,

    patient_first_name: row.patients?.first_name ?? '—',
    patient_last_name:  row.patients?.last_name  ?? '',
    patient_email:      row.patients?.email      ?? null,
    patient_phone:      row.patients?.phone      ?? null,

    doctor_title:      row.doctors?.title      ?? null,
    doctor_first_name: row.doctors?.first_name ?? '—',
    doctor_last_name:  row.doctors?.last_name  ?? '',

    service_name:     row.appointment_types?.name           ?? null,
    service_color:    row.appointment_types?.color          ?? null,
    service_duration: row.appointment_types?.duration_minutes ?? null,
  }));

  // -------------------------------------------------------------------------
  // Count by status for tab badges
  // -------------------------------------------------------------------------
  const { data: rawCounts } = await supabase
    .from('appointments')
    .select('status', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .eq('booked_via', 'online')
    .is('deleted_at', null);

  type CountRow = { status: string };
  const countRows = rawCounts as unknown as CountRow[] | null;

  const statusCounts = (countRows ?? []).reduce(
    (acc, row) => {
      const s = row.status;
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const bookingUrl = clinic ? `${baseUrl}/${clinic.slug}/booking` : null;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Online Bookings</h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage appointments booked through your public booking portal.
        </p>
      </div>

      {/* Booking link banner */}
      {bookingUrl && clinic && (
        <BookingLinkBanner
          clinicName={clinic.name}
          bookingUrl={bookingUrl}
        />
      )}

      {/* Bookings list with status filter tabs */}
      <OnlineBookingsList
        bookings={bookings}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        userRole={membership.role}
      />
    </div>
  );
}
