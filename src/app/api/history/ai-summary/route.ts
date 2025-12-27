
import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { generateReviewsSummary } from '@/lib/ai'
import { getCache, setCache } from '@/lib/cache'
import { REVIEWS_DATA } from '@/lib/reviews-data'

import { getMarketSnapshot } from '@/lib/market-aggregator'

export const dynamic = 'force-dynamic'
// API Route to get AI Summary for Reviews
// Cached for 4 hours (to capture market shifts)

const CACHE_KEY = 'reviews_ai_summary_v5' // v5: Added current market context
const CACHE_TTL = 14400 // 4 hours

export async function GET() {
    try {
        // 1. Check Cache
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached)
        }

        // 2. Fetch Current Market Context via Snapshot
        let currentContext: { btcPrice: number, fgi: number, fundingRate: number } | undefined = undefined

        try {
            const snapshot = await getMarketSnapshot()
            currentContext = {
                btcPrice: snapshot.btc.price,
                fgi: snapshot.sentiment.fear_greed_index || 50,
                fundingRate: snapshot.capital_flow.funding_rate || 0
            }
        } catch (err) {
            logger.warn('Failed to fetch snapshot for reviews summary', { error: err })
        }

        // 3. Generate New Summary
        logger.info('[Reviews AI] Generating new summary with context', { feature: 'reviews', hasContext: !!currentContext })

        const result = await generateReviewsSummary({ events: REVIEWS_DATA, currentContext })

        if (!result) {
            throw new Error('Failed to generate summary')
        }

        // 3. Set Cache
        await setCache(CACHE_KEY, result, CACHE_TTL)

        return NextResponse.json(result)

    } catch (error) {
        logger.error('Reviews AI Summary API Error', error, { feature: 'reviews' })

        // Fallback if AI fails
        return NextResponse.json({
            summary: "目前歷史數據庫正進行系統維護與重新索引，請稍後再試。",
            source: "系統訊息"
        }, { status: 500 })
    }
}
