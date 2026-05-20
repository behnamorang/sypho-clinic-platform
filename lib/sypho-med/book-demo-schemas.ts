/**
 * @file lib/sypho-med/book-demo-schemas.ts
 * @description Zod validation schemas for the consultation booking form (client-only).
 */

import { z } from 'zod';
import {
  BOOKING_VOLUME_OPTIONS,
  CLINIC_LOCATIONS,
  PAIN_POINT_OPTIONS,
  type BookingVolume,
  type PainPointId,
} from '@/lib/sypho-med/book-demo-types';

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
