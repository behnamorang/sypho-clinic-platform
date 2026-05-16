/**
 * @file lib/validations/onboarding.ts
 * @description Zod validation schemas for the clinic onboarding wizard.
 *
 * Each step has its own schema. The complete onboarding schema is the
 * intersection of all step schemas, validated at the API boundary.
 *
 * @compliance GDPR — country_code must be within EU/EEA per data residency requirements.
 */

import { z } from 'zod';
import { DATA_RESIDENCY } from '@/config/supabase';

// ---------------------------------------------------------------------------
// Shared constraints
// ---------------------------------------------------------------------------

/** Allowed EU/EEA country codes (ISO 3166-1 alpha-2) from the config. */
const EU_COUNTRY_CODES = DATA_RESIDENCY.SUPPORTED_COUNTRIES as readonly string[];

const euCountryCodeSchema = z
  .string()
  .length(2, 'Please select a country.')
  .refine(
    (val) => EU_COUNTRY_CODES.includes(val.toUpperCase()),
    { message: 'Country must be within the EU/EEA for GDPR data residency compliance.' },
  )
  .transform((val) => val.toUpperCase());

// ---------------------------------------------------------------------------
// Step 1: Clinic basic details
// ---------------------------------------------------------------------------

/**
 * Step 1 — Basic clinic identity information.
 */
export const clinicDetailsStepSchema = z.object({
  clinic_name: z
    .string()
    .min(2, 'Clinic name must be at least 2 characters.')
    .max(255, 'Clinic name is too long.')
    .trim(),

  clinic_email: z
    .string()
    .min(1, 'Clinic contact email is required.')
    .email('Please enter a valid email address.')
    .max(254)
    .toLowerCase()
    .trim(),

  clinic_phone: z
    .string()
    .max(30, 'Phone number is too long.')
    .trim()
    .optional()
    .or(z.literal('')),

  timezone: z
    .string()
    .min(1, 'Please select a timezone.')
    .max(100),
});

export type ClinicDetailsStepValues = z.infer<typeof clinicDetailsStepSchema>;

// ---------------------------------------------------------------------------
// Step 2: Clinic location / address
// ---------------------------------------------------------------------------

/**
 * Step 2 — Clinic address and country (data residency critical).
 */
export const clinicLocationStepSchema = z.object({
  country_code: euCountryCodeSchema,

  address_line1: z
    .string()
    .min(1, 'Street address is required.')
    .max(255)
    .trim(),

  address_line2: z
    .string()
    .max(255)
    .trim()
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .min(1, 'City is required.')
    .max(100)
    .trim(),

  state_province: z
    .string()
    .max(100)
    .trim()
    .optional()
    .or(z.literal('')),

  postal_code: z
    .string()
    .min(1, 'Postal code is required.')
    .max(20)
    .trim(),
});

export type ClinicLocationStepValues = z.infer<typeof clinicLocationStepSchema>;

// ---------------------------------------------------------------------------
// Step 3: Subscription plan selection
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_TIERS = ['free', 'starter', 'professional', 'enterprise'] as const;
export type SubscriptionTierOption = (typeof SUBSCRIPTION_TIERS)[number];

/**
 * Step 3 — Subscription plan selection.
 */
export const planSelectionStepSchema = z.object({
  subscription_tier: z.enum(SUBSCRIPTION_TIERS, {
    errorMap: () => ({ message: 'Please select a subscription plan.' }),
  }),
});

export type PlanSelectionStepValues = z.infer<typeof planSelectionStepSchema>;

// ---------------------------------------------------------------------------
// Combined onboarding schema (all steps merged)
// ---------------------------------------------------------------------------

/**
 * Complete onboarding form data — validated at the API boundary before
 * creating the clinic and clinic_member records.
 */
export const onboardingCompleteSchema = clinicDetailsStepSchema
  .merge(clinicLocationStepSchema)
  .merge(planSelectionStepSchema);

export type OnboardingCompleteValues = z.infer<typeof onboardingCompleteSchema>;

// ---------------------------------------------------------------------------
// Slug generation helper (not a validator, but collocated for convenience)
// ---------------------------------------------------------------------------

/**
 * Generates a URL-safe slug from a clinic name.
 * Result: lowercase alphanumeric + hyphens only.
 *
 * @param name - The clinic name to slugify.
 * @returns A URL-safe slug string.
 */
export function generateClinicSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63); // PostgreSQL index limit safety margin
}
