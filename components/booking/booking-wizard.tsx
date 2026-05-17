/**
 * @file components/booking/booking-wizard.tsx
 * @description Main multi-step booking wizard client component.
 *
 * Orchestrates the four-step booking flow:
 *   Step 1 — Service Selection (ServiceSelection)
 *   Step 2 — Doctor Selection (DoctorSelection)
 *   Step 3 — Schedule Selection (ScheduleSelection)
 *   Step 4 — Patient Information & GDPR (PatientInformation)
 *   Final  — Booking Confirmation (BookingConfirmation)
 *
 * State management:
 *   - All wizard state is managed locally via useState.
 *   - Transitions are forward (via step components' onSelect callbacks)
 *     or backward (via the Back button or progress step clicks).
 *   - The booking confirmation POST is submitted here; loading/error
 *     states are passed down to the PatientInformation component.
 *
 * The wizard is intentionally stateful (no URL params for steps) to avoid
 * partial state being bookmarked or shared.
 *
 * @compliance GDPR — Consent is captured in Step 4 and forwarded to the API.
 *             The API is the source of truth for consent storage.
 */

'use client';

import { useCallback, useReducer }        from 'react';
import { getGeoContext }                  from '@/lib/booking/geo';
import { BookingProgress }                from '@/components/booking/booking-progress';
import { ServiceSelection }               from '@/components/booking/steps/service-selection';
import { DoctorSelection }                from '@/components/booking/steps/doctor-selection';
import { ScheduleSelection }              from '@/components/booking/steps/schedule-selection';
import { PatientInformation }             from '@/components/booking/steps/patient-information';
import { BookingConfirmation }            from '@/components/booking/booking-confirmation';
import type {
  BookingWizardState,
  BookingStep,
  PublicClinicProfile,
  PublicServiceProfile,
  PublicDoctorProfile,
  PatientBookingFormData,
  BookingTimeSlot,
  BookingConfirmationResult,
  GeoContext,
}                                         from '@/types/booking';

// ---------------------------------------------------------------------------
// STATE MACHINE
// ---------------------------------------------------------------------------

type WizardAction =
  | { type: 'SELECT_SERVICE';    service:   PublicServiceProfile }
  | { type: 'SELECT_DOCTOR';     doctor:    PublicDoctorProfile  }
  | { type: 'SELECT_DATE';       date:      string               }
  | { type: 'SELECT_SLOT';       slot:      BookingTimeSlot      }
  | { type: 'CONFIRM_START'                                       }
  | { type: 'CONFIRM_SUCCESS';   result:    BookingConfirmationResult }
  | { type: 'CONFIRM_ERROR';     message:   string               }
  | { type: 'GO_BACK'                                             }
  | { type: 'GO_TO_STEP';        step:      BookingStep          };

const INITIAL_STATE: BookingWizardState = {
  step:            'service',
  selectedService: null,
  selectedDoctor:  null,
  selectedDate:    null,
  selectedSlot:    null,
  patientInfo:     null,
  confirmation:    null,
  errorMessage:    null,
};

const STEP_BACK_MAP: Partial<Record<BookingStep, BookingStep>> = {
  doctor:       'service',
  schedule:     'doctor',
  patient_info: 'schedule',
};

function wizardReducer(state: BookingWizardState, action: WizardAction): BookingWizardState {
  switch (action.type) {
    case 'SELECT_SERVICE':
      return {
        ...state,
        selectedService: action.service,
        selectedDoctor:  null,
        selectedDate:    null,
        selectedSlot:    null,
        step:            'doctor',
        errorMessage:    null,
      };

    case 'SELECT_DOCTOR':
      return {
        ...state,
        selectedDoctor: action.doctor,
        selectedDate:   null,
        selectedSlot:   null,
        step:           'schedule',
        errorMessage:   null,
      };

    case 'SELECT_DATE':
      return {
        ...state,
        selectedDate: action.date,
        selectedSlot: null,
        errorMessage: null,
      };

    case 'SELECT_SLOT':
      return {
        ...state,
        selectedSlot: action.slot.starts_at,
        step:         'patient_info',
        errorMessage: null,
      };

    case 'CONFIRM_START':
      return { ...state, step: 'confirming', errorMessage: null };

    case 'CONFIRM_SUCCESS':
      return { ...state, step: 'confirmed', confirmation: action.result, errorMessage: null };

    case 'CONFIRM_ERROR':
      return { ...state, step: 'patient_info', errorMessage: action.message };

    case 'GO_BACK': {
      const prevStep = STEP_BACK_MAP[state.step];
      if (!prevStep) return state;
      return { ...state, step: prevStep, errorMessage: null };
    }

    case 'GO_TO_STEP':
      return { ...state, step: action.step, errorMessage: null };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface BookingWizardProps {
  clinic:     PublicClinicProfile;
  /** When omitted or null, defaults to Germany (DE) geo context. */
  geo?:       GeoContext | null | undefined;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Root booking wizard — manages all step transitions and API submissions.
 */
export function BookingWizard({ clinic, geo }: BookingWizardProps) {
  const safeGeo = geo ?? getGeoContext('DE');
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE);

  // ---------------------------------------------------------------------------
  // Booking confirmation submission
  // ---------------------------------------------------------------------------

  const submitBooking = useCallback(async (patientData: PatientBookingFormData) => {
    if (
      !state.selectedService ||
      !state.selectedDoctor  ||
      !state.selectedSlot
    ) return;

    dispatch({ type: 'CONFIRM_START' });

    // Combine phone country code + number into E.164 format
    const fullPhone = `${patientData.phone_country_code}${patientData.phone.replace(/\s/g, '')}`;

    const body = {
      appointment_type_id: state.selectedService.id,
      doctor_id:           state.selectedDoctor.id,
      scheduled_at:        state.selectedSlot,
      first_name:          patientData.first_name.trim(),
      last_name:           patientData.last_name.trim(),
      date_of_birth:       patientData.date_of_birth,
      gender:              patientData.gender,
      email:               patientData.email.trim(),
      phone:               fullPhone,
      chief_complaint:     patientData.chief_complaint,
      gdpr_consent:        patientData.gdpr_consent as true,
      marketing_consent:   patientData.marketing_consent,
      consent_version:     '1.0',
    };

    try {
      const res  = await fetch(
        `/api/booking/${encodeURIComponent(clinic.slug)}/confirm`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        }
      );

      const json = await res.json() as {
        data:  BookingConfirmationResult | null;
        error: { code: string; message: string } | null;
      };

      if (!res.ok || json.error || !json.data) {
        const message = json.error?.message ?? 'Booking failed. Please try again.';
        dispatch({ type: 'CONFIRM_ERROR', message });
        return;
      }

      dispatch({ type: 'CONFIRM_SUCCESS', result: json.data });
    } catch {
      dispatch({
        type:    'CONFIRM_ERROR',
        message: 'Network error. Please check your connection and try again.',
      });
    }
  }, [clinic.slug, state.selectedService, state.selectedDoctor, state.selectedSlot]);

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------

  const handleStepClick = useCallback((step: BookingStep) => {
    dispatch({ type: 'GO_TO_STEP', step });
  }, []);

  const handleBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const showBackButton = (
    state.step !== 'service' &&
    state.step !== 'confirming' &&
    state.step !== 'confirmed'
  );

  const showProgress = (
    state.step !== 'confirming' &&
    state.step !== 'confirmed'
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

        {/* Clinic header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-200/50 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-surface-900">{clinic.name}</h1>
          <p className="text-sm text-surface-500 mt-1">
            {clinic.city}{clinic.address_line1 ? ` — ${clinic.address_line1}` : ''}
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-card-lg border border-surface-100 overflow-hidden">

          {/* Progress bar (hidden during confirmation flow) */}
          {showProgress && (
            <div className="px-6 pt-6 pb-2">
              <BookingProgress
                currentStep={state.step}
                onStepClick={handleStepClick}
              />
            </div>
          )}

          {/* Confirming overlay */}
          {state.step === 'confirming' && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-surface-800">Confirming your appointment…</p>
              <p className="text-sm text-surface-400 mt-1">Please wait, this will only take a moment.</p>
            </div>
          )}

          {/* Step content */}
          {state.step !== 'confirming' && (
            <div className="p-6">
              {/* Back button */}
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-800 mb-5 transition-colors"
                  aria-label="Go back to previous step"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}

              {/* Step 1: Service selection */}
              {state.step === 'service' && (
                <ServiceSelection
                  clinicSlug={clinic.slug}
                  geo={safeGeo}
                  selectedService={state.selectedService}
                  onSelect={(service) => dispatch({ type: 'SELECT_SERVICE', service })}
                />
              )}

              {/* Step 2: Doctor selection */}
              {state.step === 'doctor' && state.selectedService && (
                <DoctorSelection
                  clinicSlug={clinic.slug}
                  selectedService={state.selectedService}
                  selectedDoctor={state.selectedDoctor}
                  onSelect={(doctor) => dispatch({ type: 'SELECT_DOCTOR', doctor })}
                />
              )}

              {/* Step 3: Schedule selection */}
              {state.step === 'schedule' && state.selectedService && state.selectedDoctor && (
                <ScheduleSelection
                  clinicSlug={clinic.slug}
                  selectedService={state.selectedService}
                  selectedDoctor={state.selectedDoctor}
                  selectedDate={state.selectedDate}
                  selectedSlot={state.selectedSlot}
                  geo={safeGeo}
                  onDateChange={(date) => dispatch({ type: 'SELECT_DATE', date })}
                  onSlotSelect={(slot) => dispatch({ type: 'SELECT_SLOT', slot })}
                />
              )}

              {/* Step 4: Patient information */}
              {state.step === 'patient_info' && state.selectedService && state.selectedDoctor && (
                <PatientInformation
                  clinic={clinic}
                  geo={safeGeo}
                  initialData={state.patientInfo}
                  onSubmit={(data) => void submitBooking(data)}
                  isLoading={false}
                  errorMsg={state.errorMessage}
                />
              )}

              {/* Terminal: Confirmed */}
              {state.step === 'confirmed' &&
               state.confirmation &&
               state.selectedService &&
               state.selectedDoctor &&
               state.selectedSlot && (
                <BookingConfirmation
                  clinic={clinic}
                  service={state.selectedService}
                  doctor={state.selectedDoctor}
                  scheduledAt={state.selectedSlot}
                  confirmation={state.confirmation}
                  dateFormat={safeGeo.dateFormat}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-surface-400 mt-6">
          Powered by{' '}
          <span className="font-semibold text-surface-500">Sypho</span>
          {' '}— GDPR-compliant clinic booking
        </p>
      </div>
    </div>
  );
}
