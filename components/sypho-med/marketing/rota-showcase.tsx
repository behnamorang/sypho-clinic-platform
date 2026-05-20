/**
 * @file components/sypho-med/marketing/rota-showcase.tsx
 * @description Doctor rota matrix and mobile confirmation preview for booking page.
 */

'use client';

import { Calendar, Check, Clock, Smartphone } from 'lucide-react';
import { ScrollReveal } from '@/components/sypho-med/motion/scroll-reveal';

const DOCTORS = ['Dr. Mitchell', 'Dr. Al-Rashid', 'Dr. Vogel'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

type SlotState = 'open' | 'booked' | 'break';

function slotClass(state: SlotState): string {
  if (state === 'open') return 'bg-neon-500/25 border-neon-400/30';
  if (state === 'booked') return 'bg-white/[0.08] border-white/[0.1]';
  return 'bg-obsidian-400/30 border-transparent';
}

function getSlotState(docIdx: number, dayIdx: number, slotIdx: number): SlotState {
  const hash = (docIdx + 1) * (dayIdx + 2) * (slotIdx + 3);
  if (hash % 7 === 0) return 'break';
  if (hash % 5 === 0) return 'booked';
  return 'open';
}

/**
 * Multi-location scheduling matrix with mobile confirmation mock.
 */
export function RotaShowcase() {
  return (
    <ScrollReveal delay={0.1}>
      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-3 med-glass-strong rounded-3xl p-4 sm:p-6 border border-white/[0.08] overflow-x-auto">
          <div className="flex items-center justify-between mb-4 min-w-[520px] sm:min-w-0">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neon-400" aria-hidden="true" />
              Multi-location rota matrix
            </h3>
            <span className="text-[10px] text-silver-500 flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              30-min clinical slots
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
                  <div key={day} className="grid grid-rows-3 gap-0.5">
                    {[0, 1, 2].map((slotIdx) => (
                      <div
                        key={slotIdx}
                        className={[
                          'h-3 sm:h-4 rounded-sm border',
                          slotClass(getSlotState(docIdx, dayIdx, slotIdx)),
                        ].join(' ')}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-silver-600 mt-4 flex flex-wrap gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-neon-500/25 border border-neon-400/30" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-white/10" />
              Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-obsidian-400/30" />
              Break
            </span>
          </p>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="w-[260px] rounded-[2rem] border-[3px] border-obsidian-400 bg-obsidian-100 p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)]">
            <div className="rounded-[1.5rem] bg-obsidian overflow-hidden">
              <div className="h-6 flex items-center justify-center bg-obsidian-200/80">
                <span className="w-8 h-1 rounded-full bg-obsidian-400" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-neon-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-white">Confirmed · WhatsApp</span>
                </div>
                <div className="rounded-xl bg-neon-500/10 border border-neon-400/20 p-3">
                  <p className="text-sm text-white font-medium">Consultation</p>
                  <p className="text-xs text-silver-400 mt-1">Dr. Mitchell · Thu 14:00</p>
                </div>
                <p className="text-[10px] text-silver-500 flex items-center gap-1">
                  <Check className="w-3 h-3 text-neon-400" aria-hidden="true" />
                  Reminder sequence armed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
