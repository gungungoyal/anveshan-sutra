import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase environment variables:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "**** (present)" : "not set");

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