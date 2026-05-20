/**
 * @file app/solutions/aesthetic-clinics/page.tsx
 * @description Vertical solution page for premium aesthetic and wellness centers.
 */

import type { Metadata } from 'next';
import { AestheticClinicsPage } from '@/components/sypho-med/solutions/aesthetic-clinics-page';

export const metadata: Metadata = {
  title: 'Aesthetic Clinics',
  description:
    'Sypho Med for aesthetic and wellness centers in London and Muscat — WhatsApp inquiry-to-booking automation, autonomous reception, and premium CRM.',
  openGraph: {
    title: 'Sypho Med · Aesthetic Clinics',
    description: 'The custom operating system for premium aesthetic centers.',
    type: 'website',
  },
};

/**
 * Solutions vertical — `/solutions/aesthetic-clinics`
 */
export default function AestheticClinicsSolutionPage() {
  return <AestheticClinicsPage />;
}
