/**
 * @file app/(marketing)/pricing/page.tsx
 * @description Premium single-tier pricing — placeholder.
 */

import type { Metadata } from 'next';
import { MarketingPlaceholderPage } from '@/components/sypho-med/marketing/marketing-placeholder-page';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Transparent, premium pricing for high-performance clinics. One tier designed for autonomous operations at scale.',
};

/**
 * Pricing route — `/pricing`
 */
export default function PricingPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Pricing"
      headline="One premium tier. Zero compromise."
      description="A single, clinic-grade plan built for autonomous reception, unified CRM, and Cal.com-grade scheduling — priced for elite operators who value clarity over complexity."
    />
  );
}
