import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { generateIndicatorSummary, IndicatorSummaryInput } from '@/lib/gemini'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes cache

// Generate cache key from input data (rounded values to increase cache hits)
function generateCacheKey(data: IndicatorSummaryInput): string {
    // Round values to reduce unique keys
    const roundedFgi = Math.round(data.fearGreedIndex / 5) * 5 // Round to nearest 5
    const roundedFr = Math.round(data.fundingRate * 10000) // 4 decimal precision
    const roundedLsr = Math.round(data.longShortRatio * 100) / 100 // 2 decimal precision
    return `ai:indicator-summary:${roundedFgi}:${roundedFr}:${roundedLsr}`
}

export async function POST(request: Request) {
    try {
        const data: IndicatorSummaryInput = await request.json()

        // Validate required fields
        if (!data.fearGreedIndex || data.fundingRate === undefined || data.longShortRatio === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check cache first (5 min for indicator summaries)
        const cacheKey = generateCacheKey(data)
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const result = await generateIndicatorSummary(data)

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to generate summary' },
                { status: 500 }
            )
        }

        // Cache the result for 5 minutes
        await setCache(cacheKey, result, CacheTTL.MEDIUM)

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (error) {
        logger.error('Indicator Summary API Error', error, { feature: 'ai-api', endpoint: 'indicator-summary' })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
