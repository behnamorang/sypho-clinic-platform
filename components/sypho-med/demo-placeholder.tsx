/**
 * @file components/sypho-med/demo-placeholder.tsx
 * @description Temporary shell shown after one-click demo — full dashboard ships next.
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SyphoMedLogo } from '@/components/sypho-med/logo';
import { MedButton } from '@/components/sypho-med/med-button';

export interface DemoPlaceholderProps {
  onExitDemo: () => void;
}

/**
 * Placeholder while the interactive mock dashboard is built out.
 */
export function DemoPlaceholder({ onExitDemo }: DemoPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[100dvh] bg-obsidian flex flex-col"
    >
      <div className="border-b border-white/[0.06] med-glass px-4 sm:px-6 h-16 flex items-center justify-between">
        <SyphoMedLogo size="md" />
        <MedButton variant="ghost" size="sm" onClick={onExitDemo}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to site
        </MedButton>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center max-w-md"
        >
          <p className="text-sm text-neon-400/90 mb-3 tracking-wide uppercase">
            Instant demo
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium text-white mb-3 tracking-tight">
            Interactive dashboard loading
          </h2>
          <p className="text-silver-400 text-sm leading-relaxed">
            CRM pipeline, booking calendar, and live analytics — all running on
            client-side state with London, Muscat, Berlin, and Amsterdam presets.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
