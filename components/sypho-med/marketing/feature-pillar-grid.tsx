/**
 * @file components/sypho-med/marketing/feature-pillar-grid.tsx
 * @description Icon feature pillar grid for marketing deep-dive pages.
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import {
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/sypho-med/motion/scroll-reveal';

export interface FeaturePillar {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FeaturePillarGridProps {
  pillars: FeaturePillar[];
  columns?: 2 | 3;
}

/**
 * Responsive grid of feature pillars with glass cards.
 */
export function FeaturePillarGrid({
  pillars,
  columns = 3,
}: FeaturePillarGridProps) {
  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <ScrollRevealStagger
      className={`grid gap-4 ${colClass}`}
      stagger={0.07}
    >
      {pillars.map((pillar) => {
        const Icon = pillar.icon;
        return (
          <ScrollRevealItem key={pillar.title}>
            <div className="h-full rounded-2xl p-5 sm:p-6 border border-white/[0.06] med-glass hover:border-neon-400/20 transition-colors duration-300">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-500/10 text-neon-400 mb-4 border border-neon-400/15">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-medium text-white mb-2">{pillar.title}</h3>
              <p className="text-xs text-silver-500 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          </ScrollRevealItem>
        );
      })}
    </ScrollRevealStagger>
  );
}
