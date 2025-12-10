
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { exchange_name, activity_id, event_type, user_id } = body

        if (!exchange_name || !event_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
            console.error('Tracking Error:', error)
            return NextResponse.json({ error: 'Failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
