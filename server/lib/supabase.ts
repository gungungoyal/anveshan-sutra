import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase environment variables:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "**** (present)" : "not set");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not configured. Using mock data mode.");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
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