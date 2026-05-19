/**
 * @file components/sypho-med/features/trust-section.tsx
 * @description Global trust, compliance, and regional performance footnote.
 */

'use client';

import {
  Globe,
  Lock,
  Server,
  Shield,
  Timer,
} from 'lucide-react';
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from '@/components/sypho-med/motion/scroll-reveal';
import { MedButton } from '@/components/sypho-med/med-button';

const REGIONS = [
  {
    flag: '🇬🇧',
    name: 'United Kingdom',
    tz: 'GMT / BST',
    metric: '99.95% uptime SLA',
    detail: 'EU-West data residency · NHS-ready workflows',
  },
  {
    flag: '🇴🇲',
    name: 'GCC · Oman',
    tz: 'GST',
    metric: '< 120ms regional latency',
    detail: 'Arabic & English intake · premium clinic ops',
  },
] as const;

const COMPLIANCE = [
  { icon: Shield, label: 'GDPR Article 32 controls' },
  { icon: Lock, label: 'End-to-end TLS 1.3' },
  { icon: Server, label: 'EU-hosted infrastructure' },
  { icon: Timer, label: 'Immutable audit trails' },
] as const;

export interface TrustSectionProps {
  onLaunchDemo?: () => void;
  onBookConsultation?: () => void;
}

/**
 * Elite trust footnote for UK & GCC clinic operators.
 */
export function TrustSection({
  onLaunchDemo,
  onBookConsultation,
}: TrustSectionProps) {
  return (
    <section
      id="platform"
      className="relative py-24 sm:py-28 border-t border-white/[0.06]"
      aria-labelledby="platform-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full med-glass text-xs text-silver-400 mb-5">
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            Built for elite clinics
          </span>
          <h2
            id="platform-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white mb-4"
          >
            Enterprise performance. Regulated by design.
          </h2>
          <p className="text-sm sm:text-base text-silver-500 leading-relaxed">
            Sypho Med is architected for high-performance clinics operating across
            the UK and GCC — with data minimization, tenant isolation, and
            compliance-ready auditability at the core.
          </p>
        </ScrollReveal>

        <ScrollRevealStagger className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
          {REGIONS.map((region) => (
            <ScrollRevealItem key={region.name}>
              <div className="med-glass-strong rounded-2xl p-5 sm:p-6 border border-white/[0.06] h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl" aria-hidden="true">
                    {region.flag}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{region.name}</p>
                    <p className="text-[10px] text-silver-500">{region.tz}</p>
                  </div>
                </div>
                <p className="text-lg font-medium text-neon-400/90 tabular-nums">
                  {region.metric}
                </p>
                <p className="text-xs text-silver-500 mt-2 leading-relaxed">
                  {region.detail}
                </p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>

        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-14">
            {COMPLIANCE.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-xs text-silver-500"
              >
                <Icon className="w-3.5 h-3.5 text-neon-400/70" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="text-center">
          <div className="med-glass rounded-2xl p-8 sm:p-10 border border-white/[0.06] max-w-xl mx-auto">
            <p className="text-sm text-silver-400 mb-6">
              Experience the full autonomous stack — no sign-up, no sales call required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <MedButton variant="primary" size="lg" onClick={onLaunchDemo}>
                Launch Instant Demo
              </MedButton>
              <MedButton variant="secondary" size="lg" onClick={onBookConsultation}>
                Book Private Consultation
              </MedButton>
            </div>
          </div>
          <p className="text-[10px] text-silver-600 mt-8 max-w-md mx-auto leading-relaxed">
            Sypho Med processes health-related data in accordance with GDPR. Demo
            mode uses simulated data only — no personal information is collected on
            this marketing experience.
          </p>
        </ScrollReveal>
      </div>

      <footer className="mt-16 pt-8 border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-silver-600">
          <p>&copy; {new Date().getFullYear()} Sypho Med. All rights reserved.</p>
          <p>EU · UK · GCC clinic operations platform</p>
        </div>
      </footer>
    </section>
  );
}
