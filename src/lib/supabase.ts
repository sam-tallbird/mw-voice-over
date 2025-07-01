import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For client-side operations
export const createClientSupabase = () => createClientComponentClient();

// Service role client (for admin operations - server only)
export const createServiceSupabase = () => createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Legacy function (keeping for compatibility)
export const createServerSupabaseClient = createServiceSupabase; 