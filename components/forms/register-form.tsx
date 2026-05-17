/**
 * @file components/forms/register-form.tsx
 * @description Clinic owner registration form for Sypho.io.
 *
 * Captures: first name, last name, email, password, confirm password,
 * and explicit GDPR consent.
 *
 * On successful registration, Supabase sends a confirmation email.
 * The user must confirm before they can sign in and complete onboarding.
 *
 * @compliance
 * - GDPR Article 7 — explicit, granular consent captured and displayed.
 * - GDPR Article 13 — informs user about data processing at point of collection.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input }   from '@/components/ui/input';
import { Button }  from '@/components/ui/button';
import { Alert }   from '@/components/ui/alert';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getPublicAppOrigin } from '@/lib/utils/public-app-url';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

type RegistrationState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; email: string }
  | { status: 'error'; message: string };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Registration form for new clinic owners.
 * Shows a "check your email" confirmation screen on success.
 */
export function RegisterForm() {
  const [values, setValues] = useState<Omit<RegisterFormValues, 'gdpr_consent'> & { gdpr_consent: boolean }>({
    first_name:       '',
    last_name:        '',
    email:            '',
    password:         '',
    confirm_password: '',
    gdpr_consent:     false,
  });

  const [fieldErrors, setFieldErrors]   = useState<FieldErrors>({});
  const [state, setState]               = useState<RegistrationState>({ status: 'idle' });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues((prev) => ({ ...prev, [name]: fieldValue }));

    if (name in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof RegisterFormValues];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setState({ status: 'idle' });
    setFieldErrors({});

    // Cast consent to the literal true type for Zod
    const valuesToValidate = {
      ...values,
      gdpr_consent: values.gdpr_consent as true,
    };

    const parseResult = registerSchema.safeParse(valuesToValidate);
    if (!parseResult.success) {
      const errors: FieldErrors = {};
      parseResult.error.errors.forEach((issue: ZodIssue) => {
        const field = issue.path[0] as keyof RegisterFormValues | undefined;
        if (field) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setState({ status: 'submitting' });
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signUp({
      email:    parseResult.data.email,
      password: parseResult.data.password,
      options:  {
        emailRedirectTo: `${getPublicAppOrigin()}/api/auth/callback`,
        data: {
          first_name: parseResult.data.first_name,
          last_name:  parseResult.data.last_name,
        },
      },
    });

    if (error) {
      const message =
        error.message.includes('already registered') ||
        error.message.includes('User already registered')
          ? 'An account with this email already exists. Please sign in instead.'
          : 'Registration failed. Please try again.';

      setState({ status: 'error', message });
      return;
    }

    setState({ status: 'success', email: parseResult.data.email });
  }

  // ---------------------------------------------------------------------------
  // Success screen
  // ---------------------------------------------------------------------------

  if (state.status === 'success') {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">
          Check your inbox
        </h2>
        <p className="text-surface-600 text-sm leading-relaxed mb-1">
          We sent a confirmation link to:
        </p>
        <p className="font-semibold text-surface-900 text-sm mb-4">
          {state.email}
        </p>
        <p className="text-surface-500 text-xs">
          Click the link in the email to activate your account. The link expires in 24 hours.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render form
  // ---------------------------------------------------------------------------

  const isPending = state.status === 'submitting';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
      <div className="space-y-5">
        {state.status === 'error' && (
          <Alert variant="error">{state.message}</Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            type="text"
            name="first_name"
            value={values.first_name}
            onChange={handleChange}
            error={fieldErrors.first_name}
            autoComplete="given-name"
            placeholder="Jane"
            required
            disabled={isPending}
          />
          <Input
            label="Last name"
            type="text"
            name="last_name"
            value={values.last_name}
            onChange={handleChange}
            error={fieldErrors.last_name}
            autoComplete="family-name"
            placeholder="Smith"
            required
            disabled={isPending}
          />
        </div>

        <Input
          label="Work email address"
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

        <Input
          label="Password"
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
          label="Confirm password"
          type="password"
          name="confirm_password"
          value={values.confirm_password}
          onChange={handleChange}
          error={fieldErrors.confirm_password}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          required
          disabled={isPending}
        />

        {/* GDPR consent checkbox — Article 7 */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="gdpr_consent"
              checked={values.gdpr_consent}
              onChange={handleChange}
              disabled={isPending}
              className="mt-0.5 h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              aria-describedby="gdpr-consent-description"
            />
            <span
              id="gdpr-consent-description"
              className="text-xs text-surface-600 leading-relaxed"
            >
              I agree to Sypho&apos;s{' '}
              <Link href="/privacy" className="text-brand-600 hover:underline" target="_blank">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="text-brand-600 hover:underline" target="_blank">
                Terms of Service
              </Link>
              . I understand that my data will be processed in accordance with GDPR and stored
              in EU data centers.{' '}
              <span className="text-danger-500" aria-hidden="true">*</span>
            </span>
          </label>
          {fieldErrors.gdpr_consent && (
            <p role="alert" className="mt-1.5 text-xs text-danger-600">
              {fieldErrors.gdpr_consent}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isPending}
          loadingLabel="Creating account…"
        >
          Create account
        </Button>
      </div>
    </form>
  );
}
