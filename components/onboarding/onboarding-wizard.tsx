/**
 * @file components/onboarding/onboarding-wizard.tsx
 * @description Multi-step clinic onboarding wizard for Sypho.io.
 *
 * Orchestrates 3 steps:
 *   Step 1 — Clinic Details (name, email, phone, timezone)
 *   Step 2 — Clinic Location (country, address, city, postal code)
 *   Step 3 — Plan Selection (subscription tier)
 *
 * Defaults for timezone, phone prefix, currency context, and document locale are
 * derived server-side from edge geo headers and passed in as `geoDefaults`.
 *
 * On completion, POSTs to /api/onboarding/complete and redirects to /dashboard.
 *
 * @compliance GDPR — country restricted to EU/EEA; audit log created server-side.
 */

'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DATA_RESIDENCY } from '@/config/supabase';
import type { OnboardingGeoDefaults } from '@/types/booking';
import { ClinicDetailsStep }  from './steps/clinic-details-step';
import { ClinicLocationStep } from './steps/clinic-location-step';
import { PlanSelectionStep }  from './steps/plan-selection-step';
import type {
  ClinicDetailsStepValues,
  ClinicLocationStepValues,
  PlanSelectionStepValues,
  OnboardingCompleteValues,
} from '@/lib/validations/onboarding';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OnboardingStep = 1 | 2 | 3;

interface PartialOnboardingData {
  step1?: ClinicDetailsStepValues;
  step2?: ClinicLocationStepValues;
  step3?: PlanSelectionStepValues;
}

interface SubmitState {
  isSubmitting: boolean;
  error:        string | null;
}

interface OnboardingWizardProps {
  geoDefaults: OnboardingGeoDefaults;
}

const EU_EEA_COUNTRY_CODES = DATA_RESIDENCY.SUPPORTED_COUNTRIES as readonly string[];

// ---------------------------------------------------------------------------
// Step metadata
// ---------------------------------------------------------------------------

const STEPS: { number: OnboardingStep; label: string; description: string }[] = [
  {
    number:      1,
    label:       'Clinic details',
    description: 'Basic information about your clinic',
  },
  {
    number:      2,
    label:       'Location',
    description: 'Clinic address and country',
  },
  {
    number:      3,
    label:       'Choose plan',
    description: 'Select your subscription tier',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Full multi-step onboarding wizard.
 * Manages step navigation, partial data accumulation, and final API submission.
 */
export function OnboardingWizard({ geoDefaults }: OnboardingWizardProps) {
  const router = useRouter();

  useLayoutEffect(() => {
    const previousLang = document.documentElement.lang;
    document.documentElement.lang = geoDefaults.locale;
    return () => {
      document.documentElement.lang = previousLang;
    };
  }, [geoDefaults.locale]);

  const defaultLocationCountry = useMemo((): string => {
    return EU_EEA_COUNTRY_CODES.includes(geoDefaults.countryCode)
      ? geoDefaults.countryCode
      : 'DE';
  }, [geoDefaults.countryCode]);

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData]               = useState<PartialOnboardingData>({});
  const [submitState, setSubmitState] = useState<SubmitState>({
    isSubmitting: false,
    error:        null,
  });

  // ---------------------------------------------------------------------------
  // Step handlers
  // ---------------------------------------------------------------------------

  function handleStep1Next(values: ClinicDetailsStepValues): void {
    setData((prev) => ({ ...prev, step1: values }));
    setCurrentStep(2);
  }

  function handleStep2Next(values: ClinicLocationStepValues): void {
    setData((prev) => ({ ...prev, step2: values }));
    setCurrentStep(3);
  }

  async function handleStep3Next(values: PlanSelectionStepValues): Promise<void> {
    setData((prev) => ({ ...prev, step3: values }));
    setSubmitState({ isSubmitting: true, error: null });

    // Merge all step data for the API call
    const payload: OnboardingCompleteValues = {
      ...data.step1!,
      ...data.step2!,
      ...values,
    };

    try {
      const response = await fetch('/api/onboarding/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const result = await response.json() as {
        data: { clinic_id: string } | null;
        error: { code: string; message: string } | null;
      };

      if (!response.ok || result.error) {
        setSubmitState({
          isSubmitting: false,
          error: result.error?.message ?? 'Setup failed. Please try again.',
        });
        return;
      }

      // Success — refresh router so middleware re-reads updated session
      router.refresh();
      router.push('/dashboard');
    } catch {
      setSubmitState({
        isSubmitting: false,
        error: 'A network error occurred. Please check your connection and try again.',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const activeStep = STEPS.find((s) => s.number === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ----------------------------------------------------------------- */}
      {/* Progress indicator */}
      {/* ----------------------------------------------------------------- */}
      <nav
        aria-label="Onboarding progress"
        className="mb-8"
      >
        <ol className="flex items-center justify-center gap-0">
          {STEPS.map((step, index) => (
            <li key={step.number} className="flex items-center">
              {/* Step dot */}
              <div
                className="flex flex-col items-center"
                aria-current={step.number === currentStep ? 'step' : undefined}
              >
                <div
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200',
                    step.number < currentStep
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : step.number === currentStep
                      ? 'bg-white border-brand-600 text-brand-600'
                      : 'bg-white border-surface-200 text-surface-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.number < currentStep ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={[
                    'mt-1.5 text-xs font-medium hidden sm:block',
                    step.number === currentStep ? 'text-brand-700' : 'text-surface-400',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={[
                    'w-16 sm:w-24 h-0.5 mx-1 mt-0 sm:-mt-5 transition-all duration-300',
                    step.number < currentStep ? 'bg-brand-600' : 'bg-surface-200',
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* Step header */}
      {/* ----------------------------------------------------------------- */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900">
          {currentStep === 1 && 'Set up your clinic'}
          {currentStep === 2 && 'Clinic location'}
          {currentStep === 3 && 'Choose your plan'}
        </h1>
        <p className="text-surface-500 text-sm mt-1">
          {activeStep?.description}
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Active step */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-card-md p-6 sm:p-8 animate-slide-up">
        {currentStep === 1 && (
          <ClinicDetailsStep
            initialValues={data.step1}
            defaultTimezone={geoDefaults.timezone}
            defaultPhonePrefix={geoDefaults.phonePrefix}
            onNext={handleStep1Next}
          />
        )}

        {currentStep === 2 && (
          <ClinicLocationStep
            initialValues={data.step2}
            defaultCountryCode={defaultLocationCountry}
            onNext={handleStep2Next}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <PlanSelectionStep
            initialValues={data.step3}
            priceDisplayLocale={geoDefaults.locale}
            visitorCurrencyCode={geoDefaults.currencyCode}
            onNext={(values) => { void handleStep3Next(values); }}
            onBack={() => setCurrentStep(2)}
            isSubmitting={submitState.isSubmitting}
            submitError={submitState.error}
          />
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Step counter (mobile) */}
      {/* ----------------------------------------------------------------- */}
      <p className="text-center text-xs text-surface-400 mt-4">
        Step {currentStep} of {STEPS.length}
      </p>
    </div>
  );
}
