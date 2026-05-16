/**
 * @file app/(auth)/login/page.tsx
 * @description Login page for Sypho.io clinic staff and owners.
 *
 * Renders the LoginForm client component within the auth layout.
 * The `redirect` search parameter is passed to the form so users
 * can be returned to the page they originally tried to access.
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
import { LoginForm } from '@/components/forms/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Sypho clinic management account.',
};

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
    error?:    string;
  }>;
}

/**
 * Login page — Server Component that passes query params to the client form.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params    = await searchParams;
  const redirectTo = params.redirect;
  const errorCode  = params.error;

  return (
    <Card className="shadow-card-lg animate-fade-in">
      <CardHeader className="pb-4 pt-8 px-8">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your clinic account to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {/* Show a message if redirected due to an auth error */}
        {errorCode === 'session_expired' && (
          <div className="mb-5 p-3 bg-warning-50 border border-warning-500/20 rounded-lg text-xs text-warning-700">
            Your session has expired. Please sign in again.
          </div>
        )}

        {redirectTo !== undefined
          ? <LoginForm redirectTo={redirectTo} />
          : <LoginForm />
        }

        <div className="mt-6 pt-5 border-t border-surface-100 text-center">
          <p className="text-sm text-surface-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Create one free
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
