/**
 * @file app/(auth)/layout.tsx
 * @description Layout for all authentication pages (login, register, forgot-password).
 *
 * Centered, clean layout with Sypho branding.
 * Server Component — no dynamic data, purely structural.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth layout wraps the login/register/forgot-password pages.
 * Provides the branded header and centered card container.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-brand-50/30 to-surface-100 flex flex-col">
      {/* Top bar */}
      <header className="w-full py-5 px-6">
        <div className="max-w-sm mx-auto sm:max-w-none sm:mx-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="Sypho — go to home"
          >
            {/* Logo mark */}
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-surface-900 group-hover:text-brand-700 transition-colors">
              Sypho
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-6 text-center">
        <p className="text-xs text-surface-400">
          &copy; {new Date().getFullYear()} Sypho.io — GDPR-compliant clinic scheduling for the EU.
        </p>
      </footer>
    </div>
  );
}
