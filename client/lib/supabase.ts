import { createClient } from '@supabase/supabase-js'

// Vite requires VITE_ prefix for client-side env vars
// Also check NEXT_PUBLIC_ for Vercel deployment compatibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not configured. Please check your environment variables.')
  console.warn('For local development, create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null