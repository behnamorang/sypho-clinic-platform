/**
 * @file components/ui/alert.tsx
 * @description Alert/notification banner component for Sypho.io.
 *
 * Supports info, success, warning, and error semantic variants.
 *
 * @accessibility WCAG 2.1 AA — role="alert" for error/warning variants.
 */

import { forwardRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Semantic color variant. */
  variant?: AlertVariant;
  /** Optional title rendered in bold above the description. */
  title?: string;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const VARIANT_STYLES: Record<AlertVariant, { container: string; icon: string; title: string }> = {
  info: {
    container: 'bg-brand-50 border-brand-200 text-brand-800',
    icon: 'text-brand-500',
    title: 'text-brand-800',
  },
  success: {
    container: 'bg-success-50 border-success-500/20 text-success-700',
    icon: 'text-success-500',
    title: 'text-success-700',
  },
  warning: {
    container: 'bg-warning-50 border-warning-500/20 text-warning-700',
    icon: 'text-warning-600',
    title: 'text-warning-700',
  },
  error: {
    container: 'bg-danger-50 border-danger-200 text-danger-700',
    icon: 'text-danger-500',
    title: 'text-danger-700',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Alert banner for displaying status messages to the user.
 *
 * @example
 * ```tsx
 * <Alert variant="error" title="Authentication failed">
 *   Invalid email address or password. Please try again.
 * </Alert>
 * ```
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, children, className = '', ...props }, ref) => {
    const styles = VARIANT_STYLES[variant];
    const isAlert = variant === 'error' || variant === 'warning';

    return (
      <div
        ref={ref}
        role={isAlert ? 'alert' : 'status'}
        aria-live={isAlert ? 'assertive' : 'polite'}
        className={[
          'rounded-lg border px-4 py-3 text-sm',
          styles.container,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="flex items-start gap-3">
          <AlertIcon variant={variant} className={`mt-0.5 flex-shrink-0 ${styles.icon}`} />

          <div className="flex-1 min-w-0">
            {title && (
              <p className={`font-semibold mb-0.5 ${styles.title}`}>{title}</p>
            )}
            {children && <div className="leading-relaxed">{children}</div>}
          </div>
        </div>
      </div>
    );
  },
);

Alert.displayName = 'Alert';

// ---------------------------------------------------------------------------
// AlertIcon — internal helper
// ---------------------------------------------------------------------------

interface AlertIconProps {
  variant: AlertVariant;
  className?: string;
}

function AlertIcon({ variant, className = '' }: AlertIconProps) {
  if (variant === 'success') {
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  if (variant === 'warning') {
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }

  if (variant === 'error') {
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  // info
  return (
    <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
