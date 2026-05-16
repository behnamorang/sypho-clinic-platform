/**
 * @file app/[clinicSlug]/booking/error.tsx
 * @description Error boundary for the clinic booking page.
 * Catches unexpected rendering errors and provides a graceful recovery UI.
 */

'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function BookingError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error monitoring (Sentry / similar) — do NOT log PII
    // eslint-disable-next-line no-console
    console.error('[BookingPage] Unexpected error:', error.digest ?? 'no-digest');
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-danger-50 mb-6">
          <svg className="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-surface-900 mb-2">Something went wrong</h1>
        <p className="text-surface-500 text-sm leading-relaxed">
          An unexpected error occurred while loading the booking page.
          Please try again — your data has not been submitted.
        </p>
        <button
          onClick={reset}
          className={[
            'mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-white',
            'bg-gradient-to-r from-brand-600 to-accent-600',
            'hover:from-brand-700 hover:to-accent-700 transition-all',
            'shadow-sm shadow-brand-200',
          ].join(' ')}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
