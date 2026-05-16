/**
 * @file middleware/index.ts
 * @description Next.js Middleware for Sypho.io.
 *
 * Responsibilities:
 * 1. Refresh Supabase Auth session on every request.
 * 2. Enforce authentication guards for protected routes.
 * 3. Inject security headers (CSP, HSTS, etc.) for GDPR/compliance.
 * 4. Redirect unauthenticated users from protected routes to login.
 *
 * @compliance
 * - GDPR Article 32: Technical security measures (security headers).
 * - OWASP: CSP, HSTS, X-Frame-Options, referrer policy.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession }                   from '@/lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/api/clinics', '/api/doctors', '/api/patients', '/api/appointments'];

// Routes that authenticated users should not access (e.g., login page)
const AUTH_ROUTE_PREFIXES = ['/login', '/register', '/forgot-password'];

/**
 * Builds a strict Content Security Policy header.
 * Adjust directives based on third-party integrations as the project grows.
 */
function buildContentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",   // 'unsafe-inline' needed for Next.js — restrict further in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];
  return directives.join('; ');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Initialize response — session refresh will mutate cookies on this object
  let response = NextResponse.next({ request });

  // Step 1: Refresh Supabase session and get the current user
  const { response: updatedResponse, supabase } = await updateSession(request, response);
  response = updatedResponse;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Step 2: Route guards
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !user) {
    // Unauthenticated user attempting to access a protected route — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    // Authenticated user visiting auth pages — redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Step 3: Inject security headers on every response
  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy());
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (Next.js static assets)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico
     * - public folder assets (images, icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
