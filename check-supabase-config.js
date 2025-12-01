import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your .env.local
const supabaseUrl = 'https://thsvuhwgauwvuecpejir.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoc3Z1aHdnYXV3dnVlY3BlamlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3MDc5NCwiZXhwIjoyMDgwMTQ2Nzk0fQ.ul4A2QYsiwg89gHqpjw_UYv_0xUKVeijSc2mDLOyp1w';

// Create client with service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSupabaseConfig() {
  try {
    console.log('Checking Supabase configuration...');
    
    // Check if we can access auth settings (requires service key)
    // This is just to verify the service key works
    const { data, error } = await supabase
      .from('focus_areas')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Database connection error:', error);
    } else {
      console.log('Database connection successful');
    }
    
    // Try to get auth settings
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Key available:', !!supabaseServiceKey);
    
    console.log('\nTo check email configuration:');
    console.log('1. Go to your Supabase dashboard at https://supabase.com/dashboard');
    console.log('2. Select your project (thsvuhwgauwvuecpejir)');
    console.log('3. Go to Authentication -> Settings');
    console.log('4. Check if "Enable Email Signup" is turned ON');
    console.log('5. Check if "Enable Email Confirmations" is configured properly');
    console.log('6. Go to Authentication -> URL Configuration and verify the site URL');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSupabaseConfig();