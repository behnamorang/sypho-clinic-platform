/**
 * @file components/sypho-med/features/landing-features.tsx
 * @description Composed feature sections below the hero on the Sypho Med landing page.
 */

'use client';

import { AutonomousReceptionistSection } from '@/components/sypho-med/features/autonomous-receptionist-section';
import { WhatsappCrmSection } from '@/components/sypho-med/features/whatsapp-crm-section';
import { SchedulingSection } from '@/components/sypho-med/features/scheduling-section';
import { TrustSection } from '@/components/sypho-med/features/trust-section';

export interface LandingFeaturesProps {
  onLaunchDemo?: () => void;
  onBookConsultation?: () => void;
}

/**
 * Sequential high-converting feature blocks beneath the hero.
 */
export function LandingFeatures({
  onLaunchDemo,
  onBookConsultation,
}: LandingFeaturesProps) {
  return (
    <>
      <AutonomousReceptionistSection />
      <WhatsappCrmSection />
      <SchedulingSection />
      <TrustSection
        {...(onLaunchDemo !== undefined ? { onLaunchDemo } : {})}
        {...(onBookConsultation !== undefined ? { onBookConsultation } : {})}
      />
    </>
  );
}
