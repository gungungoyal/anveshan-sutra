// Migration script - run with: node run_migration.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read env from .env.local
const envFile = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) env[key.trim()] = vals.join('=').trim();
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const sql = `
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS focus_areas TEXT[],
    ADD COLUMN IF NOT EXISTS geography TEXT[],
    ADD COLUMN IF NOT EXISTS org_size TEXT,
    ADD COLUMN IF NOT EXISTS website TEXT,
    ADD COLUMN IF NOT EXISTS partnership_types TEXT[],
    ADD COLUMN IF NOT EXISTS budget_range TEXT,
    ADD COLUMN IF NOT EXISTS timeline TEXT,
    ADD COLUMN IF NOT EXISTS partner_notes TEXT;
`;

const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: 'rpc_not_available' }));

if (error === 'rpc_not_available' || (error && error.message?.includes('does not exist'))) {
    // Fallback: try direct REST API to execute SQL
    console.log('RPC not available, trying direct query...');
    
    // Try inserting a test record to see what columns exist
    const { data: cols, error: colErr } = await supabase
        .from('user_profiles')
        .select('id, description, focus_areas, geography, org_size, website, partnership_types, budget_range, timeline, partner_notes')
        .limit(1);
    
    if (colErr) {
        console.log('Missing columns detected. Error:', colErr.message);
        console.log('\n⚠️  Please run this SQL manually in the Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/fpkijxrlssphftsdldng/sql');
        console.log('\n' + sql);
    } else {
        console.log('✅ All columns already exist! No migration needed.');
    }
} else if (error) {
    console.error('Migration error:', error);
    console.log('\n⚠️  Please run this SQL manually in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/fpkijxrlssphftsdldng/sql');
    console.log('\n' + sql);
} else {
    console.log('✅ Migration applied successfully!');
}
