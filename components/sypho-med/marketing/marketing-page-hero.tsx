/**
 * @file components/sypho-med/marketing/marketing-page-hero.tsx
 * @description Reusable hero block for marketing feature and solution pages.
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface MarketingPageHeroProps {
  eyebrow: string;
  headline: string;
  description: string;
  primaryCta?: string;
  secondaryCta?: string;
  secondaryHref?: string;
}

/**
 * Premium page hero with book-demo primary CTA.
 */
export function MarketingPageHero({
  eyebrow,
  headline,
  description,
  primaryCta = 'Book Private Consultation',
  secondaryCta,
  secondaryHref = '/pricing',
}: MarketingPageHeroProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="text-center max-w-3xl mx-auto mb-14 sm:mb-20"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-neon-400/80 mb-4">
        {eyebrow}
      </p>
      <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.03em] leading-[1.08] med-text-gradient mb-5">
        {headline}
      </h1>
      <p className="text-base sm:text-lg text-silver-400 leading-relaxed max-w-2xl mx-auto mb-8">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/book-demo"
          className={[
            'inline-flex items-center justify-center gap-2',
            'h-12 px-7 rounded-xl text-sm font-medium',
            'bg-white text-obsidian hover:bg-silver-100 transition-colors',
            'shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]',
          ].join(' ')}
        >
          {primaryCta}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        {secondaryCta !== undefined && (
          <Link
            href={secondaryHref}
            className={[
              'inline-flex items-center justify-center h-12 px-7 rounded-xl text-sm font-medium',
              'text-silver-300 border border-white/10 hover:bg-white/[0.04] transition-colors',
            ].join(' ')}
          >
            {secondaryCta}
          </Link>
        )}
      </div>
    </motion.header>
  );
}
