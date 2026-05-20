/**
 * @file components/sypho-med/demo/demo-sidebar.tsx
 * @description Dashboard navigation for mock demo views.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Inbox,
  Kanban,
  LayoutDashboard,
} from 'lucide-react';
import { SyphoMedLogo } from '@/components/sypho-med/logo';
import { useDemo } from '@/components/sypho-med/demo/demo-context';
import type { DemoViewId } from '@/lib/sypho-med/demo/types';

const NAV: { id: DemoViewId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'pipeline',
    label: 'CRM Pipeline',
    icon: <Kanban className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'booking',
    label: 'Booking',
    icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'inbox',
    label: 'Inbox & Riley',
    icon: <Inbox className="w-4 h-4" aria-hidden="true" />,
  },
];

/**
 * Desktop sidebar + mobile bottom nav for demo views.
 */
export function DemoSidebar() {
  const { activeView, setActiveView, preset } = useDemo();

  return (
    <>
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 border-r border-white/[0.06] bg-obsidian-50/50 h-full"
        aria-label="Demo navigation"
      >
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-5 border-b border-white/[0.06]"
        >
          <SyphoMedLogo size="sm" />
          <p className="text-[10px] text-silver-500 mt-2 truncate">
            {preset.city} · {preset.timezone}
          </p>
        </motion.div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-neon-500/15 text-neon-300 border border-neon-400/20'
                    : 'text-silver-400 hover:text-white hover:bg-white/[0.04]',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-wider text-silver-500 mb-1">
            Instant demo
          </p>
          <p className="text-xs text-silver-400 leading-relaxed">
            All data is simulated locally. No authentication required.
          </p>
        </div>
      </aside>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 med-glass-strong border-t border-white/[0.08] px-2 py-2 safe-area-pb"
        aria-label="Demo navigation mobile"
      >
        <motion.div layout className="flex justify-around gap-1">
          {NAV.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={[
                  'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-[4.5rem] text-[10px] font-medium transition-colors',
                  active ? 'text-neon-400' : 'text-silver-500',
                ].join(' ')}
              >
                {item.icon}
                <span className="truncate max-w-[4.5rem]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </motion.div>
      </nav>
    </>
  );
}
