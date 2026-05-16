/**
 * @file lib/hooks/use-auth.ts
 * @description Client-side React hook for Supabase Auth state management.
 *
 * Provides:
 * - Current user state (nullable)
 * - Loading state
 * - Sign-out helper
 *
 * Uses `onAuthStateChange` to reactively update when the session changes.
 *
 * SECURITY: Uses the browser client (anon key + RLS).
 * NEVER expose Service Role key in client-side code.
 *
 * @compliance GDPR — only exposes non-sensitive auth metadata (id, email, role).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User }                         from '@supabase/supabase-js';
import { createSupabaseBrowserClient }       from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseAuthReturn {
  /** The currently authenticated Supabase user. Null if not signed in. */
  user:     User | null;
  /** True while the initial session is being loaded from storage. */
  isLoading: boolean;
  /** Signs the user out and clears the session. */
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook that provides the current auth state and a `signOut` helper.
 *
 * @example
 * ```tsx
 * const { user, isLoading, signOut } = useAuth();
 * if (!isLoading && !user) return <Redirect to="/login" />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Load initial session
    void supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Subscribe to session changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  }, []);

  return { user, isLoading, signOut };
}
