/**
 * @file components/sypho-med/motion/scroll-reveal.tsx
 * @description Reusable Framer Motion scroll-reveal wrapper for landing sections.
 */

'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (seconds). */
  delay?: number;
  /** Only animate once when entering viewport. */
  once?: boolean;
  /** Fraction of element visible before triggering (0–1). */
  amount?: number;
}

/**
 * Fades and slides content up when scrolled into view.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export interface ScrollRevealStaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

/**
 * Staggers child `ScrollRevealItem` animations.
 */
export function ScrollRevealStagger({
  children,
  className = '',
  stagger = 0.08,
}: ScrollRevealStaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
