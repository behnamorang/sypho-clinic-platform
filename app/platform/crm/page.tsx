/**
 * @file app/platform/crm/page.tsx
 * @description Platform CRM feature deep dive — Medical CRM and pipeline management.
 */

import type { Metadata } from 'next';
import { CrmPlatformPage } from '@/components/sypho-med/platform/crm-platform-page';

export const metadata: Metadata = {
  title: 'CRM Pipeline',
  description:
    'Kanban CRM pipeline with WhatsApp-native lead capture, centralized client cards, and autonomous stage progression for EU clinics.',
  openGraph: {
    title: 'Sypho Med · Medical CRM',
    description: 'Patient pipeline management built for premium aesthetic clinics.',
    type: 'website',
  },
};

/**
 * Platform CRM — `/platform/crm`
 */
export default function PlatformCrmPage() {
  return <CrmPlatformPage />;
}
