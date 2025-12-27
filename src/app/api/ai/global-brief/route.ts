import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { generateGlobalBrief } from '@/lib/gemini'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { MacroEventsService } from '@/lib/services/macro-events'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes

const CACHE_KEY = 'global_brief_v1'

export async function GET() {
    try {
        // 1. Check Cache
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } })
        }

        // 2. Aggregate Data (The Triad)
        // A. Sentiment (News) & B. Structure (Indicators)
        // We fetch these from Coinglass
        const apiKey = process.env.COINGLASS_API_KEY
        if (!apiKey) throw new Error('COINGLASS_API_KEY not configured')

        // C. Catalyst (Calendar)
        const calendarPromise = MacroEventsService.getCalendarViewModel()

        const [newsRes, fgiRes, frRes, calendarEvents] = await Promise.all([
            fetch('https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/index/fear-greed-history', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/futures/funding-rate/vol?symbol=BTC&type=U', { headers: { 'CG-API-KEY': apiKey } }),
            calendarPromise
        ])

        // Process Data
        const newsJson = await newsRes.json()
        const newsItems = newsJson.data || []

        const fgiJson = fgiRes.ok ? await fgiRes.json() : null
        const frJson = frRes.ok ? await frRes.json() : null

        const indicators = {
            fgi: fgiJson?.data?.[0]?.values?.[0]?.value || null,
            fundingRate: frJson?.data?.[0]?.rate || null
        }

        // Filter nearest event (Catalyst)
        const upcomingEvents = calendarEvents
            .filter(e => e.daysUntil >= 0 && e.daysUntil <= 5) // Look ahead 5 days for catalyst
            .sort((a, b) => a.daysUntil - b.daysUntil)

        const catalyst = upcomingEvents.length > 0 ? upcomingEvents[0] : null

        // 3. Generate Global Brief
        const result = await generateGlobalBrief({
            news: newsItems.slice(0, 5), // Top 5 news
            indicators,
            catalyst
        })

        if (!result) {
            throw new Error('Failed to generate global brief')
        }

        // 4. Cache (15 min - matches market context)
        await setCache(CACHE_KEY, result, CacheTTL.SLOW)

        return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })

    } catch (error) {
        logger.error('Global Brief API Error', error, { feature: 'ai-api', endpoint: 'global-brief' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
