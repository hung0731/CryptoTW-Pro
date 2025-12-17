import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Public API for fetching alerts (used by /alerts page)
// Uses anonymous client - relies on RLS policies for security
export async function GET(req: NextRequest) {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const hoursAgo = Math.min(parseInt(searchParams.get('hours') || '24'), 72)

    if (isNaN(limit) || isNaN(hoursAgo)) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

    // Fetch Recent Alerts
    const { data: alerts, error: alertsError } = await supabase
        .from('alert_events')
        .select('id, market, alert_type, summary, severity, metrics_snapshot, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (alertsError) {
        console.error('Error fetching public alerts:', alertsError)
        return NextResponse.json({ alerts: [], error: alertsError.message }, { status: 500 })
    }

    // Fetch Latest Market State
    const { data: marketState } = await supabase
        .from('market_states')
        .select('leverage_state, whale_state, liquidation_pressure, price, updated_at')
        .eq('market', 'BTC')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

    return NextResponse.json({
        alerts: alerts || [],
        marketState: marketState || null,
        count: alerts?.length || 0
    })
}
