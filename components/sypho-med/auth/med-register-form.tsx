/**
 * @file components/sypho-med/auth/med-register-form.tsx
 * @description Obsidian-themed clinic owner registration form.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { PremiumInput } from '@/components/sypho-med/book-demo/premium-field';
import { MedAuthAlert } from '@/components/sypho-med/auth/med-auth-alert';
import { MedAuthButton } from '@/components/sypho-med/auth/med-auth-button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { mapRegisterSupabaseError } from '@/lib/auth/register-errors';
import { resolveAuthCallbackUrl } from '@/lib/utils/public-app-url';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth';
import type { ZodIssue } from 'zod';

type FieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

type RegistrationState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; email: string }
  | { status: 'error'; message: string };

/**
 * Registration with GDPR consent and email confirmation flow.
 */
export function MedRegisterForm() {
  const [values, setValues] = useState<
    Omit<RegisterFormValues, 'gdpr_consent'> & { gdpr_consent: boolean }
  >({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    gdpr_consent: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<RegistrationState>({ status: 'idle' });

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
    const callback = resolveAuthCallbackUrl();
    if (!callback.ok) {
      setState({ status: 'error', message: callback.message });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: parseResult.data.email,
      password: parseResult.data.password,
      options: {
        emailRedirectTo: callback.url,
        data: {
          first_name: parseResult.data.first_name,
          last_name: parseResult.data.last_name,
        },
      },
    });

    if (error) {
      setState({ status: 'error', message: mapRegisterSupabaseError(error) });
      return;
    }

    if (!data.user) {
      setState({
        status: 'error',
        message: 'Registration could not be completed. Please try again.',
      });
      return;
    }

    setState({ status: 'success', email: parseResult.data.email });
  }

  if (state.status === 'success') {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-neon-500/15 border border-neon-400/20 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-neon-400" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-medium text-white mb-2">Check your inbox</h2>
        <p className="text-sm text-silver-400 leading-relaxed mb-4">
          We sent a confirmation link to activate your clinic workspace.
        </p>
        <p className="text-sm font-medium text-neon-400/90 mb-6">{state.email}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-sm font-medium border border-white/10 text-silver-300 hover:text-white hover:border-neon-400/30 transition-colors"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  const isPending = state.status === 'submitting';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-5">
      {state.status === 'error' && (
        <MedAuthAlert variant="error">{state.message}</MedAuthAlert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <PremiumInput
          label="First name"
          name="first_name"
          value={values.first_name}
          onChange={handleChange}
          error={fieldErrors.first_name}
          autoComplete="given-name"
          required
          disabled={isPending}
        />
        <PremiumInput
          label="Last name"
          name="last_name"
          value={values.last_name}
          onChange={handleChange}
          error={fieldErrors.last_name}
          autoComplete="family-name"
          required
          disabled={isPending}
        />
      </div>

      <PremiumInput
        label="Work email"
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

      <PremiumInput
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
      />

      <PremiumInput
        label="Confirm password"
        type="password"
        name="confirm_password"
        value={values.confirm_password}
        onChange={handleChange}
        error={fieldErrors.confirm_password}
        autoComplete="new-password"
        required
        disabled={isPending}
      />

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="gdpr_consent"
            checked={values.gdpr_consent}
            onChange={handleChange}
            disabled={isPending}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-obsidian-200 text-neon-500 focus:ring-neon-500/40"
          />
          <span className="text-xs text-silver-500 leading-relaxed">
            I agree to Sypho&apos;s data processing under GDPR. My data is stored in EU data
            centers. <span className="text-danger-500">*</span>
          </span>
        </label>
        {fieldErrors.gdpr_consent !== undefined && (
          <p className="mt-1.5 text-xs text-danger-500" role="alert">
            {fieldErrors.gdpr_consent}
          </p>
        )}
      </div>

      <MedAuthButton isLoading={isPending} loadingLabel="Creating account…">
        Create account
      </MedAuthButton>
    </form>
  );
}
