/**
 * @file components/sypho-med/auth/auth-shell.tsx
 * @description Obsidian-themed layout shell for login and register pages.
 */

import Link from 'next/link';
import { SyphoMedLogo } from '@/components/sypho-med/logo';

export interface AuthShellProps {
  children: React.ReactNode;
}

/**
 * Minimal premium auth frame — obsidian background, centered card.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-[100dvh] bg-[#050506] text-white antialiased flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-med-radial opacity-80"
      />
      <header className="relative z-10 shrink-0 border-b border-white/[0.06] med-glass px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <SyphoMedLogo href="/" size="md" />
          <Link
            href="/pricing"
            className="text-xs text-silver-400 hover:text-neon-300 transition-colors"
          >
            View pricing
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="relative z-10 py-6 text-center">
        <p className="text-[10px] text-silver-600 uppercase tracking-wider">
          EU-hosted · GDPR-compliant clinic infrastructure
        </p>
      </footer>
    </div>
  );
}
