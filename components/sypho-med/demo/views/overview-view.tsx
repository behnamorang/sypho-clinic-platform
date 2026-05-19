/**
 * @file components/sypho-med/demo/views/overview-view.tsx
 * @description Analytics widgets and live activity stream for the mock dashboard.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useDemo } from '@/components/sypho-med/demo/demo-context';
import type { DemoActivity } from '@/lib/sypho-med/demo/types';

const CATEGORY_ICON: Record<
  DemoActivity['category'],
  React.ReactNode
> = {
  booking: <Calendar className="w-3.5 h-3.5" aria-hidden="true" />,
  ai: <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />,
  inbox: <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />,
  pipeline: <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />,
};

/**
 * Dashboard overview — KPI cards, chart, activity feed.
 */
export function OverviewView() {
  const { preset, localActivities } = useDemo();
  const activities = [...localActivities, ...preset.activities].slice(0, 8);

  const metrics = [
    {
      label: 'Bookings today',
      value: String(preset.metrics.bookingsToday),
      delta: '+12%',
      icon: <Calendar className="w-4 h-4 text-neon-400" aria-hidden="true" />,
    },
    {
      label: 'Pipeline value',
      value: preset.metrics.pipelineValue,
      delta: '+8%',
      icon: <TrendingUp className="w-4 h-4 text-neon-400" aria-hidden="true" />,
    },
    {
      label: 'Conversion',
      value: preset.metrics.conversionRate,
      delta: '+3%',
      icon: <ArrowUpRight className="w-4 h-4 text-neon-400" aria-hidden="true" />,
    },
    {
      label: 'Utilization',
      value: preset.metrics.utilization,
      delta: 'Live',
      icon: <Activity className="w-4 h-4 text-neon-400" aria-hidden="true" />,
    },
  ];

  return (
    <motion.div
      key={preset.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        initial="hidden"
        animate="show"
      >
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
            className="med-glass rounded-2xl p-4 border border-white/[0.06]"
          >
            <div className="flex items-center gap-2 text-silver-400 mb-2">
              {m.icon}
              <span className="text-[10px] uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-2xl font-medium text-white tabular-nums">{m.value}</p>
            <p className="text-[10px] text-neon-400/90 mt-1">{m.delta}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-4">
        <motion.div
          className="lg:col-span-3 med-glass-strong rounded-2xl p-5 border border-white/[0.06]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Weekly throughput</h3>
              <p className="text-xs text-silver-500 mt-0.5">
                {preset.city} clinic · autonomous scheduling
              </p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-neon-500/15 text-neon-400 border border-neon-400/20">
              Live
            </span>
          </motion.div>
          <div className="flex items-end gap-2 h-36">
            {preset.weeklyChart.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 flex flex-col items-center gap-2"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
              >
                <motion.div
                  className="w-full rounded-md bg-gradient-to-t from-neon-600/25 to-neon-400/70 min-h-[4px]"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.45 }}
                  style={{ maxHeight: '100%' }}
                />
                <span className="text-[9px] text-silver-600">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-2 med-glass-strong rounded-2xl p-5 border border-white/[0.06] flex flex-col min-h-[280px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-sypho-pulse" aria-hidden="true" />
            <h3 className="text-sm font-medium text-white">Activity stream</h3>
          </div>
          <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
            {activities.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2.5 text-xs"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-neon-500/10 text-neon-400 shrink-0 mt-0.5">
                  {CATEGORY_ICON[item.category]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-silver-300 leading-snug">{item.message}</p>
                  <p className="text-silver-600 mt-0.5 tabular-nums">{item.time}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
