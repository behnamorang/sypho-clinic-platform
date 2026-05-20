/**
 * @file components/sypho-med/marketing/marketing-cta-band.tsx
 * @description Closing CTA band for marketing pages — routes to /book-demo.
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/sypho-med/motion/scroll-reveal';

export interface MarketingCtaBandProps {
  headline?: string;
  description?: string;
}

/**
 * Full-width conversion CTA with obsidian glass styling.
 */
export function MarketingCtaBand({
  headline = 'Ready to operate at clinic-grade precision?',
  description = 'Secure a private consultation and access your bespoke Sypho workspace instantly.',
}: MarketingCtaBandProps) {
  return (
    <ScrollReveal className="mt-20 sm:mt-28">
      <motion.div
        className="relative rounded-3xl p-8 sm:p-12 text-center border border-white/[0.08] overflow-hidden"
        whileHover={{ scale: 1.005 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-neon-500/10 via-obsidian-100/60 to-obsidian-50/40"
        />
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-neon-400/40 to-transparent"
        />
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-3">
            {headline}
          </h2>
          <p className="text-sm text-silver-400 max-w-lg mx-auto mb-6 leading-relaxed">
            {description}
          </p>
          <Link
            href="/book-demo"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl text-sm font-medium bg-white text-obsidian hover:bg-silver-100 transition-colors shadow-[0_0_28px_-4px_rgba(34,211,238,0.4)]"
          >
            Book Private Consultation
          </Link>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}
