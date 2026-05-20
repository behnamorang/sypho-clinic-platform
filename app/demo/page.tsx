/**
 * @file app/demo/page.tsx
 * @description Dedicated instant demo workspace — public mock dashboard entry.
 */

import type { Metadata } from 'next';
import { DemoWorkspacePage } from '@/components/sypho-med/demo/demo-workspace-page';

export const metadata: Metadata = {
  title: 'Live Workspace',
  description:
    'Interactive Sypho Med demo workspace — explore CRM, booking, and inbox without sign-up.',
  robots: { index: false, follow: false },
};

/**
 * Instant demo route — `/demo`
 */
export default function DemoPage() {
  return <DemoWorkspacePage />;
}
