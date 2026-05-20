/**
 * @file app/pricing/page.tsx
 * @description Premium single-tier pricing — Sypho Professional with dynamic AI add-ons.
 */

import type { Metadata } from 'next';
import { PricingModule } from '@/components/sypho-med/pricing/pricing-module';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Sypho Professional — single-tier clinic operations pricing for UK (£249/mo) and Oman/GCC (99 OMR/mo) with premium AI upgrades.',
  openGraph: {
    title: 'Sypho Med Pricing',
    description: 'One premium plan. Autonomous clinic infrastructure.',
    type: 'website',
  },
};

/**
 * Pricing route — `/pricing`
 */
export default function PricingPage() {
  return <PricingModule />;
}
