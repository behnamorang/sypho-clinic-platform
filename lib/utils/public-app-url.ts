/**
 * @file lib/utils/public-app-url.ts
 * @description Resolves the public site origin for Supabase auth redirect URLs.
 *
 * Prefer `NEXT_PUBLIC_APP_URL` on deployed builds so password-reset and signup
 * confirmation links target production, matching Supabase "Redirect URLs".
 * Falls back to `window.location.origin` in the browser when unset.
 */

/**
 * Returns the canonical public origin (scheme + host, no trailing slash) for
 * building absolute auth callback URLs in Client Components.
 */
export function getPublicAppOrigin(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    try {
      return new URL(envUrl).origin;
    } catch {
      // Invalid URL in env — fall through to window
    }
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}
