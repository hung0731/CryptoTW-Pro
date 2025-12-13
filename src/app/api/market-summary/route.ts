import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getMarketSnapshot } from '@/lib/market-aggregator'
import { generateMarketSummary } from '@/lib/gemini'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
    try {
        const supabase = createAdminClient()

        // Fetch live market data, cached report, and recent alerts in parallel
        const [snapshotResult, reportResult, alertsResult] = await Promise.allSettled([
            getMarketSnapshot(),
            supabase
                .from('market_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
            // Fetch alerts from last 12 hours for AI context
            supabase
                .from('alert_events')
                .select('alert_type, summary, severity, created_at')
                .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: false })
                .limit(10)
        ])

        // Process snapshot
        let snapshot = null
        let signals = null
        if (snapshotResult.status === 'fulfilled') {
            snapshot = snapshotResult.value
            signals = snapshot.signals
        }

        // Process cached report (for fallback)
        let cachedReport = null
        if (reportResult.status === 'fulfilled' && !reportResult.value.error) {
            const data = reportResult.value.data
            cachedReport = {
                ...data,
                headline: data.metadata?.headline || data.summary,
                analysis: data.metadata?.analysis,
                action_suggestion: data.metadata?.action_suggestion,
            }
        }

        // Process recent alerts
        let recentAlerts: any[] = []
        if (alertsResult.status === 'fulfilled' && !alertsResult.value.error) {
            recentAlerts = alertsResult.value.data || []
        }

        // Generate AI summary using live data + recent alerts
        let aiSummary = null
        if (snapshot) {
            aiSummary = await generateMarketSummary(snapshot, recentAlerts)
        }

        return NextResponse.json({
            report: aiSummary || cachedReport,
            signals,
            recentAlerts: recentAlerts.slice(0, 5), // Return top 5 alerts for UI
            meta: {
                generatedAt: new Date().toISOString(),
                alertCount: recentAlerts.length
            }
        })
    } catch (e) {
        console.error('Market Summary API Error:', e)
        return NextResponse.json({ report: null, signals: null, recentAlerts: [] })
    }
}
