/**
 * @file components/sypho-med/pricing/currency-switcher.tsx
 * @description GBP / OMR currency toggle with Framer Motion sliding indicator.
 */

'use client';

import { motion } from 'framer-motion';
import type { PricingCurrency } from '@/lib/sypho-med/pricing-config';

export interface CurrencySwitcherProps {
  value: PricingCurrency;
  onChange: (currency: PricingCurrency) => void;
}

const OPTIONS: { id: PricingCurrency; label: string; sublabel: string }[] = [
  { id: 'gbp', label: 'GBP', sublabel: '£' },
  { id: 'omr', label: 'OMR', sublabel: 'ر.ع.' },
];

/**
 * Minimal dual-currency toggle for UK vs Oman/GCC pricing profiles.
 */
export function CurrencySwitcher({ value, onChange }: CurrencySwitcherProps) {
  return (
    <div
      className="inline-flex p-1 rounded-xl bg-obsidian-200/80 border border-white/[0.08]"
      role="radiogroup"
      aria-label="Pricing currency"
    >
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={[
              'relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors min-w-[5.5rem] justify-center',
              active ? 'text-white' : 'text-silver-500 hover:text-silver-300',
            ].join(' ')}
          >
            {active && (
              <motion.span
                layoutId="pricing-currency-pill"
                className="absolute inset-0 rounded-lg bg-neon-500/15 border border-neon-400/25 shadow-[0_0_20px_-6px_rgba(34,211,238,0.4)]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
            <span className="relative z-10 text-xs opacity-70">{option.sublabel}</span>
          </button>
        );
      })}
    </div>
  );
}
