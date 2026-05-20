/**
 * @file components/sypho-med/book-demo/trust-card.tsx
 * @description Trust side panel for the consultation booking experience.
 */

'use client';

import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';

const NEXT_STEPS = [
  {
    step: '1',
    title: 'Tailored Diagnostics',
    body: 'We analyze your specific clinic workflows.',
  },
  {
    step: '2',
    title: 'Concierge Setup',
    body: 'Custom deployment plan mapping to your location (£ / OMR).',
  },
] as const;

/**
 * Desktop trust panel with process summary and testimonial.
 */
export function TrustCard() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="lg:sticky lg:top-28 rounded-3xl p-6 sm:p-8 border border-white/[0.06] bg-gradient-to-b from-obsidian-100/60 to-obsidian-50/30"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-neon-400" aria-hidden="true" />
        <p className="text-xs uppercase tracking-[0.18em] text-neon-400/80">
          What happens next
        </p>
      </div>

      <ol className="space-y-5 mb-8">
        {NEXT_STEPS.map((item) => (
          <li key={item.step} className="flex gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-neon-500/10 text-neon-400 text-sm font-medium shrink-0 border border-neon-400/15">
              {item.step}
            </span>
            <div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-silver-500 mt-1 leading-relaxed">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="relative rounded-2xl p-5 bg-obsidian-200/40 border border-white/[0.05]">
        <Quote
          className="w-5 h-5 text-neon-400/40 absolute top-4 left-4"
          aria-hidden="true"
        />
        <blockquote className="pl-8">
          <p className="text-sm text-silver-300 leading-relaxed italic">
            Sypho Med replaced three disconnected tools. Our aesthetic center now runs
            on one calm, premium operating layer — bookings up, no-shows down.
          </p>
          <footer className="mt-4 text-xs text-silver-500 not-italic">
            — Director of Operations, Premium Aesthetic Center · Muscat
          </footer>
        </blockquote>
      </div>
    </motion.aside>
  );
}
