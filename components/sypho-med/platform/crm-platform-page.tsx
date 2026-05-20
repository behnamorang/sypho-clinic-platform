/**
 * @file components/sypho-med/platform/crm-platform-page.tsx
 * @description Full marketing deep dive — Medical CRM, pipeline, and client cards.
 */

'use client';

import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Layers,
  Shield,
  Stethoscope,
  Users,
  Workflow,
} from 'lucide-react';
import { MarketingSiteHeader } from '@/components/sypho-med/marketing/marketing-site-header';
import { MarketingPageHero } from '@/components/sypho-med/marketing/marketing-page-hero';
import { FeaturePillarGrid } from '@/components/sypho-med/marketing/feature-pillar-grid';
import { KanbanShowcase } from '@/components/sypho-med/marketing/kanban-showcase';
import { MarketingCtaBand } from '@/components/sypho-med/marketing/marketing-cta-band';
import { ScrollReveal } from '@/components/sypho-med/motion/scroll-reveal';

const CRM_PILLARS = [
  {
    icon: Layers,
    title: 'Stage-aware pipeline',
    description:
      'Kanban columns mirror your clinic journey — enquiry, consultation, treatment plan, and post-care — with drag-and-drop velocity your team feels instantly.',
  },
  {
    icon: FileText,
    title: 'Centralized client cards',
    description:
      'Every patient record unifies WhatsApp threads, treatment history, consent flags, and revenue bands in one GDPR-scoped card — no spreadsheet sprawl.',
  },
  {
    icon: Workflow,
    title: 'Autonomous stage progression',
    description:
      'Riley AI qualifies inbound leads and proposes stage moves; your coordinators approve with one tap while audit logs capture every transition.',
  },
  {
    icon: Stethoscope,
    title: 'Clinical context preserved',
    description:
      'Service tags, contraindications, and preferred clinicians travel with the card so front desk and practitioners share the same truth.',
  },
  {
    icon: Users,
    title: 'Multi-channel capture',
    description:
      'WhatsApp, web forms, and walk-ins converge into one tenant-isolated pipeline — zero cross-clinic leakage under RLS enforcement.',
  },
  {
    icon: Shield,
    title: 'EU-grade data isolation',
    description:
      'Per-clinic tenancy, immutable consent logs, and soft-delete retention align with GDPR Articles 5, 9, and 17 from day one.',
  },
] as const;

/**
 * Platform CRM marketing page — `/platform/crm`
 */
export function CrmPlatformPage() {
  return (
    <div className="min-h-[100dvh] bg-obsidian flex flex-col">
      <MarketingSiteHeader />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <MarketingPageHero
            eyebrow="Platform · CRM"
            headline="The medical CRM your front desk actually wants to open"
            description="Patient pipeline management, centralized client cards, and WhatsApp-native lead capture — orchestrated on a Kanban board that moves as fast as your clinic."
            secondaryCta="View pricing"
            secondaryHref="/pricing"
          />

          <FeaturePillarGrid pillars={[...CRM_PILLARS]} />

          <section className="mt-16 sm:mt-24" aria-labelledby="crm-kanban-heading">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-3">
                Visual pipeline
              </p>
              <h2
                id="crm-kanban-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-4"
              >
                See every lead, stage, and high-value case at a glance
              </h2>
              <p className="text-sm sm:text-base text-silver-400 leading-relaxed">
                The same Kanban engine powering your live demo — drag cards between
                stages, surface priority treatments, and keep revenue bands visible
                without leaving the board.
              </p>
            </ScrollReveal>

            <KanbanShowcase />

            <div className="mt-8 flex justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 text-sm text-neon-400/90 hover:text-neon-300 transition-colors"
              >
                Explore interactive demo
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="mt-16 sm:mt-24" aria-labelledby="crm-cards-heading">
            <ScrollReveal className="rounded-3xl p-8 sm:p-10 border border-white/[0.08] med-glass-strong">
              <h2
                id="crm-cards-heading"
                className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-4"
              >
                Client cards built for high-touch aesthetic operations
              </h2>
              <p className="text-sm text-silver-400 leading-relaxed max-w-3xl mb-6">
                Each card is a living dossier: treatment interest, deposit status,
                assigned clinician, and the full WhatsApp conversation thread. Your team
                never chases context across inboxes again.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-xs text-silver-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-400/80 shrink-0" />
                  Immutable consent and marketing preference flags
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-400/80 shrink-0" />
                  Revenue band and service tags on every card
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-400/80 shrink-0" />
                  Riley-suggested next actions with human approval
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-400/80 shrink-0" />
                  Full audit trail on every read and mutation
                </li>
              </ul>
            </ScrollReveal>
          </section>

          <MarketingCtaBand
            headline="Put your pipeline on clinical-grade rails"
            description="Book a private consultation and walk through your bespoke CRM workspace — configured for your stages, services, and team."
          />
        </div>
      </main>
    </div>
  );
}
