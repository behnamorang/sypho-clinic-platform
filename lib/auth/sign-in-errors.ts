/**
 * @file lib/auth/sign-in-errors.ts
 * @description Safe Supabase sign-in error mapping (no PII in messages).
 */

type AuthLikeError = {
  message?: string | undefined;
  name?: string | undefined;
  status?: number | undefined;
  code?: string | undefined;
};

function redactEmailLikeSegments(text: string): string {
  return text.replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/gi, '[email]');
}

function signInErrorTechnicalHint(error: AuthLikeError): string {
  const parts = [
    typeof error.code === 'string' ? error.code : undefined,
    typeof error.name === 'string' ? error.name : undefined,
    typeof error.status === 'number' ? `HTTP ${error.status}` : undefined,
  ].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? ` (${parts.join(' · ')})` : '';
}

/**
 * Maps Supabase sign-in errors to user-safe copy.
 */
export function mapSignInErrorMessage(error: AuthLikeError): string {
  const rawMsg = typeof error.message === 'string' ? error.message : '';
  const msg = rawMsg.toLowerCase();
  const code = typeof error.code === 'string' ? error.code : undefined;
  const name = typeof error.name === 'string' ? error.name : undefined;

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Please confirm your email address using the link we sent you, then try again.';
  }

  const looksLikeWrongCredentials =
    code === 'invalid_credentials' ||
    name === 'AuthInvalidCredentialsError' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    msg.includes('email or password is incorrect') ||
    msg.includes('wrong email or password') ||
    msg.includes('invalid grant');

  if (looksLikeWrongCredentials) {
    return 'Incorrect email or password. If you just signed up, confirm your email first, or use Forgot password.';
  }

  if (
    name === 'AuthRetryableFetchError' ||
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('load failed')
  ) {
    return 'Network error. Check your connection and try again.';
  }

  if (
    code === 'over_request_rate_limit' ||
    error.status === 429 ||
    msg.includes('rate limit')
  ) {
    return 'Too many sign-in attempts. Wait a few minutes and try again.';
  }

  const redacted = redactEmailLikeSegments(rawMsg).trim();
  if (redacted.length > 0 && redacted.length < 200) {
    return `Sign-in failed: ${redacted}${signInErrorTechnicalHint(error)}`;
  }

  return `Sign-in failed. Please try again.${signInErrorTechnicalHint(error)}`;
}
