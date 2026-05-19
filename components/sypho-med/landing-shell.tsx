/**
 * @file components/sypho-med/landing-shell.tsx
 * @description Client shell for Sypho Med — landing ↔ instant demo transitions.
 */

'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SyphoMedHeader } from '@/components/sypho-med/header';
import { HeroSection } from '@/components/sypho-med/hero-section';
import { DemoPlaceholder } from '@/components/sypho-med/demo-placeholder';

type ViewMode = 'landing' | 'demo';

/**
 * Root client experience: cinematic landing with one-click demo entry.
 */
export function LandingShell() {
  const [view, setView] = useState<ViewMode>('landing');

  const launchDemo = useCallback(() => {
    setView('demo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const exitDemo = useCallback(() => {
    setView('landing');
  }, []);

  const bookConsultation = useCallback(() => {
    window.open('mailto:hello@sypho.io?subject=Sypho%20Med%20Private%20Consultation', '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="min-h-[100dvh] bg-obsidian text-white antialiased">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
          >
            <SyphoMedHeader
              onLaunchDemo={launchDemo}
              onBookConsultation={bookConsultation}
            />
            <main>
              <HeroSection
                onLaunchDemo={launchDemo}
                onBookConsultation={bookConsultation}
              />
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="demo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <DemoPlaceholder onExitDemo={exitDemo} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
