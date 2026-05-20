/**
 * @file components/sypho-med/book-demo/consultation-booking-form.tsx
 * @description Ultra-premium multi-step consultation booking lead capture.
 */

'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { MarketingSiteHeader } from '@/components/sypho-med/marketing/marketing-site-header';
import { PremiumInput, PremiumSelect } from '@/components/sypho-med/book-demo/premium-field';
import { TrustCard } from '@/components/sypho-med/book-demo/trust-card';
import {
  BOOKING_VOLUME_OPTIONS,
  CLINIC_LOCATION_LABELS,
  CLINIC_LOCATIONS,
  PAIN_POINT_OPTIONS,
  step1Schema,
  step2Schema,
  step3Schema,
  type ClinicLocation,
  type ConsultationLeadFormData,
  type PainPointId,
} from '@/lib/sypho-med/book-demo-types';
import { saveConsultationLead } from '@/lib/sypho-med/lead-storage';

const STEPS = [
  { id: 1, label: 'Profile' },
  { id: 2, label: 'Clinic' },
  { id: 3, label: 'Priorities' },
] as const;

const LOCATION_OPTIONS = CLINIC_LOCATIONS.map((loc) => ({
  value: loc,
  label: CLINIC_LOCATION_LABELS[loc],
}));

const INITIAL_FORM: ConsultationLeadFormData = {
  fullName: '',
  email: '',
  phone: '',
  clinicName: '',
  location: 'uk',
  bookingVolume: '100_300',
  painPoints: [],
};

type FormErrors = Partial<Record<string, string>>;

/**
 * Three-step consultation form with demo workspace redirect on submit.
 */
export function ConsultationBookingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ConsultationLeadFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof ConsultationLeadFormData>(
      key: K,
      value: ConsultationLeadFormData[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    [],
  );

  const togglePainPoint = useCallback((id: PainPointId) => {
    setForm((prev) => {
      const exists = prev.painPoints.includes(id);
      const painPoints = exists
        ? prev.painPoints.filter((p) => p !== id)
        : [...prev.painPoints, id];
      return { ...prev, painPoints };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.painPoints;
      return next;
    });
  }, []);

  const applyZodErrors = useCallback((fieldErrors: Record<string, string[] | undefined>) => {
    const mapped: FormErrors = {};
    for (const [key, messages] of Object.entries(fieldErrors)) {
      if (messages !== undefined && messages[0] !== undefined) {
        mapped[key] = messages[0];
      }
    }
    setErrors(mapped);
  }, []);

  const validateStep = useCallback((): boolean => {
    if (step === 1) {
      const result = step1Schema.safeParse(form);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors);
        return false;
      }
    }
    if (step === 2) {
      const result = step2Schema.safeParse(form);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors);
        return false;
      }
    }
    if (step === 3) {
      const result = step3Schema.safeParse(form);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors);
        return false;
      }
    }
    setErrors({});
    return true;
  }, [step, form, applyZodErrors]);

  const goNext = useCallback(() => {
    if (!validateStep()) return;
    setStep((s) => Math.min(3, s + 1));
  }, [validateStep]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
    setErrors({});
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    saveConsultationLead(form);

    await new Promise((resolve) => window.setTimeout(resolve, 2200));

    router.push('/demo');
  }, [form, validateStep, router]);

  return (
    <div className="min-h-[100dvh] bg-obsidian flex flex-col">
      <MarketingSiteHeader />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neon-400/80 mb-3">
              Private consultation
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] med-text-gradient">
              Secure your bespoke clinic workspace
            </h1>
          </motion.div>

          {/* Progress */}
          <nav
            className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-12 max-w-lg mx-auto"
            aria-label="Form progress"
          >
            {STEPS.map((s, index) => {
              const active = step === s.id;
              const complete = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                    <span
                      className={[
                        'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium border transition-all duration-300',
                        active
                          ? 'bg-neon-500/20 border-neon-400/40 text-neon-300 shadow-[0_0_20px_-6px_rgba(34,211,238,0.5)]'
                          : complete
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-obsidian-200/50 border-white/10 text-silver-600',
                      ].join(' ')}
                    >
                      {complete ? (
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        s.id
                      )}
                    </span>
                    <span
                      className={[
                        'text-[10px] uppercase tracking-wider truncate w-full text-center',
                        active ? 'text-neon-400/90' : 'text-silver-600',
                      ].join(' ')}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={[
                        'h-px flex-1 mx-1 sm:mx-2 mb-5 min-w-[1.5rem] transition-colors duration-300',
                        step > s.id ? 'bg-neon-400/40' : 'bg-white/10',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">
            {/* Form card */}
            <motion.div
              layout
              className="rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/[0.08] med-glass-strong relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 sm:py-28 text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-14 h-14 rounded-2xl bg-neon-500/15 flex items-center justify-center mb-6 border border-neon-400/20"
                    >
                      <Loader2
                        className="w-7 h-7 text-neon-400 animate-spin"
                        aria-hidden="true"
                      />
                    </motion.div>
                    <p className="text-lg font-medium text-white tracking-tight">
                      Generating Your Custom Workspace…
                    </p>
                    <p className="text-sm text-silver-500 mt-2 max-w-xs">
                      Mapping your clinic profile to the live Sypho environment
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key={`step-${step}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (step < 3) goNext();
                      else void handleSubmit();
                    }}
                    className="space-y-6"
                  >
                    {step === 1 && (
                      <div className="space-y-6">
                        <h2 className="text-lg font-medium text-white mb-2">
                          Corporate profile
                        </h2>
                        <PremiumInput
                          label="Full name"
                          value={form.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)}
                          error={errors.fullName}
                          autoComplete="name"
                        />
                        <PremiumInput
                          label="Professional email"
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          error={errors.email}
                          autoComplete="email"
                        />
                        <PremiumInput
                          label="Direct phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          error={errors.phone}
                          autoComplete="tel"
                        />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <h2 className="text-lg font-medium text-white mb-2">
                          Clinic architecture
                        </h2>
                        <PremiumInput
                          label="Clinic name"
                          value={form.clinicName}
                          onChange={(e) => updateField('clinicName', e.target.value)}
                          error={errors.clinicName}
                        />
                        <PremiumSelect
                          label="Location"
                          value={form.location}
                          onChange={(e) =>
                            updateField('location', e.target.value as ClinicLocation)
                          }
                          options={LOCATION_OPTIONS}
                          error={errors.location}
                        />
                        <PremiumSelect
                          label="Current monthly booking volume"
                          value={form.bookingVolume}
                          onChange={(e) =>
                            updateField(
                              'bookingVolume',
                              e.target.value as ConsultationLeadFormData['bookingVolume'],
                            )
                          }
                          options={BOOKING_VOLUME_OPTIONS}
                          error={errors.bookingVolume}
                        />
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <h2 className="text-lg font-medium text-white mb-2">
                          Operational pain points
                        </h2>
                        <p className="text-xs text-silver-500 -mt-2">
                          Select all challenges that reflect your clinic today.
                        </p>
                        <ul className="space-y-3">
                          {PAIN_POINT_OPTIONS.map((option) => {
                            const checked = form.painPoints.includes(option.id);
                            return (
                              <li key={option.id}>
                                <button
                                  type="button"
                                  onClick={() => togglePainPoint(option.id)}
                                  aria-pressed={checked}
                                  className={[
                                    'w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200',
                                    checked
                                      ? 'border-neon-400/35 bg-neon-500/10'
                                      : 'border-white/[0.06] hover:border-white/15 bg-obsidian-200/20',
                                  ].join(' ')}
                                >
                                  <span
                                    className={[
                                      'flex items-center justify-center w-5 h-5 rounded-md border shrink-0',
                                      checked
                                        ? 'bg-neon-500/25 border-neon-400/50'
                                        : 'border-white/20',
                                    ].join(' ')}
                                  >
                                    {checked && (
                                      <Check className="w-3 h-3 text-neon-300" strokeWidth={3} />
                                    )}
                                  </span>
                                  <span className="text-sm text-silver-200">
                                    {option.label}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {errors.painPoints !== undefined && (
                          <p className="text-xs text-danger-500" role="alert">
                            {errors.painPoints}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={goBack}
                          className="inline-flex items-center gap-2 text-sm text-silver-400 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                          Back
                        </button>
                      ) : (
                        <span />
                      )}

                      {step < 3 ? (
                        <button
                          type="submit"
                          className={[
                            'inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-medium',
                            'bg-white text-obsidian hover:bg-silver-100 transition-colors',
                            'shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]',
                          ].join(' ')}
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className={[
                            'inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-medium',
                            'bg-white text-obsidian hover:bg-silver-100 transition-colors',
                            'shadow-[0_0_28px_-4px_rgba(34,211,238,0.45)]',
                          ].join(' ')}
                        >
                          Secure Private Consultation
                        </button>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="hidden lg:block">
              <TrustCard />
            </div>
          </div>

          <div className="lg:hidden mt-8">
            <TrustCard />
          </div>
        </div>
      </main>
    </div>
  );
}
