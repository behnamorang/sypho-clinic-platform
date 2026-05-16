/**
 * @file middleware/index.ts
 * @description Next.js Middleware implementation for Sypho.io.
 *
 * Responsibilities (in execution order):
 * 1. Refresh the Supabase Auth session on every request.
 * 2. Enforce authentication guards for protected routes.
 * 3. Enforce onboarding completion for clinic owners on first login.
 * 4. Prevent authenticated users from accessing auth pages (login/register).
 * 5. Inject strict security headers (CSP, HSTS, etc.) on every response.
 *
 * Route categories:
 * - PROTECTED:   Require authentication. Unauthenticated → /login.
 * - AUTH:        Login/register pages. Authenticated → /dashboard.
 * - ONBOARDING:  Requires authentication but NOT onboarding completion.
 * - PUBLIC:      No guards applied.
 *
 * @compliance
 * - GDPR Article 32: Technical security measures (security headers).
 * - OWASP: CSP, HSTS, X-Frame-Options, referrer policy.
 * - Multi-tenancy: Onboarding check prevents dashboardaccess without a clinic.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession }                  from '@/lib/supabase/middleware';

// ---------------------------------------------------------------------------
// Route configuration
// ---------------------------------------------------------------------------

/** Routes that require a valid JWT session. */
const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/onboarding',
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
] as const;

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
 * 2. Refresh Supabase session and retrieve the current user.
 * 3. Apply auth route guard (redirect unauthenticated users).
 * 4. Apply onboarding guard (redirect to /onboarding if not yet completed).
 * 5. Redirect authenticated users away from auth pages.
 * 6. Inject security headers.
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
    pathname.startsWith(prefix),
  );
  const isAuthRoute       = AUTH_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isDashboardRoute  = pathname.startsWith('/dashboard');

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
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Onboarding already complete → /dashboard (don't re-visit wizard)
    if (onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ---------------------------------------------------------------------------
  // Step 5: Auth page guard
  // Authenticated users should not see login/register pages → /dashboard
  // ---------------------------------------------------------------------------
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ---------------------------------------------------------------------------
  // Step 6: Inject security headers on all responses
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
