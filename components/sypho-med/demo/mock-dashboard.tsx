/**
 * @file components/sypho-med/demo/mock-dashboard.tsx
 * @description Full interactive mock dashboard for Sypho Med instant demo.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SyphoMedLogo } from '@/components/sypho-med/logo';
import { MedButton } from '@/components/sypho-med/med-button';
import { DemoProvider, useDemo } from '@/components/sypho-med/demo/demo-context';
import { ClinicPresetSwitcher } from '@/components/sypho-med/demo/clinic-preset-switcher';
import { DemoSidebar } from '@/components/sypho-med/demo/demo-sidebar';
import { OverviewView } from '@/components/sypho-med/demo/views/overview-view';
import { PipelineView } from '@/components/sypho-med/demo/views/pipeline-view';
import { BookingView } from '@/components/sypho-med/demo/views/booking-view';
import { InboxView } from '@/components/sypho-med/demo/views/inbox-view';
import { DemoWelcomeBanner } from '@/components/sypho-med/demo/demo-welcome-banner';
import type { ClinicPresetId } from '@/lib/sypho-med/demo/types';

export interface MockDashboardProps {
  onExitDemo: () => void;
  /** Clinic preset seeded from consultation lead, if available. */
  initialClinicId?: ClinicPresetId;
}

/**
 * Interactive demo dashboard with clinic presets and local state.
 */
export function MockDashboard({
  onExitDemo,
  initialClinicId,
}: MockDashboardProps) {
  return (
    <DemoProvider
      {...(initialClinicId !== undefined ? { initialClinicId } : {})}
    >
      <MockDashboardInner onExitDemo={onExitDemo} />
    </DemoProvider>
  );
}

function MockDashboardInner({ onExitDemo }: MockDashboardProps) {
  const { activeView, preset } = useDemo();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[100dvh] bg-obsidian flex flex-col"
    >
      {/* Top bar */}
      <header className="shrink-0 z-30 border-b border-white/[0.06] med-glass">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between sm:justify-start gap-4 min-w-0">
            <SyphoMedLogo size="sm" />
            <MedButton
              variant="ghost"
              size="sm"
              onClick={onExitDemo}
              className="sm:hidden shrink-0"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Exit
            </MedButton>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end min-w-0">
            <ClinicPresetSwitcher />
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs text-silver-500 truncate">
                {preset.city} · {preset.timezone} · {preset.currencySymbol}
                {preset.id === 'muscat' ? ' OMR' : preset.id === 'london' ? ' GBP' : ''}
              </span>
              <MedButton variant="ghost" size="sm" onClick={onExitDemo}>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back to site
              </MedButton>
            </div>
          </div>
        </div>
      </header>

      <DemoWelcomeBanner />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DemoSidebar />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${preset.id}-${activeView}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {activeView === 'overview' && <OverviewView />}
                {activeView === 'pipeline' && <PipelineView />}
                {activeView === 'booking' && <BookingView />}
                {activeView === 'inbox' && <InboxView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
