/**
 * @file lib/sypho-med/book-demo-types.ts
 * @description Types and constants for the consultation booking lead form.
 */

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

/** Full consultation lead payload shape. */
export interface ConsultationLeadFormData {
  fullName: string;
  email: string;
  phone: string;
  clinicName: string;
  location: ClinicLocation;
  bookingVolume: BookingVolume;
  painPoints: PainPointId[];
}

/** Session storage key for captured consultation leads (demo handoff). */
export const LEAD_SESSION_STORAGE_KEY = 'sypho_med_consultation_lead';
