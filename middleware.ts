/**
 * @file middleware.ts
 * @description Next.js Middleware for Sypho.io.
 *
 * Responsibilities (in execution order):
 * 1. Refresh the Supabase Auth session on every request (Supabase SSR pattern).
 * 2. Enforce authentication guards for protected routes.
 * 3. Enforce onboarding completion for clinic owners on first login.
 * 4. Prevent authenticated users from accessing auth pages.
 * 5. Inject geo detection headers for location-based personalization.
 * 6. Inject strict security headers (CSP, HSTS, etc.) on every response.
 *
 * CRITICAL Supabase SSR note:
 * The `supabaseResponse` object MUST be the response that is eventually returned.
 * Any redirect or custom response must copy that object's Set-Cookie headers so
 * refreshed session tokens are forwarded to the browser. Failing to do this causes
 * the "too many redirects" loop.
 *
 * Route categories:
 * - PROTECTED:   Require authentication. Unauthenticated → /login.
 * - AUTH:        Login/register pages. Authenticated → /dashboard.
 * - ONBOARDING:  Requires authentication but NOT onboarding completion.
 * - BOOKING:     Fully public — no auth, geo headers injected.
 * - PUBLIC:      No guards applied.
 *
 * @compliance
 * - GDPR Article 32: Technical security measures (security headers).
 * - GDPR: IP address used only for geo detection; never stored here.
 * - OWASP: CSP, HSTS, X-Frame-Options, referrer policy.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest }          from 'next/server';
import type { Database }                           from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// Route configuration
// ---------------------------------------------------------------------------

const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/api/clinics',
  '/api/doctors',
  '/api/patients',
  '/api/appointments',
  '/api/onboarding',
] as const;

const AUTH_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

const PUBLIC_BYPASS_PREFIXES = [
  '/api/auth/callback',
  '/api/auth/signout',
  '/api/booking/',
] as const;

/** Public patient-facing booking pages: /{slug}/booking/* */
const BOOKING_PAGE_PATTERN = /^\/[a-z0-9-]+\/booking(\/.*)?$/;

// ---------------------------------------------------------------------------
// Geo detection
// ---------------------------------------------------------------------------

function detectCountryCode(request: NextRequest): string {
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1') return cfCountry.toUpperCase();
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry) return vercelCountry.toUpperCase();
  const genericCountry = request.headers.get('x-country-code');
  if (genericCountry) return genericCountry.toUpperCase();
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const match = /[a-zA-Z]{2}-([A-Z]{2})/i.exec(acceptLanguage);
    if (match?.[1]) return match[1].toUpperCase();
  }
  return 'DE';
}

// ---------------------------------------------------------------------------
// CSP builder
// ---------------------------------------------------------------------------

function buildContentSecurityPolicy(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseUrl} wss:`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join('; ');
}

function injectSecurityHeaders(response: NextResponse): void {
  response.headers.set('Content-Security-Policy',   buildContentSecurityPolicy());
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options',           'DENY');
  response.headers.set('X-Content-Type-Options',    'nosniff');
  response.headers.set('Referrer-Policy',           'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',        'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('X-DNS-Prefetch-Control',    'off');
  response.headers.set('Cross-Origin-Opener-Policy','same-origin');
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ── Step 0a: Fully public API bypass ─────────────────────────────────────
  if (PUBLIC_BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    const res = NextResponse.next({ request });
    injectSecurityHeaders(res);
    return res;
  }

  // ── Step 0b: Public booking pages — inject geo header only ───────────────
  if (BOOKING_PAGE_PATTERN.test(pathname)) {
    const countryCode = detectCountryCode(request);
    const reqHeaders  = new Headers(request.headers);
    reqHeaders.set('x-geo-country', countryCode);
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    injectSecurityHeaders(res);
    return res;
  }

  // ── Step 1: Supabase SSR session management ───────────────────────────────
  //
  // `supabaseResponse` MUST be the object we return (or we copy its cookies
  // into any redirect we create). This is the official Supabase SSR pattern.
  //
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    injectSecurityHeaders(supabaseResponse);
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll(): { name: string; value: string }[] {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]): void {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Helper: redirect carrying refreshed session cookies
  function redirect(destination: string): NextResponse {
    const res = NextResponse.redirect(new URL(destination, request.url));
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    injectSecurityHeaders(res);
    return res;
  }

  // ── Step 2: Route classification ─────────────────────────────────────────
  const isProtectedRoute  = PROTECTED_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute       = AUTH_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isDashboardRoute  = pathname.startsWith('/dashboard');

  // ── Step 3: Auth guard ────────────────────────────────────────────────────
  if (isProtectedRoute && !user) {
    return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // ── Step 4: Onboarding guard ──────────────────────────────────────────────
  if (user) {
    const onboardingCompleted = user.app_metadata['onboarding_completed'] === true;
    if (!onboardingCompleted && isDashboardRoute) return redirect('/onboarding');
    if (onboardingCompleted && isOnboardingRoute)  return redirect('/dashboard');
  }

  // ── Step 5: Bounce authenticated users off auth pages ────────────────────
  if (isAuthRoute && user) return redirect('/dashboard');

  // ── Step 6: Geo + security headers ───────────────────────────────────────
  supabaseResponse.headers.set('x-geo-country', detectCountryCode(request));
  injectSecurityHeaders(supabaseResponse);

  return supabaseResponse;
}

// ---------------------------------------------------------------------------
// Matcher
// ---------------------------------------------------------------------------

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
