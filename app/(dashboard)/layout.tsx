/**
 * @file app/(dashboard)/layout.tsx
 * @description Full dashboard route group layout for Sypho.io — Phase 3.
 *
 * Provides the authenticated shell with:
 * - Persistent sidebar navigation (desktop) / slide-in drawer (mobile)
 * - Clinic name and user role display in the sidebar
 * - Defense-in-depth server-side auth check (middleware handles primary enforcement)
 *
 * @compliance GDPR — Only non-sensitive clinic metadata (name) and user email
 *             are passed to the sidebar client component for display.
 */

import { redirect }                  from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, getClinicMembership } from '@/lib/auth/helpers';
import { Sidebar }                   from '@/components/layout/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout — Server Component.
 *
 * Fetches the minimum data required for the sidebar (clinic name, user email,
 * and role) server-side. No sensitive PHI is fetched or forwarded.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);

  if (!authResult.ok) {
    redirect('/login?error=session_expired');
  }

  const user = authResult.data;

  const membershipResult = await getClinicMembership(supabase, user.id);

  // If no membership, redirect to onboarding rather than crashing.
  if (!membershipResult.ok) {
    redirect('/onboarding');
  }

  const membership = membershipResult.data;

  // Fetch clinic name for sidebar display.
  // Type assertion required — same pattern as existing dashboard page.
  const { data: clinicRaw } = await supabase
    .from('clinics')
    .select('name')
    .eq('id', membership.clinic_id)
    .maybeSingle();

  const clinic     = clinicRaw as { name: string } | null;
  const clinicName = clinic?.name ?? 'My Clinic';
  const userEmail  = user.email ?? '';
  const userRole   = membership.role;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar — desktop permanent, mobile slide-in drawer */}
      <Sidebar
        clinicName={clinicName}
        userEmail={userEmail}
        userRole={userRole}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Skip-to-content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>

        <main
          id="main-content"
          className="flex-1 overflow-auto"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
