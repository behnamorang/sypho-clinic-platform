/**
 * @file components/sypho-med/pricing/pricing-module.tsx
 * @description World-class single-tier pricing — Sypho Professional with dynamic AI add-ons.
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { MarketingSiteHeader } from '@/components/sypho-med/marketing/marketing-site-header';
import { CurrencySwitcher } from '@/components/sypho-med/pricing/currency-switcher';
import { AnimatedPrice } from '@/components/sypho-med/pricing/animated-price';
import {
  calculateMonthlyTotal,
  formatPrice,
  INCLUDED_FEATURES,
  ONBOARDING_INCLUDES,
  PRICING_ADDONS,
  PRICING_PROFILES,
  type PricingAddonId,
  type PricingCurrency,
} from '@/lib/sypho-med/pricing-config';

const INITIAL_ADDONS: Record<PricingAddonId, boolean> = {
  ai_whatsapp: false,
  ai_followup: false,
  ai_suite: false,
};

/**
 * Full pricing page experience — currency profiles, plan card, AI upgrades.
 */
export function PricingModule() {
  const [currency, setCurrency] = useState<PricingCurrency>('gbp');
  const [addons, setAddons] = useState(INITIAL_ADDONS);

  const profile = PRICING_PROFILES[currency];
  const monthlyTotal = useMemo(
    () => calculateMonthlyTotal(profile, addons),
    [profile, addons],
  );

  const handleCurrencyChange = useCallback((next: PricingCurrency) => {
    setCurrency(next);
    setAddons(INITIAL_ADDONS);
  }, []);

  const toggleAddon = useCallback((id: PricingAddonId) => {
    setAddons((prev) => {
      if (id === 'ai_suite') {
        const next = !prev.ai_suite;
        return {
          ai_whatsapp: false,
          ai_followup: false,
          ai_suite: next,
        };
      }

      const next = { ...prev, [id]: !prev[id], ai_suite: false };
      return next;
    });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-obsidian flex flex-col">
      <MarketingSiteHeader />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Page intro */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neon-400/80 mb-4">
              Pricing
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-4">
              One plan. Clinic-grade by design.
            </h1>
            <p className="text-base text-silver-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Sypho Professional — a single high-ticket tier for operators who refuse
              fragmented tools. Toggle your market currency below.
            </p>
            <CurrencySwitcher value={currency} onChange={handleCurrencyChange} />
          </motion.div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-8 items-start">
            {/* Core plan card */}
            <motion.div
              layout
              className="relative rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/[0.08] bg-gradient-to-b from-obsidian-100/80 to-obsidian-50/40 shadow-[0_0_60px_-20px_rgba(34,211,238,0.12)]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-neon-400/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-neon-400/40 to-transparent"
              />

              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-silver-500 mb-2">
                    Single tier
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
                    Sypho Professional
                  </h2>
                  <p className="text-sm text-silver-500 mt-1">
                    {currency === 'gbp' ? 'United Kingdom · GMT' : 'Oman / GCC · GST'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-neon-500/10 text-neon-400 border border-neon-400/20">
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  Most selected
                </span>
              </div>

              {/* Monthly subscription */}
              <div className="mb-8 pb-8 border-b border-white/[0.06]">
                <p className="text-xs text-silver-500 uppercase tracking-wider mb-2">
                  Monthly subscription
                </p>
                <p className="text-4xl sm:text-5xl font-semibold text-white tracking-tight">
                  <AnimatedPrice amount={monthlyTotal} profile={profile} perMonth />
                </p>
                {monthlyTotal > profile.subscriptionMonthly && (
                  <p className="text-xs text-silver-500 mt-2">
                    Base {formatPrice(profile.subscriptionMonthly, profile, { perMonth: true })}
                    {' '}
                    <span className="text-neon-400/80">
                      + AI upgrades{' '}
                      {formatPrice(monthlyTotal - profile.subscriptionMonthly, profile)}
                    </span>
                  </p>
                )}
              </div>

              {/* Onboarding */}
              <div className="mb-8 pb-8 border-b border-white/[0.06]">
                <p className="text-xs text-silver-500 uppercase tracking-wider mb-1">
                  Premium Concierge Onboarding
                </p>
                <p className="text-xs text-silver-600 mb-3">One-time</p>
                <p className="text-2xl sm:text-3xl font-medium text-silver-200 tracking-tight">
                  <AnimatedPrice
                    amount={profile.onboardingOneTime}
                    profile={profile}
                  />
                </p>
                <ul className="mt-4 space-y-2">
                  {ONBOARDING_INCLUDES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-silver-500 leading-relaxed"
                    >
                      <span className="text-silver-600 mt-0.5">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features */}
              <div>
                <p className="text-xs text-silver-500 uppercase tracking-wider mb-4">
                  Operational infrastructure included
                </p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {INCLUDED_FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-silver-300"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-neon-500/10 shrink-0 mt-0.5">
                        <Check
                          className="w-3 h-3 text-neon-400"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mt-10 pt-8 border-t border-white/[0.06]">
                <Link
                  href="/book-demo"
                  className={[
                    'flex-1 inline-flex items-center justify-center gap-2',
                    'h-12 sm:h-14 px-6 sm:px-7 text-sm sm:text-base rounded-xl font-medium',
                    'bg-white text-obsidian hover:bg-silver-100',
                    'shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian',
                  ].join(' ')}
                >
                  Book Private Consultation
                </Link>
                <a
                  href="mailto:hello@sypho.io?subject=Sypho%20Med%20—%20Talk%20to%20Sales"
                  className={[
                    'flex-1 inline-flex items-center justify-center gap-2',
                    'h-12 sm:h-14 px-6 sm:px-7 text-sm sm:text-base rounded-xl font-medium',
                    'bg-transparent text-silver-200 border border-white/10',
                    'hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian',
                  ].join(' ')}
                  rel="noopener noreferrer"
                >
                  Talk to Sales
                </a>
              </div>
            </motion.div>

            {/* AI upgrades */}
            <motion.div
              layout
              className="rounded-3xl p-6 sm:p-7 border border-white/[0.06] med-glass-strong"
            >
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-2">
                  AI upgrades
                </p>
                <h3 className="text-lg font-medium text-white tracking-tight">
                  High-margin autonomous modules
                </h3>
                <p className="text-xs text-silver-500 mt-2 leading-relaxed">
                  Add to your monthly subscription. Totals update instantly — Full AI
                  Suite replaces individual module pricing.
                </p>
              </div>

              <ul className="space-y-3">
                {PRICING_ADDONS.map((addon) => {
                  const checked = addons[addon.id];
                  const price = profile.addons[addon.id];
                  const disabled =
                    addon.id !== 'ai_suite' && addons.ai_suite;

                  return (
                    <li key={addon.id}>
                      <button
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        disabled={disabled}
                        aria-pressed={checked}
                        className={[
                          'w-full text-left rounded-2xl p-4 border transition-all duration-200',
                          checked
                            ? 'border-neon-400/35 bg-neon-500/10 shadow-[0_0_24px_-10px_rgba(34,211,238,0.35)]'
                            : 'border-white/[0.06] bg-obsidian-200/30 hover:border-white/15 hover:bg-obsidian-200/50',
                          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                        ].join(' ')}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={[
                              'flex items-center justify-center w-5 h-5 rounded-md border shrink-0 mt-0.5 transition-colors',
                              checked
                                ? 'bg-neon-500/25 border-neon-400/50'
                                : 'border-white/20 bg-transparent',
                            ].join(' ')}
                            aria-hidden="true"
                          >
                            {checked && (
                              <Check className="w-3 h-3 text-neon-300" strokeWidth={3} />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-white">
                                {addon.label}
                              </p>
                              <span className="text-xs text-neon-400/90 tabular-nums shrink-0">
                                +
                                {formatPrice(price, profile, { perMonth: true })}
                              </span>
                            </div>
                            <p className="text-xs text-silver-500 mt-1 leading-relaxed">
                              {addon.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 p-4 rounded-2xl bg-obsidian-300/40 border border-white/[0.05]">
                <p className="text-[10px] uppercase tracking-wider text-silver-500 mb-1">
                  Estimated monthly
                </p>
                <p className="text-2xl font-semibold text-white">
                  <AnimatedPrice amount={monthlyTotal} profile={profile} perMonth />
                </p>
              </div>
            </motion.div>
          </div>

          <p className="text-center text-[10px] text-silver-600 mt-12 max-w-lg mx-auto leading-relaxed">
            All prices exclude applicable VAT where required. Premium Concierge Onboarding
            is invoiced once at contract signature. EU-hosted infrastructure with GDPR-ready
            controls.
          </p>
        </div>
      </main>
    </div>
  );
}
