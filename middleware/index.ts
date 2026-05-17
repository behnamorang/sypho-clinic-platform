/**
 * @file middleware/index.ts
 * @description Next.js Middleware implementation for Sypho.io.
 *
 * Responsibilities (in execution order):
 * 1. Refresh the Supabase Auth session on every request.
 * 2. Enforce authentication guards for protected routes.
 * 3. Enforce onboarding completion for `/dashboard` only (incomplete → `/onboarding`).
 * 4. Prevent authenticated users from accessing auth pages (login/register).
 * 5. Inject strict security headers (CSP, HSTS, etc.) on every response.
 * 6. Detect visitor geolocation from CDN headers and forward as request headers.
 *    This allows Server Components on the booking page to read geo context
 *    via next/headers() without additional client-side API calls.
 *
 * Route categories:
 * - PROTECTED:   Require authentication. Unauthenticated → /login.
 * - AUTH:        Login/register pages. Authenticated → /dashboard.
 * - ONBOARDING:  Requires authentication; wizard vs /dashboard handoff is handled
 *                in `app/onboarding/page.tsx` (with membership check) to avoid
 *                redirect loops with the dashboard layout.
 * - BOOKING:     Fully public — no auth guard, no redirect.
 * - PUBLIC:      No guards applied.
 *
 * Geo detection (for Smart Location-Based Personalization):
 *   Reads the visitor's country from CDN-injected headers in this priority:
 *     1. Cloudflare:  CF-IPCountry
 *     2. Vercel Edge: x-vercel-ip-country
 *     3. Generic CDN: x-country-code
 *     4. Accept-Language header (language region hint)
 *     5. Fallback: 'DE' (EU default)
 *   The resolved country code is forwarded to Server Components via the
 *   request header x-geo-country.
 *
 * @compliance
 * - GDPR Article 32: Technical security measures (security headers).
 * - GDPR: IP address is used ONLY for geo detection; never stored here.
 * - OWASP: CSP, HSTS, X-Frame-Options, referrer policy.
 * - Multi-tenancy: Onboarding check prevents dashboard access without a clinic.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession }                  from '@/lib/supabase/middleware';

// ---------------------------------------------------------------------------
// Route configuration
// ---------------------------------------------------------------------------

/**
 * Public URL prefix for the clinic onboarding wizard.
 * Filesystem: `app/onboarding/`.
 */
const ONBOARDING_ROUTE_PREFIX = '/onboarding';

/**
 * Public URL prefix for authenticated clinic UI.
 * Filesystem: `app/(dashboard)/dashboard/` — route group `(dashboard)` is omitted from the path.
 */
const DASHBOARD_ROUTE_PREFIX = '/dashboard';

/** True when the pathname is the dashboard home or a nested dashboard route. */
function isDashboardPath(pathname: string): boolean {
  return pathname === DASHBOARD_ROUTE_PREFIX || pathname.startsWith(`${DASHBOARD_ROUTE_PREFIX}/`);
}

/** Routes that require a valid JWT session. */
const PROTECTED_ROUTE_PREFIXES = [
  DASHBOARD_ROUTE_PREFIX,
  ONBOARDING_ROUTE_PREFIX,
  '/api/clinics',
  '/api/doctors',
  '/api/patients',
  '/api/appointments',
  '/api/onboarding',
] as const;

/** Routes that authenticated users should not access (auth pages). */
const AUTH_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/** Routes that should be completely excluded from middleware processing. */
const PUBLIC_BYPASS_PREFIXES = [
  '/api/auth/callback',  // Auth callback must be fully public
  '/api/auth/signout',   // Sign-out must be accessible
  '/api/booking/',       // Public booking API — no auth required
] as const;

/** Pattern for public patient-facing booking pages: /{slug}/booking/* */
const BOOKING_PAGE_PATTERN = /^\/[a-z0-9-]+\/booking(\/.*)?$/;

// ---------------------------------------------------------------------------
// Geo detection
// ---------------------------------------------------------------------------

/**
 * Extracts the visitor's country from CDN/proxy request headers.
 *
 * Checks in priority order:
 *   1. Cloudflare CF-IPCountry (most reliable, attached by CDN before reaching origin)
 *   2. Vercel x-vercel-ip-country (Vercel Edge Network)
 *   3. Generic x-country-code (other CDN providers)
 *   4. Accept-Language header (language region hint — less reliable)
 *
 * GDPR: The IP address itself is never read or stored here. Only the
 * derived country code (non-personal metadata) is extracted and forwarded.
 *
 * @param request - The incoming Next.js request.
 * @returns ISO 3166-1 alpha-2 country code string (e.g., 'OM', 'DE', 'GB').
 */
function detectCountryCode(request: NextRequest): string {
  // Cloudflare CDN header (most reliable)
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1') {
    return cfCountry.toUpperCase();
  }

  // Vercel Edge Network header
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry) {
    return vercelCountry.toUpperCase();
  }

  // Generic CDN header (AWS CloudFront, etc.)
  const genericCountry = request.headers.get('x-country-code');
  if (genericCountry) {
    return genericCountry.toUpperCase();
  }

  // Accept-Language fallback (e.g., "ar-OM" → "OM", "en-GB" → "GB")
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const regionMatch = /[a-zA-Z]{2}-([A-Z]{2})/i.exec(acceptLanguage);
    if (regionMatch?.[1]) {
      return regionMatch[1].toUpperCase();
    }
  }

  // Default: EU (Germany) — safe GDPR-compliant default
  return 'DE';
}

// ---------------------------------------------------------------------------
// CSP builder
// ---------------------------------------------------------------------------

/**
 * Builds a strict Content Security Policy header.
 *
 * Directives are intentionally restrictive.
 * 'unsafe-inline' for scripts is required by Next.js (inline script tags for hydration).
 * Tighten further using nonces when using the experimental nonce support in Next.js.
 */
function buildContentSecurityPolicy(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // 'unsafe-eval' needed for Next.js dev mode
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseUrl} wss:`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ];

  return directives.join('; ');
}

// ---------------------------------------------------------------------------
// Middleware function
// ---------------------------------------------------------------------------

/**
 * Main middleware function — runs on every matched request.
 *
 * Execution order:
 * 1. Allow public bypass routes through immediately.
 * 2. Allow booking page routes through (public — no auth required).
 * 3. Refresh Supabase session and retrieve the current user.
 * 4. Apply protected-route guard (redirect unauthenticated users to /login).
 * 5. Apply onboarding guard for `/dashboard` only (incomplete onboarding → /onboarding).
 * 6. Redirect authenticated users away from auth pages.
 * 7. Inject geo country header for location-based personalization.
 * 8. Inject security headers.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // Step 0: Public bypass — skip all guards for specific API routes
  // ---------------------------------------------------------------------------
  const isBypassRoute = PUBLIC_BYPASS_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isBypassRoute) {
    const bypassResponse = NextResponse.next({ request });
    injectSecurityHeaders(bypassResponse);
    return bypassResponse;
  }

  // ---------------------------------------------------------------------------
  // Step 0b: Booking page routes — public, no auth guard.
  // Inject geo headers for server-side location personalization.
  // ---------------------------------------------------------------------------
  const isBookingPage = BOOKING_PAGE_PATTERN.test(pathname);

  if (isBookingPage) {
    const countryCode = detectCountryCode(request);

    // Forward geo country to Server Components via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-geo-country', countryCode);

    const bookingResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });
    injectSecurityHeaders(bookingResponse);
    return bookingResponse;
  }

  // ---------------------------------------------------------------------------
  // Step 1: Refresh Supabase session — MUST happen before any redirect logic.
  //         `updateSession` reads the existing JWT, validates it server-side,
  //         and refreshes it if expired. The returned `supabase` client uses
  //         the refreshed session for all subsequent calls in this request.
  // ---------------------------------------------------------------------------
  let response = NextResponse.next({ request });
  const { response: updatedResponse, supabase } = await updateSession(request, response);
  response = updatedResponse;

  // `getUser()` validates the JWT with the Supabase Auth server.
  // This is intentionally called AFTER updateSession to use the refreshed token.
  const { data: { user } } = await supabase.auth.getUser();

  // ---------------------------------------------------------------------------
  // Step 2: Route classification
  // ---------------------------------------------------------------------------
  const isProtectedRoute  = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthRoute       = AUTH_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isDashboardRoute  = isDashboardPath(pathname);

  // ---------------------------------------------------------------------------
  // Step 3: Authentication guard
  // Unauthenticated user → /login with original path preserved as `redirect`.
  // ---------------------------------------------------------------------------
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ---------------------------------------------------------------------------
  // Step 4: Onboarding guard (authenticated users only)
  //
  // Checks `user.app_metadata.onboarding_completed` which is populated by the
  // admin client after the onboarding wizard is completed.
  //
  // Since `getUser()` validates with the Supabase Auth server (not from cache),
  // it always returns the latest `app_metadata` state.
  // ---------------------------------------------------------------------------
  if (user) {
    const onboardingCompleted = user.app_metadata['onboarding_completed'] === true;

    // Authenticated but onboarding not complete → /onboarding
    // Exception: /onboarding route itself is always allowed through
    if (!onboardingCompleted && isDashboardRoute) {
      return NextResponse.redirect(new URL(ONBOARDING_ROUTE_PREFIX, request.url));
    }

    // Never redirect /onboarding → /dashboard here. `app/onboarding/page.tsx` and
    // `app/(dashboard)/layout.tsx` own that handoff (membership-aware) to avoid loops.
  }

  // ---------------------------------------------------------------------------
  // Step 5: Auth page guard
  // Authenticated users should not see login/register pages → /dashboard
  // ---------------------------------------------------------------------------
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTE_PREFIX, request.url));
  }

  // ---------------------------------------------------------------------------
  // Step 6: Inject geo header for all authenticated routes as well
  // (useful for future dashboard geo features)
  // ---------------------------------------------------------------------------
  const countryCode = detectCountryCode(request);
  response.headers.set('x-geo-country', countryCode);

  // ---------------------------------------------------------------------------
  // Step 7: Inject security headers on all responses
  // ---------------------------------------------------------------------------
  injectSecurityHeaders(response);

  return response;
}

// ---------------------------------------------------------------------------
// Security header injection
// ---------------------------------------------------------------------------

/**
 * Injects OWASP-recommended security headers on every response.
 * These complement the CSP to provide defense-in-depth.
 *
 * @param response - The NextResponse to mutate with security headers.
 */
function injectSecurityHeaders(response: NextResponse): void {
  response.headers.set('Content-Security-Policy',   buildContentSecurityPolicy());
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options',           'DENY');
  response.headers.set('X-Content-Type-Options',    'nosniff');
  response.headers.set('Referrer-Policy',            'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',         'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('X-DNS-Prefetch-Control',    'off');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
}

// ---------------------------------------------------------------------------
// Middleware matcher
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /**
     * Match all request paths EXCEPT:
     * - _next/static  (Next.js static assets — no middleware needed)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico   (browser favicon)
     * - public/       (static files in /public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
