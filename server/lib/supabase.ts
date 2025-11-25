import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials not configured. Using mock data mode.");
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function isSupabaseConfigured(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("organizations").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
