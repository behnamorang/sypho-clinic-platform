/**
 * @file components/onboarding/steps/clinic-details-step.tsx
 * @description Step 1 of the clinic onboarding wizard — basic clinic identity.
 *
 * Captures: clinic name, contact email, phone (optional), and timezone.
 */

'use client';

import { useState, useCallback } from 'react';
import { Input }    from '@/components/ui/input';
import { Select }   from '@/components/ui/select';
import { Button }   from '@/components/ui/button';
import { CLINIC_TIMEZONE_OPTIONS } from '@/lib/constants/clinic-timezones';
import {
  clinicDetailsStepSchema,
  type ClinicDetailsStepValues,
} from '@/lib/validations/onboarding';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<keyof ClinicDetailsStepValues, string>>;

export interface ClinicDetailsStepProps {
  initialValues?: Partial<ClinicDetailsStepValues> | undefined;
  /** Applied when the user has not saved step 1 yet (from edge IP defaults). */
  defaultTimezone?: string | undefined;
  /** E.164 prefix including '+' — pre-fills phone and shapes the placeholder. */
  defaultPhonePrefix?: string | undefined;
  onNext: (values: ClinicDetailsStepValues) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Onboarding Step 1: Clinic basic information.
 */
export function ClinicDetailsStep({
  initialValues,
  defaultTimezone,
  defaultPhonePrefix,
  onNext,
}: ClinicDetailsStepProps) {
  const resolvedTimezone =
    initialValues?.timezone ?? defaultTimezone ?? 'Europe/Berlin';

  const resolvedPhone =
    initialValues?.clinic_phone ??
    (defaultPhonePrefix !== undefined && defaultPhonePrefix.length > 0
      ? `${defaultPhonePrefix} `
      : '');

  const phonePlaceholder =
    defaultPhonePrefix !== undefined && defaultPhonePrefix.length > 0
      ? `${defaultPhonePrefix} 30 12345678`
      : '+49 30 12345678';

  const [values, setValues] = useState<ClinicDetailsStepValues>({
    clinic_name:  initialValues?.clinic_name  ?? '',
    clinic_email: initialValues?.clinic_email ?? '',
    clinic_phone: resolvedPhone,
    timezone:     resolvedTimezone,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name as keyof ClinicDetailsStepValues];
      return next;
    });
  }, []);

  function handleNext(): void {
    const parseResult = clinicDetailsStepSchema.safeParse(values);
    if (!parseResult.success) {
      const errors: FieldErrors = {};
      parseResult.error.errors.forEach((issue: ZodIssue) => {
        const field = issue.path[0] as keyof ClinicDetailsStepValues | undefined;
        if (field) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }
    onNext(parseResult.data);
  }

  return (
    <div className="space-y-5">
      <Input
        label="Clinic name"
        type="text"
        name="clinic_name"
        value={values.clinic_name}
        onChange={handleChange}
        error={fieldErrors.clinic_name}
        autoComplete="organization"
        placeholder="e.g. Central Medical Practice"
        required
      />

      <Input
        label="Clinic contact email"
        type="email"
        name="clinic_email"
        value={values.clinic_email}
        onChange={handleChange}
        error={fieldErrors.clinic_email}
        autoComplete="email"
        placeholder="contact@yourclinic.com"
        required
        helperText="Used for patient communications and notifications."
      />

      <Input
        label="Phone number"
        type="tel"
        name="clinic_phone"
        value={values.clinic_phone ?? ''}
        onChange={handleChange}
        error={fieldErrors.clinic_phone}
        autoComplete="tel"
        placeholder={phonePlaceholder}
      />

      <Select
        label="Timezone"
        name="timezone"
        value={values.timezone}
        onChange={handleChange}
        error={fieldErrors.timezone}
        options={CLINIC_TIMEZONE_OPTIONS}
        required
        helperText="All appointment times will be displayed in this timezone."
      />

      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={handleNext}
        >
          Continue
          <span aria-hidden="true" className="ml-1">→</span>
        </Button>
      </div>
    </div>
  );
}
