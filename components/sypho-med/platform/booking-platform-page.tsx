/**
 * @file components/sypho-med/platform/booking-platform-page.tsx
 * @description Full marketing deep dive — intelligent scheduling and no-show reduction.
 */

'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { MarketingSiteHeader } from '@/components/sypho-med/marketing/marketing-site-header';
import { MarketingPageHero } from '@/components/sypho-med/marketing/marketing-page-hero';
import { FeaturePillarGrid } from '@/components/sypho-med/marketing/feature-pillar-grid';
import { RotaShowcase } from '@/components/sypho-med/marketing/rota-showcase';
import { MarketingCtaBand } from '@/components/sypho-med/marketing/marketing-cta-band';
import { ScrollReveal } from '@/components/sypho-med/motion/scroll-reveal';

const BOOKING_PILLARS = [
  {
    icon: CalendarClock,
    title: 'Service-aware scheduling',
    description:
      'Appointment types carry clinical durations, buffer rules, and resource requirements — slots only surface when the full care team is available.',
  },
  {
    icon: MapPin,
    title: 'Multi-location calendars',
    description:
      'London Harley Street and Muscat wellness suites run independent rotas under one tenant — unified reporting, isolated availability.',
  },
  {
    icon: Building2,
    title: 'Doctor rota matrices',
    description:
      'Per-practitioner availability grids with break blocks, double-booking guards, and instant overrides for emergency clinics.',
  },
  {
    icon: Bell,
    title: 'Intelligent reminder cadence',
    description:
      'WhatsApp, SMS, and email confirmations fire on a clinically tuned timeline — 72h, 24h, and 2h touchpoints before every visit.',
  },
  {
    icon: RefreshCw,
    title: 'No-show recovery loops',
    description:
      'Missed appointments trigger automated re-offer sequences, waitlist backfill, and deposit reconfirmation — revenue protected without manual chase.',
  },
  {
    icon: ShieldCheck,
    title: 'GDPR-safe confirmations',
    description:
      'Patient-facing messages respect consent granularity; every reminder and cancellation is logged to your immutable audit trail.',
  },
] as const;

const NO_SHOW_LAYERS = [
  {
    step: '01',
    title: 'Predict',
    detail: 'Historical no-show patterns inform risk scoring on new bookings.',
  },
  {
    step: '02',
    title: 'Confirm',
    detail: 'Multi-channel reminders with one-tap WhatsApp confirmation links.',
  },
  {
    step: '03',
    title: 'Recover',
    detail: 'Automated waitlist backfill and rebooking nudges within 15 minutes.',
  },
] as const;

/**
 * Platform booking marketing page — `/platform/booking`
 */
export function BookingPlatformPage() {
  return (
    <div className="min-h-[100dvh] bg-obsidian flex flex-col">
      <MarketingSiteHeader />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <MarketingPageHero
            eyebrow="Platform · Booking"
            headline="Intelligent scheduling that respects clinical reality"
            description="Multi-location calendar management, doctor rota matrices, and an automated No-Show Reduction framework — engineered for premium UK and GCC clinic operations."
            secondaryCta="View pricing"
            secondaryHref="/pricing"
          />

          <FeaturePillarGrid pillars={[...BOOKING_PILLARS]} />

          <section className="mt-16 sm:mt-24" aria-labelledby="booking-rota-heading">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-3">
                Scheduling engine
              </p>
              <h2
                id="booking-rota-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] med-text-gradient leading-tight mb-4"
              >
                Cal.com-grade depth — built for surgeon rotas
              </h2>
              <p className="text-sm sm:text-base text-silver-400 leading-relaxed">
                Visualize practitioner availability across locations, lock slots with
                service-aware durations, and push confirmations straight to patient
                WhatsApp — before they ever open a browser.
              </p>
            </ScrollReveal>

            <RotaShowcase />

            <div className="mt-8 flex justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 text-sm text-neon-400/90 hover:text-neon-300 transition-colors"
              >
                Try the booking wizard in demo
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section
            className="mt-16 sm:mt-24"
            aria-labelledby="no-show-framework-heading"
          >
            <ScrollReveal className="rounded-3xl p-8 sm:p-10 border border-white/[0.08] med-glass-strong overflow-hidden relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 bg-neon-500/[0.05] blur-[72px] rounded-full"
              />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neon-400/80 mb-3">
                  No-Show Reduction Framework
                </p>
                <h2
                  id="no-show-framework-heading"
                  className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-4"
                >
                  Three layers that protect chair time and revenue
                </h2>
                <p className="text-sm text-silver-400 leading-relaxed max-w-3xl mb-8">
                  Sypho Med does not send generic reminders. Our framework combines
                  predictive risk scoring, consent-aware multi-channel confirmations,
                  and automated recovery — the same system included in Sypho
                  Professional.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {NO_SHOW_LAYERS.map((layer) => (
                    <div
                      key={layer.step}
                      className="rounded-2xl p-5 border border-white/[0.06] bg-obsidian-300/30"
                    >
                      <span className="text-[10px] font-mono text-neon-400/70 tabular-nums">
                        {layer.step}
                      </span>
                      <p className="text-sm font-medium text-white mt-2 mb-1">
                        {layer.title}
                      </p>
                      <p className="text-xs text-silver-500 leading-relaxed">
                        {layer.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-silver-600">
                  Clinics on Sypho Professional report up to 41% fewer no-shows within
                  the first quarter of deployment.
                </p>
              </div>
            </ScrollReveal>
          </section>

          <MarketingCtaBand
            headline="Schedule with surgical precision"
            description="See your rota matrix, reminder cadence, and no-show recovery configured for your locations — book a private consultation today."
          />
        </div>
      </main>
    </div>
  );
}
