/**
 * @file app/onboarding/layout.tsx
 * @description Layout for the clinic onboarding flow.
 *
 * Shows a clean, focused layout without the full dashboard chrome.
 * Authenticated users who have not yet completed onboarding are
 * directed here by the middleware.
 */

import Link from 'next/link';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

/**
 * Onboarding layout — provides branded header and centered content area.
 */
export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-brand-50/20 to-surface-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-5 px-6 border-b border-surface-100 bg-white/70 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="Sypho — go to home"
          >
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
            <span className="text-xl font-bold text-surface-900">Sypho</span>
          </Link>

          <span className="text-xs text-surface-500 hidden sm:block">
            Setting up your clinic account
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-5 px-6 text-center">
        <p className="text-xs text-surface-400">
          &copy; {new Date().getFullYear()} Sypho.io — All patient data is stored in EU data centers
          per GDPR requirements.
        </p>
      </footer>
    </div>
  );
}
