/**
 * @file components/booking/steps/patient-information.tsx
 * @description Step 4: Patient Information & EU GDPR Compliance.
 *
 * Collects the minimum patient data required for healthcare provision:
 *   - Separate First / Last name fields.
 *   - Date of birth and gender.
 *   - SMS/WhatsApp-compatible phone with country code selector.
 *   - Email address.
 *   - Chief complaint (optional, capped at 1000 chars).
 *   - Mandatory GDPR data processing consent checkbox.
 *   - Optional marketing communications consent checkbox.
 *
 * @compliance GDPR Article 7  — Explicit, granular, freely-given consent.
 *             GDPR Article 5  — Data minimization (only necessary fields).
 *             GDPR Article 13 — Transparency via privacy policy link.
 */

'use client';

import { useState, useCallback } from 'react';
import type {
  PatientBookingFormData,
  GeoContext,
  PublicClinicProfile,
}                                 from '@/types/booking';
import type { GenderType }        from '@/database/types/database.types';
import { getGeoContext }          from '@/lib/booking/geo';

// ---------------------------------------------------------------------------
// PHONE COUNTRY CODES (subset — most common booking markets)
// ---------------------------------------------------------------------------

interface PhoneCountryOption {
  code:   string;
  prefix: string;
  label:  string;
}

const PHONE_COUNTRIES: PhoneCountryOption[] = [
  { code: 'OM', prefix: '+968', label: '🇴🇲 +968 (Oman)' },
  { code: 'SA', prefix: '+966', label: '🇸🇦 +966 (Saudi Arabia)' },
  { code: 'AE', prefix: '+971', label: '🇦🇪 +971 (UAE)' },
  { code: 'KW', prefix: '+965', label: '🇰🇼 +965 (Kuwait)' },
  { code: 'QA', prefix: '+974', label: '🇶🇦 +974 (Qatar)' },
  { code: 'BH', prefix: '+973', label: '🇧🇭 +973 (Bahrain)' },
  { code: 'DE', prefix: '+49',  label: '🇩🇪 +49 (Germany)' },
  { code: 'GB', prefix: '+44',  label: '🇬🇧 +44 (UK)' },
  { code: 'FR', prefix: '+33',  label: '🇫🇷 +33 (France)' },
  { code: 'NL', prefix: '+31',  label: '🇳🇱 +31 (Netherlands)' },
  { code: 'BE', prefix: '+32',  label: '🇧🇪 +32 (Belgium)' },
  { code: 'AT', prefix: '+43',  label: '🇦🇹 +43 (Austria)' },
  { code: 'SE', prefix: '+46',  label: '🇸🇪 +46 (Sweden)' },
  { code: 'NO', prefix: '+47',  label: '🇳🇴 +47 (Norway)' },
  { code: 'DK', prefix: '+45',  label: '🇩🇰 +45 (Denmark)' },
  { code: 'IT', prefix: '+39',  label: '🇮🇹 +39 (Italy)' },
  { code: 'ES', prefix: '+34',  label: '🇪🇸 +34 (Spain)' },
  { code: 'US', prefix: '+1',   label: '🇺🇸 +1 (United States)' },
  { code: 'CA', prefix: '+1',   label: '🇨🇦 +1 (Canada)' },
];

// ---------------------------------------------------------------------------
// PROPS & VALIDATION TYPES
// ---------------------------------------------------------------------------

interface PatientInformationProps {
  clinic:     PublicClinicProfile;
  /** When omitted or null, defaults to Germany (DE) for phone prefix selection. */
  geo?:       GeoContext | null | undefined;
  initialData: PatientBookingFormData | null;
  onSubmit:   (data: PatientBookingFormData) => void;
  isLoading:  boolean;
  errorMsg:   string | null;
}

interface FormErrors {
  first_name?:   string;
  last_name?:    string;
  date_of_birth?: string;
  gender?:       string;
  email?:        string;
  phone?:        string;
  gdpr_consent?: string;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function validateForm(data: PatientBookingFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.first_name.trim())  errors.first_name   = 'First name is required.';
  if (!data.last_name.trim())   errors.last_name    = 'Last name is required.';
  if (!data.date_of_birth)      errors.date_of_birth = 'Date of birth is required.';
  if (!data.gender)             errors.gender       = 'Please select a gender.';

  if (!data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (data.phone.trim().length < 5) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (!data.gdpr_consent) {
    errors.gdpr_consent = 'You must accept the Privacy Policy to complete your booking.';
  }

  return errors;
}

// Input field CSS classes
const inputCls = (hasError: boolean) =>
  [
    'w-full rounded-lg border px-3.5 py-2.5 text-sm text-surface-900',
    'placeholder:text-surface-400 bg-white',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-0',
    'transition-colors duration-150',
    hasError
      ? 'border-danger-500 focus-visible:ring-danger-400'
      : 'border-surface-300 hover:border-surface-400 focus-visible:border-brand-400',
  ].join(' ');

const labelCls = 'block text-xs font-semibold text-surface-700 mb-1.5';
const errorCls = 'mt-1 text-xs text-danger-600';

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Step 4 of the booking wizard.
 * Collects patient details with full GDPR compliance.
 */
export function PatientInformation({
  clinic,
  geo,
  initialData,
  onSubmit,
  isLoading,
  errorMsg,
}: PatientInformationProps) {
  const safeGeo = geo ?? getGeoContext('DE');

  const defaultCountry = PHONE_COUNTRIES.find((c) => c.code === safeGeo.countryCode)
    ?? PHONE_COUNTRIES.find((c) => c.prefix === safeGeo.phonePrefix)
    ?? PHONE_COUNTRIES[0]!;

  const [form, setForm] = useState<PatientBookingFormData>(
    initialData ?? {
      first_name:         '',
      last_name:          '',
      date_of_birth:      '',
      gender:             'prefer_not_to_say',
      email:              '',
      phone_country_code: defaultCountry.prefix,
      phone:              '',
      chief_complaint:    '',
      gdpr_consent:       false,
      marketing_consent:  false,
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PatientBookingFormData, boolean>>>({});

  const update = useCallback(
    <K extends keyof PatientBookingFormData>(field: K, value: PatientBookingFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Partial<Record<keyof PatientBookingFormData, boolean>>
    );
    setTouched(allTouched);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(form);
    }
  }, [form, onSubmit]);

  // Max date for date_of_birth (patient must be born before today)
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 1);
  const maxDobStr = maxDob.toISOString().split('T')[0] ?? '';

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-surface-900">Your information</h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Please fill in your details to complete the booking.
          Your data is processed securely under GDPR.
        </p>
      </div>

      {/* Global error */}
      {errorMsg && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
          <p className="text-sm text-danger-700 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelCls}>
            First name <span className="text-danger-500">*</span>
          </label>
          <input
            id="first_name"
            type="text"
            autoComplete="given-name"
            value={form.first_name}
            onChange={(e) => update('first_name', e.target.value)}
            placeholder="Jane"
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first_name_err' : undefined}
            className={inputCls(!!errors.first_name && touched.first_name === true)}
          />
          {errors.first_name && touched.first_name && (
            <p id="first_name_err" className={errorCls}>{errors.first_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className={labelCls}>
            Last name <span className="text-danger-500">*</span>
          </label>
          <input
            id="last_name"
            type="text"
            autoComplete="family-name"
            value={form.last_name}
            onChange={(e) => update('last_name', e.target.value)}
            placeholder="Smith"
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last_name_err' : undefined}
            className={inputCls(!!errors.last_name && touched.last_name === true)}
          />
          {errors.last_name && touched.last_name && (
            <p id="last_name_err" className={errorCls}>{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* DOB + Gender row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date_of_birth" className={labelCls}>
            Date of birth <span className="text-danger-500">*</span>
          </label>
          <input
            id="date_of_birth"
            type="date"
            autoComplete="bday"
            value={form.date_of_birth}
            max={maxDobStr}
            onChange={(e) => update('date_of_birth', e.target.value)}
            aria-invalid={!!errors.date_of_birth}
            aria-describedby={errors.date_of_birth ? 'dob_err' : undefined}
            className={inputCls(!!errors.date_of_birth && touched.date_of_birth === true)}
          />
          {errors.date_of_birth && touched.date_of_birth && (
            <p id="dob_err" className={errorCls}>{errors.date_of_birth}</p>
          )}
        </div>

        <div>
          <label htmlFor="gender" className={labelCls}>
            Gender <span className="text-danger-500">*</span>
          </label>
          <select
            id="gender"
            value={form.gender}
            onChange={(e) => update('gender', e.target.value as GenderType)}
            aria-invalid={!!errors.gender}
            className={[inputCls(!!errors.gender && touched.gender === true), 'cursor-pointer'].join(' ')}
          >
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && touched.gender && (
            <p className={errorCls}>{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelCls}>
          Email address <span className="text-danger-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="jane.smith@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email_err' : 'email_hint'}
          className={inputCls(!!errors.email && touched.email === true)}
        />
        <p id="email_hint" className="mt-1 text-[11px] text-surface-400">
          Your confirmation will be sent to this email.
        </p>
        {errors.email && touched.email && (
          <p id="email_err" className={errorCls}>{errors.email}</p>
        )}
      </div>

      {/* Phone with country code */}
      <div>
        <label htmlFor="phone" className={labelCls}>
          Phone (SMS / WhatsApp) <span className="text-danger-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            value={form.phone_country_code}
            onChange={(e) => update('phone_country_code', e.target.value)}
            aria-label="Phone country code"
            className={[
              'shrink-0 rounded-lg border border-surface-300 px-2.5 py-2.5 text-sm',
              'bg-white text-surface-700 cursor-pointer',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              'hover:border-surface-400 transition-colors',
            ].join(' ')}
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={`${c.code}-${c.prefix}`} value={c.prefix}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            id="phone"
            type="tel"
            autoComplete="tel-national"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="12345678"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone_err' : 'phone_hint'}
            className={[inputCls(!!errors.phone && touched.phone === true), 'flex-1'].join(' ')}
          />
        </div>
        <p id="phone_hint" className="mt-1 text-[11px] text-surface-400">
          Used for appointment reminders via SMS or WhatsApp.
        </p>
        {errors.phone && touched.phone && (
          <p id="phone_err" className={errorCls}>{errors.phone}</p>
        )}
      </div>

      {/* Chief complaint (optional) */}
      <div>
        <label htmlFor="chief_complaint" className={labelCls}>
          Reason for visit
          <span className="ml-1 text-surface-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="chief_complaint"
          rows={3}
          value={form.chief_complaint}
          onChange={(e) => update('chief_complaint', e.target.value)}
          maxLength={1000}
          placeholder="Briefly describe your symptoms or reason for the appointment…"
          aria-describedby="complaint_hint"
          className={[
            inputCls(false),
            'resize-none leading-relaxed',
          ].join(' ')}
        />
        <p id="complaint_hint" className="mt-1 flex justify-between text-[11px] text-surface-400">
          <span>This helps your doctor prepare for your visit.</span>
          <span>{form.chief_complaint.length}/1000</span>
        </p>
      </div>

      {/* GDPR consent section */}
      <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 space-y-3">
        <p className="text-xs font-semibold text-surface-700 uppercase tracking-wider">
          Privacy & Consent
        </p>

        {/* Mandatory GDPR consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              id="gdpr_consent"
              checked={form.gdpr_consent}
              onChange={(e) => update('gdpr_consent', e.target.checked)}
              className="sr-only peer"
              aria-describedby={errors.gdpr_consent ? 'gdpr_err' : undefined}
            />
            <div
              aria-hidden="true"
              className={[
                'w-5 h-5 rounded border-2 flex items-center justify-center',
                'transition-all duration-150',
                form.gdpr_consent
                  ? 'bg-brand-600 border-brand-600'
                  : errors.gdpr_consent && touched.gdpr_consent
                    ? 'border-danger-500 bg-white'
                    : 'border-surface-300 bg-white group-hover:border-brand-400',
              ].join(' ')}
            >
              {form.gdpr_consent && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-surface-600 leading-relaxed">
            <span className="font-semibold text-surface-800">I agree to the processing of my personal data</span>{' '}
            for healthcare provision by {clinic.name}, in accordance with{' '}
            {clinic.privacy_policy_url ? (
              <a
                href={clinic.privacy_policy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 underline"
                onClick={(e) => e.stopPropagation()}
              >
                their Privacy Policy
              </a>
            ) : (
              'their Privacy Policy'
            )}
            {' '}and the EU GDPR (Regulation 2016/679).{' '}
            <span className="text-danger-500 font-medium">Required to proceed.</span>
          </span>
        </label>
        {errors.gdpr_consent && touched.gdpr_consent && (
          <p id="gdpr_err" role="alert" className="text-xs text-danger-600 ml-8">{errors.gdpr_consent}</p>
        )}

        {/* Optional marketing consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              id="marketing_consent"
              checked={form.marketing_consent}
              onChange={(e) => update('marketing_consent', e.target.checked)}
              className="sr-only"
            />
            <div
              aria-hidden="true"
              className={[
                'w-5 h-5 rounded border-2 flex items-center justify-center',
                'transition-all duration-150',
                form.marketing_consent
                  ? 'bg-brand-600 border-brand-600'
                  : 'border-surface-300 bg-white group-hover:border-brand-400',
              ].join(' ')}
            >
              {form.marketing_consent && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-surface-500 leading-relaxed">
            I agree to receive newsletters, health tips, and promotional offers from {clinic.name}.
            <span className="text-surface-400"> (Optional — you can withdraw at any time.)</span>
          </span>
        </label>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={[
          'w-full py-3.5 rounded-xl text-sm font-semibold text-white',
          'bg-gradient-to-r from-brand-600 to-accent-600',
          'shadow-md shadow-brand-200/50',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          isLoading
            ? 'opacity-70 cursor-not-allowed'
            : 'hover:from-brand-700 hover:to-accent-700 hover:shadow-lg active:scale-[0.99]',
        ].join(' ')}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Confirming your appointment…
          </span>
        ) : (
          'Confirm Appointment'
        )}
      </button>

      <p className="text-center text-[11px] text-surface-400 leading-relaxed">
        By confirming, you acknowledge that your data is processed under{' '}
        GDPR Article 9(2)(h) — healthcare provision.
        {clinic.terms_url && (
          <>
            {' '}
            <a
              href={clinic.terms_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-600 underline"
            >
              Terms of Service
            </a>
          </>
        )}
      </p>
    </div>
  );
}
