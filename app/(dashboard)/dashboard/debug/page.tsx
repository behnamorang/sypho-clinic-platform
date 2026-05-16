/**
 * Debug page — no Supabase queries, pure static render.
 * Helps isolate whether the blank screen is from the layout or page data layer.
 */
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DebugPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#4f46e5' }}>Debug: Layout + Auth works ✓</h1>
      <p>User: {user?.email ?? 'NOT AUTHENTICATED'}</p>
      <p>Error: {error?.message ?? 'none'}</p>
      <p>App metadata: {JSON.stringify(user?.app_metadata ?? {})}</p>
    </div>
  );
}
