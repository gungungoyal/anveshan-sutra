import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your .env.local
const supabaseUrl = 'https://thsvuhwgauwvuecpejir.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoc3Z1aHdnYXV3dnVlY3BlamlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3MDc5NCwiZXhwIjoyMDgwMTQ2Nzk0fQ.ul4A2QYsiwg89gHqpjw_UYv_0xUKVeijSc2mDLOyp1w';

// Create client with service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseSchema() {
  try {
    console.log('Checking if database tables exist...');
    
    // Check if users table exists
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (usersError) {
      console.log('Users table error:', usersError.message);
      if (usersError.message.includes('relation "users" does not exist')) {
        console.log('Users table does not exist. You need to run the database migrations.');
        console.log('To fix this:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Run the SQL from database/migrations/001_init_schema.sql');
      }
    } else {
      console.log('Users table exists and is accessible');
    }
    
    // Check if focus_areas table exists
    const { data: focusData, error: focusError } = await supabase
      .from('focus_areas')
      .select('id')
      .limit(1);
      
    if (focusError) {
      console.log('Focus areas table error:', focusError.message);
    } else {
      console.log('Focus areas table exists and is accessible');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabaseSchema();