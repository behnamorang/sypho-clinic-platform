/**
 * @file components/sypho-med/pricing/animated-price.tsx
 * @description Smooth price transitions for dynamic pricing totals.
 */

'use client';

import { motion } from 'framer-motion';
import {
  formatPrice,
  type PricingProfile,
} from '@/lib/sypho-med/pricing-config';

export interface AnimatedPriceProps {
  amount: number;
  profile: PricingProfile;
  className?: string;
  perMonth?: boolean;
}

/**
 * Animates price changes when currency or add-ons update.
 */
export function AnimatedPrice({
  amount,
  profile,
  className = '',
  perMonth = false,
}: AnimatedPriceProps) {
  const label = formatPrice(amount, profile, { perMonth });

  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      <motion.span
        key={`${profile.currency}-${amount}-${perMonth}`}
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {label}
      </motion.span>
    </span>
  );
}
