require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Error: Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkTable(tableName) {
    console.log(`Checking table: ${tableName}...`);
    const { data, error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });

    if (error) {
        console.error(`Status for ${tableName}: [ERROR]`, error.message, error.code);
        if (error.code === 'PGRST205') {
            console.log(`-> CONFIRMED: Table '${tableName}' does not exist.`);
        }
    } else {
        console.log(`Status for ${tableName}: [OK] Table exists and is accessible.`);
    }
}

async function main() {
    await checkTable('users'); // Should exist
    await checkTable('vip_applications'); // Suspected missing
    await checkTable('push_messages'); // Suspected missing
}

main();
