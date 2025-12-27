import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { generateIndicatorSummary, IndicatorSummaryInput } from '@/lib/ai'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes cache

// Generate cache key from input data (rounded values to increase cache hits)
function generateCacheKey(data: IndicatorSummaryInput, nearestEvent?: any): string {
    // Round values to reduce unique keys
    const roundedFgi = Math.round((Number(data.fearGreedIndex) || 0) / 5) * 5 // Round to nearest 5
    const roundedFr = Math.round((Number(data.fundingRate) || 0) * 10000) // 4 decimal precision
    const roundedLsr = Math.round((Number(data.longShortRatio) || 0) * 100) / 100 // 2 decimal precision

    // Include nearest event in cache key if it exists
    const eventKey = nearestEvent ? `${nearestEvent.def.key} -${nearestEvent.daysUntil} ` : 'no-event'

    // Generate cache key based on inputs + version
    const CACHE_KEY = `indicator - summary - v5 - ${JSON.stringify({ roundedFgi, roundedFr, roundedLsr, eventKey })} `
    return CACHE_KEY
}

import { MacroEventsService } from '@/lib/services/macro-events'

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

        // [New] Fetch Nearest Macro Event (Cross-Pollination)
        let nearestEvent = null
        try {
            // Get calendar view model
            const calendarEvents = await MacroEventsService.getCalendarViewModel()

            // Find the closest event within 3 days
            // Filter valid upcoming events
            const upcoming = calendarEvents
                .filter(e => e.daysUntil >= 0 && e.daysUntil <= 3)
                .sort((a, b) => a.daysUntil - b.daysUntil)

            if (upcoming.length > 0) {
                nearestEvent = upcoming[0]
            }
        } catch (err) {
            logger.warn('Failed to fetch macro events for indicator summary', { error: err })
        }

        // Check cache first (5 min for indicator summaries)
        const cacheKey = generateCacheKey(data, nearestEvent)
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        // Pass nearestEvent to generator
        const result = await generateIndicatorSummary(data, nearestEvent)

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
