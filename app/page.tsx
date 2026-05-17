/**
 * @file app/page.tsx
 * @description Root entry point — redirects to /dashboard for authenticated users
 * or /login for unauthenticated users.
 *
 * The actual redirect logic is handled by middleware (cookie-based session check).
 * This page acts as a fallback redirect to ensure no blank screen is shown.
 */

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Session is read from cookies via `createSupabaseServerClient()` — not statically prerenderable. */
export const dynamic = 'force-dynamic';

/**
 * Root page — performs server-side redirect based on auth state.
 */
export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  redirect('/login');
}
