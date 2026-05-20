/**
 * @file app/register/page.tsx
 * @description Sypho Med obsidian registration for clinic owners.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/sypho-med/auth/auth-shell';
import { MedRegisterForm } from '@/components/sypho-med/auth/med-register-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create your Sypho Med clinic workspace account.',
  robots: { index: false, follow: false },
};

/**
 * Register route — `/register`
 */
export default function RegisterPage() {
  return (
    <AuthShell>
      <div className="rounded-3xl p-8 sm:p-10 border border-white/[0.08] med-glass-strong">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neon-400/80 mb-3">
            Get started
          </p>
          <h1 className="text-2xl font-semibold tracking-tight med-text-gradient">
            Create your account
          </h1>
          <p className="text-sm text-silver-500 mt-2">
            Start your clinic workspace — EU-hosted and GDPR-ready.
          </p>
        </div>

        <MedRegisterForm />

        <p className="mt-8 pt-6 border-t border-white/[0.06] text-center text-sm text-silver-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-neon-400/90 hover:text-neon-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
