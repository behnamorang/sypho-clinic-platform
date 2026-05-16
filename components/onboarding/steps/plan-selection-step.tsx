/**
 * @file components/onboarding/steps/plan-selection-step.tsx
 * @description Step 3 of the clinic onboarding wizard — subscription plan selection.
 *
 * Presents the four subscription tiers: free, starter, professional, enterprise.
 * The user selects one before completing onboarding.
 */

'use client';

import { useState } from 'react';
import { Button }                from '@/components/ui/button';
import { Alert }                 from '@/components/ui/alert';
import {
  planSelectionStepSchema,
  type PlanSelectionStepValues,
  type SubscriptionTierOption,
} from '@/lib/validations/onboarding';

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

interface PlanDefinition {
  id:          SubscriptionTierOption;
  name:        string;
  price:       string;
  description: string;
  features:    string[];
  highlighted: boolean;
}

const PLANS: PlanDefinition[] = [
  {
    id:          'free',
    name:        'Free',
    price:       '€0 / month',
    description: 'Perfect for solo practitioners getting started.',
    features:    [
      '1 doctor profile',
      'Up to 50 appointments/month',
      'Basic patient management',
      'Email confirmations',
    ],
    highlighted: false,
  },
  {
    id:          'starter',
    name:        'Starter',
    price:       '€49 / month',
    description: 'For small clinics with a growing patient base.',
    features:    [
      'Up to 5 doctor profiles',
      'Unlimited appointments',
      'SMS + email reminders',
      'Basic analytics',
      'Priority support',
    ],
    highlighted: false,
  },
  {
    id:          'professional',
    name:        'Professional',
    price:       '€149 / month',
    description: 'For established clinics needing advanced features.',
    features:    [
      'Up to 20 doctor profiles',
      'Unlimited appointments',
      'Online patient booking',
      'Advanced analytics & reports',
      'GDPR data export tools',
      'Custom branding',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    id:          'enterprise',
    name:        'Enterprise',
    price:       'Custom pricing',
    description: 'For multi-site hospital groups and large practices.',
    features:    [
      'Unlimited doctor profiles',
      'Multi-clinic management',
      'Dedicated account manager',
      'SSO / LDAP integration',
      'SLA guarantee',
      'Custom GDPR DPA',
    ],
    highlighted: false,
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanSelectionStepProps {
  initialValues?: Partial<PlanSelectionStepValues> | undefined;
  onNext:         (values: PlanSelectionStepValues) => void;
  onBack:         () => void;
  isSubmitting?:  boolean | undefined;
  submitError?:   string | null | undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Onboarding Step 3: Subscription plan selection.
 * The "Finish setup" button triggers the final API call.
 */
export function PlanSelectionStep({
  initialValues,
  onNext,
  onBack,
  isSubmitting = false,
  submitError,
}: PlanSelectionStepProps) {
  const [selected, setSelected] = useState<SubscriptionTierOption>(
    initialValues?.subscription_tier ?? 'free',
  );
  const [validationError, setValidationError] = useState<string | undefined>();

  function handleSelect(tier: SubscriptionTierOption): void {
    setSelected(tier);
    setValidationError(undefined);
  }

  function handleFinish(): void {
    const parseResult = planSelectionStepSchema.safeParse({ subscription_tier: selected });
    if (!parseResult.success) {
      setValidationError(parseResult.error.errors[0]?.message);
      return;
    }
    onNext(parseResult.data);
  }

  return (
    <div className="space-y-5">
      {submitError && (
        <Alert variant="error">{submitError}</Alert>
      )}

      {validationError && (
        <Alert variant="error">{validationError}</Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selected === plan.id}
            onSelect={handleSelect}
            disabled={isSubmitting}
          />
        ))}
      </div>

      <p className="text-xs text-surface-500 text-center">
        You can change your plan at any time from your billing settings.
        All plans include a 14-day free trial.
      </p>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          ← Back
        </Button>
        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={handleFinish}
          isLoading={isSubmitting}
          loadingLabel="Setting up your clinic…"
        >
          Finish setup
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlanCard — internal sub-component
// ---------------------------------------------------------------------------

interface PlanCardProps {
  plan:       PlanDefinition;
  isSelected: boolean;
  onSelect:   (id: SubscriptionTierOption) => void;
  disabled:   boolean;
}

function PlanCard({ plan, isSelected, onSelect, disabled }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`Select ${plan.name} plan: ${plan.price}`}
      className={[
        'relative text-left rounded-xl border-2 p-4 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        isSelected
          ? 'border-brand-500 bg-brand-50 shadow-card-md'
          : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-card',
        plan.highlighted && !isSelected ? 'border-brand-200' : '',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most popular
        </span>
      )}

      {isSelected && (
        <span className="absolute top-3 right-3 text-brand-600" aria-hidden="true">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </span>
      )}

      <div className="mb-3">
        <p className="font-semibold text-surface-900 text-sm">{plan.name}</p>
        <p className="text-brand-600 font-bold text-base mt-0.5">{plan.price}</p>
        <p className="text-surface-500 text-xs mt-1 leading-relaxed">{plan.description}</p>
      </div>

      <ul className="space-y-1.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-xs text-surface-700">
            <svg
              className="w-3.5 h-3.5 text-success-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}
