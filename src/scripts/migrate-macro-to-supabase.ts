import { createClient } from '@supabase/supabase-js'
import { MACRO_OCCURRENCES } from '@/lib/macro-events'
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function migrate() {
    console.log('🚀 Starting Macro Events Migration...')

    // 1. Ensure event types exist (already handled by SQL seed, but good to double check)
    // 2. Migrate Occurrences
    console.log(`📦 Migrating ${MACRO_OCCURRENCES.length} event occurrences...`)

    // Sort by date ascending to ensure trigger calculates previous_actual correctly
    const sortedEvents = [...MACRO_OCCURRENCES].sort((a, b) =>
        new Date(a.occursAt).getTime() - new Date(b.occursAt).getTime()
    )

    let eventCount = 0
    let errorCount = 0

    // Cache event IDs for linking reactions
    const eventIdMap: Record<string, string> = {} // maps "unrate-2024-12-06" -> UUID

    for (const event of sortedEvents) {
        try {
            const { data, error } = await supabase
                .from('macro_events')
                .upsert({
                    event_type: event.eventKey,
                    occurs_at: event.occursAt,
                    notes: event.notes,
                    forecast: event.forecast,
                    actual: event.actual
                    // previous_actual will be auto-set by DB trigger
                }, { onConflict: 'event_type, occurs_at' })
                .select('id')
                .single()

            if (error) {
                console.error(`❌ Failed to upsert event ${event.eventKey} at ${event.occursAt}:`, error.message)
                errorCount++
            } else {
                const keyDate = new Date(event.occursAt).toISOString().split('T')[0]
                const reactionKey = `${event.eventKey}-${keyDate}`
                eventIdMap[reactionKey] = data.id
                eventCount++
            }
        } catch (e) {
            console.error(`❌ Exception for event ${event.eventKey}:`, e)
            errorCount++
        }
    }
    console.log(`✅ Migrated ${eventCount} events (Errors: ${errorCount})`)

    // 3. Migrate Reactions
    console.log('📦 Migrating Price Reactions...')
    const reactionsPath = path.join(process.cwd(), 'src/data/macro-reactions.json')
    if (!fs.existsSync(reactionsPath)) {
        console.error('❌ Reactions file not found!')
        return
    }

    const fileContent = fs.readFileSync(reactionsPath, 'utf-8')
    const rawData = JSON.parse(fileContent)

    // Handle flat vs wrapped structure
    let allReactions: Record<string, any> = {}
    if (rawData.data) {
        // Merge wrapped data with root data if mixed
        const rootData = Object.fromEntries(
            Object.entries(rawData).filter(([k]) => !['count', 'generatedAt', 'data', 'lastSync'].includes(k))
        )
        allReactions = { ...rawData.data, ...rootData }
    } else {
        allReactions = Object.fromEntries(
            Object.entries(rawData).filter(([k]) => !['count', 'generatedAt', 'data', 'lastSync'].includes(k))
        )
    }

    let reactionCount = 0
    let reactionErrors = 0

    for (const [key, reaction] of Object.entries(allReactions)) {
        const eventId = eventIdMap[key]
        if (!eventId) {
            console.warn(`⚠️ No matching event found for reaction key: ${key} (Skipping)`)
            continue
        }

        try {
            const stats = reaction.stats || {}
            // Determine direction based on price data if missing
            let direction = stats.direction
            if (!direction && reaction.priceData && reaction.priceData.length > 0) {
                // Simple logic fallback
                direction = 'chop'
            }

            const { error } = await supabase
                .from('macro_price_reactions')
                .upsert({
                    event_id: eventId,
                    d0d1_return: stats.d0d1Return,
                    max_drawdown: stats.maxDrawdown,
                    max_upside: stats.maxUpside,
                    price_range: stats.range,
                    direction: direction,
                    price_data: reaction.priceData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'event_id' })

            if (error) {
                console.error(`❌ Failed to upsert reaction for ${key}:`, error.message)
                reactionErrors++
            } else {
                reactionCount++
            }
        } catch (e) {
            console.error(`❌ Exception for reaction ${key}:`, e)
            reactionErrors++
        }
    }

    console.log(`✅ Migrated ${reactionCount} reactions (Errors: ${reactionErrors})`)
    console.log('🎉 Migration Complete!')
}

migrate().catch(console.error)
