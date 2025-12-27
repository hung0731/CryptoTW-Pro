
import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { generateReviewsSummary } from '@/lib/gemini'
import { getCache, setCache } from '@/lib/cache'
import { REVIEWS_DATA } from '@/lib/reviews-data'

export const dynamic = 'force-dynamic'
// API Route to get AI Summary for Reviews
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

        // 2. Fetch Current Market Context (Cross-Pollination)
        const apiKey = process.env.COINGLASS_API_KEY
        let currentContext: { fgi: any, fundingRate: any } | undefined = undefined

        if (apiKey) {
            try {
                const [fgiRes, frRes] = await Promise.all([
                    fetch('https://open-api-v4.coinglass.com/api/index/fear-greed-history', { headers: { 'CG-API-KEY': apiKey } }),
                    fetch('https://open-api-v4.coinglass.com/api/futures/funding-rate/vol?symbol=BTC&type=U', { headers: { 'CG-API-KEY': apiKey } })
                ])

                const fgiJson = fgiRes.ok ? await fgiRes.json() : null
                const frJson = frRes.ok ? await frRes.json() : null

                currentContext = {
                    fgi: fgiJson?.data?.[0]?.values?.[0]?.value || null,
                    fundingRate: frJson?.data?.[0]?.rate || null
                }
            } catch (err) {
                logger.warn('Failed to fetch indicators for reviews summary', { error: err })
            }
        }

        // 3. Generate New Summary
        logger.info('[Reviews AI] Generating new summary with context', { feature: 'reviews', hasContext: !!currentContext })

        const result = await generateReviewsSummary(REVIEWS_DATA, currentContext)

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
