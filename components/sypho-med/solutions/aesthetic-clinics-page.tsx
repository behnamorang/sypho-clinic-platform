/**
 * @file components/sypho-med/solutions/aesthetic-clinics-page.tsx
 * @description Primary vertical solution page — premium aesthetic & wellness centers.
 */

'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Crown,
  Globe2,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { MarketingSiteHeader } from '@/components/sypho-med/marketing/marketing-site-header';
import { MarketingPageHero } from '@/components/sypho-med/marketing/marketing-page-hero';
import { FeaturePillarGrid } from '@/components/sypho-med/marketing/feature-pillar-grid';
import { WhatsappFunnelShowcase } from '@/components/sypho-med/marketing/whatsapp-funnel-showcase';
import { KanbanShowcase } from '@/components/sypho-med/marketing/kanban-showcase';
import { MarketingCtaBand } from '@/components/sypho-med/marketing/marketing-cta-band';
import { ScrollReveal } from '@/components/sypho-med/motion/scroll-reveal';

const AESTHETIC_PILLARS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp-first acquisition',
    description:
      'Capture high-intent inquiries where your patients already are — Riley responds in seconds, qualifies treatment interest, and never leaves a thread unanswered.',
  },
  {
    icon: Sparkles,
    title: 'Autonomous reception (Riley)',
    description:
      'Voice and chat AI handles after-hours enquiries, pricing questions, and clinician preferences — escalating only when human judgment is required.',
  },
  {
    icon: TrendingUp,
    title: 'Inquiry-to-booking automation',
    description:
      'From first message to confirmed slot in one flow — CRM card creation, deposit collection, and calendar lock without copy-paste between tools.',
  },
  {
    icon: Crown,
    title: 'Premium brand experience',
    description:
      'Obsidian UI, micro-glow accents, and calm typography signal the same luxury your patients expect in the treatment room.',
  },
  {
    icon: Globe2,
    title: 'London & Muscat ready',
    description:
      'Dual-currency pricing, GCC and UK compliance posture, and multi-location rotas for Harley Street suites and Muscat wellness campuses.',
  },
  {
    icon: Wallet,
    title: 'High-ticket revenue protection',
    description:
      'Pipeline value bands, deposit workflows, and no-show recovery tuned for aesthetic procedures — not generic GP visit volumes.',
  },
] as const;

const MARKET_BADGES = [
  { city: 'London', detail: 'Harley Street · Mayfair · Chelsea aesthetic cohorts' },
  { city: 'Muscat', detail: 'Premium wellness · cosmetic surgery · med-spa groups' },
] as const;

/**
 * Aesthetic clinics vertical — `/solutions/aesthetic-clinics`
 */
export function AestheticClinicsPage() {
  return (
    <div className="min-h-[100dvh] bg-obsidian flex flex-col">
      <MarketingSiteHeader />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <MarketingPageHero
            eyebrow="Solutions · Aesthetic clinics"
            headline="The operating system for London and Muscat's finest aesthetic centers"
            description="Sypho Med is the custom clinic OS for premium aesthetic and wellness operators — automated WhatsApp inquiry-to-booking conversions, autonomous reception, and a pipeline your concierge team will actually use."
            primaryCta="Book Private Consultation"
            secondaryCta="View pricing"
            secondaryHref="/pricing"
          />

          <ScrollReveal className="mb-12 sm:mb-16">
            <div className="grid sm:grid-cols-2 gap-4">
              {MARKET_BADGES.map((badge) => (
                <div
                  key={badge.city}
                  className="rounded-2xl p-5 sm:p-6 border border-white/[0.08] med-glass"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-2">
                    {badge.city}
                  </p>
                  <p className="text-sm text-silver-300 leading-relaxed">
                    {badge.detail}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <FeaturePillarGrid pillars={[...AESTHETIC_PILLARS]} />

          <section className="mt-16 sm:mt-24" aria-labelledby="whatsapp-funnel-heading">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-3">
                Core conversion engine
              </p>
              <h2
                id="whatsapp-funnel-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-4"
              >
                WhatsApp inquiry to confirmed booking — fully automated
              </h2>
              <p className="text-sm sm:text-base text-silver-400 leading-relaxed">
                Your highest-value patients start on WhatsApp. Sypho Med turns every
                thread into a qualified lead, a CRM card, and a locked calendar slot —
                without your front desk living in three different apps.
              </p>
            </ScrollReveal>

            <WhatsappFunnelShowcase />
          </section>

          <section className="mt-16 sm:mt-24" aria-labelledby="aesthetic-pipeline-heading">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <h2
                id="aesthetic-pipeline-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-4"
              >
                One calm workspace for pipeline, bookings, and inbox
              </h2>
              <p className="text-sm sm:text-base text-silver-400 leading-relaxed">
                The same premium dashboard your team previews in demo — Kanban stages,
                Riley inbox, and surgeon rotas unified under your brand.
              </p>
            </ScrollReveal>

            <KanbanShowcase />
          </section>

          <section className="mt-16 sm:mt-24" aria-labelledby="aesthetic-os-heading">
            <ScrollReveal className="rounded-3xl p-8 sm:p-10 border border-white/[0.08] med-glass-strong text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-3">
                Why operators switch
              </p>
              <h2
                id="aesthetic-os-heading"
                className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-4"
              >
                Replace fragmented tools with one clinical-grade OS
              </h2>
              <p className="text-sm text-silver-400 leading-relaxed max-w-2xl mx-auto mb-8">
                Calendars, CRM spreadsheets, WhatsApp Business, and legacy PMS systems
                were never designed for high-ticket aesthetic workflows. Sypho Med
                unifies them — EU-hosted, tenant-isolated, and built for operators who
                refuse to compromise on patient experience.
              </p>
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-sm font-medium bg-white text-obsidian hover:bg-silver-100 transition-colors shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]"
              >
                Book Private Consultation
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </ScrollReveal>
          </section>

          <MarketingCtaBand
            headline="Your bespoke workspace is one consultation away"
            description="Tell us about your London or Muscat operation — we configure Riley, your pipeline stages, and WhatsApp flows before you leave the call."
          />
        </div>
      </main>
    </div>
  );
}
