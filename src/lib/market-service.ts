import { getMarketSnapshot } from '@/lib/market-aggregator'
import { generateMarketSummary } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-admin'
import { fetchRSSTitles } from '@/lib/rss'
import { logger } from '@/lib/logger'

export async function updateMarketSummary() {
    logger.info('[MarketService] Starting Market Summary Generation...', { feature: 'market-service' })

    // 1. Aggregate Data
    const snapshot = await getMarketSnapshot()

    // Setup DB Client
    let dbClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
            dbClient = createAdminClient()
        } catch (e) {
            logger.warn('Failed to create Admin Client, falling back to public client', { feature: 'market-service', error: e })
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
        logger.warn('[MarketService] Failed to fetch context data:', { feature: 'market-service', error: e })
    }

    // 2. Generate AI Report (Unified: Technical + Context)
    const report = await generateMarketSummary(snapshot, recentAlerts, rssTitles)

    if (!report) {
        throw new Error('Failed to generate report')
    }

    logger.info('[MarketService] Report Generated. Saving...', { feature: 'market-service' })

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
        logger.error('DB Insert Error:', error as Error, { feature: 'market-service' })
        throw new Error(`Database save failed: ${error.message}`)
    }

    return report
}

