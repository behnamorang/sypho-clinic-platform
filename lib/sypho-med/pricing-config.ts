/**
 * @file lib/sypho-med/pricing-config.ts
 * @description Sypho Professional single-tier pricing profiles (UK & Oman/GCC).
 */

/** Supported billing currencies for the pricing page. */
export type PricingCurrency = 'gbp' | 'omr';

/** AI add-on identifiers. */
export type PricingAddonId = 'ai_whatsapp' | 'ai_followup' | 'ai_suite';

export interface PricingProfile {
  currency: PricingCurrency;
  symbol: string;
  suffix: string;
  locale: string;
  subscriptionMonthly: number;
  onboardingOneTime: number;
  addons: Record<PricingAddonId, number>;
}

export const PRICING_PROFILES: Record<PricingCurrency, PricingProfile> = {
  gbp: {
    currency: 'gbp',
    symbol: '£',
    suffix: '',
    locale: 'en-GB',
    subscriptionMonthly: 249,
    onboardingOneTime: 1000,
    addons: {
      ai_whatsapp: 99,
      ai_followup: 69,
      ai_suite: 169,
    },
  },
  omr: {
    currency: 'omr',
    symbol: '',
    suffix: ' OMR',
    locale: 'en-OM',
    subscriptionMonthly: 99,
    onboardingOneTime: 499,
    addons: {
      ai_whatsapp: 39,
      ai_followup: 29,
      ai_suite: 69,
    },
  },
};

export const INCLUDED_FEATURES = [
  'Unified WhatsApp Team Inbox',
  'Online Booking Engine (Cal.com style)',
  'Medical CRM & Kanban Pipelines',
  'Intelligent Reminders & No-Show Reduction',
  'Custom Workflow Automations',
  'Executive Analytics & Lead Tracking',
  'Unlimited Team Accounts',
  'Mobile-Responsive Admin Dashboard',
] as const;

export const ONBOARDING_INCLUDES = [
  'Historical patient data migration',
  'Custom automated WhatsApp workflow design',
  'Dedicated on-site staff training',
] as const;

export interface PricingAddonDefinition {
  id: PricingAddonId;
  label: string;
  description: string;
}

export const PRICING_ADDONS: PricingAddonDefinition[] = [
  {
    id: 'ai_whatsapp',
    label: 'AI WhatsApp Assistant',
    description: 'Autonomous inbox triage and patient replies via Riley',
  },
  {
    id: 'ai_followup',
    label: 'AI Follow-Up Automation',
    description: 'Post-visit sequences, recalls, and no-show recovery',
  },
  {
    id: 'ai_suite',
    label: 'Full AI Operating Suite',
    description: 'All AI modules — bundled at preferred clinic rate',
  },
];

/**
 * Computes total monthly subscription including selected add-ons.
 */
export function calculateMonthlyTotal(
  profile: PricingProfile,
  selected: Record<PricingAddonId, boolean>,
): number {
  let total = profile.subscriptionMonthly;

  if (selected.ai_suite) {
    total += profile.addons.ai_suite;
    return total;
  }

  if (selected.ai_whatsapp) {
    total += profile.addons.ai_whatsapp;
  }
  if (selected.ai_followup) {
    total += profile.addons.ai_followup;
  }

  return total;
}

/**
 * Formats a monetary amount for display.
 */
export function formatPrice(
  amount: number,
  profile: PricingProfile,
  options?: { perMonth?: boolean },
): string {
  const formatted =
    profile.currency === 'gbp'
      ? amount.toLocaleString(profile.locale)
      : amount.toLocaleString(profile.locale);

  const base =
    profile.currency === 'gbp'
      ? `${profile.symbol}${formatted}`
      : `${formatted}${profile.suffix}`;

  return options?.perMonth ? `${base} / month` : base;
}
