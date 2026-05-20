/**
 * @file app/book-demo/page.tsx
 * @description Multi-step private consultation booking — high-converting lead capture.
 */

import type { Metadata } from 'next';
import { ConsultationBookingForm } from '@/components/sypho-med/book-demo/consultation-booking-form';

export const metadata: Metadata = {
  title: 'Book a Private Consultation',
  description:
    'Request a bespoke Sypho Med consultation for your clinic. Secure onboarding with instant access to the live demo workspace.',
  openGraph: {
    title: 'Book a Private Consultation | Sypho Med',
    description: 'Luxury clinic operators — secure your bespoke workspace.',
    type: 'website',
  },
};

/**
 * Lead capture route — `/book-demo`
 */
export default function BookDemoPage() {
  return <ConsultationBookingForm />;
}
