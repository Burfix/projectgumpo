/**
 * Browser-side Supabase client
 * 
 * ⚠️ WARNING: This should ONLY be used in client components
 * For server components, use createClient from '@/lib/supabase/server'
 * 
 * This creates a singleton client for the browser that persists
 * the user's session across page navigations. It's safe for client-side
 * use because each browser has its own isolated instance.
 */

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

// Default export for backward compatibility
// TODO: Migrate all imports to use getSupabaseBrowserClient()
export default getSupabaseBrowserClient();


