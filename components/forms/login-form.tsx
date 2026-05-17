/**
 * @file components/forms/login-form.tsx
 * @description Email + password login form for clinic staff and owners.
 *
 * Client Component — uses Supabase browser client for authentication.
 * On success, the session cookie is set and the user is redirected
 * to /dashboard (middleware handles onboarding checks).
 *
 * @compliance GDPR — no PII is logged; password never stored client-side.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Alert }    from '@/components/ui/alert';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

type AuthLikeError = {
  message?: string;
  name?: string;
  status?: number;
  code?: string;
};

/** Removes email-shaped substrings so server messages can be shown without leaking addresses. */
function redactEmailLikeSegments(text: string): string {
  return text.replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/gi, '[email]');
}

function signInErrorTechnicalHint(error: AuthLikeError): string {
  const parts = [
    typeof error.code === 'string' ? error.code : undefined,
    typeof error.name === 'string' ? error.name : undefined,
    typeof error.status === 'number' ? `HTTP ${error.status}` : undefined,
  ].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? ` (${parts.join(' · ')})` : '';
}

/**
 * Maps Supabase / GoTrue sign-in errors to safe UI copy (no PII).
 * GoTrue and auth-js use several shapes: `AuthApiError` with `code`,
 * `CustomAuthError` subclasses with only `name` + `message`, or legacy strings.
 */
function mapSignInErrorMessage(error: AuthLikeError): string {
  const rawMsg = typeof error.message === 'string' ? error.message : '';
  const msg = rawMsg.toLowerCase();
  const code = typeof error.code === 'string' ? error.code : undefined;
  const name = typeof error.name === 'string' ? error.name : undefined;

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Please confirm your email address using the link we sent you, then try again.';
  }

  const looksLikeWrongCredentials =
    code === 'invalid_credentials' ||
    name === 'AuthInvalidCredentialsError' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    msg.includes('email or password is incorrect') ||
    msg.includes('wrong email or password') ||
    msg.includes('invalid grant');

  if (looksLikeWrongCredentials) {
    return 'Incorrect email or password. If you just signed up, confirm your email from the message we sent, or use Forgot password.';
  }

  if (
    name === 'AuthInvalidTokenResponseError' ||
    msg.includes('auth session or user missing') ||
    msg.includes('auth session missing')
  ) {
    return (
      'Sign-in could not complete (no session returned). ' +
      'Check that Vercel has the correct Supabase URL and anon key for this project, then try again.'
    );
  }

  if (
    code === 'over_request_rate_limit' ||
    error.status === 429 ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  ) {
    return 'Too many sign-in attempts. Wait a few minutes and try again.';
  }

  if (code === 'captcha_failed' || msg.includes('captcha')) {
    return 'Captcha verification failed. Refresh the page and try again.';
  }

  if (code === 'user_banned' || msg.includes('user is banned') || msg.includes('banned')) {
    return 'This account cannot sign in. Contact your clinic administrator.';
  }

  if (
    name === 'AuthRetryableFetchError' ||
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('load failed')
  ) {
    return 'Network error. Check your connection and try again.';
  }

  if (code === 'email_provider_disabled' || code === 'provider_disabled') {
    return 'Email sign-in is disabled for this project. Contact support.';
  }

  // Short server messages — redact emails so GoTrue hints are visible
  const redacted = redactEmailLikeSegments(rawMsg).trim();
  if (redacted.length > 0 && redacted.length < 200) {
    return `Sign-in failed: ${redacted}${signInErrorTechnicalHint(error)}`;
  }

  return `Sign-in failed. Please try again.${signInErrorTechnicalHint(error)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Login form with email/password fields, validation, and error display.
 * Redirect destination can be pre-filled via the `redirectTo` prop
 * (e.g. when the user was previously redirected from a protected route).
 */
export function LoginForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const router = useRouter();

  const [values, setValues] = useState<LoginFormValues>({
    email:    '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending]     = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (name in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof LoginFormValues];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setServerError(null);
    setFieldErrors({});

    // Client-side validation
    const parseResult = loginSchema.safeParse(values);
    if (!parseResult.success) {
      const errors: FieldErrors = {};
      parseResult.error.errors.forEach((issue: ZodIssue) => {
        const field = issue.path[0] as keyof LoginFormValues | undefined;
        if (field) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({
      email:    parseResult.data.email,
      password: parseResult.data.password,
    });

    setIsPending(false);

    if (error) {
      setServerError(mapSignInErrorMessage(error as unknown as AuthLikeError));
      return;
    }

    // Refresh the Next.js router to trigger middleware session detection
    router.refresh();
    router.push(redirectTo.startsWith('/') ? redirectTo : '/dashboard');
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
      <div className="space-y-5">
        {serverError && (
          <Alert variant="error">
            {serverError}
          </Alert>
        )}

        <Input
          label="Email address"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          error={fieldErrors.email}
          autoComplete="email"
          placeholder="you@clinic.com"
          required
          disabled={isPending}
        />

        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            error={fieldErrors.password}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={isPending}
          />
          <div className="text-right mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isPending}
          loadingLabel="Signing in…"
        >
          Sign in
        </Button>
      </div>
    </form>
  );
}
