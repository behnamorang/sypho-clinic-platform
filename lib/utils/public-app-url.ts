/**
 * @file lib/utils/public-app-url.ts
 * @description Resolves the public site origin for Supabase auth redirect URLs.
 *
 * Supabase emails use the `redirectTo` / `emailRedirectTo` we send. If Vercel
 * mistakenly has `NEXT_PUBLIC_APP_URL=http://localhost:3000` (copied from
 * `.env.example`), prefer the real page origin when the user is on a deployed
 * host so magic links do not point at localhost.
 *
 * For **email links** (`getAuthEmailRedirectOrigin`), a non-loopback
 * `NEXT_PUBLIC_APP_URL` always wins so confirmation links are not built with
 * `http://localhost:3000` when developers open the register form locally.
 *
 * Operators must still set Supabase Authentication → URL Configuration:
 * Site URL and Redirect URL allowlist to the production origin. If Site URL
 * stays on localhost, some email templates still redirect there regardless
 * of `emailRedirectTo`.
 */

/** True for localhost / loopback hosts only (not "local" TLD). */
function isLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

function parseHttpOrigin(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

/**
 * Returns the canonical public origin (scheme + host, no trailing slash) for
 * building absolute auth callback URLs in Client Components.
 */
export function getPublicAppOrigin(): string {
  const envOrigin = parseHttpOrigin(process.env.NEXT_PUBLIC_APP_URL);

  if (typeof window !== 'undefined') {
    const pageOrigin = window.location.origin;
    // User is on production / preview — always use that, even if env says localhost
    if (!isLoopbackOrigin(pageOrigin)) {
      return pageOrigin;
    }
    // Local dev: optional override to hit a deployed callback (rare)
    if (envOrigin && !isLoopbackOrigin(envOrigin)) {
      return envOrigin;
    }
    return pageOrigin;
  }

  // No window (SSR / edge) — never return loopback from env on Vercel
  if (process.env.VERCEL === '1') {
    const vo = parseHttpOrigin(
      process.env.VERCEL_URL?.startsWith('http')
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL ?? ''}`,
    );
    if (vo && !isLoopbackOrigin(vo)) {
      return vo;
    }
  }
  if (envOrigin && !isLoopbackOrigin(envOrigin)) {
    return envOrigin;
  }
  return envOrigin ?? '';
}

/**
 * Origin embedded in Supabase auth emails (`emailRedirectTo` / `redirectTo`).
 *
 * Prefer `NEXT_PUBLIC_APP_URL` when it points to a deployed host so
 * confirmation and recovery links never use `localhost` even if the form was
 * submitted from a local dev server.
 */
export function getAuthEmailRedirectOrigin(): string {
  const envOrigin = parseHttpOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (envOrigin && !isLoopbackOrigin(envOrigin)) {
    return envOrigin;
  }
  return getPublicAppOrigin();
}

export type AuthCallbackUrlResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

/**
 * Absolute `/api/auth/callback` URL for Supabase `redirect_to` / `emailRedirectTo`.
 * If this URL is not listed under Supabase → Authentication → URL Configuration →
 * Redirect URLs, GoTrue may reject the flow or confirmation emails may not send.
 *
 * @param pathSuffix - Appended after `/api/auth/callback` (e.g. `?type=recovery`).
 */
export function resolveAuthCallbackUrl(pathSuffix: string = ''): AuthCallbackUrlResult {
  const origin = getAuthEmailRedirectOrigin().replace(/\/$/, '');
  if (!origin) {
    return {
      ok:      false,
      message:
        'Application URL is missing. Set NEXT_PUBLIC_APP_URL on Vercel to your HTTPS site (for example https://your-app.vercel.app), then redeploy.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return {
      ok:      false,
      message: 'NEXT_PUBLIC_APP_URL is not a valid URL. Fix it in Vercel and redeploy.',
    };
  }

  const loopback = isLoopbackOrigin(origin);
  if (!loopback && parsed.protocol !== 'https:') {
    return {
      ok:      false,
      message:
        'Production app URL must use HTTPS. Update NEXT_PUBLIC_APP_URL on Vercel and redeploy.',
    };
  }

  return { ok: true, url: `${parsed.origin}/api/auth/callback${pathSuffix}` };
}
