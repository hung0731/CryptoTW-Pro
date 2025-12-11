const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

async function verifySchema() {
    console.log('Verifying activities table schema...');

    // Check if we can select the new columns
    const { data, error } = await supabase
        .from('activities')
        .select('content, end_date')
        .limit(1);

    if (error) {
        console.error('Schema Verification Failed:', error.message);
        if (error.code === 'PGRST204') { // Column not found error code (often)
            console.log('Reason: Columns likely missing.');
        }
        process.exit(1);
    } else {
        console.log('Schema Verification Passed: Columns `content` and `end_date` exist.');
    }
}

verifySchema();
