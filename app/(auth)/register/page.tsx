/**
 * @file app/(auth)/register/page.tsx
 * @description Clinic owner registration page for Sypho.io.
 *
 * Presents the registration form for new clinic owners.
 * After registration, users must confirm their email before proceeding
 * to the onboarding wizard.
 *
 * @compliance GDPR — explicit consent captured in the RegisterForm component.
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
import { RegisterForm } from '@/components/forms/register-form';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create your Sypho clinic management account.',
};

/**
 * Registration page — Server Component.
 * Renders the RegisterForm client component.
 */
export default function RegisterPage() {
  return (
    <Card className="shadow-card-lg animate-fade-in">
      <CardHeader className="pb-4 pt-8 px-8">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Start your 14-day free trial — no credit card required.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <RegisterForm />

        <div className="mt-6 pt-5 border-t border-surface-100 text-center">
          <p className="text-sm text-surface-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
