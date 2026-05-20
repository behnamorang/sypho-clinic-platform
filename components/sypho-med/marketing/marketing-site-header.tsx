/**
 * @file components/sypho-med/marketing/marketing-site-header.tsx
 * @description Minimal server-safe header for Sypho Med marketing subpages.
 */

import Link from 'next/link';
import { SyphoMedLogo } from '@/components/sypho-med/logo';

const NAV_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Platform', href: '/platform/crm' },
  { label: 'Solutions', href: '/solutions/aesthetic-clinics' },
] as const;

/**
 * Lightweight top bar — logo and primary marketing routes.
 */
export function MarketingSiteHeader() {
  return (
    <header className="shrink-0 border-b border-white/[0.06] med-glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        <SyphoMedLogo href="/" size="md" />

        <nav
          className="hidden sm:flex items-center gap-6"
          aria-label="Marketing"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-silver-400 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book-demo"
          className="text-sm font-medium text-obsidian bg-white hover:bg-silver-100 px-4 py-2 rounded-xl transition-colors duration-200"
        >
          Book demo
        </Link>
      </div>
    </header>
  );
}
