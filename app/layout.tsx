/**
 * @file app/layout.tsx
 * @description Root layout for Sypho.io — wraps all pages.
 *
 * Sets the document language, global styles, and Inter font.
 * Security headers and CSP are injected via middleware, not here.
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Sypho Med',
    default: 'Sypho Med — Autonomous Clinic Operations',
  },
  description:
    'Premium autonomous operating system for high-performance clinics. Voice AI, unified inbox, and intelligent scheduling.',
  robots: {
    index: true,
    follow: true,
  },
  referrer: 'strict-origin-when-cross-origin',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout — applied to every page.
 * Uses Server Component (no 'use client') for optimal performance.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
       * We load Inter as a self-hosted font via CSS variable.
       * For production, add next/font/google with display: 'swap'.
       */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050506] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
