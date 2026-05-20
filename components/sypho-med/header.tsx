/**
 * @file components/sypho-med/header.tsx
 * @description Premium glass navigation header for Sypho Med marketing pages.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SyphoMedLogo } from '@/components/sypho-med/logo';
import { MedButton } from '@/components/sypho-med/med-button';

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Autonomous AI', href: '#autonomous' },
  { label: 'Workflows', href: '#workflows' },
  { label: 'Booking', href: '#booking' },
] as const;

export interface SyphoMedHeaderProps {
  onLaunchDemo?: () => void;
  onBookConsultation?: () => void;
}

/**
 * Fixed top navigation with animated logo and mobile drawer.
 */
export function SyphoMedHeader({
  onLaunchDemo,
  onBookConsultation,
}: SyphoMedHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5"
      >
        <div className="med-glass rounded-2xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]">
          <SyphoMedLogo href="/" size="md" />

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-silver-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="hidden md:flex items-center gap-3"
          >
            <MedButton variant="ghost" size="sm" onClick={onBookConsultation}>
              Sign in
            </MedButton>
            <MedButton variant="primary" size="sm" onClick={onLaunchDemo}>
              Launch Demo
            </MedButton>
          </motion.div>

          <button
            type="button"
            className="md:hidden p-2 -mr-2 text-silver-400 hover:text-white rounded-lg transition-colors"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mx-4 mt-2 overflow-hidden"
          >
            <div className="med-glass-strong rounded-2xl p-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 text-sm text-silver-300 hover:text-white rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-2 pt-3 mt-2 border-t border-white/[0.06]"
              >
                <MedButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    onBookConsultation?.();
                  }}
                >
                  Book Private Consultation
                </MedButton>
                <MedButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    onLaunchDemo?.();
                  }}
                >
                  Launch Instant Demo
                </MedButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
