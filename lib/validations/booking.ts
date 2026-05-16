/**
 * @file lib/validations/booking.ts
 * @description Zod validation schemas for the public booking portal.
 *
 * All API route handlers in app/api/booking/** MUST validate inputs against
 * these schemas before any database interaction.
 *
 * @compliance GDPR — Enforces data minimization at the validation boundary.
 *             OWASP — Input validation prevents injection and malformed data.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// SHARED PRIMITIVES
// ---------------------------------------------------------------------------

const clinicSlugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Clinic slug must be lowercase alphanumeric with hyphens.');

const uuidSchema = z
  .string()
  .uuid('Must be a valid UUID.');

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.');

const isoDatetimeSchema = z
  .string()
  .datetime({ message: 'Must be a valid ISO 8601 datetime string.' });

// ---------------------------------------------------------------------------
// QUERY PARAMETER SCHEMAS
// ---------------------------------------------------------------------------

/**
 * Validates query parameters for GET /api/booking/[clinicSlug]/doctors
 * Optional service_id filters doctors by appointment type association.
 */
export const doctorsQuerySchema = z.object({
  service_id: uuidSchema.optional(),
});

/**
 * Validates query parameters for GET /api/booking/[clinicSlug]/slots
 */
export const slotsQuerySchema = z.object({
  doctor_id:           uuidSchema,
  appointment_type_id: uuidSchema,
  date:                isoDateSchema,
});

// ---------------------------------------------------------------------------
// BOOKING CONFIRMATION SCHEMA
// ---------------------------------------------------------------------------

/**
 * Validates the request body for POST /api/booking/[clinicSlug]/confirm.
 *
 * GDPR compliance notes:
 * - gdpr_consent must be literally `true` (not truthy) — explicit consent.
 * - Only minimum-necessary fields are collected.
 * - date_of_birth is required for patient identity and clinical safety.
 * - chief_complaint is optional but limited to prevent over-collection.
 */
export const bookingConfirmSchema = z.object({
  appointment_type_id: uuidSchema,
  doctor_id:           uuidSchema,

  scheduled_at: isoDatetimeSchema,

  first_name: z
    .string()
    .min(1, 'First name is required.')
    .max(100, 'First name must be 100 characters or fewer.'),

  last_name: z
    .string()
    .min(1, 'Last name is required.')
    .max(100, 'Last name must be 100 characters or fewer.'),

  date_of_birth: isoDateSchema,

  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'], {
    errorMap: () => ({ message: 'Please select a valid gender option.' }),
  }),

  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(255),

  phone: z
    .string()
    .min(7, 'Phone number must be at least 7 digits.')
    .max(20, 'Phone number must be 20 characters or fewer.')
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +96812345678).'),

  chief_complaint: z
    .string()
    .max(1000, 'Chief complaint must be 1000 characters or fewer.')
    .optional()
    .default(''),

  /**
   * GDPR Article 7 — Explicit consent.
   * Must be the literal boolean true; any other value is rejected.
   */
  gdpr_consent: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the privacy policy and consent to data processing to book.',
    }),
  }),

  marketing_consent: z.boolean().optional().default(false),

  consent_version: z
    .string()
    .min(1)
    .max(50)
    .default('1.0'),
});

export type BookingConfirmInput = z.infer<typeof bookingConfirmSchema>;

// ---------------------------------------------------------------------------
// CLINIC SLUG PATH PARAM SCHEMA (shared across booking routes)
// ---------------------------------------------------------------------------

export const clinicSlugParamSchema = z.object({
  clinicSlug: clinicSlugSchema,
});
