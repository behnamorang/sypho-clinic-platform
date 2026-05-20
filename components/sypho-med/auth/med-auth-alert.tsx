/**
 * @file components/sypho-med/auth/med-auth-alert.tsx
 * @description Inline alert for Sypho Med auth forms.
 */

export interface MedAuthAlertProps {
  variant: 'error' | 'info' | 'warning';
  children: React.ReactNode;
}

const VARIANT_CLASS: Record<MedAuthAlertProps['variant'], string> = {
  error: 'bg-danger-500/10 border-danger-500/25 text-danger-500',
  info: 'bg-neon-500/10 border-neon-400/20 text-neon-300',
  warning: 'bg-warning-500/10 border-warning-500/25 text-warning-500',
};

/**
 * Compact alert banner for auth validation and server messages.
 */
export function MedAuthAlert({ variant, children }: MedAuthAlertProps) {
  return (
    <div
      role="alert"
      className={[
        'rounded-xl border px-4 py-3 text-xs leading-relaxed',
        VARIANT_CLASS[variant],
      ].join(' ')}
    >
      {children}
    </div>
  );
}
