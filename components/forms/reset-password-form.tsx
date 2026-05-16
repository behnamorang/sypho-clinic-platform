/**
 * @file components/forms/reset-password-form.tsx
 * @description Password reset form — allows the user to set a new password
 * after clicking the recovery link in their email.
 *
 * The Supabase session is already established when this form renders
 * (the recovery callback exchanged the token). The form calls
 * `supabase.auth.updateUser()` to set the new password.
 *
 * @compliance GDPR — password changes are silent; no old password in logs.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input }   from '@/components/ui/input';
import { Button }  from '@/components/ui/button';
import { Alert }   from '@/components/ui/alert';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations/auth';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<keyof ResetPasswordFormValues, string>>;

type ResetState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Reset password form — called after the recovery email link is clicked.
 */
export function ResetPasswordForm() {
  const router = useRouter();

  const [values, setValues] = useState<ResetPasswordFormValues>({
    password:         '',
    confirm_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [state, setState]             = useState<ResetState>({ status: 'idle' });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (name in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof ResetPasswordFormValues];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setState({ status: 'idle' });
    setFieldErrors({});

    const parseResult = resetPasswordSchema.safeParse(values);
    if (!parseResult.success) {
      const errors: FieldErrors = {};
      parseResult.error.errors.forEach((issue: ZodIssue) => {
        const field = issue.path[0] as keyof ResetPasswordFormValues | undefined;
        if (field) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setState({ status: 'submitting' });
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.updateUser({
      password: parseResult.data.password,
    });

    if (error) {
      setState({
        status:  'error',
        message: 'Failed to update password. The reset link may have expired. Please request a new one.',
      });
      return;
    }

    setState({ status: 'success' });
    // Redirect to dashboard after a brief moment
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (state.status === 'success') {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">
          Password updated
        </h2>
        <p className="text-surface-600 text-sm">
          Your password has been changed successfully. Redirecting you to the dashboard…
        </p>
      </div>
    );
  }

  const isPending = state.status === 'submitting';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
      <div className="space-y-5">
        {state.status === 'error' && (
          <Alert variant="error">{state.message}</Alert>
        )}

        <Input
          label="New password"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          required
          disabled={isPending}
          helperText="Must include uppercase, lowercase, and a number."
        />

        <Input
          label="Confirm new password"
          type="password"
          name="confirm_password"
          value={values.confirm_password}
          onChange={handleChange}
          error={fieldErrors.confirm_password}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          required
          disabled={isPending}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isPending}
          loadingLabel="Updating password…"
        >
          Update password
        </Button>
      </div>
    </form>
  );
}
