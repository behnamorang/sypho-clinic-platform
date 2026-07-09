'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Reveal } from '@/components/clinic-demo/reveal';
import {
  ACCREDITATIONS,
  ABOUT_IMAGE,
  CLINIC,
  FAQ,
  HERO_IMAGE,
  INSIGHTS,
  JOURNEY,
  LOCATIONS,
  NAV_LINKS,
  OUTCOMES,
  PILLARS,
  SERVICES,
  SPECIALISTS,
  STATS,
  TECHNOLOGY,
  TESTIMONIALS,
} from '@/lib/clinic-demo/content';

/** Seeded public booking flow for the showcase clinic concept. */
const BOOKING_HREF = '/medisyn-amsterdam/booking';

function Section({
  id,
  className = '',
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">{children}</div>
    </section>
  );
}

function Btn({
  href,
  variant = 'primary',
  children,
  className = '',
}: {
  href: string;
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-300';
  const variants = {
    primary: 'bg-clinic-ink text-clinic-pearl hover:bg-clinic-slate shadow-lg shadow-clinic-ink/20',
    outline: 'border border-clinic-ink/20 text-clinic-ink hover:border-clinic-gold hover:text-clinic-gold',
    ghost:   'text-clinic-ink/70 hover:text-clinic-ink',
  };
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function ClinicDemoSite() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [openFaq, setOpenFaq]     = useState<number | null>(0);
  const [testimonial, setTestimonial] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTestimonial((i) => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const toggleFaq = useCallback((i: number) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  }, []);

  return (
    <div className="bg-clinic-cream text-clinic-ink antialiased">
      {/* Announcement */}
      <div className="bg-clinic-slate text-clinic-pearl text-center text-xs tracking-widest uppercase py-2.5 px-4">
        Now accepting international consultations · Private suites available this month
      </div>

      {/* Sypho design concept badge */}
      <div className="bg-clinic-cream border-b border-clinic-ink/5 py-2.5 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs tracking-wide text-clinic-ink/50 hover:text-clinic-gold transition-colors"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-clinic-gold/80" aria-hidden="true" />
          A Sypho design concept
        </Link>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-clinic-pearl/95 shadow-md backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/showcase" className="font-display text-2xl tracking-wide text-clinic-ink">
            {CLINIC.name}
          </Link>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-clinic-ink/70 hover:text-clinic-gold transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="text-sm text-clinic-ink/60">
              {CLINIC.phone}
            </a>
            <Btn href={BOOKING_HREF}>Book consultation</Btn>
          </div>
          <button
            type="button"
            className="lg:hidden rounded-lg border border-clinic-ink/10 p-2"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <nav className="lg:hidden border-t border-clinic-ink/10 bg-clinic-pearl px-6 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-2 text-sm">
                {l.label}
              </a>
            ))}
            <Btn href={BOOKING_HREF} className="mt-2">Book consultation</Btn>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <Image src={HERO_IMAGE} alt="Lumière Institute flagship reception" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-clinic-ink via-clinic-ink/50 to-clinic-ink/20" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-40 lg:px-8 lg:pb-28">
          <Reveal>
            <p className="text-clinic-goldLt text-xs font-medium tracking-[0.2em] uppercase mb-4">{CLINIC.tagline}</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-clinic-pearl max-w-4xl leading-[1.05]">
              The art of refined clinical care
            </h1>
            <p className="mt-6 max-w-xl text-lg text-clinic-pearl/80 leading-relaxed">
              Brussels&apos; destination for physician-led aesthetics, dermatology, and longevity — where world-class outcomes meet absolute discretion.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Btn href={BOOKING_HREF} className="!bg-clinic-gold !text-clinic-ink hover:!bg-clinic-goldLt border-0">
                Schedule consultation
              </Btn>
              <Btn href="#services" variant="outline" className="!border-clinic-pearl/40 !text-clinic-pearl hover:!border-clinic-gold">
                Explore treatments
              </Btn>
            </div>
          </Reveal>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float hidden md:block">
          <span className="block h-12 w-px bg-clinic-pearl/40" />
        </div>
      </section>

      {/* Stats + marquee */}
      <section className="bg-clinic-pearl border-y border-clinic-ink/5 py-12">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <p className="font-display text-4xl text-clinic-gold">{s.value}</p>
              <p className="text-sm text-clinic-ink/60 mt-1">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <div className="overflow-hidden border-t border-clinic-ink/5 pt-8">
          <div className="flex animate-marquee whitespace-nowrap gap-16">
            {[...ACCREDITATIONS, ...ACCREDITATIONS].map((a, i) => (
              <span key={`${a}-${i}`} className="text-sm tracking-widest uppercase text-clinic-ink/40 font-medium">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <Section id="about" className="bg-clinic-cream">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Our philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Medicine with the precision of science and the warmth of hospitality
            </h2>
            <p className="mt-6 text-clinic-ink/70 leading-relaxed">
              Founded in Brussels, Lumière Institute unites board-certified specialists under one roof — from medical dermatology to day-case surgery. We believe exceptional outcomes begin with listening, not selling.
            </p>
            <p className="mt-4 text-clinic-ink/70 leading-relaxed">
              Our suites are designed for calm. Our protocols are evidence-based. Our promise is simple: honest counsel, measured treatment, and care that continues long after you leave.
            </p>
            <Btn href="#journey" className="mt-8">Discover your visit</Btn>
          </Reveal>
          <Reveal delay={120} className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
            <Image src={ABOUT_IMAGE} alt="Consultation suite" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          </Reveal>
        </div>
      </Section>

      {/* Services */}
      <Section id="services" className="bg-clinic-pearl">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Treatments</p>
          <h2 className="font-display text-4xl md:text-5xl">Comprehensive programmes, singular standards</h2>
          <p className="mt-4 text-clinic-ink/60">Eight clinical departments. One coordinated team. Every pathway begins with physician assessment.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 60}>
              <article className="group rounded-2xl overflow-hidden bg-clinic-cream border border-clinic-ink/5 hover:shadow-xl hover:border-clinic-gold/30 transition-all duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={s.image} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="280px" />
                  <span className="absolute top-3 left-3 rounded-full bg-clinic-pearl/90 px-3 py-1 text-[10px] tracking-wider uppercase">{s.tag}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-clinic-ink/60 line-clamp-3">{s.desc}</p>
                  <Link href={BOOKING_HREF} className="mt-4 inline-block text-sm text-clinic-gold hover:underline">Enquire →</Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pillars */}
      <Section className="bg-clinic-slate text-clinic-pearl">
        <Reveal className="text-center mb-14">
          <h2 className="font-display text-4xl">Why patients choose Lumière</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="border-l border-clinic-gold/50 pl-6">
                <h3 className="font-display text-xl text-clinic-goldLt">{p.title}</h3>
                <p className="mt-3 text-sm text-clinic-pearl/70 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Specialists */}
      <Section id="specialists" className="bg-clinic-cream">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Medical team</p>
            <h2 className="font-display text-4xl md:text-5xl">Board-certified specialists</h2>
          </div>
          <Btn href={BOOKING_HREF} variant="outline">Meet your physician</Btn>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SPECIALISTS.map((d, i) => (
            <Reveal key={d.name} delay={i * 50}>
              <article className="text-center group">
                <div className="relative mx-auto aspect-[3/4] max-w-[280px] rounded-2xl overflow-hidden">
                  <Image src={d.image} alt={d.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" sizes="280px" />
                </div>
                <h3 className="font-display text-xl mt-5">{d.name}</h3>
                <p className="text-sm text-clinic-ink/60">{d.role}</p>
                <span className="inline-block mt-2 text-[10px] tracking-widest uppercase text-clinic-gold">{d.cred}</span>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Technology */}
      <Section id="technology" className="bg-clinic-pearl">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Technology & facilities</p>
          <h2 className="font-display text-4xl md:text-5xl">Investing in outcomes, not trends</h2>
          <p className="mt-4 text-clinic-ink/60">FDA- and CE-marked platforms maintained to manufacturer specifications with on-site biomedical engineering.</p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          {TECHNOLOGY.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden group">
                <Image src={t.image} alt={t.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-clinic-ink/80 to-transparent" />
                <p className="absolute bottom-6 left-6 right-6 font-display text-2xl text-clinic-pearl">{t.name}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Journey */}
      <Section id="journey" className="bg-clinic-cream">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Your visit</p>
          <h2 className="font-display text-4xl md:text-5xl">A seamless patient journey</h2>
        </Reveal>
        <div className="grid md:grid-cols-5 gap-6">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.step} delay={i * 60}>
              <div className="relative p-6 rounded-2xl bg-clinic-pearl border border-clinic-ink/5 h-full">
                <span className="font-display text-3xl text-clinic-gold/40">{j.step}</span>
                <h3 className="font-display text-lg mt-2">{j.title}</h3>
                <p className="mt-2 text-sm text-clinic-ink/60">{j.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Outcomes */}
      <Section className="bg-clinic-slate text-clinic-pearl">
        <Reveal className="text-center mb-14">
          <h2 className="font-display text-4xl">Measured outcomes</h2>
          <p className="mt-3 text-clinic-pearl/60">Transparency is a clinical standard, not a marketing line.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OUTCOMES.map((o, i) => (
            <Reveal key={o.label} delay={i * 60}>
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                <Image src={o.image} alt="" fill className="object-cover opacity-60" sizes="300px" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-clinic-ink">
                  <p className="font-display text-5xl text-clinic-gold">{o.stat}</p>
                  <p className="text-sm text-clinic-pearl/80 mt-1">{o.label}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="bg-clinic-pearl overflow-hidden">
        <Reveal className="text-center mb-12">
          <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Patient voices</p>
          <h2 className="font-display text-4xl">Trusted across Europe and beyond</h2>
        </Reveal>
        <div className="relative max-w-4xl mx-auto min-h-[220px]">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.name}
              className={`absolute inset-0 text-center transition-all duration-700 ${
                i === testimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <p className="font-display text-2xl md:text-3xl leading-snug text-clinic-ink">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-8">
                <cite className="not-italic font-medium">{t.name}</cite>
                <p className="text-sm text-clinic-ink/50 mt-1">{t.detail}</p>
              </footer>
            </blockquote>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-10">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setTestimonial(i)}
              className={`h-2 rounded-full transition-all ${i === testimonial ? 'w-8 bg-clinic-gold' : 'w-2 bg-clinic-ink/20'}`}
            />
          ))}
        </div>
      </Section>

      {/* International */}
      <Section className="bg-clinic-cream">
        <div className="grid lg:grid-cols-2 gap-12 items-center rounded-3xl bg-clinic-ink text-clinic-pearl p-10 md:p-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <Image src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" alt="" fill className="object-cover" />
          </div>
          <Reveal className="relative z-10">
            <p className="text-clinic-goldLt text-xs tracking-[0.2em] uppercase mb-3">International patients</p>
            <h2 className="font-display text-4xl">Fly-in programmes with white-glove coordination</h2>
            <ul className="mt-6 space-y-3 text-clinic-pearl/80 text-sm">
              <li>✓ Video pre-consultation with your specialist</li>
              <li>✓ Airport transfers and five-star partner hotels</li>
              <li>✓ Multilingual coordinators and pharmacy delivery</li>
              <li>✓ Remote follow-up via secure patient portal</li>
            </ul>
            <Btn href={BOOKING_HREF} className="mt-8 !bg-clinic-gold !text-clinic-ink">Start international enquiry</Btn>
          </Reveal>
        </div>
      </Section>

      {/* Insurance */}
      <Section className="bg-clinic-pearl">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Transparent pricing', desc: 'Written quotes before treatment. No hidden facility fees.' },
            { title: 'Financing options', desc: '0% for 6 months · Extended plans up to 24 months via EU partners.' },
            { title: 'Insurance liaison', desc: 'We provide documentation for reimbursable dermatology pathways.' },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="p-8 rounded-2xl border border-clinic-ink/5 bg-clinic-cream h-full">
                <h3 className="font-display text-xl">{item.title}</h3>
                <p className="mt-3 text-sm text-clinic-ink/60">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Locations */}
      <Section id="locations" className="bg-clinic-cream">
        <Reveal className="mb-14">
          <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Locations</p>
          <h2 className="font-display text-4xl md:text-5xl">Three cities. One standard of care.</h2>
        </Reveal>
        <div className="grid lg:grid-cols-3 gap-8">
          {LOCATIONS.map((loc, i) => (
            <Reveal key={loc.name} delay={i * 70}>
              <article className="rounded-2xl overflow-hidden bg-clinic-pearl border border-clinic-ink/5 shadow-lg">
                <div className="relative aspect-[16/10]">
                  <Image src={loc.image} alt={loc.name} fill className="object-cover" sizes="400px" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl">{loc.name}</h3>
                  <p className="text-sm text-clinic-ink/60 mt-2">{loc.address}</p>
                  <p className="text-sm text-clinic-gold mt-2">{loc.hours}</p>
                  <Link href={BOOKING_HREF} className="inline-block mt-4 text-sm font-medium hover:text-clinic-gold">Book appointment →</Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="bg-clinic-pearl">
        <Reveal className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={item.q} className="rounded-xl border border-clinic-ink/10 bg-clinic-cream overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-medium"
                  aria-expanded={openFaq === i}
                  onClick={() => toggleFaq(i)}
                >
                  {item.q}
                  <span className="text-clinic-gold text-xl">{openFaq === i ? '−' : '+'}</span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <p className="overflow-hidden px-6 pb-4 text-sm text-clinic-ink/70 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Insights */}
      <Section className="bg-clinic-cream">
        <Reveal className="flex justify-between items-end mb-12">
          <div>
            <p className="text-clinic-gold text-xs tracking-[0.2em] uppercase mb-3">Insights</p>
            <h2 className="font-display text-4xl">Clinical perspectives</h2>
          </div>
          <a href="#" className="text-sm text-clinic-gold hidden md:inline">View all articles →</a>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {INSIGHTS.map((post, i) => (
            <Reveal key={post.title} delay={i * 60}>
              <article className="group rounded-2xl overflow-hidden bg-clinic-pearl border border-clinic-ink/5">
                <div className="relative aspect-[16/10]">
                  <Image src={post.image} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
                </div>
                <div className="p-6">
                  <p className="text-xs text-clinic-ink/50">{post.date} · {post.read}</p>
                  <h3 className="font-display text-lg mt-2 group-hover:text-clinic-gold transition-colors">{post.title}</h3>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Book CTA */}
      <Section id="book" className="bg-clinic-slate relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse-soft bg-gradient-to-br from-clinic-gold/10 to-transparent" />
        <Reveal className="relative text-center max-w-2xl mx-auto text-clinic-pearl">
          <h2 className="font-display text-4xl md:text-5xl">Begin with a private consultation</h2>
          <p className="mt-4 text-clinic-pearl/70">
            Deposit €150 secures your 60-minute assessment — credited toward treatment if you proceed within 90 days.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Btn href={BOOKING_HREF} className="!bg-clinic-gold !text-clinic-ink">
              Request appointment
            </Btn>
            <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="inline-flex items-center rounded-full border border-clinic-pearl/30 px-7 py-3.5 text-sm text-clinic-pearl hover:border-clinic-gold">
              {CLINIC.phone}
            </a>
          </div>
          <p className="mt-8 text-xs text-clinic-pearl/40">
            Demo site powered by <Link href="/" className="underline hover:text-clinic-gold">Sypho Med</Link> — EU clinic booking platform
          </p>
        </Reveal>
      </Section>

      {/* Footer */}
      <footer className="bg-clinic-ink text-clinic-pearl py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <p className="font-display text-2xl">{CLINIC.name}</p>
            <p className="mt-4 text-sm text-clinic-pearl/50 max-w-sm">
              Physician-led aesthetic and medical clinic. GDPR-compliant patient records. EU data residency.
            </p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-clinic-gold mb-4">Contact</p>
            <p className="text-sm">{CLINIC.email}</p>
            <p className="text-sm mt-2">{CLINIC.phone}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-clinic-gold mb-4">Legal</p>
            <ul className="text-sm text-clinic-pearl/50 space-y-2">
              <li><a href="#" className="hover:text-clinic-pearl">Privacy policy</a></li>
              <li><a href="#" className="hover:text-clinic-pearl">Cookie policy</a></li>
              <li><a href="#" className="hover:text-clinic-pearl">Terms of care</a></li>
            </ul>
          </div>
        </div>
        <p className="text-center text-xs text-clinic-pearl/30 mt-12">© {new Date().getFullYear()} Lumière Institute · Demonstration only</p>
      </footer>
    </div>
  );
}
