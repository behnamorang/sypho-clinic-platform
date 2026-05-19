/**
 * @file components/sypho-med/hero-dashboard-mockup.tsx
 * @description Floating dashboard preview cards for the cinematic hero section.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

/**
 * Layered glass dashboard mockup with subtle float animation.
 */
export function HeroDashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0"
    >
      {/* Ambient glow */}
      <motion.div
        aria-hidden="true"
        className="absolute -inset-8 bg-neon-500/10 blur-3xl rounded-full"
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Back card */}
      <motion.div
        className="absolute -right-4 sm:-right-8 top-8 w-[72%] med-glass rounded-2xl p-4 opacity-60 hidden sm:block"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-neon-400/80" aria-hidden="true" />
          <span className="text-xs text-silver-400">Doctor rota — Berlin</span>
        </div>
        <motion.div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className={[
                'h-6 rounded-md',
                i % 3 === 0 ? 'bg-neon-500/20' : 'bg-white/[0.04]',
              ].join(' ')}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Main card */}
      <motion.div
        className="relative med-glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] border border-white/[0.08] animate-float-slow"
      >
        <motion.div
          className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-sypho-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-silver-300 tracking-wide uppercase">
              Live clinic pulse
            </span>
          </motion.div>
          <span className="text-[10px] text-silver-500 tabular-nums">London · UTC</span>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            icon={<TrendingUp className="w-4 h-4 text-neon-400" />}
            label="Bookings today"
            value="47"
            delta="+12%"
          />
          <StatCard
            icon={<Activity className="w-4 h-4 text-neon-400" />}
            label="Pipeline value"
            value="€128k"
            delta="+8%"
          />
        </div>

        <div className="rounded-xl bg-obsidian-300/50 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-silver-400">Weekly throughput</span>
            <span className="text-[10px] text-neon-400/80">Autonomous</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-neon-600/30 to-neon-400/70"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.6 + i * 0.06, duration: 0.5 }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <ActivityRow
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            text="Riley confirmed MRI slot via WhatsApp"
            time="2m ago"
          />
          <ActivityRow
            icon={<Calendar className="w-3.5 h-3.5" />}
            text="Dr. Al-Rashid — consultation booked"
            time="8m ago"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
}

function StatCard({ icon, label, value, delta }: StatCardProps) {
  return (
    <motion.div
      className="rounded-xl bg-obsidian-300/40 p-3 border border-white/[0.04]"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div className="flex items-center gap-1.5 mb-2 text-silver-400">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </motion.div>
      <p className="text-lg font-medium text-white tabular-nums">{value}</p>
      <p className="text-[10px] text-neon-400/90 mt-0.5">{delta}</p>
    </motion.div>
  );
}

interface ActivityRowProps {
  icon: React.ReactNode;
  text: string;
  time: string;
}

function ActivityRow({ icon, text, time }: ActivityRowProps) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-neon-500/10 text-neon-400 shrink-0">
        {icon}
      </span>
      <span className="flex-1 text-silver-300 truncate">{text}</span>
      <span className="text-silver-500 shrink-0 tabular-nums">{time}</span>
    </div>
  );
}
