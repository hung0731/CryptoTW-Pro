import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, eventType, eventName, metadata } = body

        if (!eventType || !eventName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createAdminClient()

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
