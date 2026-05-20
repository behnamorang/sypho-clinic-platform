/**
 * @file components/sypho-med/demo/demo-workspace-page.tsx
 * @description Client wrapper for the standalone `/demo` instant workspace route.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MockDashboard } from '@/components/sypho-med/demo/mock-dashboard';
import {
  getConsultationLead,
  leadLocationToClinicPreset,
} from '@/lib/sypho-med/lead-storage';
import type { ClinicPresetId } from '@/lib/sypho-med/demo/types';

const DEFAULT_PRESET: ClinicPresetId = 'london';

/**
 * Full-screen mock dashboard with navigation back to marketing site.
 */
export function DemoWorkspacePage() {
  const router = useRouter();
  const [initialClinicId, setInitialClinicId] = useState<ClinicPresetId>(DEFAULT_PRESET);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const lead = getConsultationLead();
    if (lead) {
      setInitialClinicId(leadLocationToClinicPreset(lead.location));
    }
    setHydrated(true);
  }, []);

  const handleExit = useCallback(() => {
    router.push('/');
  }, [router]);

  if (!hydrated) {
    return (
      <div
        className="min-h-[100dvh] bg-[#050506] flex items-center justify-center"
        aria-busy="true"
        aria-label="Loading workspace"
      >
        <div className="w-8 h-8 rounded-full border-2 border-neon-400/30 border-t-neon-400 animate-spin" />
      </div>
    );
  }

  return (
    <MockDashboard onExitDemo={handleExit} initialClinicId={initialClinicId} />
  );
}
