import { getMarketSnapshot } from '@/lib/market-aggregator'
import { generateMarketSummary } from '@/lib/gemini'
import { createAdminClient, supabase } from '@/lib/supabase'
import { fetchRSSTitles } from '@/lib/rss'

export async function updateMarketSummary() {
    console.log('[MarketService] Starting Market Summary Generation...')

    // 1. Aggregate Data
    const snapshot = await getMarketSnapshot()

    // Setup DB Client
    let dbClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
            dbClient = createAdminClient()
        } catch (e) {
            console.warn('Failed to create Admin Client, falling back to public client', e)
        }
    }

    // 1.5 Fetch Recent Alert Events (Last 12H) & RSS Titles
    let recentAlerts: any[] = []
    let rssTitles = ''

    try {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()

        // Parallel Fetch: Alerts + RSS
        const [alertsResult, titles] = await Promise.all([
            dbClient
                .from('alert_events')
                .select('alert_type, summary, severity, detected_at, metrics_snapshot')
                .eq('market', 'BTC')
                .gte('detected_at', twelveHoursAgo)
                .order('detected_at', { ascending: false })
                .limit(10),
            fetchRSSTitles(40) // Fetch top 40 titles
        ])

        if (alertsResult.data) {
            recentAlerts = alertsResult.data
        }
        rssTitles = titles

    } catch (e) {
        console.warn('[MarketService] Failed to fetch context data:', e)
    }

    // 2. Generate AI Report (Unified: Technical + Context)
    const report = await generateMarketSummary(snapshot, recentAlerts, rssTitles)

    if (!report) {
        throw new Error('Failed to generate report')
    }

    console.log('[MarketService] Report Generated. Saving...')

    // 3. Save to Supabase
    // dbClient is already initialized above

    // Store the full report as JSON in metadata column
    const { error } = await dbClient.from('market_reports').insert({
        sentiment: report.sentiment,
        sentiment_score: report.sentiment_score,
        summary: report.headline,
        key_points: [],
        strategy: report.risk_note || '',
        emoji: report.emoji,
        metadata: {
            ...snapshot,
            analysis: report.analysis,
            whale_summary: report.whale_summary,
            market_structure: report.market_structure,
            headline: report.headline,
            risk_note: report.risk_note
        }
    })

    if (error) {
        console.error('DB Insert Error:', error)
        throw new Error(`Database save failed: ${error.message}`)
    }

    return report
}

