/**
 * @file components/sypho-med/features/autonomous-receptionist-section.tsx
 * @description Riley AI autonomous receptionist — Vapi + ElevenLabs voice integration showcase.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Phone,
  PhoneIncoming,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/sypho-med/motion/scroll-reveal';

const CALL_LOG = [
  {
    id: '1',
    line: 'Riley answered London Clinic Line',
    detail: 'Intent: new patient enquiry',
    time: '10:42:08',
    status: 'live' as const,
  },
  {
    id: '2',
    line: 'Verified NHS number · GDPR consent captured',
    detail: 'Voice fingerprint matched',
    time: '10:42:31',
    status: 'done' as const,
  },
  {
    id: '3',
    line: 'Booking confirmed for Dr. Smith',
    detail: 'Thursday 14:00 · Dermatology consult',
    time: '10:43:12',
    status: 'done' as const,
  },
  {
    id: '4',
    line: 'WhatsApp confirmation dispatched',
    detail: 'Cal.com slot synced to clinic calendar',
    time: '10:43:18',
    status: 'done' as const,
  },
];

const WAVEFORM_BARS = 32;

/**
 * Riley autonomous receptionist feature block.
 */
export function AutonomousReceptionistSection() {
  const [visibleLogs, setVisibleLogs] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleLogs((n) => (n >= CALL_LOG.length ? 1 : n + 1));
    }, 2800);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="autonomous"
      className="relative py-24 sm:py-32 overflow-hidden"
      aria-labelledby="autonomous-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian-50/30 to-obsidian"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 w-[480px] h-[480px] bg-neon-500/[0.06] blur-[100px] rounded-full -translate-y-1/2"
      />

      <motion.div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="max-w-2xl mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full med-glass text-xs text-neon-400/90 mb-5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Autonomous Receptionist
          </span>
          <h2
            id="autonomous-heading"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-5"
          >
            Riley answers every call like your best front desk — at scale
          </h2>
          <p className="text-base sm:text-lg text-silver-400 leading-relaxed">
            Powered by{' '}
            <span className="text-silver-200">Vapi</span> orchestration and{' '}
            <span className="text-silver-200">ElevenLabs</span> natural voice synthesis.
            Riley handles intake, triage, and booking — 24/7, in perfect clinic tone.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Waveform visual */}
          <ScrollReveal delay={0.1}>
            <div className="med-glass-strong rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-400 opacity-40" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-400" />
                  </span>
                  <span className="text-sm font-medium text-white">Live voice session</span>
                </div>
                <span className="text-[10px] text-silver-500 uppercase tracking-wider">
                  Vapi · ElevenLabs
                </span>
              </div>

              <div
                className="flex items-center justify-center gap-[3px] h-28 sm:h-36 mb-6"
                aria-hidden="true"
              >
                {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-neon-600/40 to-neon-400/90"
                    animate={{
                      height: ['20%', `${35 + Math.sin(i * 0.5) * 30 + 25}%`, '20%'],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2 + (i % 5) * 0.15,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.04,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-obsidian-300/50 border border-white/[0.06]">
                <div className="w-12 h-12 rounded-2xl bg-neon-500/15 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5 text-neon-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium">Riley · Voice AI</p>
                  <p className="text-xs text-silver-500 mt-0.5 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" aria-hidden="true" />
                    Natural prosody · clinic-trained persona
                  </p>
                </div>
                <Phone className="w-5 h-5 text-neon-400/60 shrink-0" aria-hidden="true" />
              </div>
            </div>
          </ScrollReveal>

          {/* Call log */}
          <ScrollReveal delay={0.15}>
            <motion.div className="med-glass rounded-3xl p-5 sm:p-6 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
                <PhoneIncoming className="w-4 h-4 text-neon-400" aria-hidden="true" />
                <h3 className="text-sm font-medium text-white">AI phone call log</h3>
                <span className="ml-auto text-[10px] text-silver-500 tabular-nums">
                  GMT · Live
                </span>
              </div>

              <ScrollRevealStagger className="space-y-3">
                {CALL_LOG.map((entry, index) => {
                  const show = index < visibleLogs;
                  return (
                    <ScrollRevealItem key={entry.id}>
                      <motion.div
                        layout
                        initial={false}
                        animate={{
                          opacity: show ? 1 : 0.25,
                          scale: show ? 1 : 0.98,
                        }}
                        className={[
                          'flex gap-3 p-3 rounded-xl border transition-colors',
                          show
                            ? 'border-neon-400/20 bg-neon-500/5'
                            : 'border-white/[0.04] bg-transparent',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'w-2 h-2 rounded-full mt-1.5 shrink-0',
                            entry.status === 'live' && show
                              ? 'bg-neon-400 animate-sypho-pulse'
                              : 'bg-silver-600',
                          ].join(' ')}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-silver-200">{entry.line}</p>
                          <p className="text-xs text-silver-500 mt-0.5">{entry.detail}</p>
                        </div>
                        <span className="text-[10px] text-silver-600 tabular-nums shrink-0">
                          {entry.time}
                        </span>
                      </motion.div>
                    </ScrollRevealItem>
                  );
                })}
              </ScrollRevealStagger>
            </motion.div>
          </ScrollReveal>
        </div>
      </motion.div>
    </section>
  );
}
