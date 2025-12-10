
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        // 1. Fetch Bindings Stats (Group by exchange name)
        // Note: Supabase JS client doesn't support complex group by easily without RPC.
        // We will fetch all and count in JS for MVP simplicity (assuming < 10k records).
        // For production, use RPC or Views.

        const { data: bindings, error: bindError } = await supabase
            .from('exchange_bindings')
            .select('exchange_name, status')

        if (bindError) throw bindError

        // 2. Fetch Click Stats
        const { data: clicks, error: clickError } = await supabase
            .from('analytics_events')
            .select('exchange_name')
            .eq('event_type', 'click')

        if (clickError) throw clickError

        // 3. Aggregate Data
        const stats: Record<string, { total_bindings: number, verified: number, clicks: number }> = {}
        const exchanges = ['binance', 'okx', 'bybit', 'bingx', 'pionex']

        exchanges.forEach(ex => {
            stats[ex] = { total_bindings: 0, verified: 0, clicks: 0 }
        })

        bindings?.forEach((b: any) => {
            const ex = b.exchange_name.toLowerCase()
            if (!stats[ex]) stats[ex] = { total_bindings: 0, verified: 0, clicks: 0 }

            stats[ex].total_bindings += 1
            if (b.status === 'verified') stats[ex].verified += 1
        })

        clicks?.forEach((c: any) => {
            const ex = c.exchange_name.toLowerCase()
            if (!stats[ex]) stats[ex] = { total_bindings: 0, verified: 0, clicks: 0 }
            stats[ex].clicks += 1
        })

        return NextResponse.json({ stats })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
