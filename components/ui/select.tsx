/**
 * @file components/ui/select.tsx
 * @description Accessible select dropdown for Sypho.io.
 */

'use client';

import { forwardRef, useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string | undefined;
  error?: string | undefined;
  helperText?: string | undefined;
  options: SelectOption[];
  placeholder?: string | undefined;
  fullWidth?: boolean | undefined;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
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

    const hasError  = Boolean(error);
    const hasHelper = Boolean(helperText);

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
              <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={[
            'block w-full rounded-lg border px-3 py-2.5 text-sm bg-white',
            'text-surface-900 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-colors duration-150',
            hasError
              ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
              : 'border-surface-300 focus:ring-brand-500 focus:border-brand-500',
            props.disabled ? 'bg-surface-50 text-surface-400 cursor-not-allowed' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

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

Select.displayName = 'Select';
