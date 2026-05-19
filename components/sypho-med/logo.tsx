/**
 * @file components/sypho-med/logo.tsx
 * @description Code-rendered Sypho Med brand mark — lowercase "sypho" with thin "med" accent
 * and a pulsing neon-blue status dot.
 */

import Link from 'next/link';

export type SyphoMedLogoSize = 'sm' | 'md' | 'lg';

export interface SyphoMedLogoProps {
  /** Visual scale preset. Defaults to 'md'. */
  size?: SyphoMedLogoSize;
  /** When set, wraps the mark in a Next.js Link. */
  href?: string;
  /** Additional class names for the root element. */
  className?: string;
}

const SIZE_CLASSES: Record<
  SyphoMedLogoSize,
  { dot: string; sypho: string; med: string; gap: string }
> = {
  sm: {
    dot: 'w-1.5 h-1.5',
    sypho: 'text-base tracking-[-0.02em]',
    med: 'text-sm',
    gap: 'gap-2',
  },
  md: {
    dot: 'w-2 h-2',
    sypho: 'text-lg sm:text-xl tracking-[-0.03em]',
    med: 'text-base sm:text-lg',
    gap: 'gap-2.5',
  },
  lg: {
    dot: 'w-2.5 h-2.5',
    sypho: 'text-2xl sm:text-3xl tracking-[-0.04em]',
    med: 'text-xl sm:text-2xl',
    gap: 'gap-3',
  },
};

/**
 * Premium minimalist wordmark: [pulse dot] sypho med
 */
export function SyphoMedLogo({
  size = 'md',
  href,
  className = '',
}: SyphoMedLogoProps) {
  const sizes = SIZE_CLASSES[size];

  const content = (
    <span
      className={[
        'inline-flex items-center',
        sizes.gap,
        'select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Sypho Med"
    >
      <span
        className={[
          sizes.dot,
          'rounded-full bg-neon-400 shrink-0 animate-sypho-pulse',
        ].join(' ')}
        aria-hidden="true"
      />
      <span className="inline-flex items-baseline gap-0.5">
        <span
          className={[
            sizes.sypho,
            'font-light text-white/95 lowercase',
          ].join(' ')}
        >
          sypho
        </span>
        <span
          className={[
            sizes.med,
            'font-extralight text-neon-400/90 lowercase',
          ].join(' ')}
        >
          med
        </span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
      >
        {content}
      </Link>
    );
  }

  return content;
}
