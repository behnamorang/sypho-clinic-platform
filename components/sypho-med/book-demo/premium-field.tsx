/**
 * @file components/sypho-med/book-demo/premium-field.tsx
 * @description Premium form field primitives for the consultation booking flow.
 */

'use client';

import { forwardRef } from 'react';

export interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
}

/**
 * Borderless input with subtle bottom glow on focus.
 */
export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="space-y-2">
        <label htmlFor={fieldId} className="block text-xs text-silver-400 uppercase tracking-wider">
          {label}
        </label>
        <div className="relative group">
          <input
            ref={ref}
            id={fieldId}
            className={[
              'w-full bg-transparent border-0 border-b border-white/10',
              'px-0 py-3 text-sm text-white placeholder:text-silver-600',
              'transition-all duration-200',
              'focus:outline-none focus:border-neon-400/50',
              'focus:shadow-[0_4px_24px_-8px_rgba(34,211,238,0.45)]',
              error ? 'border-danger-500/50' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={error !== undefined}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            {...props}
          />
        </div>
        {error !== undefined && (
          <p id={`${fieldId}-error`} className="text-xs text-danger-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PremiumInput.displayName = 'PremiumInput';

export interface PremiumSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
}

/**
 * Premium select matching input aesthetic.
 */
export const PremiumSelect = forwardRef<HTMLSelectElement, PremiumSelectProps>(
  (
    { label, error, options, placeholder = 'Select…', className = '', id, ...props },
    ref,
  ) => {
    const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="space-y-2">
        <label htmlFor={fieldId} className="block text-xs text-silver-400 uppercase tracking-wider">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={[
              'w-full appearance-none bg-transparent border-0 border-b border-white/10',
              'px-0 py-3 pr-8 text-sm text-white',
              'transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:border-neon-400/50',
              'focus:shadow-[0_4px_24px_-8px_rgba(34,211,238,0.45)]',
              error ? 'border-danger-500/50' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={error !== undefined}
            {...props}
          >
            <option value="" disabled className="bg-obsidian text-silver-500">
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-obsidian">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error !== undefined && (
          <p className="text-xs text-danger-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PremiumSelect.displayName = 'PremiumSelect';
