/**
 * @file app/api/auth/signout/route.ts
 * @description Secure sign-out endpoint for Sypho.io.
 *
 * Invalidates the user's Supabase session server-side and clears
 * all auth cookies. Responds to POST requests to prevent CSRF attacks
 * (GET-based sign-out is a CSRF vulnerability).
 *
 * After sign-out, redirects to /login.
 *
 * @compliance GDPR Article 17 — supports user's right to end sessions.
 *             OWASP — POST-only sign-out prevents CSRF-triggered logouts.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient }      from '@/lib/supabase/server';

/**
 * POST /api/auth/signout
 *
 * Signs out the current user and redirects to the login page.
 * Called from a form POST (Server Action) or a fetch() in client code.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createSupabaseServerClient();

  // Sign out from Supabase — invalidates the session and clears cookies
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Sign Out] Failed to sign out:', error.message);
    // Even if server-side signout fails, redirect to login for safety
  }

  const { origin } = request.nextUrl;
  return NextResponse.redirect(new URL('/login', origin), { status: 303 });
}
