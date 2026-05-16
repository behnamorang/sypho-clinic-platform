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
import {
  clinicDetailsStepSchema,
  type ClinicDetailsStepValues,
} from '@/lib/validations/onboarding';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Timezone options (common EU/EEA timezones)
// ---------------------------------------------------------------------------

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Berlin',    label: '(UTC+1/+2) Berlin, Frankfurt, Munich' },
  { value: 'Europe/Amsterdam', label: '(UTC+1/+2) Amsterdam, Netherlands' },
  { value: 'Europe/Paris',     label: '(UTC+1/+2) Paris, France' },
  { value: 'Europe/Rome',      label: '(UTC+1/+2) Rome, Milan, Italy' },
  { value: 'Europe/Madrid',    label: '(UTC+1/+2) Madrid, Barcelona, Spain' },
  { value: 'Europe/Warsaw',    label: '(UTC+1/+2) Warsaw, Poland' },
  { value: 'Europe/Vienna',    label: '(UTC+1/+2) Vienna, Austria' },
  { value: 'Europe/Brussels',  label: '(UTC+1/+2) Brussels, Belgium' },
  { value: 'Europe/Zurich',    label: '(UTC+1/+2) Zurich, Switzerland' },
  { value: 'Europe/Stockholm', label: '(UTC+1/+2) Stockholm, Sweden' },
  { value: 'Europe/Helsinki',  label: '(UTC+2/+3) Helsinki, Finland' },
  { value: 'Europe/Athens',    label: '(UTC+2/+3) Athens, Greece' },
  { value: 'Europe/Bucharest', label: '(UTC+2/+3) Bucharest, Romania' },
  { value: 'Europe/London',    label: '(UTC+0/+1) London, UK' },
  { value: 'Europe/Dublin',    label: '(UTC+0/+1) Dublin, Ireland' },
  { value: 'Europe/Lisbon',    label: '(UTC+0/+1) Lisbon, Portugal' },
  { value: 'Europe/Prague',    label: '(UTC+1/+2) Prague, Czech Republic' },
  { value: 'Europe/Budapest',  label: '(UTC+1/+2) Budapest, Hungary' },
  { value: 'Europe/Riga',      label: '(UTC+2/+3) Riga, Latvia' },
  { value: 'Europe/Tallinn',   label: '(UTC+2/+3) Tallinn, Estonia' },
  { value: 'Europe/Vilnius',   label: '(UTC+2/+3) Vilnius, Lithuania' },
  { value: 'Europe/Oslo',      label: '(UTC+1/+2) Oslo, Norway' },
  { value: 'Europe/Copenhagen',label: '(UTC+1/+2) Copenhagen, Denmark' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<keyof ClinicDetailsStepValues, string>>;

export interface ClinicDetailsStepProps {
  initialValues?: Partial<ClinicDetailsStepValues> | undefined;
  onNext: (values: ClinicDetailsStepValues) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Onboarding Step 1: Clinic basic information.
 */
export function ClinicDetailsStep({ initialValues, onNext }: ClinicDetailsStepProps) {
  const [values, setValues] = useState<ClinicDetailsStepValues>({
    clinic_name:  initialValues?.clinic_name  ?? '',
    clinic_email: initialValues?.clinic_email ?? '',
    clinic_phone: initialValues?.clinic_phone ?? '',
    timezone:     initialValues?.timezone     ?? 'Europe/Berlin',
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
        placeholder="+49 30 12345678"
      />

      <Select
        label="Timezone"
        name="timezone"
        value={values.timezone}
        onChange={handleChange}
        error={fieldErrors.timezone}
        options={TIMEZONE_OPTIONS}
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
