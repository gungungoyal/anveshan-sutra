import { createClient } from '@supabase/supabase-js'

// Next.js requires NEXT_PUBLIC_ prefix for client-side env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// Support both ANON_KEY (JWT format) and PUBLISHABLE_DEFAULT_KEY (newer format)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

// Use anon key first, fall back to publishable key
const supabaseKey = supabaseAnonKey || supabasePublishableKey

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key not configured. Please check your environment variables.')
  console.warn('For local development, create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Important for OAuth callbacks
    },
  })
  : null
