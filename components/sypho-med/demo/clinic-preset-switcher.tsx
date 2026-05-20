/**
 * @file components/sypho-med/demo/clinic-preset-switcher.tsx
 * @description Global clinic preset toggle — London, Muscat, Berlin, Amsterdam.
 */

'use client';

import { motion } from 'framer-motion';
import { useDemo, CLINIC_PRESET_ORDER } from '@/components/sypho-med/demo/demo-context';
import { getClinicPreset } from '@/lib/sypho-med/demo/clinic-presets';
import type { ClinicPresetId } from '@/lib/sypho-med/demo/types';

const FLAG_EMOJI: Record<ClinicPresetId, string> = {
  london: '🇬🇧',
  muscat: '🇴🇲',
  berlin: '🇩🇪',
  amsterdam: '🇳🇱',
};

/**
 * Segmented control for switching active clinic context.
 */
export function ClinicPresetSwitcher() {
  const { clinicId, setClinicId } = useDemo();

  return (
    <motion.div
      layout
      className="flex flex-wrap gap-1 p-1 rounded-xl bg-obsidian-200/80 border border-white/[0.06]"
      role="tablist"
      aria-label="Clinic location"
    >
      {CLINIC_PRESET_ORDER.map((id) => {
        const preset = getClinicPreset(id);
        const active = clinicId === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setClinicId(id)}
            className={[
              'relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              active
                ? 'text-white'
                : 'text-silver-400 hover:text-silver-200',
            ].join(' ')}
          >
            {active && (
              <motion.span
                layoutId="clinic-preset-active"
                className="absolute inset-0 rounded-lg bg-neon-500/20 border border-neon-400/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10" aria-hidden="true">
              {FLAG_EMOJI[id]}
            </span>
            <span className="relative z-10">{preset.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
