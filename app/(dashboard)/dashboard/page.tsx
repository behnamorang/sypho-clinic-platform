/**
 * @file app/(dashboard)/page.tsx
 * @description Main dashboard home page for Sypho.io — Phase 3.
 *
 * Shows a high-level overview:
 * - Welcome greeting with clinic name and user role
 * - Today's appointment quick-stats
 * - Quick-access navigation cards to major features
 *
 * @compliance GDPR — only non-sensitive clinic metadata and aggregated counts.
 *             No patient PII is displayed on this overview page.
 */

import Link      from 'next/link';
import { redirect }                          from 'next/navigation';
import { createSupabaseServerClient }        from '@/lib/supabase/server';
import { getAuthenticatedUser, getClinicMembership } from '@/lib/auth/helpers';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Dashboard home — Server Component.
 * Fetches clinic stats for today's appointments and renders the overview.
 */
export default async function DashboardPage() {
  // eslint-disable-next-line no-console
  console.log('[DashboardPage] Rendering started');

  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);

  // eslint-disable-next-line no-console
  console.log('[DashboardPage] Auth result ok:', authResult.ok);

  if (!authResult.ok) {
    redirect('/login?error=session_expired');
  }

  const user = authResult.data;
  // eslint-disable-next-line no-console
  console.log('[DashboardPage] User email:', user.email, 'onboarding_completed:', user.app_metadata['onboarding_completed']);

  const membershipResult = await getClinicMembership(supabase, user.id);
  // eslint-disable-next-line no-console
  console.log('[DashboardPage] Membership ok:', membershipResult.ok);

  const membership       = membershipResult.ok ? membershipResult.data : null;

  // Fetch clinic details.
  let clinicName:        string | null = null;
  let totalPatients:     number        = 0;
  let totalDoctors:      number        = 0;
  let todayAppts:        number        = 0;
  let pendingAppts:      number        = 0;
  let pendingOnline:     number        = 0;

  if (membership) {
    const clinicId = membership.clinic_id;
    // eslint-disable-next-line no-console
    console.log('[DashboardPage] clinic_id:', clinicId);

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [clinicResRaw, patientsRes, doctorsRes, todayRes, pendingRes, onlineRes] = await Promise.all([
      supabase
        .from('clinics')
        .select('name')
        .eq('id', clinicId)
        .maybeSingle(),

      supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .is('deleted_at', null),

      supabase
        .from('doctors')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('is_active', true),

      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .is('deleted_at', null)
        .gte('scheduled_at', todayStart.toISOString())
        .lte('scheduled_at', todayEnd.toISOString()),

      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .is('deleted_at', null)
        .eq('status', 'pending'),

      // Pending online bookings — require clinic staff review
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .is('deleted_at', null)
        .eq('booked_via', 'online')
        .eq('status', 'pending'),
    ]);

    const clinicRes = clinicResRaw as { data: { name: string } | null; error: unknown };
    clinicName     = clinicRes.data?.name ?? null;
    totalPatients  = (patientsRes as { count: number | null }).count  ?? 0;
    totalDoctors   = (doctorsRes  as { count: number | null }).count  ?? 0;
    todayAppts     = (todayRes    as { count: number | null }).count  ?? 0;
    pendingAppts   = (pendingRes  as { count: number | null }).count  ?? 0;
    pendingOnline  = (onlineRes   as { count: number | null }).count  ?? 0;
    // eslint-disable-next-line no-console
    console.log('[DashboardPage] Stats loaded — clinic:', clinicName, 'patients:', totalPatients);
  }

  const displayName = (user.user_metadata['first_name'] as string | undefined)
    ?? user.email?.split('@')[0]
    ?? 'there';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  });

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Welcome header */}
      <div className="mb-8">
        <p className="text-sm text-surface-500 mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-surface-900">
          Good {getGreeting()}, {displayName}
        </h1>
        {clinicName && (
          <p className="text-surface-500 mt-1">{clinicName}</p>
        )}
        {membership && (
          <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
            {membership.role.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's Appointments" value={todayAppts}     icon={<CalendarIcon />}  color="brand" />
        <StatCard label="Pending Review"       value={pendingAppts}   icon={<ClockIcon />}     color="warning" />
        <StatCard label="Active Patients"      value={totalPatients}  icon={<UsersIcon />}     color="accent" />
        <StatCard label="Active Doctors"       value={totalDoctors}   icon={<DoctorIcon />}    color="success" />
      </div>

      {/* Online booking alert banner */}
      {pendingOnline > 0 && (
        <Link
          href="/dashboard/bookings?status=pending"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 hover:bg-amber-100 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendingOnline} online booking{pendingOnline !== 1 ? 's' : ''} awaiting confirmation
            </p>
            <p className="text-xs text-amber-600">Click to review and confirm patient bookings</p>
          </div>
          <svg className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Quick access grid */}
      <h2 className="text-sm font-semibold text-surface-700 mb-4 uppercase tracking-wide">
        Quick Access
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURE_LINKS.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={[
              'group bg-white rounded-xl border border-surface-200 p-5',
              'hover:border-brand-300 hover:shadow-card-md transition-all',
              feature.disabled ? 'opacity-60 pointer-events-none' : '',
            ].join(' ')}
            aria-disabled={feature.disabled}
            tabIndex={feature.disabled ? -1 : undefined}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${feature.iconBg}`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-surface-900 text-sm mb-1 group-hover:text-brand-700 transition-colors">
              {feature.title}
            </h3>
            <p className="text-surface-500 text-xs leading-relaxed">{feature.description}</p>
            {feature.disabled && (
              <span className="inline-block mt-3 text-xs font-medium text-surface-400 bg-surface-100 px-2 py-0.5 rounded">
                Coming soon
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  icon:  React.ReactNode;
  color: 'brand' | 'warning' | 'accent' | 'success';
}

const STAT_COLORS: Record<StatCardProps['color'], { bg: string; text: string }> = {
  brand:   { bg: 'bg-brand-50',   text: 'text-brand-700'   },
  warning: { bg: 'bg-amber-50',   text: 'text-amber-700'   },
  accent:  { bg: 'bg-accent-50',  text: 'text-accent-700'  },
  success: { bg: 'bg-success-50', text: 'text-success-700' },
};

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colors = STAT_COLORS[color];
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-card">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors.bg}`}>
        <span className={colors.text}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
      <p className="text-xs text-surface-500 mt-0.5">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature link data
// ---------------------------------------------------------------------------

const FEATURE_LINKS = [
  {
    href:        '/dashboard/calendar',
    title:       'Appointment Calendar',
    description: 'Schedule, manage, and track appointments with the interactive drag-and-drop calendar.',
    iconBg:      'bg-brand-50',
    disabled:    false,
    icon: (
      <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href:        '/dashboard/bookings',
    title:       'Online Bookings',
    description: 'Review and manage patient appointments booked via your public booking portal.',
    iconBg:      'bg-accent-50',
    disabled:    false,
    icon: (
      <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    href:        '/dashboard/patients',
    title:       'Patient Management',
    description: 'GDPR-compliant patient records with full rights management and audit trails.',
    iconBg:      'bg-accent-50',
    disabled:    true,
    icon: (
      <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href:        '/dashboard/doctors',
    title:       'Doctor Profiles',
    description: 'Manage doctor availability, specialties, and appointment type configurations.',
    iconBg:      'bg-violet-50',
    disabled:    true,
    icon: (
      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href:        '/dashboard/analytics',
    title:       'Analytics & Reports',
    description: 'Clinic performance metrics, appointment statistics, and compliance reports.',
    iconBg:      'bg-amber-50',
    disabled:    true,
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href:        '/dashboard/gdpr',
    title:       'GDPR Tools',
    description: 'Patient data export, consent management, and rights-exercise request workflows.',
    iconBg:      'bg-success-50',
    disabled:    true,
    icon: (
      <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    href:        '/dashboard/settings',
    title:       'Clinic Settings',
    description: 'Manage clinic profile, booking link, GDPR/DPO details, and team members.',
    iconBg:      'bg-surface-100',
    disabled:    false,
    icon: (
      <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
] as const;

// ---------------------------------------------------------------------------
// Icon components
// ---------------------------------------------------------------------------

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function DoctorIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
