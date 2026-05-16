/**
 * @file components/ui/input.tsx
 * @description Accessible text input primitive for Sypho.io.
 *
 * Supports error states, helper text, and prefix/suffix icons.
 *
 * @accessibility WCAG 2.1 AA — aria-invalid, aria-describedby, focus ring.
 */

'use client';

import { forwardRef, useId } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Human-readable field label. If omitted, ensure aria-label is provided. */
  label?: string | undefined;
  /** Error message — renders below the input in red. Sets aria-invalid. */
  error?: string | undefined;
  /** Helper text rendered below the input (dimmed). */
  helperText?: string | undefined;
  /** Icon/element rendered on the left inside the input. */
  leftAddon?: React.ReactNode;
  /** Icon/element rendered on the right inside the input. */
  rightAddon?: React.ReactNode;
  /** Stretch the input to fill its container. Defaults to true. */
  fullWidth?: boolean | undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Form input field with label, error state, and helper text.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email address"
 *   type="email"
 *   error={errors.email}
 *   autoComplete="email"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      fullWidth = true,
      className = '',
      id: externalId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id          = externalId ?? generatedId;
    const errorId     = `${id}-error`;
    const helperId    = `${id}-helper`;

    const hasError    = Boolean(error);
    const hasHelper   = Boolean(helperText);

    const describedBy = [
      hasError  ? errorId  : null,
      hasHelper ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            {label}
            {props.required && (
              <span className="text-danger-500 ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftAddon && (
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400"
              aria-hidden="true"
            >
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={[
              'block w-full rounded-lg border px-3 py-2.5 text-sm',
              'bg-white text-surface-900 placeholder-surface-400',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              hasError
                ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
                : 'border-surface-300 focus:ring-brand-500 focus:border-brand-500',
              leftAddon  ? 'pl-10' : '',
              rightAddon ? 'pr-10' : '',
              props.disabled ? 'bg-surface-50 text-surface-400 cursor-not-allowed' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {rightAddon && (
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400"
              aria-hidden="true"
            >
              {rightAddon}
            </div>
          )}
        </div>

        {hasError && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger-600">
            {error}
          </p>
        )}

        {!hasError && hasHelper && (
          <p id={helperId} className="mt-1.5 text-xs text-surface-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
