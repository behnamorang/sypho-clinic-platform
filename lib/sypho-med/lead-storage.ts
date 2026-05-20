/**
 * @file lib/sypho-med/lead-storage.ts
 * @description Client-side lead profile persistence for demo workspace handoff.
 *
 * GDPR: Stored in sessionStorage only for the browser session; not transmitted
 * to external services in this marketing demo flow.
 */

import type {
  ClinicLocation,
  ConsultationLeadFormData,
} from '@/lib/sypho-med/book-demo-types';
import { LEAD_SESSION_STORAGE_KEY } from '@/lib/sypho-med/book-demo-types';
import type { ClinicPresetId } from '@/lib/sypho-med/demo/types';

export interface StoredConsultationLead extends ConsultationLeadFormData {
  submittedAt: string;
}

/**
 * Persists the consultation lead to sessionStorage for the instant demo handoff.
 */
export function saveConsultationLead(data: ConsultationLeadFormData): void {
  if (typeof window === 'undefined') return;

  const payload: StoredConsultationLead = {
    ...data,
    submittedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(LEAD_SESSION_STORAGE_KEY, JSON.stringify(payload));
}

/**
 * Reads the stored lead profile, if present.
 */
/**
 * Maps lead location to the closest demo clinic preset.
 */
export function leadLocationToClinicPreset(
  location: ClinicLocation,
): ClinicPresetId {
  switch (location) {
    case 'oman':
      return 'muscat';
    case 'uk':
      return 'london';
    case 'uae':
      return 'amsterdam';
    case 'other':
    default:
      return 'berlin';
  }
}

/**
 * Reads the stored lead profile, if present.
 */
export function getConsultationLead(): StoredConsultationLead | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(LEAD_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredConsultationLead;
  } catch {
    return null;
  }
}
