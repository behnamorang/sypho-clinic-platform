/**
 * @file index.ts
 * @description Barrel export for all Supabase client factories.
 *
 * Import from this module for clean, consistent imports across the codebase:
 *
 * ```ts
 * // In Client Components:
 * import { createSupabaseBrowserClient } from '@/lib/supabase';
 *
 * // In Server Components / Route Handlers:
 * import { createSupabaseServerClient } from '@/lib/supabase';
 *
 * // In public Server Components (RLS allows anon — booking catalog):
 * import { createSupabasePublicClient } from '@/lib/supabase';
 *
 * // In privileged server-only contexts (background jobs):
 * import { createSupabaseAdminClient } from '@/lib/supabase';
 *
 * // In Next.js Middleware:
 * import { updateSession } from '@/lib/supabase';
 * ```
 *
 * @compliance GDPR — Client selection is critical for data access control.
 *             Use the least-privileged client appropriate for the context.
 */

export { createSupabaseBrowserClient } from './client';
export {
  createSupabaseServerClient,
  createSupabasePublicClient,
  createSupabaseAdminClient,
} from './server';
export { updateSession } from './middleware';
