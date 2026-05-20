/**
 * @file app/(marketing)/platform/crm/page.tsx
 * @description Platform CRM feature deep dive — placeholder.
 */

import type { Metadata } from 'next';
import { MarketingPlaceholderPage } from '@/components/sypho-med/marketing/marketing-placeholder-page';

export const metadata: Metadata = {
  title: 'CRM Pipeline',
  description:
    'Kanban CRM pipeline with WhatsApp-native lead capture and autonomous stage progression for EU clinics.',
};

/**
 * Platform CRM — `/platform/crm`
 */
export default function PlatformCrmPage() {
  return (
    <MarketingPlaceholderPage
      eyebrow="Platform · CRM"
      headline="Pipeline that moves as fast as your front desk should"
      description="Drag-and-drop Kanban stages, multi-channel lead capture, and Riley-assisted qualification — scoped per clinic with full tenant isolation."
    />
  );
}
