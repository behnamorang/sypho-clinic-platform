/**
 * @file components/sypho-med/marketing/marketing-placeholder-page.tsx
 * @description Premium minimal placeholder shell for marketing routes under construction.
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MarketingSiteHeader } from '@/components/sypho-med/marketing/marketing-site-header';

export interface MarketingPlaceholderPageProps {
  /** Small label above the headline (e.g. "Platform · CRM"). */
  eyebrow: string;
  /** Primary page headline. */
  headline: string;
  /** Optional supporting copy. */
  description?: string;
}

/**
 * Centered placeholder with obsidian theme, logo header, and typography hierarchy.
 */
export function MarketingPlaceholderPage({
  eyebrow,
  headline,
  description,
}: MarketingPlaceholderPageProps) {
  return (
    <div className="min-h-[100dvh] bg-obsidian flex flex-col">
      <MarketingSiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="w-full max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-neon-400/80 mb-4">
            {eyebrow}
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.1] med-text-gradient mb-5">
            {headline}
          </h1>

          {description !== undefined && (
            <p className="text-base sm:text-lg text-silver-400 leading-relaxed max-w-xl mx-auto mb-10">
              {description}
            </p>
          )}

          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-silver-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to home
            </Link>
            <span className="hidden sm:inline text-silver-600" aria-hidden="true">
              ·
            </span>
            <Link
              href="/book-demo"
              className="text-sm font-medium text-neon-400/90 hover:text-neon-300 transition-colors"
            >
              Book a private demo
            </Link>
          </div>

          <p className="mt-12 text-[10px] text-silver-600 uppercase tracking-wider">
            Coming soon · Phase 2
          </p>
        </div>
      </main>
    </div>
  );
}
