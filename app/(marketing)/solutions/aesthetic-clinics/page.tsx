/**
 * @file app/(marketing)/solutions/aesthetic-clinics/page.tsx
 * @description Vertical solution page for aesthetic clinics — placeholder.
 */

import type { Metadata } from 'next';
import { MarketingPlaceholderPage } from '@/components/sypho-med/marketing/marketing-placeholder-page';

export const metadata: Metadata = {
  title: 'Aesthetic Clinics',
  description:
    'Sypho Med for aesthetic and cosmetic clinics — autonomous reception, WhatsApp CRM, and premium booking workflows.',
};

/**
 * Solutions vertical — `/solutions/aesthetic-clinics`
 */
export default function AestheticClinicsPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Solutions · Aesthetic clinics"
      headline="Built for high-touch aesthetic operations"
      description="From first WhatsApp enquiry to post-treatment follow-up — orchestrate voice AI, pipeline CRM, and surgeon rotas in one calm, premium workspace."
    />
  );
}
