/**
 * @file app/(marketing)/layout.tsx
 * @description Shared layout for Sypho Med public marketing routes (pricing, platform, solutions).
 *
 * Route group `(marketing)` is omitted from URLs — e.g. `pricing/page.tsx` → `/pricing`.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

interface MarketingLayoutProps {
  children: React.ReactNode;
}

/**
 * Obsidian marketing shell — child pages supply headers and content.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-obsidian text-white antialiased">
      {children}
    </div>
  );
}
