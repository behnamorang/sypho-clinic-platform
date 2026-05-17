/**
 * @file lib/auth/helpers.ts
 * @description Server-side authentication helper functions for Sypho.io.
 *
 * These utilities are intended for use ONLY in:
 * - Server Components
 * - Route Handlers (app/api/**)
 * - Server Actions
 * - Next.js Middleware
 *
 * NEVER import these in Client Components ('use client').
 *
 * @compliance GDPR — helpers enforce authenticated access and role-based
 *             authorization before any data processing.
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, UserRole, ClinicMemberRow } from '@/types';

/**
 * The concrete Supabase client type accepted by Sypho server/browser helpers.
 * Uses `SupabaseClient<Database>` which resolves to the 'public' schema by default.
 * Compatible with clients returned by `createServerClient<Database>`,
 * `createBrowserClient<Database>`, and `createClient<Database>`.
 */
export type SyphoClient = SupabaseClient<Database>;

// ---------------------------------------------------------------------------
// Result types (discriminated union — no raw Error throwing)
// ---------------------------------------------------------------------------

export type AuthResult<T> =
  | { ok: true;  data: T }
  | { ok: false; code: string; message: string };

// ---------------------------------------------------------------------------
// getAuthenticatedUser
// ---------------------------------------------------------------------------

/**
 * Retrieves the currently authenticated user from a Supabase server client.
 *
 * Uses `getUser()` (not `getSession()`) to ensure the JWT is validated
 * against the Supabase Auth server on every call — prevents stale tokens.
 *
 * @param supabase - A Supabase server client (from `createSupabaseServerClient`).
 * @returns A discriminated union result containing the User or an error.
 */
export async function getAuthenticatedUser(
  supabase: SyphoClient,
): Promise<AuthResult<User>> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok:      false,
      code:    'UNAUTHENTICATED',
      message: 'You must be signed in to perform this action.',
    };
  }

  return { ok: true, data: user };
}

// ---------------------------------------------------------------------------
// getClinicMembership
// ---------------------------------------------------------------------------

/**
 * Retrieves the active clinic membership for a given user.
 *
 * Used to determine the user's role and associated clinic_id for
 * multi-tenant access control.
 *
 * @param supabase - A Supabase server client.
 * @param userId   - The authenticated user's UUID.
 * @returns A discriminated union result with the membership row or an error.
 */
export async function getClinicMembership(
  supabase: SyphoClient,
  userId:   string,
): Promise<AuthResult<ClinicMemberRow>> {
  const { data: membership, error } = await supabase
    .from('clinic_members')
    .select('id, clinic_id, user_id, role, is_active, invited_by, invited_at, accepted_at, created_at, updated_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    return {
      ok:      false,
      code:    'DATABASE_ERROR',
      message: 'Failed to retrieve clinic membership. Please try again.',
    };
  }

  if (!membership) {
    return {
      ok:      false,
      code:    'NO_CLINIC_MEMBERSHIP',
      message: 'No active clinic membership found. Please complete onboarding.',
    };
  }

  return { ok: true, data: membership };
}

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------

/**
 * Validates that the user's role is within the permitted set.
 *
 * @param userRole    - The user's actual role from their membership record.
 * @param allowedRoles - Roles permitted to perform the action.
 * @returns A discriminated union result — error if role is not permitted.
 */
export function requireRole(
  userRole:     UserRole,
  allowedRoles: readonly UserRole[],
): AuthResult<true> {
  if (!allowedRoles.includes(userRole)) {
    return {
      ok:      false,
      code:    'FORBIDDEN',
      message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
    };
  }

  return { ok: true, data: true };
}

// ---------------------------------------------------------------------------
// hasCompletedOnboarding
// ---------------------------------------------------------------------------

/**
 * Checks whether a user has completed clinic onboarding.
 *
 * Reads from `app_metadata` on the user object returned by `getUser()`.
 * Since `getUser()` hits the Supabase Auth server, this reflects the latest
 * state even after the admin client updates `app_metadata`.
 *
 * @param user - The Supabase Auth User object.
 * @returns `true` if onboarding is complete, `false` otherwise.
 */
export function hasCompletedOnboarding(user: User): boolean {
  return user.app_metadata?.['onboarding_completed'] === true;
}

// ---------------------------------------------------------------------------
// getRequestMetadata
// ---------------------------------------------------------------------------

/**
 * Extracts audit-relevant metadata from an HTTP request.
 * Used when writing to the audit_logs table.
 *
 * @param request - The incoming Request object.
 * @returns IP address, user agent, and session token hash (SHA-256 prefix).
 */
export function getRequestMetadata(request: Request): {
  actor_ip:         string | null;
  actor_user_agent: string | null;
} {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp       = request.headers.get('x-real-ip');
  const userAgent    = request.headers.get('user-agent');

  const ip = forwardedFor
    ? (forwardedFor.split(',')[0] ?? null)?.trim() ?? null
    : realIp;

  return {
    actor_ip:         ip ?? null,
    actor_user_agent: userAgent ?? null,
  };
}
