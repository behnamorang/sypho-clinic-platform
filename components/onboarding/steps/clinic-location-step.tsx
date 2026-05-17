/**
 * @file components/onboarding/steps/clinic-location-step.tsx
 * @description Step 2 of the clinic onboarding wizard — clinic address.
 *
 * Captures: country (EU/EEA only for GDPR), address, city, postal code.
 * Country selection is restricted to EU/EEA member states per data residency requirements.
 *
 * @compliance GDPR — data must remain in EU/EEA jurisdiction.
 */

'use client';

import { useState, useCallback } from 'react';
import { Input }    from '@/components/ui/input';
import { Select }   from '@/components/ui/select';
import { Button }   from '@/components/ui/button';
import { Alert }    from '@/components/ui/alert';
import {
  clinicLocationStepSchema,
  type ClinicLocationStepValues,
} from '@/lib/validations/onboarding';
import { DATA_RESIDENCY } from '@/config/supabase';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Country options (EU/EEA only)
// ---------------------------------------------------------------------------

const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Austria',         BE: 'Belgium',        BG: 'Bulgaria',
  CY: 'Cyprus',          CZ: 'Czech Republic', DE: 'Germany',
  DK: 'Denmark',         EE: 'Estonia',        ES: 'Spain',
  FI: 'Finland',         FR: 'France',         GR: 'Greece',
  HR: 'Croatia',         HU: 'Hungary',        IE: 'Ireland',
  IT: 'Italy',           LT: 'Lithuania',      LU: 'Luxembourg',
  LV: 'Latvia',          MT: 'Malta',          NL: 'Netherlands',
  PL: 'Poland',          PT: 'Portugal',       RO: 'Romania',
  SE: 'Sweden',          SI: 'Slovenia',       SK: 'Slovakia',
  IS: 'Iceland (EEA)',   LI: 'Liechtenstein (EEA)', NO: 'Norway (EEA)',
};

const COUNTRY_OPTIONS = [...DATA_RESIDENCY.SUPPORTED_COUNTRIES]
  .sort((a, b) => (COUNTRY_NAMES[a] ?? a).localeCompare(COUNTRY_NAMES[b] ?? b))
  .map((code) => ({ value: code, label: COUNTRY_NAMES[code] ?? code }));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<keyof ClinicLocationStepValues, string>>;

export interface ClinicLocationStepProps {
  initialValues?: Partial<ClinicLocationStepValues> | undefined;
  /** When step 2 has no saved country yet, defaults from IP if it is EU/EEA, else DE. */
  defaultCountryCode?: string | undefined;
  onNext: (values: ClinicLocationStepValues) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Onboarding Step 2: Clinic address and country.
 * Country is restricted to EU/EEA to enforce GDPR data residency.
 */
export function ClinicLocationStep({
  initialValues,
  defaultCountryCode,
  onNext,
  onBack,
}: ClinicLocationStepProps) {
  const [values, setValues] = useState<ClinicLocationStepValues>({
    country_code:  initialValues?.country_code ?? defaultCountryCode ?? 'DE',
    address_line1: initialValues?.address_line1 ?? '',
    address_line2: initialValues?.address_line2 ?? '',
    city:          initialValues?.city          ?? '',
    state_province: initialValues?.state_province ?? '',
    postal_code:   initialValues?.postal_code   ?? '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name as keyof ClinicLocationStepValues];
      return next;
    });
  }, []);

  function handleNext(): void {
    const parseResult = clinicLocationStepSchema.safeParse(values);
    if (!parseResult.success) {
      const errors: FieldErrors = {};
      parseResult.error.errors.forEach((issue: ZodIssue) => {
        const field = issue.path[0] as keyof ClinicLocationStepValues | undefined;
        if (field) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }
    onNext(parseResult.data);
  }

  return (
    <div className="space-y-5">
      <Alert variant="info">
        <span className="font-medium">GDPR data residency:</span> Sypho stores all patient data
        exclusively within EU/EEA data centers. Clinic registration is limited to EU/EEA countries.
      </Alert>

      <Select
        label="Country"
        name="country_code"
        value={values.country_code}
        onChange={handleChange}
        error={fieldErrors.country_code}
        options={COUNTRY_OPTIONS}
        required
      />

      <Input
        label="Street address"
        type="text"
        name="address_line1"
        value={values.address_line1}
        onChange={handleChange}
        error={fieldErrors.address_line1}
        autoComplete="address-line1"
        placeholder="Hauptstraße 1"
        required
      />

      <Input
        label="Address line 2 (optional)"
        type="text"
        name="address_line2"
        value={values.address_line2 ?? ''}
        onChange={handleChange}
        error={fieldErrors.address_line2}
        autoComplete="address-line2"
        placeholder="Building, floor, suite…"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          type="text"
          name="city"
          value={values.city}
          onChange={handleChange}
          error={fieldErrors.city}
          autoComplete="address-level2"
          placeholder="Berlin"
          required
        />

        <Input
          label="Postal code"
          type="text"
          name="postal_code"
          value={values.postal_code}
          onChange={handleChange}
          error={fieldErrors.postal_code}
          autoComplete="postal-code"
          placeholder="10115"
          required
        />
      </div>

      <Input
        label="State / Province (optional)"
        type="text"
        name="state_province"
        value={values.state_province ?? ''}
        onChange={handleChange}
        error={fieldErrors.state_province}
        autoComplete="address-level1"
        placeholder="Bavaria"
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button type="button" variant="primary" fullWidth onClick={handleNext}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
