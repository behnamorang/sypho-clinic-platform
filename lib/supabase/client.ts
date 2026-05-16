/**
 * @file client.ts
 * @description Browser-side Supabase client for Sypho.io.
 *
 * This client is initialized with the ANON key and is safe to use in
 * Client Components ('use client'). Access control is enforced entirely
 * through PostgreSQL Row Level Security (RLS) policies and JWT claims.
 *
 * SECURITY RULES:
 * - Never use this client with the Service Role key.
 * - Never access sensitive tables without proper RLS being enforced.
 * - This client is intended for authenticated user-facing interactions only.
 *
 * @compliance GDPR — Data access is limited by RLS; no direct PII exposure.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/database/types/database.types';

/**
 * Creates a typed Supabase browser client for use in React Client Components.
 *
 * Usage:
 * ```ts
 * const supabase = createSupabaseBrowserClient();
 * const { data, error } = await supabase.from('clinics').select('id, name, slug');
 * ```
 *
 * @returns A fully-typed Supabase client scoped to the Database schema.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '[Supabase] Missing environment variables: ' +
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
