/**
 * @file components/sypho-med/hero-section.tsx
 * @description Cinematic hero for Sypho Med — headline, CTAs, and floating dashboard mockup.
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { MedButton } from '@/components/sypho-med/med-button';
import { HeroDashboardMockup } from '@/components/sypho-med/hero-dashboard-mockup';

export interface HeroSectionProps {
  onLaunchDemo?: () => void;
  onBookConsultation?: () => void;
}

const STAGGER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Full-viewport hero with premium typography and motion.
 */
export function HeroSection({
  onLaunchDemo,
  onBookConsultation,
}: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20"
      aria-labelledby="hero-heading"
    >
      {/* Background layers */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-obsidian"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-med-radial"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-med-grid bg-med-grid opacity-40"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-neon-500/[0.07] blur-[120px] rounded-full"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={STAGGER}
          initial="hidden"
          animate="show"
        >
          {/* Copy column */}
          <div className="text-center lg:text-left">
            <motion.div variants={ITEM}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full med-glass text-xs text-silver-300 mb-6 sm:mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-sypho-pulse" aria-hidden="true" />
                Phase 2 — Autonomous clinic OS
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={ITEM}
              className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-semibold leading-[1.08] tracking-[-0.03em] med-text-gradient mb-6"
            >
              The Autonomous Operating System for High-Performance Clinics
            </motion.h1>

            <motion.p
              variants={ITEM}
              className="text-base sm:text-lg text-silver-400 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 sm:mb-10"
            >
              Sypho Med orchestrates voice AI reception, unified patient
              communications, and intelligent scheduling — so your clinic runs
              with calm, enterprise-grade precision.
            </motion.p>

            <motion.div
              variants={ITEM}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <MedButton
                variant="primary"
                size="lg"
                onClick={onLaunchDemo}
                className="group"
              >
                <Play
                  className="w-4 h-4 text-obsidian fill-obsidian"
                  aria-hidden="true"
                />
                Launch Instant Demo
                <ArrowRight
                  className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </MedButton>
              <MedButton
                variant="secondary"
                size="lg"
                onClick={onBookConsultation}
              >
                Book Private Consultation
              </MedButton>
            </motion.div>

            <motion.p
              variants={ITEM}
              className="mt-6 text-xs text-silver-500"
            >
              No sign-up required for the instant demo · GDPR-ready EU infrastructure
            </motion.p>
          </div>

          {/* Mockup column */}
          <motion.div variants={ITEM} className="relative lg:pl-4">
            <HeroDashboardMockup />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-obsidian to-transparent"
      />
    </section>
  );
}
