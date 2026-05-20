/**
 * @file app/(marketing)/book-demo/page.tsx
 * @description Unified high-converting lead capture — placeholder.
 */

import type { Metadata } from 'next';
import { MarketingPlaceholderPage } from '@/components/sypho-med/marketing/marketing-placeholder-page';

export const metadata: Metadata = {
  title: 'Book a Demo',
  description:
    'Schedule a private consultation or launch the instant interactive demo for Sypho Med.',
};

/**
 * Lead capture route — `/book-demo`
 */
export default function BookDemoPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Book demo"
      headline="See Sypho Med on your terms"
      description="Private consultation for clinic leadership teams, or jump straight into our frictionless instant demo — no sign-up required."
    />
  );
}
