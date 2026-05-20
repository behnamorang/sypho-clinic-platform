/**
 * @file components/sypho-med/demo/demo-workspace-page.tsx
 * @description Client wrapper for the standalone `/demo` instant workspace route.
 */

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { MockDashboard } from '@/components/sypho-med/demo/mock-dashboard';
import {
  getConsultationLead,
  leadLocationToClinicPreset,
} from '@/lib/sypho-med/lead-storage';
import type { ClinicPresetId } from '@/lib/sypho-med/demo/types';

/**
 * Full-screen mock dashboard with navigation back to marketing site.
 */
export function DemoWorkspacePage() {
  const router = useRouter();

  const initialClinicId = useMemo((): ClinicPresetId => {
    const lead = getConsultationLead();
    if (lead) {
      return leadLocationToClinicPreset(lead.location);
    }
    return 'london';
  }, []);

  const handleExit = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <MockDashboard onExitDemo={handleExit} initialClinicId={initialClinicId} />
  );
}
