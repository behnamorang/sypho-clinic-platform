/**
 * @file app/(dashboard)/dashboard/page.tsx
 * @description Enterprise control room home — authenticated Sypho Med dashboard.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Calendar,
  Clock,
  LayoutGrid,
  Shield,
  Stethoscope,
  Users,
} from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getClinicMembership } from '@/lib/auth/helpers';
import type { LucideIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * Dashboard home — Server Component with Supabase auth and clinic aggregates.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=session_expired');
  }

  const membershipResult = await getClinicMembership(supabase, user.id);
  const membership = membershipResult.ok ? membershipResult.data : null;

  let clinicName: string | null = null;
  let totalPatients = 0;
  let totalDoctors = 0;
  let todayAppts = 0;
  let pendingAppts = 0;

  if (membership) {
    const clinicId = membership.clinic_id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [clinicResRaw, patientsRes, doctorsRes, todayRes, pendingRes] =
      await Promise.all([
        supabase.from('clinics').select('name').eq('id', clinicId).maybeSingle(),
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
      ]);

    const clinicRes = clinicResRaw as { data: { name: string } | null; error: unknown };
    clinicName = clinicRes.data?.name ?? null;
    totalPatients = patientsRes.count ?? 0;
    totalDoctors = doctorsRes.count ?? 0;
    todayAppts = todayRes.count ?? 0;
    pendingAppts = pendingRes.count ?? 0;
  }

  const displayName =
    (user.user_metadata?.['first_name'] as string | undefined) ??
    user.email?.split('@')[0] ??
    'Operator';

  const userEmail = user.email ?? '';
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full">
      <header className="mb-8 sm:mb-10">
        <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-2">
          Enterprise control room
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight med-text-gradient">
          Good {getGreeting()}, {displayName}
        </h1>
        <p className="text-sm text-silver-500 mt-2">{todayLabel}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          {clinicName !== null && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full med-glass border border-white/[0.08] text-silver-300">
              <Stethoscope className="w-3.5 h-3.5 text-neon-400" aria-hidden="true" />
              {clinicName}
            </span>
          )}
          {membership && (
            <span className="inline-flex px-3 py-1 rounded-full bg-neon-500/10 border border-neon-400/20 text-neon-300 capitalize">
              {membership.role.replace(/_/g, ' ')}
            </span>
          )}
          <span className="text-silver-600 truncate max-w-[240px]">{userEmail}</span>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <StatCard
          label="Today's appointments"
          value={todayAppts}
          icon={Calendar}
          accent="neon"
        />
        <StatCard
          label="Pending review"
          value={pendingAppts}
          icon={Clock}
          accent="amber"
        />
        <StatCard
          label="Active patients"
          value={totalPatients}
          icon={Users}
          accent="silver"
        />
        <StatCard
          label="Active doctors"
          value={totalDoctors}
          icon={Stethoscope}
          accent="neon"
        />
      </div>

      <section aria-labelledby="integrations-heading">
        <h2
          id="integrations-heading"
          className="text-xs font-medium text-silver-500 uppercase tracking-wider mb-4"
        >
          Clinic integrations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'group rounded-2xl p-5 border border-white/[0.06] med-glass',
                'hover:border-neon-400/25 hover:bg-neon-500/[0.04] transition-all duration-200',
                item.disabled ? 'opacity-50 pointer-events-none' : '',
              ].join(' ')}
              aria-disabled={item.disabled}
            >
              <span
                className={[
                  'flex items-center justify-center w-10 h-10 rounded-xl mb-4 border',
                  item.iconWrap,
                ].join(' ')}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-medium text-white group-hover:text-neon-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-silver-500 mt-1.5 leading-relaxed">
                {item.description}
              </p>
              {item.disabled && (
                <span className="inline-block mt-3 text-[10px] uppercase tracking-wider text-silver-600">
                  Coming soon
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-2xl p-5 sm:p-6 border border-neon-400/15 bg-neon-500/5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-neon-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-white">Workspace secured</p>
          <p className="text-xs text-silver-500 mt-1 leading-relaxed">
            Session validated via Supabase Auth. All clinic data routes enforce row-level
            security and EU residency policies.
          </p>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: 'neon' | 'amber' | 'silver';
}

const ACCENT: Record<StatCardProps['accent'], string> = {
  neon: 'text-neon-400 bg-neon-500/10 border-neon-400/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-400/20',
  silver: 'text-silver-400 bg-white/5 border-white/10',
};

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 border border-white/[0.06] med-glass-strong">
      <span
        className={[
          'inline-flex items-center justify-center w-9 h-9 rounded-lg border mb-3',
          ACCENT[accent],
        ].join(' ')}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>
      <p className="text-[10px] text-silver-500 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

const INTEGRATIONS = [
  {
    href: '/dashboard/calendar',
    title: 'Appointment calendar',
    description: 'Schedule and manage clinical appointments with drag-and-drop.',
    icon: Calendar,
    iconWrap: 'text-neon-400 bg-neon-500/10 border-neon-400/20',
    disabled: false,
  },
  {
    href: '/dashboard/patients',
    title: 'Patient records',
    description: 'GDPR-scoped patient management with audit trails.',
    icon: Users,
    iconWrap: 'text-silver-400 bg-white/5 border-white/10',
    disabled: true,
  },
  {
    href: '/dashboard/doctors',
    title: 'Doctor profiles',
    description: 'Rota, specialties, and availability configuration.',
    icon: Stethoscope,
    iconWrap: 'text-silver-400 bg-white/5 border-white/10',
    disabled: true,
  },
  {
    href: '/dashboard/analytics',
    title: 'Analytics',
    description: 'Performance metrics and compliance reporting.',
    icon: LayoutGrid,
    iconWrap: 'text-silver-400 bg-white/5 border-white/10',
    disabled: true,
  },
  {
    href: '/dashboard/gdpr',
    title: 'GDPR tools',
    description: 'Consent, export, and data subject request workflows.',
    icon: Shield,
    iconWrap: 'text-neon-400 bg-neon-500/10 border-neon-400/20',
    disabled: true,
  },
  {
    href: '/dashboard/settings',
    title: 'Clinic settings',
    description: 'Team, billing, and business hours.',
    icon: LayoutGrid,
    iconWrap: 'text-silver-400 bg-white/5 border-white/10',
    disabled: true,
  },
] as const;
