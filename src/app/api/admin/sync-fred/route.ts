/**
 * Admin API: Sync FRED Economic Data
 * 
 * POST /api/admin/sync-fred
 * 
 * Fetches latest economic indicator data from FRED API
 * and updates src/data/macro-indicators.json
 */


import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import {
    fetchFredSeries,
    calculateYoY,
    calculateMoMChange,
    FRED_SERIES
} from '@/lib/fred-api'
import { logger } from '@/lib/logger'

// Helper to date match (returns Event ID if found)
function matchEventByDate(dateStr: string, events: any[]): string | null {
    // Standardize input date to YYYY-MM-DD
    const targetDate = new Date(dateStr)
    targetDate.setHours(0, 0, 0, 0)

    // Find event within same day (offset issues possible, so check strict date match or small range)
    // Occurrences are stored with T12:30:00Z etc.
    const match = events.find(e => {
        const eventDate = new Date(e.occurs_at)
        // Check if same YYYY-MM-DD
        return eventDate.getUTCFullYear() === targetDate.getFullYear() &&
            eventDate.getUTCMonth() === targetDate.getMonth() &&
            eventDate.getUTCDate() === targetDate.getDate()
    })

    return match ? match.id : null
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        logger.info('Starting FRED data sync (DB Mode)', { feature: 'admin', endpoint: 'sync-fred' })

        const results = {
            cpi: 0,
            nfp: 0,
            fomc: 0,
            unrate: 0,
            ppi: 0,
            errors: [] as string[]
        }

        // 1. Fetch all existing events from DB
        const { data: allEvents, error: fetchError } = await supabase
            .from('macro_events')
            .select('id, event_type, occurs_at')

        if (fetchError || !allEvents) {
            throw new Error(`Failed to fetch events from DB: ${fetchError?.message}`)
        }

        // Group events by type for faster matching
        const eventsByType: Record<string, any[]> = {
            cpi: [], nfp: [], fomc: [], unrate: [], ppi: []
        }
        allEvents.forEach(e => {
            if (eventsByType[e.event_type]) eventsByType[e.event_type].push(e)
        })

        // ========== Sync CPI ==========
        try {
            logger.info('Fetching CPI data', { feature: 'admin', endpoint: 'sync-fred' })
            const cpiObservations = await fetchFredSeries(FRED_SERIES.CPI, { startDate: '2022-01-01', limit: 48 })
            const yoyMap = calculateYoY(cpiObservations)

            for (const [fredDate, yoyValue] of yoyMap.entries()) {
                const eventId = matchEventByDate(fredDate, eventsByType['cpi'])
                if (eventId) {
                    await supabase.from('macro_events').update({ actual: yoyValue }).eq('id', eventId)
                    results.cpi++
                }
            }
        } catch (e: any) {
            results.errors.push(`CPI Sync Error: ${e.message}`)
        }

        // ========== Sync NFP ==========
        try {
            logger.info('Fetching NFP data', { feature: 'admin', endpoint: 'sync-fred' })
            const nfpObservations = await fetchFredSeries(FRED_SERIES.NFP, { startDate: '2022-01-01', limit: 48 })
            const momMap = calculateMoMChange(nfpObservations)

            for (const [fredDate, changeValue] of momMap.entries()) {
                const eventId = matchEventByDate(fredDate, eventsByType['nfp'])
                if (eventId) {
                    await supabase.from('macro_events').update({ actual: changeValue }).eq('id', eventId)
                    results.nfp++
                }
            }
        } catch (e: any) {
            results.errors.push(`NFP Sync Error: ${e.message}`)
        }

        // ========== Sync FOMC (Fed Funds Rate) ==========
        try {
            logger.info('Fetching FOMC data', { feature: 'admin', endpoint: 'sync-fred' })
            const fomcObservations = await fetchFredSeries(FRED_SERIES.FED_RATE, { startDate: '2022-01-01', limit: 50 })

            for (const obs of fomcObservations) {
                if (obs.value === '.') continue
                const rateValue = parseFloat(obs.value)
                const obsDate = new Date(obs.date)

                // Logic: Find FOMC meeting closest to this rate change (within 7 days)
                const closestEvent = eventsByType['fomc'].find(e => {
                    const eventDate = new Date(e.occurs_at)
                    const diffTime = Math.abs(eventDate.getTime() - obsDate.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays < 7
                })

                if (closestEvent) {
                    await supabase.from('macro_events').update({ actual: rateValue }).eq('id', closestEvent.id)
                    results.fomc++
                }
            }
        } catch (e: any) {
            results.errors.push(`FOMC Sync Error: ${e.message}`)
        }

        // ========== Sync UNRATE ==========
        try {
            logger.info('Fetching UNRATE data', { feature: 'admin', endpoint: 'sync-fred' })
            const unrateObservations = await fetchFredSeries(FRED_SERIES.UNRATE, { startDate: '2022-01-01', limit: 48 })

            for (const obs of unrateObservations) {
                if (obs.value === '.') continue
                const rateValue = parseFloat(obs.value)
                const eventId = matchEventByDate(obs.date, eventsByType['unrate'])

                if (eventId) {
                    await supabase.from('macro_events').update({ actual: rateValue }).eq('id', eventId)
                    results.unrate++
                }
            }
        } catch (e: any) {
            results.errors.push(`UNRATE Sync Error: ${e.message}`)
        }

        // ========== Sync PPI ==========
        try {
            logger.info('Fetching PPI data', { feature: 'admin', endpoint: 'sync-fred' })
            const ppiObservations = await fetchFredSeries(FRED_SERIES.PPI, { startDate: '2022-01-01', limit: 48 })
            const yoyMap = calculateYoY(ppiObservations)

            for (const [fredDate, yoyValue] of yoyMap.entries()) {
                const eventId = matchEventByDate(fredDate, eventsByType['ppi'])
                if (eventId) {
                    await supabase.from('macro_events').update({ actual: yoyValue }).eq('id', eventId)
                    results.ppi++
                }
            }
        } catch (e: any) {
            results.errors.push(`PPI Sync Error: ${e.message}`)
        }

        logger.info('DB Sync complete', { feature: 'admin', endpoint: 'sync-fred', results })

        return NextResponse.json({
            success: true,
            message: 'DB Sync completed',
            results
        })

    } catch (error: any) {
        logger.error('Sync Fatal Error', { feature: 'admin', endpoint: 'sync-fred', error: error.message })
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ status: 'Use POST to sync' })
}
