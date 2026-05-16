/**
 * @file app/(dashboard)/layout.tsx
 * @description Dashboard route group layout for Sypho.io.
 *
 * This is the authenticated shell for the main application.
 * Phase 2 provides the skeleton; full navigation and sidebar are
 * implemented in Phase 3 (Dashboard & Core Features).
 *
 * Middleware guarantees that only authenticated users with completed
 * onboarding can reach routes under this layout.
 */

import { redirect }                  from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUser }       from '@/lib/auth/helpers';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout — Server Component.
 * Performs a final server-side auth check as a defense-in-depth measure.
 * The middleware already enforces auth; this adds a belt-and-suspenders layer.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase  = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);

  if (!authResult.ok) {
    redirect('/login?error=session_expired');
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Minimal header — expanded in Phase 3 */}
      <header className="sticky top-0 z-40 h-14 bg-white border-b border-surface-200 flex items-center px-6 gap-4">
        <div className="flex items-center gap-2.5 mr-auto">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-surface-900 text-lg">Sypho</span>
        </div>

        {/* Sign out — accessible via form POST to prevent CSRF */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-surface-600 hover:text-brand-700 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-100"
          >
            Sign out
          </button>
        </form>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
