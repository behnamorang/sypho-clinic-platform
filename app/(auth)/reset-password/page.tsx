/**
 * @file app/(auth)/reset-password/page.tsx
 * @description Password reset page — reached via the recovery email link.
 *
 * The recovery callback (/api/auth/callback?type=recovery) establishes the
 * session before redirecting here. The ResetPasswordForm then calls
 * supabase.auth.updateUser() to set the new password.
 */

import type { Metadata } from 'next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';

export const metadata: Metadata = {
  title: 'Set new password',
  description: 'Set a new password for your Sypho account.',
};

/**
 * Reset password page — Server Component.
 */
export default function ResetPasswordPage() {
  return (
    <Card className="shadow-card-lg animate-fade-in">
      <CardHeader className="pb-4 pt-8 px-8">
        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-brand-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>
          Choose a strong password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
