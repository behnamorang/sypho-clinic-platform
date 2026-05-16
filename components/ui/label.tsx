/**
 * @file components/ui/label.tsx
 * @description Standalone Label primitive for Sypho.io.
 *
 * Used when a label is not bundled with an Input component,
 * e.g. for checkboxes, radio groups, or custom form controls.
 */

'use client';

import { forwardRef } from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** When true, renders a red asterisk after the label text. */
  required?: boolean;
}

/**
 * Accessible form label component.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, children, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={[
          'block text-sm font-medium text-surface-700',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
        {required && (
          <span className="text-danger-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);

Label.displayName = 'Label';
