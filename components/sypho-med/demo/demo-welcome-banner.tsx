/**
 * @file components/sypho-med/demo/demo-welcome-banner.tsx
 * @description Welcome banner after consultation form handoff to demo workspace.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import {
  getConsultationLead,
  type StoredConsultationLead,
} from '@/lib/sypho-med/lead-storage';

/**
 * Displays personalized workspace welcome when a consultation lead exists.
 */
export function DemoWelcomeBanner() {
  const [lead, setLead] = useState<StoredConsultationLead | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getConsultationLead();
    if (stored) {
      setLead(stored);
      setVisible(true);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && lead !== null && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="shrink-0 border-b border-neon-400/15 bg-neon-500/5"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-neon-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-silver-300 flex-1 leading-relaxed">
              <span className="text-white font-medium">{lead.clinicName}</span>
              {' '}workspace ready — profile logged for{' '}
              <span className="text-neon-400/90">{lead.fullName}</span>.
              Explore the live environment below.
            </p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="p-1 text-silver-500 hover:text-white rounded-lg transition-colors shrink-0"
              aria-label="Dismiss welcome message"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
