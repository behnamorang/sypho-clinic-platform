/**
 * @file lib/validations/auth.ts
 * @description Zod validation schemas for authentication forms in Sypho.io.
 *
 * All user inputs are validated at the API boundary and on the client side.
 * These schemas serve as the single source of truth for field constraints.
 *
 * @compliance GDPR — explicit consent field required at registration.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared field schemas
// ---------------------------------------------------------------------------

const emailSchema = z
  .string()
  .min(1, 'Email address is required.')
  .email('Please enter a valid email address.')
  .max(254, 'Email address is too long.')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password cannot exceed 72 characters.')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  );

// ---------------------------------------------------------------------------
// Login schema
// ---------------------------------------------------------------------------

/**
 * Validates the login form (email + password).
 */
export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Register schema
// ---------------------------------------------------------------------------

/**
 * Validates the clinic owner registration form.
 * Includes GDPR explicit consent field.
 */
export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, 'First name is required.')
      .max(100, 'First name is too long.')
      .trim(),

    last_name: z
      .string()
      .min(1, 'Last name is required.')
      .max(100, 'Last name is too long.')
      .trim(),

    email:            emailSchema,
    password:         passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password.'),

    /** GDPR Article 7 — explicit consent to data processing is mandatory. */
    gdpr_consent: z.literal(true, {
      errorMap: () => ({
        message: 'You must accept the Privacy Policy and Terms to create an account.',
      }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Forgot password schema
// ---------------------------------------------------------------------------

/**
 * Validates the forgot-password form (email only).
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ---------------------------------------------------------------------------
// Reset password schema
// ---------------------------------------------------------------------------

/**
 * Validates the password reset form (new password + confirmation).
 */
export const resetPasswordSchema = z
  .object({
    password:         passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
