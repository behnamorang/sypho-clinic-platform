/**
 * @file app/(marketing)/platform/booking/page.tsx
 * @description Platform booking feature deep dive — placeholder.
 */

import type { Metadata } from 'next';
import { MarketingPlaceholderPage } from '@/components/sypho-med/marketing/marketing-placeholder-page';

export const metadata: Metadata = {
  title: 'Clinic Booking',
  description:
    'Cal.com-grade scheduling with doctor rotas, service-aware slots, and patient confirmations for EU healthcare clinics.',
};

/**
 * Platform booking — `/platform/booking`
 */
export default function PlatformBookingPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Platform · Booking"
      headline="Scheduling engineered for clinical rotas"
      description="Service durations, doctor availability matrices, and instant confirmations across WhatsApp, email, and calendar — designed for UK and GCC clinic operations."
    />
  );
}
