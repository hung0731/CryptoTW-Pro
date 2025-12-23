
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { lineUserId, settings } = body

        if (!lineUserId || !settings) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('users')
            .update({ notification_preferences: settings, updated_at: new Date().toISOString() })
            .eq('line_user_id', lineUserId)
            .select()
            .single()

        if (error) {
            logger.error('Error updating settings', error, { feature: 'user-settings' })
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, user: data })
    } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Settings API Error', err, { feature: 'user-settings' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
