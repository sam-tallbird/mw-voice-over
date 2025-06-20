import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a Supabase client for use on the client side
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This helper should only be used in server-side contexts
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  // The service role key can bypass RLS policies
  return createClient(supabaseUrl, supabaseServiceKey);
}; 