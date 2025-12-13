import { NextResponse } from 'next/server'
import { enrichMacroEvent, MACRO_EVENTS } from '@/lib/macro-knowledge-base'

export const dynamic = 'force-dynamic'
export const revalidate = 600 // Cache for 10 minutes (matching API update freq)

const API_KEY = process.env.COINGLASS_API_KEY
const BASE_URL = 'https://open-api-v4.coinglass.com/api/calendar/economic-data'

export async function GET() {
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

        // Calculate time window: -15 days to +15 days (API Limit)
        const now = Date.now()
        const dayMs = 86400000
        const startTime = now - (14 * dayMs) // Safe buffer
        const endTime = now + (14 * dayMs)

        // Fetch data
        const url = `${BASE_URL}?start_time=${startTime}&end_time=${endTime}&language=en`

        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': API_KEY,
                'accept': 'application/json'
            },
            next: { revalidate: 600 }
        })

        if (!res.ok) {
            throw new Error(`Coinglass API Error: ${res.statusText}`)
        }

        const json = await res.json()
        const rawEvents = json.data || []

        // Process and Enrich Data
        const enrichedEvents = rawEvents
            .map((event: any) => {
                // 1. Filter: specific country (User focused on USD, maybe generic global S-Tier)
                // Actually, our knowledge base keywords are English, so we match directly.

                const enrichment = enrichMacroEvent(event.calendar_name)

                // If not in our allowlist (knowledge base), check if it's high importance USD, 
                // but user said "Strict Allowlist". So we prioritize our list.
                // We will keep Non-Allowlist events ONLY if they are High Importance (3) AND USD,
                // but we won't give them the "Why Important" badge unless generic.

                if (!enrichment) {
                    // Strict filtering: If not in our S/A tier list, execute strict drop?
                    // User said: "Red Tier (Others) -> Don't show".
                    // So we effectively DROP everything not in our list?
                    // BUT, we should double check if we missed something important like 'GDP'.
                    // Our list covers FOMC, CPI, PCE, NFP, Unemployment, GDP, PMI.
                    // Let's drop everything else to be clean "CryptoTW Pro".
                    return null
                }

                // Transform to frontend format
                return {
                    id: `${event.publish_timestamp}-${event.calendar_name}`,
                    date: new Date(event.publish_timestamp).toISOString().split('T')[0],
                    time: new Date(event.publish_timestamp).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Taipei' // Display in Taipei time? Or UTC? 
                        // Usually raw timestamp is UTC. Coinglass timestamp is likely ms epoch.
                    }),
                    timestamp: event.publish_timestamp,
                    currency: event.country_code, // e.g. 'US' or 'USD'
                    country: event.country_name,
                    title: enrichment.titleTW, // Use our standardized TW title
                    originalTitle: event.calendar_name,
                    importance: event.importance_level,
                    actual: event.published_value,
                    forecast: event.forecast_value,
                    previous: event.previous_value,

                    // Enriched content
                    tier: enrichment.tier,
                    whyImportant: enrichment.whyImportant,
                    cryptoReaction: enrichment.cryptoReaction,

                    // Frontend helper
                    isKey: enrichment.tier === 'S'
                }
            })
            .filter((e: any) => e !== null) // Remove filtered out events
            .sort((a: any, b: any) => a.timestamp - b.timestamp) // Sort by time

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
