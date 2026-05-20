/**
 * @file lib/sypho-med/book-demo-types.ts
 * @description Types and validation for the consultation booking lead form.
 */

import { z } from 'zod';

/** Clinic location options for lead segmentation. */
export const CLINIC_LOCATIONS = ['oman', 'uk', 'uae', 'other'] as const;

export type ClinicLocation = (typeof CLINIC_LOCATIONS)[number];

export const CLINIC_LOCATION_LABELS: Record<ClinicLocation, string> = {
  oman: 'Oman',
  uk: 'United Kingdom',
  uae: 'United Arab Emirates',
  other: 'Other',
};

/** Monthly booking volume bands. */
export const BOOKING_VOLUME_OPTIONS = [
  { value: 'under_100', label: 'Under 100 appointments' },
  { value: '100_300', label: '100 – 300 appointments' },
  { value: '300_600', label: '300 – 600 appointments' },
  { value: '600_plus', label: '600+ appointments' },
] as const;

export type BookingVolume = (typeof BOOKING_VOLUME_OPTIONS)[number]['value'];

/** Operational pain point identifiers. */
export const PAIN_POINT_OPTIONS = [
  { id: 'no_shows', label: 'High No-Show Rates' },
  { id: 'whatsapp', label: 'Messy WhatsApp Booking' },
  { id: 'reminders', label: 'Manual Patient Reminders' },
  { id: 'crm', label: 'Scattered CRM Data' },
] as const;

export type PainPointId = (typeof PAIN_POINT_OPTIONS)[number]['id'];

export const step1Schema = z.object({
  fullName: z
    .string()
    .min(2, 'Please enter your full name')
    .max(120, 'Name is too long'),
  email: z.string().email('Please enter a valid professional email'),
  phone: z
    .string()
    .min(8, 'Please enter a direct phone number')
    .max(24, 'Phone number is too long'),
});

export const step2Schema = z.object({
  clinicName: z
    .string()
    .min(2, 'Please enter your clinic name')
    .max(160, 'Clinic name is too long'),
  location: z.enum(CLINIC_LOCATIONS, {
    errorMap: () => ({ message: 'Please select a location' }),
  }),
  bookingVolume: z.enum(
    BOOKING_VOLUME_OPTIONS.map((o) => o.value) as [
      BookingVolume,
      ...BookingVolume[],
    ],
    { errorMap: () => ({ message: 'Please select booking volume' }) },
  ),
});

export const step3Schema = z.object({
  painPoints: z
    .array(
      z.enum(
        PAIN_POINT_OPTIONS.map((p) => p.id) as [PainPointId, ...PainPointId[]],
      ),
    )
    .min(1, 'Select at least one operational challenge'),
});

export const consultationLeadSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export type ConsultationLeadFormData = z.infer<typeof consultationLeadSchema>;

export type ConsultationStep1Data = z.infer<typeof step1Schema>;
export type ConsultationStep2Data = z.infer<typeof step2Schema>;
export type ConsultationStep3Data = z.infer<typeof step3Schema>;

/** Session storage key for captured consultation leads (demo handoff). */
export const LEAD_SESSION_STORAGE_KEY = 'sypho_med_consultation_lead';
