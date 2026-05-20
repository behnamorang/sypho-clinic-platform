/**
 * @file components/sypho-med/med-button.tsx
 * @description Premium CTA buttons for Sypho Med marketing surfaces.
 */

'use client';

import { forwardRef } from 'react';

export type MedButtonVariant = 'primary' | 'secondary' | 'ghost';
export type MedButtonSize = 'sm' | 'md' | 'lg';

export interface MedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: MedButtonVariant;
  size?: MedButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<MedButtonVariant, string> = {
  primary: [
    'bg-white text-obsidian font-medium',
    'hover:bg-silver-100 active:bg-silver-200',
    'shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]',
    'focus-visible:ring-neon-400/60',
  ].join(' '),
  secondary: [
    'bg-transparent text-silver-200',
    'border border-white/10',
    'hover:bg-white/[0.04] hover:border-white/20',
    'focus-visible:ring-white/30',
  ].join(' '),
  ghost: [
    'bg-transparent text-silver-300',
    'hover:text-white hover:bg-white/[0.04]',
    'focus-visible:ring-white/20',
  ].join(' '),
};

const SIZE_CLASSES: Record<MedButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 sm:h-14 px-6 sm:px-7 text-sm sm:text-base rounded-xl',
};

/**
 * Dark-mode optimized button for landing and demo surfaces.
 */
export const MedButton = forwardRef<HTMLButtonElement, MedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-2',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian',
          'disabled:opacity-50 disabled:pointer-events-none',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </button>
    );
  },
);

MedButton.displayName = 'MedButton';
