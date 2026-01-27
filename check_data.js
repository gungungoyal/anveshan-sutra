const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
    const envPath = path.resolve(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    } else {
        console.log('.env.local not found');
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

async function check() {
    console.log('Checking Supabase data...');

    // Check organizations
    const { count, error: orgError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

    if (orgError) {
        console.error('Error fetching organizations:', orgError.message);
    } else {
        console.log(`Organizations count: ${count}`);
    }

    // Check focus areas
    const { count: faCount, error: faError } = await supabase
        .from('focus_areas')
        .select('*', { count: 'exact', head: true });

    if (faError) {
        console.error('Error fetching focus_areas:', faError.message);
    } else {
        console.log(`Focus Areas count: ${faCount}`);
    }
}

check();
