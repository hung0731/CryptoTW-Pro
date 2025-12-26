
import { MacroEventsService } from '@/lib/services/macro-events'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Mock environment for the service if needed, but the service imports createAdminClient
// which uses process.env. We need to load .env here.
dotenv.config({ path: path.join(process.cwd(), '.env') })

// Mock @/lib/supabase-admin because we are running in standalone script
// and the service imports it. Wait, the service imports from '@/lib/supabase-admin'.
// TSX handles path aliases. 
// But 'server-only' might be an issue again.
// We might need to mock createAdminClient if the service imports it from the file that has 'server-only'.
// The file src/lib/supabase-admin.ts HAS 'import "server-only"'.
// So we cannot import MacroEventsService directly in a standalone script easily if it imports that file.

async function verify() {
    console.log('🧪 Verifying MacroEventsService...')

    // We cannot easily run the service code in standalone node due to 'server-only' and Next.js specific imports.
    // Instead, we will perform a direct DB query similar to what the service does 
    // to verify the data integrity in Supabase.

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // 1. Check Events Count
    const { count: eventCount, error: e1 } = await supabase.from('macro_events').select('*', { count: 'exact', head: true })
    if (e1) console.error('Error counting events:', e1)
    console.log(`✅ Macro Events Count: ${eventCount}`)

    // 2. Check Reactions Count
    const { count: reactionCount, error: e2 } = await supabase.from('macro_price_reactions').select('*', { count: 'exact', head: true })
    if (e2) console.error('Error counting reactions:', e2)
    console.log(`✅ Price Reactions Count: ${reactionCount}`)

    // 3. Check a specific event (Latest CPI)
    const { data: cpiEvents } = await supabase
        .from('macro_events')
        .select(`
            *,
            macro_price_reactions(*)
        `)
        .eq('event_type', 'cpi')
        .order('occurs_at', { ascending: false })
        .limit(2)

    if (cpiEvents && cpiEvents.length > 0) {
        console.log('\n📝 Latest CPI Event:')
        const latest = cpiEvents[0]
        console.log(`- Date: ${latest.occurs_at}`)
        console.log(`- Actual: ${latest.actual}`)
        console.log(`- Forecast: ${latest.forecast}`)
        console.log(`- Previous (Auto): ${latest.previous_actual}`)

        if (latest.macro_price_reactions) {
            console.log(`- Reaction D0-D1: ${latest.macro_price_reactions.d0d1_return}%`)
            // Check d0d3 patch
            // console.log(`- Reaction D0-D3: ${latest.macro_price_reactions.d0d3_return}%`) 
            // TS doesn't know about d0d3_return yet, but runtime should show it if selected *
        } else {
            console.log(`- No reaction data found.`)
        }

        console.log('\n📝 Previous CPI Event (Comparison):')
        const prev = cpiEvents[1]
        console.log(`- Date: ${prev.occurs_at}`)
        console.log(`- Actual: ${prev.actual}`)

        if (latest.previous_actual == prev.actual) {
            console.log('✅ Auto-previous match confirmed!')
        } else {
            console.log(`⚠️ Auto-previous mismatch: Expected ${prev.actual}, got ${latest.previous_actual}`)
        }
    }
}

verify().catch(console.error)
