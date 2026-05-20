/**
 * @file components/sypho-med/auth/med-login-form.tsx
 * @description Obsidian-themed email/password login form.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PremiumInput } from '@/components/sypho-med/book-demo/premium-field';
import { MedAuthAlert } from '@/components/sypho-med/auth/med-auth-alert';
import { MedAuthButton } from '@/components/sypho-med/auth/med-auth-button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { mapSignInErrorMessage } from '@/lib/auth/sign-in-errors';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import type { ZodIssue } from 'zod';

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

export interface MedLoginFormProps {
  redirectTo?: string;
}

/**
 * Email/password authentication with neon focus fields.
 */
export function MedLoginForm({ redirectTo = '/dashboard' }: MedLoginFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
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
      email: parseResult.data.email,
      password: parseResult.data.password,
    });
    setIsPending(false);

    if (error) {
      setServerError(mapSignInErrorMessage(error));
      return;
    }

    router.refresh();
    router.push(redirectTo.startsWith('/') ? redirectTo : '/dashboard');
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-6">
      {serverError !== null && <MedAuthAlert variant="error">{serverError}</MedAuthAlert>}

      <PremiumInput
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
        <PremiumInput
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
        <div className="text-right mt-2">
          <Link
            href="/forgot-password"
            className="text-xs text-neon-400/80 hover:text-neon-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <MedAuthButton isLoading={isPending} loadingLabel="Signing in…">
        Sign in
      </MedAuthButton>
    </form>
  );
}
