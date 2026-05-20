/**
 * @file components/sypho-med/features/whatsapp-crm-section.tsx
 * @description Unified marketing & WhatsApp CRM automation showcase.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  Megaphone,
  Mail,
  Workflow,
  UserPlus,
} from 'lucide-react';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/sypho-med/motion/scroll-reveal';
import { MedButton } from '@/components/sypho-med/med-button';

const CHANNELS = [
  { icon: MessageCircle, label: 'WhatsApp', active: true },
  { icon: Mail, label: 'Email', active: false },
  { icon: Megaphone, label: 'Campaigns', active: false },
] as const;

/**
 * Interactive WhatsApp → CRM pipeline demonstration.
 */
export function WhatsappCrmSection() {
  const [stage, setStage] = useState<'idle' | 'message' | 'crm'>('idle');
  const [hasPlayed, setHasPlayed] = useState(false);

  const runDemo = () => {
    setStage('message');
    setHasPlayed(true);
    window.setTimeout(() => setStage('crm'), 900);
  };

  return (
    <section
      id="workflows"
      className="relative py-24 sm:py-32"
      aria-labelledby="workflows-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full med-glass text-xs text-neon-400/90 mb-5">
            <Workflow className="w-3.5 h-3.5" aria-hidden="true" />
            Unified Marketing & CRM
          </span>
          <h2
            id="workflows-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-5"
          >
            WhatsApp conversations that become pipeline — instantly
          </h2>
          <p className="text-base sm:text-lg text-silver-400 leading-relaxed">
            Multi-channel intake, automated nurture, and CRM sync. Every inbound
            WhatsApp message can populate a lead card without manual data entry.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="med-glass-strong rounded-3xl p-5 sm:p-8 border border-white/[0.08] max-w-4xl mx-auto">
            {/* Channel tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CHANNELS.map(({ icon: Icon, label, active }) => (
                <span
                  key={label}
                  className={[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border',
                    active
                      ? 'bg-[#25D366]/15 text-[#25D366] border-[#25D366]/30'
                      : 'text-silver-500 border-white/[0.06] bg-obsidian-200/40',
                  ].join(' ')}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Incoming message */}
              <div className="rounded-2xl bg-obsidian-300/40 border border-white/[0.06] p-4 min-h-[220px] flex flex-col">
                <p className="text-[10px] uppercase tracking-wider text-silver-500 mb-3">
                  Incoming WhatsApp
                </p>
                <AnimatePresence mode="wait">
                  {stage === 'idle' && !hasPlayed && (
                    <motion.p
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-silver-500 flex-1 flex items-center justify-center text-center px-4"
                    >
                      Tap below to simulate an inbound patient message
                    </motion.p>
                  )}
                  {(stage === 'message' || stage === 'crm') && (
                    <motion.div
                      key="msg"
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="max-w-[90%] rounded-2xl rounded-tl-sm bg-obsidian-200/80 px-3 py-2.5 text-sm text-silver-200 border border-white/[0.06]"
                    >
                      Hi — I&apos;d like to book a dermatology consult next week. Is
                      Thursday available?
                      <p className="text-[10px] text-silver-600 mt-1 text-right">10:44</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mini pipeline */}
              <div className="rounded-2xl bg-obsidian-300/40 border border-white/[0.06] p-4 min-h-[220px]">
                <p className="text-[10px] uppercase tracking-wider text-silver-500 mb-3">
                  CRM · New Leads
                </p>
                <div className="rounded-xl border border-dashed border-white/10 p-3 min-h-[140px] relative">
                  <AnimatePresence>
                    {stage === 'crm' && (
                      <motion.div
                        key="card"
                        initial={{ opacity: 0, x: 24, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        className="med-glass rounded-xl p-3 border border-neon-400/25 shadow-[0_0_24px_-8px_rgba(34,211,238,0.35)]"
                      >
                        <motion.div className="flex items-center gap-2 mb-2">
                          <UserPlus className="w-4 h-4 text-neon-400" aria-hidden="true" />
                          <span className="text-xs font-medium text-white">
                            New lead · WhatsApp
                          </span>
                        </motion.div>
                        <p className="text-sm text-silver-300">Emma Richardson</p>
                        <p className="text-xs text-silver-500 mt-0.5">
                          Dermatology consult · Thursday intent
                        </p>
                        <p className="text-[10px] text-neon-400/80 mt-2 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                          Auto-assigned to Riley follow-up
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {stage !== 'crm' && (
                    <p className="text-xs text-silver-600 text-center absolute inset-0 flex items-center justify-center">
                      Awaiting sync…
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <MedButton
                variant="secondary"
                size="md"
                onClick={runDemo}
                disabled={stage === 'message'}
              >
                {hasPlayed ? 'Replay automation' : 'Simulate inbound message'}
              </MedButton>
            </div>
          </div>
        </ScrollReveal>

        <ScrollRevealStagger className="grid sm:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto">
          {[
            'Multi-channel capture',
            'Workflow automations',
            'Pipeline auto-stage',
          ].map((label) => (
            <ScrollRevealItem key={label}>
              <motion.div className="text-center p-4 rounded-xl med-glass border border-white/[0.05]">
                <p className="text-sm text-silver-300">{label}</p>
              </motion.div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>
      </div>
    </section>
  );
}
