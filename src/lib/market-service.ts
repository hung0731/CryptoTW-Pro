import { getMarketSnapshot } from '@/lib/market-aggregator'
import { generateMarketSummary } from '@/lib/gemini'
import { createAdminClient, supabase } from '@/lib/supabase'

export async function updateMarketSummary() {
    console.log('[MarketService] Starting Market Summary Generation...')

    // 1. Aggregate Data
    const snapshot = await getMarketSnapshot()

    // 2. Generate AI Report
    const report = await generateMarketSummary(snapshot)

    if (!report) {
        throw new Error('Failed to generate report')
    }

    console.log('[MarketService] Report Generated. Saving...')

    // 3. Save to Supabase
    // Try using Admin Client if Service Key exists (Bypass RLS)
    let dbClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
            dbClient = createAdminClient()
        } catch (e) {
            console.warn('Failed to create Admin Client, falling back to public client', e)
        }
    }

    const { error } = await dbClient.from('market_reports').insert({
        sentiment: report.sentiment,
        sentiment_score: report.sentiment_score,
        summary: report.summary,
        key_points: report.key_points,
        strategy: report.actionable_insight, // Mapping 'actionable_insight' to 'strategy' column
        emoji: report.emoji,
        metadata: { ...snapshot, metrics: report.metrics } // Save metrics in metadata
    })

    if (error) {
        console.error('DB Insert Error:', error)
        throw new Error(`Database save failed: ${error.message}`)
    }

    return report
}
