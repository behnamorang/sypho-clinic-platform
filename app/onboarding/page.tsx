/**
 * @file app/onboarding/page.tsx
 * @description Clinic onboarding page — rendered after first login.
 *
 * This Server Component:
 * 1. Verifies the user is authenticated (defense-in-depth; middleware handles primary check).
 * 2. Verifies onboarding has NOT been completed yet (prevents revisiting).
 * 3. Renders the multi-step OnboardingWizard client component with IP-derived defaults.
 *
 * The middleware sends users here when they are authenticated but
 * `app_metadata.onboarding_completed` is not `true`. Users who are marked
 * complete in Auth but still lack a clinic membership stay here so the wizard
 * can finish — redirect to `/dashboard` only runs when membership exists.
 *
 * @compliance GDPR — no personal data is processed on this page; only auth check.
 */

import type { Metadata }              from 'next';
import { headers }                    from 'next/headers';
import { redirect }                   from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOnboardingGeoDefaultsFromHeaders } from '@/lib/booking/geo';
import {
  getAuthenticatedUser,
  getClinicMembership,
  hasCompletedOnboarding,
} from '@/lib/auth/helpers';
import { OnboardingWizard }           from '@/components/onboarding/onboarding-wizard';

export const metadata: Metadata = {
  title: 'Set up your clinic — Sypho',
  description: 'Complete your clinic profile to start using Sypho.',
};

/**
 * Onboarding page — Server Component that gates the wizard.
 */
export default async function OnboardingPage() {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);

  // Redirect unauthenticated users to login
  if (!authResult.ok) {
    redirect('/login');
  }

  const user = authResult.data;

  // Only send to dashboard when auth metadata and DB agree (active membership).
  // Otherwise the dashboard layout redirects back to /onboarding → infinite loop.
  if (hasCompletedOnboarding(user)) {
    const membershipResult = await getClinicMembership(supabase, user.id);
    if (membershipResult.ok) {
      redirect('/dashboard');
    }
  }

  const firstName = user.user_metadata?.['first_name'] as string | undefined;
  const greeting  = firstName ? `Let's set up ${firstName}'s clinic` : "Let's set up your clinic";

  const geoDefaults = getOnboardingGeoDefaultsFromHeaders(await headers());

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Greeting */}
      <div className="text-center mb-8">
        <p className="text-brand-600 font-semibold text-sm mb-2">
          Welcome to Sypho 🎉
        </p>
        <h1 className="text-3xl font-bold text-surface-900 mb-3">
          {greeting}
        </h1>
        <p className="text-surface-500 leading-relaxed max-w-lg mx-auto">
          Complete the following steps to configure your clinic profile.
          This takes about 2 minutes and only needs to be done once.
        </p>
      </div>

      {/* Onboarding wizard */}
      <OnboardingWizard geoDefaults={geoDefaults} />
    </div>
  );
}
