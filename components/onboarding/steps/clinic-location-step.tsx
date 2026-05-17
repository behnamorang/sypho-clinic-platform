/**
 * @file components/onboarding/steps/clinic-location-step.tsx
 * @description Step 2 of the clinic onboarding wizard — clinic address.
 *
 * Captures: country (ISO 3166-1 alpha-2 worldwide list), address, city, postal code.
 * Non-EU/EEA selections show an additional compliance notice; patient data remains in EU regions.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Input }    from '@/components/ui/input';
import { Select }   from '@/components/ui/select';
import { Button }   from '@/components/ui/button';
import { Alert }    from '@/components/ui/alert';
import {
  clinicLocationStepSchema,
  type ClinicLocationStepValues,
} from '@/lib/validations/onboarding';
import { DATA_RESIDENCY } from '@/config/supabase';
import {
  ISO_3166_1_ALPHA2_CODES,
  ISO_3166_1_ALPHA2_EN,
} from '@/lib/constants/iso-3166-countries';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Country options (ISO 3166-1 alpha-2, English labels)
// ---------------------------------------------------------------------------

const EU_EEA_CODES = new Set<string>(DATA_RESIDENCY.SUPPORTED_COUNTRIES as readonly string[]);

const COUNTRY_OPTIONS = ISO_3166_1_ALPHA2_CODES.map((code) => ({
  value: code,
  label: ISO_3166_1_ALPHA2_EN[code] ?? code,
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<keyof ClinicLocationStepValues, string>>;

export interface ClinicLocationStepProps {
  initialValues?: Partial<ClinicLocationStepValues> | undefined;
  /** When step 2 has no saved country yet, defaults from geo when it is a valid ISO code, else DE. */
  defaultCountryCode?: string | undefined;
  onNext: (values: ClinicLocationStepValues) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Onboarding Step 2: Clinic address and country.
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

  const isOutsideEuEea = useMemo(
    () => !EU_EEA_CODES.has(values.country_code),
    [values.country_code],
  );

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
        <span className="font-medium">Data residency:</span> Patient data in Sypho is processed and
        stored in EU-based infrastructure. You may select any ISO country for your clinic&apos;s
        registered address; this does not change where health data is hosted.
      </Alert>

      {isOutsideEuEea && (
        <Alert variant="warning">
          <span className="font-medium">Outside EU/EEA:</span> Your clinic country is not in the
          EU/EEA. You remain responsible for local licensing and privacy obligations when using an
          EU-hosted service.
        </Alert>
      )}

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
        placeholder="Building, floor, suite..."
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
