/**
 * @file server.ts
 * @description Server-side Supabase client for Sypho.io.
 *
 * This module provides two server-side Supabase client factories:
 *
 * 1. `createSupabaseServerClient()` — For use in Server Components, Route Handlers,
 *    and Server Actions. Reads/writes auth cookies to maintain user session.
 *    Uses the ANON key; access control enforced by RLS.
 *
 * 2. `createSupabaseAdminClient()` — For use in privileged server-only contexts
 *    (e.g., background jobs, webhook handlers, data pipeline scripts).
 *    Uses the SERVICE ROLE key; BYPASSES RLS — use with extreme caution.
 *
 * SECURITY RULES:
 * - NEVER import or instantiate the admin client in any file that could be
 *   bundled into the client (no 'use client' files, no shared utilities).
 * - The SERVICE ROLE key must NEVER be exposed to the browser.
 * - Always prefer the server client over the admin client.
 * - The admin client should only be used when RLS enforcement is impossible
 *   for the operation (e.g., system-level inserts, cross-tenant admin tasks).
 *
 * @compliance GDPR — Server clients enforce tenant isolation via RLS.
 *             Admin client bypasses RLS; callers are responsible for isolation.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient }                             from '@supabase/supabase-js';
import { cookies }                                  from 'next/headers';
import type { Database }                            from '@/database/types/database.types';
import { normalizeSupabaseProjectUrl }              from '@/lib/utils/supabase-project-url';

// ---------------------------------------------------------------------------
// ENVIRONMENT VARIABLE VALIDATION
// Validated once at module load time to catch misconfiguration early.
// ---------------------------------------------------------------------------

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[Supabase] Missing required environment variable: ${name}. ` +
      'Ensure this is set in your .env.local file or deployment environment.'
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// SERVER CLIENT (uses ANON key + cookie-based session)
// ---------------------------------------------------------------------------

/**
 * Creates a typed Supabase server client that reads the user's session from
 * HTTP cookies. Intended for use in:
 * - Next.js Server Components
 * - Next.js Route Handlers (`app/api/**`)
 * - Next.js Server Actions
 *
 * RLS is enforced on all queries using the authenticated user's JWT.
 *
 * @example
 * ```ts
 * // In a Server Component:
 * const supabase = await createSupabaseServerClient();
 * const { data, error } = await supabase
 *   .from('appointments')
 *   .select('id, scheduled_at, status')
 *   .eq('status', 'confirmed');
 * ```
 *
 * @returns A promise resolving to a fully-typed Supabase server client.
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = normalizeSupabaseProjectUrl(requireEnvVar('NEXT_PUBLIC_SUPABASE_URL'));
  const supabaseKey = requireEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In Server Components, cookies cannot be set (read-only context).
          // This is expected and can be safely ignored when using middleware
          // to refresh sessions.
        }
      },
    },
  });
}

// ---------------------------------------------------------------------------
// PUBLIC (ANON) CLIENT — unauthenticated reads allowed by RLS
// ---------------------------------------------------------------------------

/**
 * Creates a Supabase client using the **anon** key with no user session and
 * no cookie access. Use only where Row Level Security grants `anon` deliberate
 * read access (public booking catalog — see `003_booking_portal.sql`).
 *
 * Does **not** use the service role key, so it is safe for public Server
 * Components on Vercel without `SUPABASE_SERVICE_ROLE_KEY`.
 *
 * @returns A typed Supabase client acting as the `anon` Postgres role.
 */
export function createSupabasePublicClient() {
  const supabaseUrl = normalizeSupabaseProjectUrl(requireEnvVar('NEXT_PUBLIC_SUPABASE_URL'));
  const supabaseKey = requireEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
    },
  });
}

// ---------------------------------------------------------------------------
// ADMIN CLIENT (uses SERVICE ROLE key — bypasses RLS)
// ---------------------------------------------------------------------------

/**
 * Creates a Supabase admin client using the Service Role key.
 *
 * WARNING: This client BYPASSES all Row Level Security policies.
 * Only use this in:
 * - Server-side background jobs (cron, queue workers)
 * - Webhook handlers (e.g., Stripe billing events)
 * - Data migration scripts
 * - System-level administrative operations
 *
 * NEVER use this client in:
 * - Client Components
 * - Route Handlers that respond to end-user requests
 * - Server Actions triggered by user input
 *
 * Callers using this client are fully responsible for enforcing
 * tenant isolation and data access controls manually.
 *
 * @example
 * ```ts
 * // In a background job (server-only):
 * const supabase = createSupabaseAdminClient();
 * const { error } = await supabase
 *   .from('patients')
 *   .update({ anonymized_at: new Date().toISOString() })
 *   .lt('data_retention_until', new Date().toISOString());
 * ```
 *
 * @returns A fully-typed Supabase admin client (bypasses RLS).
 */
export function createSupabaseAdminClient() {
  const supabaseUrl    = normalizeSupabaseProjectUrl(requireEnvVar('NEXT_PUBLIC_SUPABASE_URL'));
  const serviceRoleKey = requireEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto-refresh for server-side admin clients
      autoRefreshToken:    false,
      persistSession:      false,
      detectSessionInUrl:  false,
    },
  });
}
