import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing config");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
        organization_name: 'Test Org Update Script',
        role: 'csr',
        description: 'Test description',
        form_filled: true,
        updated_at: new Date().toISOString(),
    })
    .eq('id', '1a8f2db5-c567-4cc1-bb25-797ec965462f');
    
  if (error) {
    console.error("Error from update:", error);
  } else {
    console.log("Update success!");
  }
}

run();
