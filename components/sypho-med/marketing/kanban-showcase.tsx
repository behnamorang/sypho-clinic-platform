/**
 * @file components/sypho-med/marketing/kanban-showcase.tsx
 * @description Static Kanban pipeline visual for CRM marketing page.
 */

'use client';

import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { ScrollReveal } from '@/components/sypho-med/motion/scroll-reveal';
import { PIPELINE_COLUMNS } from '@/lib/sypho-med/demo/clinic-presets';
import { getClinicPreset } from '@/lib/sypho-med/demo/clinic-presets';
import type { PipelineColumnId } from '@/lib/sypho-med/demo/types';

const SHOWCASE_PRESET = getClinicPreset('london');

/**
 * Decorative read-only Kanban board mirroring the live demo pipeline.
 */
export function KanbanShowcase() {
  const cardsByColumn = (columnId: PipelineColumnId) =>
    SHOWCASE_PRESET.pipelineCards.filter((c) => c.columnId === columnId);

  return (
    <ScrollReveal delay={0.08}>
      <div className="relative rounded-3xl p-5 sm:p-8 border border-white/[0.08] med-glass-strong overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-0 w-80 h-80 bg-neon-500/[0.06] blur-[80px] rounded-full"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-1">
              Live pipeline view
            </p>
            <h3 className="text-lg sm:text-xl font-medium text-white">
              Medical CRM · Kanban stages
            </h3>
          </div>
          <p className="text-xs text-silver-500">{SHOWCASE_PRESET.city} clinic preview</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {PIPELINE_COLUMNS.map((column, colIndex) => {
            const cards = cardsByColumn(column.id);
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: colIndex * 0.08, duration: 0.45 }}
                className={[
                  'flex-shrink-0 w-[min(100%,260px)] snap-center rounded-2xl p-3 min-h-[320px]',
                  'bg-gradient-to-b border border-white/[0.06]',
                  column.accent,
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-[10px] font-medium text-silver-300 uppercase tracking-wider">
                    {column.title}
                  </h4>
                  <span className="text-[10px] text-silver-600 tabular-nums">
                    {cards.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {cards.map((card, i) => (
                    <motion.li
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: colIndex * 0.06 + i * 0.04 }}
                      className={[
                        'rounded-xl p-3 med-glass border border-white/[0.08]',
                        card.priority === 'high' ? 'ring-1 ring-neon-400/15' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical
                          className="w-3 h-3 text-silver-600 shrink-0 mt-0.5 opacity-50"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {card.patientName}
                          </p>
                          <p className="text-[10px] text-silver-500 truncate mt-0.5">
                            {card.service}
                          </p>
                          <p className="text-[10px] text-neon-400/80 mt-1.5 tabular-nums">
                            {card.valueLabel}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
