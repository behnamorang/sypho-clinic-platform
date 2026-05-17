/**
 * @file lib/utils/supabase-project-url.ts
 * @description Normalizes Supabase project URLs from environment variables.
 *
 * Operators sometimes paste the REST endpoint (including `/rest/v1`) or a
 * trailing slash. Auth and PostgREST expect the bare project origin.
 */

/**
 * Returns the Supabase project base URL without `/rest/v1` suffix or trailing slash.
 *
 * @param raw - Value from NEXT_PUBLIC_SUPABASE_URL (may include REST path).
 * @returns Trimmed project origin suitable for Supabase clients and CSP connect-src.
 */
export function normalizeSupabaseProjectUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }

  let u = trimmed;
  if (u.endsWith('/')) {
    u = u.slice(0, -1);
  }

  const restMarker = '/rest/v1';
  const restIndex = u.indexOf(restMarker);
  if (restIndex !== -1) {
    u = u.slice(0, restIndex);
  }

  return u;
}
