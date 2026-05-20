/**
 * @file lib/auth/register-errors.ts
 * @description Safe Supabase registration error mapping (no PII in messages).
 */

type AuthLikeError = {
  message?: string | undefined;
  name?: string | undefined;
  code?: string | undefined;
  status?: number | undefined;
};

function redactEmailsInMessage(text: string): string {
  return text.replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/gi, '[email]');
}

/**
 * Maps Supabase signUp errors to user-safe copy.
 */
export function mapRegisterSupabaseError(error: AuthLikeError): string {
  const raw = typeof error.message === 'string' ? error.message : '';
  const msg = raw.toLowerCase();
  const code = typeof error.code === 'string' ? error.code : undefined;

  const looksLikeAlreadyExists =
    code === 'email_exists' ||
    code === 'user_already_exists' ||
    msg.includes('already registered') ||
    msg.includes('user already registered') ||
    msg.includes('email already exists');

  if (looksLikeAlreadyExists) {
    return 'An account with this email already exists. Try signing in, or use Forgot password.';
  }

  if (code === 'signup_disabled' || msg.includes('signup is disabled')) {
    return 'New registrations are disabled. Contact support.';
  }

  if (code === 'weak_password' || msg.includes('weak password')) {
    return 'Password does not meet security requirements. Adjust it and try again.';
  }

  if (
    code === 'over_request_rate_limit' ||
    error.status === 429 ||
    msg.includes('rate limit')
  ) {
    return 'Too many attempts. Wait a few minutes and try again.';
  }

  const redacted = redactEmailsInMessage(raw).trim();
  if (redacted.length > 0 && redacted.length < 220) {
    return `Registration failed: ${redacted}`;
  }

  return 'Registration failed. Please try again.';
}
