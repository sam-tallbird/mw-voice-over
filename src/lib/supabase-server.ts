import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// For server-side operations in Server Components
export const createServerSupabase = () => createServerComponentClient({ cookies }) 