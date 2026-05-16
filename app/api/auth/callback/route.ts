/**
 * @file app/api/auth/callback/route.ts
 * @description Supabase Auth callback handler for Sypho.io.
 *
 * Handles two authentication flows:
 *
 * 1. PKCE code exchange — email confirmation, OAuth providers.
 *    Triggered when Supabase redirects to `/api/auth/callback?code=<CODE>`.
 *
 * 2. Token hash verification — magic links, password recovery.
 *    Triggered when Supabase redirects to `/api/auth/callback?token_hash=<HASH>&type=<TYPE>`.
 *
 * After successful session establishment:
 * - If the user has completed onboarding → redirect to /dashboard
 * - If the user has NOT completed onboarding → redirect to /onboarding
 * - On error → redirect to /login?error=<CODE>
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 * @compliance GDPR Article 32 — secure session handling; no PII in URLs.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient }      from '@/lib/supabase/server';
import { hasCompletedOnboarding }          from '@/lib/auth/helpers';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;

  const code      = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type      = searchParams.get('type') as
    | 'signup'
    | 'recovery'
    | 'email_change'
    | 'magiclink'
    | null;

  // Prevent open redirect attacks — only redirect to same origin
  const next       = searchParams.get('next') ?? '/dashboard';
  const safeNext   = next.startsWith('/') ? next : '/dashboard';

  const supabase = await createSupabaseServerClient();

  // ---------------------------------------------------------------------------
  // Flow 1: PKCE code exchange
  // ---------------------------------------------------------------------------
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Code exchange failed:', error.message);
      return NextResponse.redirect(
        new URL(`/login?error=auth_callback_failed`, origin),
      );
    }

    return resolvePostAuthRedirect(supabase, origin, safeNext, type);
  }

  // ---------------------------------------------------------------------------
  // Flow 2: Token hash (magic link / recovery)
  // ---------------------------------------------------------------------------
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

    if (error) {
      console.error('[Auth Callback] Token verification failed:', error.message);
      return NextResponse.redirect(
        new URL(`/login?error=token_expired`, origin),
      );
    }

    if (type === 'recovery') {
      // Password recovery — redirect to the reset-password page to set new password
      return NextResponse.redirect(new URL('/reset-password', origin));
    }

    return resolvePostAuthRedirect(supabase, origin, safeNext, type);
  }

  // No valid parameters — redirect to login
  return NextResponse.redirect(new URL('/login?error=invalid_callback', origin));
}

// ---------------------------------------------------------------------------
// Internal: determine where to redirect after successful auth
// ---------------------------------------------------------------------------

async function resolvePostAuthRedirect(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  origin:   string,
  next:     string,
  type:     string | null,
): Promise<NextResponse> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=session_not_found', origin));
  }

  // Password recovery always goes to reset-password
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password', origin));
  }

  // Check onboarding status from app_metadata (set by admin after onboarding)
  if (hasCompletedOnboarding(user)) {
    return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL('/onboarding', origin));
}
