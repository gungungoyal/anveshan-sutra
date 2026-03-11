import { searchOrganizations } from './src/lib/services/organizations.js';
import { createClient } from '@supabase/supabase-js';

// Try to test the exact API to see if it throws an error
import { loadEnvConfig } from '@next/env';
loadEnvConfig('./');

async function test() {
  try {
    const res = await searchOrganizations({
      sortBy: 'alignment',
      limit: 20
    });
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
}
test();
