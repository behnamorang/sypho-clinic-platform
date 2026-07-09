/**
 * @file components/sypho-med/landing-shell.tsx
 * @description Client shell for Sypho Med marketing home — routes instant demo to /showcase.
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SyphoMedHeader } from '@/components/sypho-med/header';
import { HeroSection } from '@/components/sypho-med/hero-section';
import { LandingFeatures } from '@/components/sypho-med/features/landing-features';

/**
 * Public marketing landing — "Launch Instant Demo" navigates to the clinic showcase.
 */
export function LandingShell() {
  const router = useRouter();

  const launchDemo = useCallback(() => {
    router.push('/showcase');
  }, [router]);

  const bookConsultation = useCallback(() => {
    window.open('mailto:hello@sypho.io?subject=Sypho%20Med%20Private%20Consultation', '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="min-h-[100dvh] bg-obsidian text-white antialiased">
      <SyphoMedHeader
        onLaunchDemo={launchDemo}
        onBookConsultation={bookConsultation}
      />
      <main>
        <HeroSection
          onLaunchDemo={launchDemo}
          onBookConsultation={bookConsultation}
        />
        <LandingFeatures
          onLaunchDemo={launchDemo}
          onBookConsultation={bookConsultation}
        />
      </main>
    </div>
  );
}
