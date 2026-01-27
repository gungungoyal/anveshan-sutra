const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
    const envPath = path.resolve(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuery() {
    console.log('Testing specific query from organizations.ts...');

    const { data, error } = await supabase
        .from('organizations')
        .select(`
      *,
      organization_focus_areas(focus_area)
    `)
        .limit(3);

    if (error) {
        console.error('Query Error:', JSON.stringify(error, null, 2));
    } else {
        console.log(`Successfully fetched ${data.length} records.`);
        if (data.length > 0) {
            console.log('First record sample:', JSON.stringify(data[0], null, 2));
            console.log('Focus areas present?', !!data[0].organization_focus_areas);
        }
    }
}

checkQuery();
