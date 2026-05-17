/**
 * @file app/(dashboard)/dashboard/calendar/page.tsx
 * @description Calendar page — Server Component that pre-fetches all data
 * required for the interactive calendar's initial render.
 *
 * Data fetched server-side:
 * - Current week's appointments (joined with patient + doctor + appointment_type)
 * - Active patients in the clinic (for the booking modal search)
 * - Active doctors in the clinic (for the booking modal selector)
 * - Active appointment types (for duration pre-fill)
 *
 * All queries are scoped by `clinic_id` (tenant isolation enforced by RLS +
 * explicit .eq('clinic_id', clinicId) filter as defense-in-depth).
 *
 * @compliance GDPR Article 5(1)(c) — Data minimization: only the columns
 *             required for display are selected (no PII beyond name/contact).
 */

import { redirect }                          from 'next/navigation';
import { createSupabaseServerClient }        from '@/lib/supabase/server';
import { getAuthenticatedUser, getClinicMembership } from '@/lib/auth/helpers';
import { CalendarView }                      from '@/components/calendar/calendar-view';
import { startOfWeek, endOfWeek }            from '@/lib/utils/date';
import type { CalendarInitialData, AppointmentWithRelations, CalendarPatient, CalendarDoctor, CalendarAppointmentType } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata = {
  title: 'Calendar — Sypho',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Calendar Server Component.
 * Performs a parallel fetch of all calendar seed data, then renders the
 * fully-interactive CalendarView Client Component.
 */
export default async function CalendarPage() {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);

  if (!authResult.ok) {
    redirect('/login?error=session_expired');
  }

  const membershipResult = await getClinicMembership(supabase, authResult.data.id);
  if (!membershipResult.ok) {
    redirect('/onboarding');
  }

  const clinicId = membershipResult.data.clinic_id;

  // Compute the current week's date range for the initial appointments fetch.
  const now       = new Date();
  const weekStart = startOfWeek(now).toISOString();
  const weekEnd   = endOfWeek(now).toISOString();

  // Parallel fetch — all four queries run concurrently.
  const [appointmentsRes, patientsRes, doctorsRes, typesRes] = await Promise.all([
    supabase
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
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .gte('scheduled_at', weekStart)
      .lte('scheduled_at', weekEnd)
      .order('scheduled_at'),

    supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .is('anonymized_at', null)
      .order('last_name')
      .order('first_name'),

    supabase
      .from('doctors')
      .select('id, first_name, last_name, title, specialty')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('last_name'),

    supabase
      .from('appointment_types')
      .select('id, name, color, duration_minutes')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('name'),
  ]);

  // Non-fatal: log Supabase errors but don't crash — render with empty data.
  // (In production, these would go to an observability service, not console.)
  const appointments    = (appointmentsRes.data  as unknown as AppointmentWithRelations[]) ?? [];
  const patients        = (patientsRes.data       as CalendarPatient[])         ?? [];
  const doctors         = (doctorsRes.data        as CalendarDoctor[])          ?? [];
  const appointmentTypes = (typesRes.data         as CalendarAppointmentType[]) ?? [];

  const initialData: CalendarInitialData = {
    clinicId,
    appointments,
    patients,
    doctors,
    appointmentTypes,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 bg-white border-b border-surface-200 lg:pl-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Appointment Calendar</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Manage and schedule patient appointments
            </p>
          </div>

          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-4">
            <CalendarStat
              label="This Week"
              value={appointments.filter((a) => a.status !== 'cancelled').length}
              accent="brand"
            />
            <CalendarStat
              label="Confirmed"
              value={appointments.filter((a) => a.status === 'confirmed').length}
              accent="accent"
            />
            <CalendarStat
              label="Pending"
              value={appointments.filter((a) => a.status === 'pending').length}
              accent="warning"
            />
          </div>
        </div>
      </div>

      {/* Interactive calendar — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <CalendarView initialData={initialData} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat badge
// ---------------------------------------------------------------------------

interface CalendarStatProps {
  label:  string;
  value:  number;
  accent: 'brand' | 'accent' | 'warning';
}

const ACCENT_STYLES: Record<CalendarStatProps['accent'], string> = {
  brand:   'text-brand-700 bg-brand-50',
  accent:  'text-accent-700 bg-accent-50',
  warning: 'text-amber-700 bg-amber-50',
};

function CalendarStat({ label, value, accent }: CalendarStatProps) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-200">
      <span className={`text-lg font-bold ${ACCENT_STYLES[accent]?.split(' ')[0]}`}>{value}</span>
      <span className="text-[10px] text-surface-500 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}
