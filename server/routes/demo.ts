import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";
import { supabase } from "../lib/supabase";

export const handleDemo: RequestHandler = async (_req, res) => {
  try {
    // Test Supabase connection
    let supabaseStatus = "Not configured";
    let supabaseError = null;
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('focus_areas')
          .select('id')
          .limit(1);
        
        if (error) {
          supabaseStatus = "Error";
          supabaseError = error.message;
          console.log("Supabase query error:", error);
          
          // Check if it's a table not found error
          if (error.message.includes('focus_areas')) {
            supabaseError += ". Please run the database migrations to create the required tables.";
          }
        } else {
          supabaseStatus = data ? "Connected" : "Connected but no data";
          console.log("Supabase query success:", data);
        }
      } catch (err) {
        supabaseStatus = "Connection failed";
        supabaseError = err instanceof Error ? err.message : String(err);
        console.log("Supabase connection error:", err);
      }
    } else {
      console.log("Supabase client not initialized");
    }

    const response: DemoResponse = {
      message: `Anveshan API is running! Supabase status: ${supabaseStatus}${supabaseError ? ` - ${supabaseError}` : ''}`,
    };

    res.json(response);
  } catch (error) {
    console.error("Demo error:", error);
    res.status(500).json({ error: "Demo failed" });
  }
};