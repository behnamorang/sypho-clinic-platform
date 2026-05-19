/**
 * @file app/page.tsx
 * @description Sypho Med marketing home — premium cinematic landing with one-click demo.
 *
 * Replaces the legacy auth redirect. Authenticated users can still access
 * `/dashboard` directly; the home page is a public marketing surface.
 */

import type { Metadata } from 'next';
import { LandingShell } from '@/components/sypho-med/landing-shell';

export const metadata: Metadata = {
  title: 'Sypho Med — Autonomous Operating System for Clinics',
  description:
    'Premium clinic operations platform with voice AI reception, unified inbox, and intelligent scheduling for high-performance EU clinics.',
  openGraph: {
    title: 'Sypho Med',
    description:
      'The autonomous operating system for high-performance clinics.',
    type: 'website',
  },
};

/**
 * Public marketing landing — client shell handles demo transition.
 */
export default function HomePage() {
  return <LandingShell />;
}
