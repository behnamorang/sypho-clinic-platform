/**
 * @file app/(auth)/forgot-password/page.tsx
 * @description Forgot password page for Sypho.io.
 *
 * Allows users to request a password reset email.
 * The email contains a secure link that expires after 24 hours.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset your Sypho account password.',
};

/**
 * Forgot password page — Server Component.
 */
export default function ForgotPasswordPage() {
  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-surface-600 hover:text-brand-600 mb-5 font-medium transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to sign in
      </Link>

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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>
            No problem. Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
