/**
 * @file app/[clinicSlug]/booking/not-found.tsx
 * @description 404 page for invalid or inactive clinic slugs.
 */

import Link from 'next/link';

export default function BookingNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 mb-6">
          <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Clinic Not Found</h1>
        <p className="text-surface-500 text-sm leading-relaxed">
          The booking page you&apos;re looking for doesn&apos;t exist or is no longer active.
          Please check the link and try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to homepage
        </Link>
      </div>
    </div>
  );
}
