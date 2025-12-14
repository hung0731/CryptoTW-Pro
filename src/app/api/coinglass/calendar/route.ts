import { NextRequest, NextResponse } from 'next/server'
import { enrichMacroEvent, MACRO_EVENTS } from '@/lib/macro-knowledge-base'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 600 // Cache for 10 minutes (matching API update freq)

const API_KEY = process.env.COINGLASS_API_KEY
const BASE_URL = 'https://open-api-v4.coinglass.com/api/calendar/economic-data'

export async function GET(req: NextRequest) {
    // Rate limit: 30 requests per minute per IP
    const rateLimited = simpleApiRateLimit(req, 'cg-calendar', 30, 60)
    if (rateLimited) return rateLimited

    try {
        if (!API_KEY) {
            console.warn('COINGLASS_API_KEY is missing, returning mock/empty data')
            // Fallback to mock if needed, but for now we want to test the real logic.
            // Returning mock data from previous version if key missing to prevent crash
            const today = new Date()
            return NextResponse.json({
                calendar: {
                    events: getMockCalendarData(today),
                    isMock: true,
                    lastUpdated: new Date().toISOString()
                }
            })
        }

        // Fetch data in chunks to bypass 15-day limit (assuming limit is on query span)
        // Goal: Past 30 days, Future 60 days
        const now = Date.now()
        const dayMs = 86400000

        // Define 15-day chunks (past 30 days + future 90 days)
        const chunks = [
            { start: -30, end: -15 },
            { start: -15, end: 0 },
            { start: 0, end: 15 },
            { start: 15, end: 30 },
            { start: 30, end: 45 },
            { start: 45, end: 60 },
            { start: 60, end: 75 },
            { start: 75, end: 90 }
        ]

        const fetchChunk = async (startOffset: number, endOffset: number) => {
            const startTime = now + (startOffset * dayMs)
            const endTime = now + (endOffset * dayMs)
            const url = `${BASE_URL}?start_time=${startTime}&end_time=${endTime}&language=zh`

            try {
                const res = await fetch(url, {
                    headers: {
                        'CG-API-KEY': API_KEY,
                        'accept': 'application/json'
                    },
                    next: { revalidate: 600 }
                })
                if (!res.ok) return []
                const json = await res.json()
                return json.data || []
            } catch (e) {
                console.error(`Fetch error for chunk ${startOffset}-${endOffset}:`, e)
                return []
            }
        }

        const results = await Promise.all(chunks.map(c => fetchChunk(c.start, c.end)))

        // Deduplicate events by ID (timestamp + name) just in case overlaps occur
        const allEvents = results.flat()
        const seenIds = new Set()
        const rawEvents = []

        for (const ev of allEvents) {
            const id = `${ev.publish_timestamp}-${ev.calendar_name}`
            if (!seenIds.has(id)) {
                seenIds.add(id)
                rawEvents.push(ev)
            }
        }

        // Process and Enrich Data - Only US events
        const enrichedEvents = rawEvents
            .map((event: any) => {
                // Strict Country Filter: Only US events
                const isUS = event.country_code === 'US' ||
                    event.country_name === 'United States' ||
                    event.country_name === '美國'
                if (!isUS) return null

                const enrichment = enrichMacroEvent(event.calendar_name)

                // Transform to frontend format
                return {
                    id: `${event.publish_timestamp}-${event.calendar_name}`,
                    date: new Date(event.publish_timestamp).toISOString().split('T')[0],
                    time: new Date(event.publish_timestamp).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Taipei'
                    }),
                    timestamp: event.publish_timestamp,
                    currency: event.country_code, // e.g. 'US' or 'USD'
                    country: event.country_name,
                    title: enrichment?.titleTW || event.calendar_name, // Fallback to English name
                    originalTitle: event.calendar_name,
                    importance: event.importance_level,
                    actual: event.published_value,
                    forecast: event.forecast_value,
                    previous: event.previous_value,

                    // Enriched content (Optional)
                    tier: enrichment?.tier || (event.importance_level >= 3 ? 'A' : 'C'), // Map importance to tier if unknown
                    whyImportant: enrichment?.whyImportant,
                    cryptoReaction: enrichment?.cryptoReaction,

                    // Frontend helper
                    isKey: enrichment?.tier === 'S' || event.importance_level >= 3 // Highlight High Impact events
                }
            })
            .filter((e: any) => e !== null)
            .sort((a: any, b: any) => a.timestamp - b.timestamp)

        return NextResponse.json({
            calendar: {
                events: enrichedEvents,
                lastUpdated: new Date().toISOString()
            }
        })

    } catch (error) {
        console.error('Calendar API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            calendar: { events: [], lastUpdated: new Date().toISOString() }
        })
    }
}

// Fallback Mock Data (Updated to match new structure partially for safety)
function getMockCalendarData(date: Date) {
    // ... Mock implementation from previous, essentially acts as placeholder ...
    // Integrating some S-Tier mocks for demo if key fails
    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    const enriched = enrichMacroEvent('Fed Interest Rate Decision')!

    return [
        {
            id: 'mock-1',
            date: formatDate(date),
            time: '02:00',
            currency: 'USD',
            country: 'United States',
            title: enriched.titleTW,
            originalTitle: 'Fed Interest Rate Decision',
            importance: 3,
            actual: '',
            forecast: '5.50%',
            previous: '5.50%',
            tier: enriched.tier,
            whyImportant: enriched.whyImportant,
            cryptoReaction: enriched.cryptoReaction,
            isKey: true
        }
    ]
}
