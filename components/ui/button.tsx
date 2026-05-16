/**
 * @file components/ui/button.tsx
 * @description Accessible Button primitive for Sypho.io.
 *
 * Supports multiple visual variants and sizes.
 * All interactive states (hover, focus, disabled, loading) are handled.
 *
 * @accessibility WCAG 2.1 AA — proper focus ring, disabled state, aria attributes.
 */

'use client';

import { forwardRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant. Defaults to 'primary'. */
  variant?: ButtonVariant;
  /** Size preset. Defaults to 'md'. */
  size?: ButtonSize;
  /** When true, shows a spinner and disables the button. */
  isLoading?: boolean;
  /** Accessible label for the loading spinner (screen readers only). */
  loadingLabel?: string;
  /** Icon to render on the left side of the button label. */
  leftIcon?: React.ReactNode;
  /** Icon to render on the right side of the button label. */
  rightIcon?: React.ReactNode;
  /** Stretch the button to fill its container. */
  fullWidth?: boolean;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-600 text-white',
    'hover:bg-brand-700 active:bg-brand-800',
    'disabled:bg-brand-300 disabled:cursor-not-allowed',
    'focus-visible:ring-brand-500',
  ].join(' '),

  secondary: [
    'bg-surface-100 text-surface-900',
    'hover:bg-surface-200 active:bg-surface-300',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:ring-surface-400',
  ].join(' '),

  outline: [
    'bg-transparent text-brand-700 border border-brand-300',
    'hover:bg-brand-50 active:bg-brand-100',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:ring-brand-500',
  ].join(' '),

  ghost: [
    'bg-transparent text-surface-700',
    'hover:bg-surface-100 active:bg-surface-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:ring-surface-400',
  ].join(' '),

  danger: [
    'bg-danger-600 text-white',
    'hover:bg-danger-700 active:bg-danger-800',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:ring-danger-500',
  ].join(' '),
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Primary interactive button component.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" isLoading={isPending}>
 *   Save changes
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingLabel = 'Loading…',
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={[
          'inline-flex items-center justify-center',
          'font-medium rounded-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'transition-colors duration-150',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size} />
            <span className="sr-only">{loadingLabel}</span>
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

// ---------------------------------------------------------------------------
// LoadingSpinner
// ---------------------------------------------------------------------------

interface LoadingSpinnerProps {
  size: ButtonSize;
}

function LoadingSpinner({ size }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <svg
      className={`${sizeClass} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
