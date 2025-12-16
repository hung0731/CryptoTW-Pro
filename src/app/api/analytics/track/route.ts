import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase'

// Event whitelist - only these events are allowed
const ALLOWED_EVENTS = new Set([
    // Page views
    'page_view',
    'join_view',
    'join_click',
    'pro_complete',
    // Feature usage
    'feature_click',
    'share_click',
    'widget_view',
    // Navigation
    'tab_switch',
    'menu_open',
])

// Maximum payload sizes
const MAX_METADATA_SIZE = 4096 // 4KB
const MAX_STRING_LENGTH = 200

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, eventType, eventName, metadata } = body

        // 1. Validate required fields
        if (!eventType || !eventName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 2. Event whitelist check
        if (!ALLOWED_EVENTS.has(eventName)) {
            return NextResponse.json({ error: 'Invalid event name' }, { status: 400 })
        }

        // 3. Validate string lengths
        if (eventType.length > MAX_STRING_LENGTH || eventName.length > MAX_STRING_LENGTH) {
            return NextResponse.json({ error: 'Field too long' }, { status: 400 })
        }

        // 4. Validate metadata size
        const metadataStr = JSON.stringify(metadata || {})
        if (metadataStr.length > MAX_METADATA_SIZE) {
            return NextResponse.json({ error: 'Metadata too large' }, { status: 400 })
        }

        // 5. Rate Limit: 30 requests per minute per IP
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        const { success } = await rateLimit(`analytics:${ip}`, 30, 60)
        if (!success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        // 6. Use anon client (relies on RLS for insert policy)
        const supabase = createClient()

        const { error } = await supabase
            .from('analytics_events')
            .insert({
                user_id: userId || null,
                event_type: eventType,
                event_name: eventName,
                metadata: metadata || {}
            })

        if (error) {
            console.error('Analytics Insert Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
