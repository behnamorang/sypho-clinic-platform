/**
 * @file components/forms/forgot-password-form.tsx
 * @description Forgot password form — sends a password reset link to the user's email.
 *
 * Uses `supabase.auth.resetPasswordForEmail()` which triggers Supabase to send
 * a recovery email. The link targets `/api/auth/callback?type=recovery`; that
 * URL must be allowed in Supabase → Authentication → URL Configuration → Redirect URLs.
 *
 * @compliance GDPR — no PII logged. Rate limiting on auth endpoints applies.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input }   from '@/components/ui/input';
import { Button }  from '@/components/ui/button';
import { Alert }   from '@/components/ui/alert';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { resolveAuthCallbackUrl } from '@/lib/utils/public-app-url';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ForgotPasswordState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Forgot password form — accepts email and sends a reset link.
 */
export function ForgotPasswordForm() {
  const [email, setEmail]         = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [state, setState]         = useState<ForgotPasswordState>({ status: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setState({ status: 'idle' });
    setEmailError(undefined);

    const parseResult = forgotPasswordSchema.safeParse({ email });
    if (!parseResult.success) {
      const issue = parseResult.error.errors[0] as ZodIssue | undefined;
      setEmailError(issue?.message);
      return;
    }

    setState({ status: 'submitting' });
    const callback = resolveAuthCallbackUrl('?type=recovery');
    if (!callback.ok) {
      setState({ status: 'error', message: callback.message });
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      parseResult.data.email,
      {
        redirectTo: callback.url,
      },
    );

    if (error) {
      setState({
        status:  'error',
        message: 'Unable to send reset email. Please try again.',
      });
      return;
    }

    // Always show success to prevent email enumeration attacks
    setState({ status: 'success' });
  }

  if (state.status === 'success') {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">
          Reset link sent
        </h2>
        <p className="text-surface-600 text-sm leading-relaxed mb-6">
          If an account exists for this email address, you will receive a password reset link
          shortly. Check your spam folder if you don&apos;t see it.
        </p>
        <Link
          href="/login"
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          ← Back to sign in
        </Link>
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

        <Alert variant="info">
          Enter the email address associated with your account and we&apos;ll send you a link
          to reset your password.
        </Alert>

        <Input
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(undefined);
          }}
          error={emailError}
          autoComplete="email"
          placeholder="you@clinic.com"
          required
          disabled={isPending}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isPending}
          loadingLabel="Sending reset link…"
        >
          Send reset link
        </Button>

        <p className="text-center text-sm text-surface-500">
          Remembered your password?{' '}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
