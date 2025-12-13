import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getMarketSnapshot } from '@/lib/market-aggregator'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
    try {
        // Fetch both report and live signals in parallel
        const [reportResult, snapshotResult] = await Promise.allSettled([
            supabase
                .from('market_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
            getMarketSnapshot()
        ])

        // Process report
        let report = null
        if (reportResult.status === 'fulfilled' && !reportResult.value.error) {
            const data = reportResult.value.data
            report = {
                ...data,
                headline: data.metadata?.headline || data.summary,
                analysis: data.metadata?.analysis,
                action_suggestion: data.metadata?.action_suggestion,
            }
        }

        // Process signals
        let signals = null
        if (snapshotResult.status === 'fulfilled') {
            signals = snapshotResult.value.signals
        }

        return NextResponse.json({ report, signals })
    } catch (e) {
        console.error('Market Summary API Error:', e)
        return NextResponse.json({ report: null, signals: null })
    }
}
