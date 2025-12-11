const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkSchema() {
    console.log('Checking activities table schema...');

    // Try to select the specific columns. If they don't exist, it should throw an error.
    const { data, error } = await supabase
        .from('activities')
        .select('content, end_date')
        .limit(1);

    if (error) {
        console.error('Error selecting columns:', error.message);
        console.log('Schema update IS likely needed.');
    } else {
        console.log('Success! Columns exist.');
    }
}

checkSchema();
