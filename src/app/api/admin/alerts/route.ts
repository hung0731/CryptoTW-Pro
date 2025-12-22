import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

// GET: Fetch recent alerts and current market state
export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const hoursAgo = parseInt(searchParams.get('hours') || '24')

    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

    // 1. Fetch Recent Alerts
    const { data: alerts, error: alertsError } = await supabase
        .from('alert_events')
        .select('*')
        .gte('detected_at', since)
        .order('detected_at', { ascending: false })
        .limit(limit)

    if (alertsError) {
        console.error('Error fetching alerts:', alertsError)
        return NextResponse.json({ error: alertsError.message }, { status: 500 })
    }

    // 2. Fetch Latest Market State
    const { data: marketState, error: stateError } = await supabase
        .from('market_states')
        .select('*')
        .eq('market', 'BTC')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

    if (stateError && stateError.code !== 'PGRST116') {
        console.error('Error fetching market state:', stateError)
    }

    return NextResponse.json({
        alerts,
        marketState,
        meta: {
            count: alerts?.length || 0,
            since,
            fetchedAt: new Date().toISOString()
        }
    })
}
