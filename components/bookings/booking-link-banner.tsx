/**
 * @file components/bookings/booking-link-banner.tsx
 * @description Clinic booking link sharing banner for the dashboard.
 *
 * Displays the clinic's public booking URL with a copy-to-clipboard button
 * and a direct link to preview the booking page.
 */

'use client';

import { useState, useCallback } from 'react';

interface BookingLinkBannerProps {
  clinicName: string;
  bookingUrl: string;
}

/**
 * Renders a premium banner with the clinic's shareable booking link.
 * Includes one-click copy to clipboard with visual feedback.
 */
export function BookingLinkBanner({ clinicName, bookingUrl }: BookingLinkBannerProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select the input
      const input = document.getElementById('booking-url-input') as HTMLInputElement | null;
      input?.select();
    }
  }, [bookingUrl]);

  return (
    <div className="mb-6 bg-gradient-to-r from-brand-50 to-accent-50 rounded-xl border border-brand-200/60 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Icon + text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900">
              {clinicName} — Online Booking Page
            </p>
            <p className="text-xs text-surface-500 truncate">{bookingUrl}</p>
          </div>
        </div>

        {/* URL input + buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            id="booking-url-input"
            type="text"
            readOnly
            value={bookingUrl}
            className="hidden"
            aria-label="Booking page URL"
          />

          {/* Copy button */}
          <button
            onClick={() => void copyToClipboard()}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
              'transition-all duration-200',
              copied
                ? 'bg-success-600 text-white'
                : 'bg-white text-surface-700 border border-surface-200 hover:border-brand-300 hover:text-brand-700',
            ].join(' ')}
            aria-label={copied ? 'Link copied!' : 'Copy booking link'}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy link
              </>
            )}
          </button>

          {/* Open preview button */}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            aria-label="Preview booking page in new tab"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Preview
          </a>
        </div>
      </div>
    </div>
  );
}
