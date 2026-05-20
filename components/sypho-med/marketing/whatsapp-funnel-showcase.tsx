/**
 * @file components/sypho-med/marketing/whatsapp-funnel-showcase.tsx
 * @description WhatsApp inquiry-to-booking funnel visual for aesthetic clinics page.
 */

'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  MessageCircle,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { ScrollReveal } from '@/components/sypho-med/motion/scroll-reveal';

const FUNNEL_STEPS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp inquiry',
    detail: 'Patient asks about treatment availability',
    accent: 'text-[#25D366]',
    bg: 'bg-[#25D366]/15 border-[#25D366]/25',
  },
  {
    icon: Sparkles,
    label: 'Riley qualifies',
    detail: 'AI captures intent, budget band, preferred clinician',
    accent: 'text-neon-400',
    bg: 'bg-neon-500/10 border-neon-400/20',
  },
  {
    icon: UserPlus,
    label: 'CRM card created',
    detail: 'Lead staged in pipeline with treatment tags',
    accent: 'text-neon-400',
    bg: 'bg-neon-500/10 border-neon-400/20',
  },
  {
    icon: Calendar,
    label: 'Booking confirmed',
    detail: 'Cal.com-style slot locked · deposit optional',
    accent: 'text-neon-400',
    bg: 'bg-neon-500/10 border-neon-400/20',
  },
] as const;

/**
 * Horizontal funnel showing WhatsApp-to-booking conversion path.
 */
export function WhatsappFunnelShowcase() {
  return (
    <ScrollReveal delay={0.1}>
      <div className="med-glass-strong rounded-3xl p-6 sm:p-10 border border-white/[0.08]">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-2">
            Conversion architecture
          </p>
          <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
            Inquiry to confirmed booking — one continuous flow
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FUNNEL_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative"
              >
                <div
                  className={[
                    'rounded-2xl p-4 border h-full',
                    step.bg,
                  ].join(' ')}
                >
                  <Icon className={`w-5 h-5 mb-3 ${step.accent}`} aria-hidden="true" />
                  <p className="text-sm font-medium text-white">{step.label}</p>
                  <p className="text-xs text-silver-500 mt-1 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
                {index < FUNNEL_STEPS.length - 1 && (
                  <ArrowRight
                    className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-600 z-10"
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4 bg-obsidian-300/40 border border-white/[0.05]">
            <p className="text-2xl font-semibold text-neon-400/90">+34%</p>
            <p className="text-xs text-silver-500 mt-1">
              Avg. inquiry-to-booking uplift · London aesthetic cohort
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-obsidian-300/40 border border-white/[0.05]">
            <p className="text-2xl font-semibold text-neon-400/90">-41%</p>
            <p className="text-xs text-silver-500 mt-1">
              No-show reduction · Muscat wellness centers
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
