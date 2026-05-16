/**
 * @file middleware.ts
 * @description Supabase session refresh utility for Next.js Middleware.
 *
 * This module exports a helper function used inside `middleware/index.ts`
 * to refresh the Supabase Auth session on every request. Without this,
 * server-side session tokens can expire between requests.
 *
 * The middleware client does NOT have read access to the response body —
 * it only interacts with cookies for session management.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 * @compliance GDPR — Session management only; no personal data is processed here.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse }          from 'next/server';
import type { Database }                            from '@/database/types/database.types';

/**
 * Updates the Supabase session within a Next.js Middleware function.
 *
 * This function must be called at the top of the middleware handler to ensure
 * the user's session is valid and refreshed before any route logic executes.
 *
 * @param request  - The incoming Next.js request object.
 * @param response - The outgoing Next.js response object.
 * @returns An object containing the updated response and the Supabase client,
 *          which can be used to retrieve the session for auth guards.
 *
 * @example
 * ```ts
 * // middleware/index.ts
 * import { updateSession } from '@/lib/supabase/middleware';
 *
 * export async function middleware(request: NextRequest) {
 *   const { response, supabase } = await updateSession(request);
 *   const { data: { user } } = await supabase.auth.getUser();
 *   if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
 *     return NextResponse.redirect(new URL('/login', request.url));
 *   }
 *   return response;
 * }
 * ```
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<{ response: NextResponse; supabase: ReturnType<typeof createServerClient<Database>> }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '[Supabase Middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh the session without exposing the service role.
  // getUser() validates the JWT with the Supabase server on every call.
  await supabase.auth.getUser();

  return { response, supabase };
}
