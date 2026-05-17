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
      // Prefer machine-readable codes: GoTrue sometimes returns `invalid_credentials`
      // for wrong password AND for unconfirmed email (to avoid account enumeration).
      const code = 'code' in error && typeof error.code === 'string' ? error.code : undefined;

      let message: string;
      if (
        code === 'email_not_confirmed' ||
        error.message === 'Email not confirmed'
      ) {
        message =
          'Please confirm your email address using the link we sent you, then try again.';
      } else if (
        code === 'invalid_credentials' ||
        error.message === 'Invalid login credentials'
      ) {
        message =
          'Incorrect email or password. If you just signed up, confirm your email from the message we sent, or use Forgot password.';
      } else {
        message = 'Sign-in failed. Please try again.';
      }

      setServerError(message);
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
