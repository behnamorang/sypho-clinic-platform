/**
 * @file app/(dashboard)/settings/page.tsx
 * @description Clinic Settings page — Phase 4.
 *
 * Provides clinic staff with:
 * - Clinic profile information display
 * - Booking link section (copy + QR placeholder)
 * - Business hours summary
 * - GDPR contact information (DPO)
 *
 * @compliance GDPR Article 37 — DPO contact information is surfaced here.
 *             No patient data is displayed on this page.
 */

import type { Metadata }               from 'next';
import { redirect }                    from 'next/navigation';
import { createSupabaseServerClient }  from '@/lib/supabase/server';
import { getAuthenticatedUser, getClinicMembership } from '@/lib/auth/helpers';
import { BookingLinkBanner }           from '@/components/bookings/booking-link-banner';

export const metadata: Metadata = { title: 'Clinic Settings' };

type ClinicSettingsRow = {
  name:               string;
  slug:               string;
  email:              string;
  phone:              string | null;
  address_line1:      string;
  city:               string;
  country_code:       string;
  timezone:           string;
  dpo_name:           string | null;
  dpo_email:          string | null;
  privacy_policy_url: string | null;
  subscription_tier:  string;
  is_verified:        boolean;
};

export default async function SettingsPage() {
  const supabase   = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);
  if (!authResult.ok) redirect('/login?error=session_expired');

  const membershipResult = await getClinicMembership(supabase, authResult.data.id);
  if (!membershipResult.ok) redirect('/onboarding');

  const membership = membershipResult.data;

  const { data: rawClinic } = await supabase
    .from('clinics')
    .select(
      'name, slug, email, phone, address_line1, city, country_code, timezone, ' +
      'dpo_name, dpo_email, privacy_policy_url, subscription_tier, is_verified'
    )
    .eq('id', membership.clinic_id)
    .maybeSingle();

  const clinic = rawClinic as unknown as ClinicSettingsRow | null;

  const baseUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const bookingUrl = clinic ? `${baseUrl}/${clinic.slug}/booking` : null;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto w-full">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Clinic Settings</h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage your clinic profile and booking configuration.
        </p>
      </div>

      {/* Booking link section */}
      {bookingUrl && clinic && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider mb-3">
            Online Booking Portal
          </h2>
          <BookingLinkBanner
            clinicName={clinic.name}
            bookingUrl={bookingUrl}
          />
          <p className="text-xs text-surface-400 mt-2">
            Share this link with patients via email, WhatsApp, or your website.
            Bookings made through this portal appear in{' '}
            <a href="/dashboard/bookings" className="text-brand-600 hover:text-brand-700 underline">
              Online Bookings
            </a>.
          </p>
        </section>
      )}

      {/* Clinic profile card */}
      {clinic ? (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider mb-3">
            Clinic Profile
          </h2>
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingField label="Clinic Name"       value={clinic.name} />
              <SettingField label="Booking Slug"      value={clinic.slug} mono />
              <SettingField label="Email"             value={clinic.email} />
              <SettingField label="Phone"             value={clinic.phone ?? '—'} />
              <SettingField label="Address"           value={`${clinic.address_line1}, ${clinic.city}`} />
              <SettingField label="Timezone"          value={clinic.timezone} />
              <SettingField label="Subscription Plan" value={clinic.subscription_tier} capitalize />
              <SettingField
                label="Verification Status"
                value={clinic.is_verified ? 'Verified ✓' : 'Not verified'}
                accent={clinic.is_verified ? 'success' : 'warning'}
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-surface-200 bg-surface-50 p-6 text-center text-sm text-surface-500">
          Unable to load clinic settings. Please refresh the page.
        </div>
      )}

      {/* GDPR / DPO section */}
      {clinic && (
        <section>
          <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider mb-3">
            GDPR & Data Protection
          </h2>
          <div className="bg-white rounded-xl border border-surface-200 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField label="DPO Name"         value={clinic.dpo_name ?? 'Not designated'} />
            <SettingField label="DPO Email"        value={clinic.dpo_email ?? '—'} />
            <SettingField label="Privacy Policy"   value={clinic.privacy_policy_url ?? 'Not set'} mono={!!clinic.privacy_policy_url} />
          </div>
          <p className="text-xs text-surface-400 mt-2">
            Under EU GDPR, clinics processing health data are required to designate
            a Data Protection Officer (DPO) or designate a point of contact for data subjects.
          </p>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SettingField primitive
// ---------------------------------------------------------------------------

interface SettingFieldProps {
  label:      string;
  value:      string;
  mono?:      boolean;
  capitalize?: boolean;
  accent?:    'success' | 'warning';
}

function SettingField({ label, value, mono, capitalize, accent }: SettingFieldProps) {
  const valueClass = [
    'text-sm mt-0.5',
    mono       ? 'font-mono text-surface-700' : 'text-surface-800',
    capitalize ? 'capitalize' : '',
    accent === 'success' ? 'text-success-700 font-medium'
      : accent === 'warning' ? 'text-amber-700 font-medium' : '',
  ].filter(Boolean).join(' ');

  return (
    <div>
      <p className="text-xs font-medium text-surface-500">{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  );
}
