/**
 * @file components/booking/booking-progress.tsx
 * @description Multi-step progress indicator for the booking wizard.
 * Shows steps 1–4 with active, completed, and pending visual states.
 */

'use client';

import type { BookingStep } from '@/types/booking';

interface BookingProgressProps {
  currentStep: BookingStep;
  onStepClick: (step: BookingStep) => void;
}

const STEPS: { key: BookingStep; label: string; number: number }[] = [
  { key: 'service',      label: 'Service',    number: 1 },
  { key: 'doctor',       label: 'Doctor',     number: 2 },
  { key: 'schedule',     label: 'Schedule',   number: 3 },
  { key: 'patient_info', label: 'Your Info',  number: 4 },
];

const STEP_ORDER: Record<BookingStep, number> = {
  service:      1,
  doctor:       2,
  schedule:     3,
  patient_info: 4,
  confirming:   4,
  confirmed:    5,
};

/**
 * Renders a premium horizontal step-progress bar.
 * Completed steps are clickable to allow going back and editing selections.
 */
export function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  const currentOrder = STEP_ORDER[currentStep];

  return (
    <div className="w-full" role="navigation" aria-label="Booking steps">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const stepOrder   = step.number;
          const isCompleted = stepOrder < currentOrder;
          const isActive    = stepOrder === currentOrder;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step circle */}
              <button
                onClick={() => isCompleted ? onStepClick(step.key) : undefined}
                disabled={!isCompleted}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step.number}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                className={[
                  'relative flex flex-col items-center gap-1.5 group',
                  isCompleted ? 'cursor-pointer' : 'cursor-default',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold',
                    'transition-all duration-200 ring-2 ring-offset-2',
                    isCompleted
                      ? 'bg-brand-600 text-white ring-brand-600 group-hover:bg-brand-700 group-hover:ring-brand-700'
                      : isActive
                        ? 'bg-brand-600 text-white ring-brand-500 shadow-md shadow-brand-200'
                        : 'bg-white text-surface-400 ring-surface-200',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </span>

                <span
                  className={[
                    'text-xs font-medium whitespace-nowrap',
                    isCompleted ? 'text-brand-600'
                      : isActive ? 'text-surface-800'
                        : 'text-surface-400',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line (not after last step) */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={[
                    'h-0.5 flex-1 mx-2 mt-[-18px] rounded-full transition-all duration-300',
                    stepOrder < currentOrder ? 'bg-brand-500' : 'bg-surface-200',
                  ].join(' ')}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Animated progress bar */}
      <div className="mt-4 h-1 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
          style={{
            width: currentOrder <= 1
              ? '0%'
              : `${Math.min(100, ((currentOrder - 1) / (STEPS.length - 1)) * 100)}%`,
          }}
          role="progressbar"
          aria-valuenow={currentOrder - 1}
          aria-valuemin={0}
          aria-valuemax={STEPS.length - 1}
        />
      </div>
    </div>
  );
}

