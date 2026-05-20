/**
 * @file components/sypho-med/auth/med-auth-button.tsx
 * @description Primary action button for Sypho Med auth forms.
 */

'use client';

import { Loader2 } from 'lucide-react';

export interface MedAuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
}

/**
 * Premium CTA with neon glow on hover.
 */
export function MedAuthButton({
  isLoading = false,
  loadingLabel = 'Loading…',
  fullWidth = true,
  children,
  disabled,
  className = '',
  ...props
}: MedAuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled === true || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium',
        'bg-white text-obsidian hover:bg-silver-100 transition-all duration-200',
        'shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
