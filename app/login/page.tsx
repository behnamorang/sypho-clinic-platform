/**
 * @file app/login/page.tsx
 * @description Sypho Med obsidian login — email/password authentication.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/sypho-med/auth/auth-shell';
import { MedLoginForm } from '@/components/sypho-med/auth/med-login-form';
import { MedAuthAlert } from '@/components/sypho-med/auth/med-auth-alert';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Sypho Med clinic workspace.',
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
}

/**
 * Login route — `/login`
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect;
  const errorCode = params.error;

  return (
    <AuthShell>
      <div className="rounded-3xl p-8 sm:p-10 border border-white/[0.08] med-glass-strong">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neon-400/80 mb-3">
            Clinic workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight med-text-gradient">
            Welcome back
          </h1>
          <p className="text-sm text-silver-500 mt-2">
            Sign in to your enterprise control room.
          </p>
        </div>

        {errorCode === 'session_expired' && (
          <div className="mb-6">
            <MedAuthAlert variant="warning">
              Your session has expired. Please sign in again.
            </MedAuthAlert>
          </div>
        )}

        {redirectTo !== undefined ? (
          <MedLoginForm redirectTo={redirectTo} />
        ) : (
          <MedLoginForm />
        )}

        <p className="mt-8 pt-6 border-t border-white/[0.06] text-center text-sm text-silver-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-neon-400/90 hover:text-neon-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
