import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { generateCalendarSummary, CalendarSummaryInput } from '@/lib/gemini'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // 30 minutes cache

// Generate a hash from input data for cache key
function hashInput(data: CalendarSummaryInput): string {
    const str = JSON.stringify(data.events.map(e => e.title).sort())
    return crypto.createHash('md5').update(str).digest('hex').slice(0, 16)
}

export async function POST(request: Request) {
    try {
        const data: CalendarSummaryInput = await request.json()

        // Validate required fields
        if (!data.events || !Array.isArray(data.events) || data.events.length === 0) {
            return NextResponse.json(
                { error: 'Missing events array' },
                { status: 400 }
            )
        }

        // Check cache first (30 min for AI summaries)
        const cacheKey = `ai:calendar-summary:${hashInput(data)}`
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const result = await generateCalendarSummary(data)

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to generate summary' },
                { status: 500 }
            )
        }

        // Cache the result for 30 minutes
        await setCache(cacheKey, result, CacheTTL.SLOW * 2) // 30 min

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (error) {
        logger.error('Calendar Summary API Error', error, { feature: 'ai-api', endpoint: 'calendar-summary' })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
