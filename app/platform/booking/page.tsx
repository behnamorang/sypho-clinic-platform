/**
 * @file app/platform/booking/page.tsx
 * @description Platform booking feature deep dive — intelligent scheduling engine.
 */

import type { Metadata } from 'next';
import { BookingPlatformPage } from '@/components/sypho-med/platform/booking-platform-page';

export const metadata: Metadata = {
  title: 'Clinic Booking',
  description:
    'Cal.com-grade scheduling with multi-location calendars, doctor rotas, and automated No-Show Reduction for EU healthcare clinics.',
  openGraph: {
    title: 'Sypho Med · Clinic Booking',
    description: 'Intelligent scheduling and no-show reduction for premium clinics.',
    type: 'website',
  },
};

/**
 * Platform booking — `/platform/booking`
 */
export default function PlatformBookingPage() {
  return <BookingPlatformPage />;
}
