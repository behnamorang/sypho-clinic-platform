/**
 * @file components/layout/sidebar.tsx
 * @description Responsive sidebar navigation for the Sypho.io clinic dashboard.
 *
 * Client Component — uses `usePathname` for active link highlighting and
 * manages the mobile overlay state internally.
 *
 * Accessibility: keyboard-navigable links, ARIA landmarks, focus-visible rings.
 */

'use client';

import Link      from 'next/link';
import { usePathname } from 'next/navigation';
import { useState }    from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
}

interface SidebarProps {
  clinicName: string;
  userEmail:  string;
  userRole:   string;
}

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
  {
    href:  '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href:  '/dashboard/calendar',
    label: 'Calendar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href:  '/dashboard/patients',
    label: 'Patients',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href:  '/dashboard/doctors',
    label: 'Doctors',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href:  '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Sidebar inner content (shared between desktop and mobile overlay)
// ---------------------------------------------------------------------------

function SidebarContent({ clinicName, userEmail, userRole, onClose }: SidebarProps & { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const roleLabel = userRole.replace(/_/g, ' ');

  return (
    <div className="flex flex-col h-full">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-neon-500/20 border border-neon-400/25 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-neon-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-white leading-tight">Sypho Med</p>
          <p className="text-xs text-silver-500 truncate">{clinicName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/[0.06] text-silver-500 hover:text-white transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(onClose !== undefined ? { onClick: onClose } : {})}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-neon-500/10 text-neon-300 border border-neon-400/20'
                  : 'text-silver-400 hover:bg-white/[0.04] hover:text-white border border-transparent',
              ].join(' ')}
            >
              <span className={active ? 'text-neon-400' : 'text-silver-500'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Sign out */}
      <div className="border-t border-white/[0.06] px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-neon-500/15 border border-neon-400/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-neon-300 uppercase">
              {(userEmail[0] ?? 'U').toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-silver-300 truncate">{userEmail}</p>
            <p className="text-xs text-silver-500 capitalize">{roleLabel}</p>
          </div>
        </div>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-silver-400 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 text-silver-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Sidebar export
// ---------------------------------------------------------------------------

/**
 * Full dashboard sidebar with desktop-permanent and mobile-overlay variants.
 *
 * Desktop (lg+): always visible, 256px wide.
 * Mobile (<lg):  hidden by default; toggled by a hamburger button in the header.
 */
export function Sidebar({ clinicName, userEmail, userRole }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0 med-glass-strong border-r border-white/[0.06] h-screen sticky top-0 z-30"
        aria-label="Sidebar"
      >
        <SidebarContent
          clinicName={clinicName}
          userEmail={userEmail}
          userRole={userRole}
        />
      </aside>

      {/* ── Mobile hamburger button ───────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg med-glass border border-white/[0.08] text-silver-400 hover:text-white transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile overlay sidebar ────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-obsidian-100 border-r border-white/[0.06] flex flex-col animate-slide-up"
            aria-label="Mobile sidebar"
          >
            <SidebarContent
              clinicName={clinicName}
              userEmail={userEmail}
              userRole={userRole}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}
