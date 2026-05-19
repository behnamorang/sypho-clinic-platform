/**
 * @file components/sypho-med/features/scheduling-section.tsx
 * @description Cal.com-grade clinic scheduling preview — rota matrix & mobile confirm.
 */

'use client';

import { motion } from 'framer-motion';
import { Calendar, Check, Clock, Smartphone } from 'lucide-react';
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from '@/components/sypho-med/motion/scroll-reveal';

const DOCTORS = ['Dr. Mitchell', 'Dr. Al-Rashid', 'Dr. Vogel'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/** Slot states for the static rota matrix. */
type SlotState = 'open' | 'booked' | 'break';

function slotClass(state: SlotState): string {
  if (state === 'open') return 'bg-neon-500/25 border-neon-400/30';
  if (state === 'booked') return 'bg-white/[0.08] border-white/[0.1]';
  return 'bg-obsidian-400/30 border-transparent';
}

/** Deterministic demo rota pattern. */
function getSlotState(docIdx: number, dayIdx: number, slotIdx: number): SlotState {
  const hash = (docIdx + 1) * (dayIdx + 2) * (slotIdx + 3);
  if (hash % 7 === 0) return 'break';
  if (hash % 5 === 0) return 'booked';
  return 'open';
}

/**
 * Premium scheduling matrix and mobile confirmation preview.
 */
export function SchedulingSection() {
  return (
    <section
      id="booking"
      className="relative py-24 sm:py-32 overflow-hidden"
      aria-labelledby="booking-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="max-w-2xl mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full med-glass text-xs text-neon-400/90 mb-5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            Clinic Scheduling
          </span>
          <h2
            id="booking-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-5"
          >
            Cal.com-grade scheduling — built for clinical rotas
          </h2>
          <p className="text-base sm:text-lg text-silver-400 leading-relaxed">
            Doctor availability matrices, service-aware durations, and patient-friendly
            confirmations — responsive on every device your patients use.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Rota matrix */}
          <ScrollReveal className="lg:col-span-3" delay={0.05}>
            <div className="med-glass-strong rounded-3xl p-4 sm:p-6 border border-white/[0.08] overflow-x-auto">
              <div className="flex items-center justify-between mb-4 min-w-[520px] sm:min-w-0">
                <h3 className="text-sm font-medium text-white">Doctor rota matrix</h3>
                <span className="text-[10px] text-silver-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  30-min slots
                </span>
              </div>

              <div className="min-w-[520px] sm:min-w-full">
                <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1 mb-1">
                  <div />
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="text-[10px] text-center text-silver-500 py-1 uppercase tracking-wider"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {DOCTORS.map((doc, docIdx) => (
                  <div
                    key={doc}
                    className="grid grid-cols-[100px_repeat(5,1fr)] gap-1 mb-2"
                  >
                    <p className="text-xs text-silver-400 py-2 pr-2 truncate">{doc}</p>
                    {DAYS.map((day, dayIdx) => (
                      <motion.div
                        key={day}
                        className="grid grid-rows-3 gap-0.5"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: docIdx * 0.05 + dayIdx * 0.02 }}
                      >
                        {[0, 1, 2].map((slotIdx) => {
                          const state = getSlotState(docIdx, dayIdx, slotIdx);
                          return (
                            <motion.div
                              key={slotIdx}
                              className={[
                                'h-3 sm:h-4 rounded-sm border',
                                slotClass(state),
                              ].join(' ')}
                              title={state}
                            />
                          );
                        })}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/[0.06] text-[10px] text-silver-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-neon-500/25 border border-neon-400/30" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-white/10 border border-white/10" />
                  Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-obsidian-400/30" />
                  Break
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Mobile preview */}
          <ScrollReveal className="lg:col-span-2" delay={0.12}>
            <div className="flex flex-col items-center">
              <div className="w-[260px] sm:w-[280px] rounded-[2rem] border-[3px] border-obsidian-400 bg-obsidian-100 p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)]">
                <div className="rounded-[1.5rem] bg-obsidian overflow-hidden">
                  <div className="h-6 flex items-center justify-center gap-1 bg-obsidian-200/80">
                    <span className="w-8 h-1 rounded-full bg-obsidian-400" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-neon-400" aria-hidden="true" />
                      <span className="text-xs font-medium text-white">
                        Booking confirmed
                      </span>
                    </div>
                    <div className="rounded-xl bg-neon-500/10 border border-neon-400/20 p-3">
                      <p className="text-sm text-white font-medium">Dermatology consult</p>
                      <p className="text-xs text-silver-400 mt-1">Dr. Vogel</p>
                      <p className="text-xs text-neon-400/90 mt-2">Thu · 14:00 · 30 min</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-silver-500">
                      <Check className="w-3.5 h-3.5 text-neon-400" aria-hidden="true" />
                      Calendar invite sent · WhatsApp reminder scheduled
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-silver-500 mt-4 text-center max-w-[240px]">
                Patient confirmation preview — optimized for mobile completion rates
              </p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollRevealStagger className="grid sm:grid-cols-3 gap-4 mt-12" stagger={0.06}>
          {[
            { title: 'Service-aware slots', desc: 'Duration rules per appointment type' },
            { title: 'Multi-doctor rotas', desc: 'Parallel availability matrices' },
            { title: 'Instant confirm', desc: 'SMS, email & WhatsApp handoff' },
          ].map((item) => (
            <ScrollRevealItem key={item.title}>
              <div className="p-5 rounded-2xl med-glass border border-white/[0.05]">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-silver-500 mt-1">{item.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>
      </div>
    </section>
  );
}
