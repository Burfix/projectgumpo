/**
 * Supabase Client Utilities
 * 
 * This file provides the correct Supabase client creation patterns for
 * different contexts in Next.js.
 */

export { default as supabaseBrowser } from './client';
export { getSupabaseBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { createAdminClient } from './admin';

/**
 * Usage Guidelines:
 * 
 * 1. Client Components (use client):
 *    import { supabaseBrowser } from '@/lib/supabase';
 *    const { data } = await supabaseBrowser.from('table').select();
 * 
 * 2. Server Components:
 *    import { createServerClient } from '@/lib/supabase';
 *    const supabase = await createServerClient();
 *    const { data } = await supabase.from('table').select();
 * 
 * 3. API Routes (Server-side):
 *    import { createServerClient } from '@/lib/supabase';
 *    const supabase = await createServerClient();
 * 
 * 4. Admin Operations (Service Role):
 *    import { createAdminClient } from '@/lib/supabase';
 *    const admin = createAdminClient();
 *    // Bypasses RLS - use with extreme caution!
 */
