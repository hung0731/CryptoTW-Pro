
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { exchange_name, activity_id, event_type, user_id } = body

        if (!exchange_name || !event_type || typeof exchange_name !== 'string' || typeof event_type !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 })
        }

        if (exchange_name.length > 50 || event_type.length > 50) {
            return NextResponse.json({ error: 'Field length exceeded' }, { status: 400 })
        }

        // Rate Limit: 30 requests per minute
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        const { success } = await rateLimit(`track:${ip}`, 30, 60)
        if (!success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        const { error } = await supabase
            .from('analytics_events')
            .insert({
                exchange_name,
                activity_id,
                event_type,
                user_id: user_id || null, // Optional
            })

        if (error) {
            logger.error('Tracking Error', error instanceof Error ? error : new Error(String(error)), { feature: 'track-api' })
            return NextResponse.json({ error: 'Failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Internal Server Error', err, { feature: 'track-api' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
