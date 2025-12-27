
import { createAdminClient } from '@/lib/supabase-admin'
import {
    fetchFredSeries,
    calculateYoY,
    calculateMoMChange,
    FRED_SERIES
} from '@/lib/fred-api'
import { logger } from '@/lib/logger'

export class FredSyncService {
    // Helper to date match (returns Event ID if found)
    private static matchEventByDate(dateStr: string, events: any[]): string | null {
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


    // Helper to fetch BTC price reaction
    private static async getBtcReaction(dateStr: string): Promise<any | null> {
        try {
            // Convert "YYYY-MM-DD" to timestamp
            // Assumption: Event happens on this day. Reaction is D+0 (Close - Open), D+1 (Next Day Close - Current Close)
            // Or simpler: D+0 = (Close - Open) / Open
            // D+1 = (Close[+1] - Close[0]) / Close[0]

            const startTime = new Date(dateStr).getTime()
            // Fetch 7 days of data
            const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&limit=8`)
            if (!res.ok) return null

            const klines = await res.json()
            if (!klines || klines.length === 0) return null

            const d0 = klines[0] // [time, open, high, low, close, ...]
            const open0 = parseFloat(d0[1])
            const close0 = parseFloat(d0[4])

            const reaction: any = {
                d0: parseFloat(((close0 - open0) / open0 * 100).toFixed(2))
            }

            if (klines.length > 1) {
                const close1 = parseFloat(klines[1][4])
                reaction.d1 = parseFloat(((close1 - close0) / close0 * 100).toFixed(2))
            }

            if (klines.length > 7) {
                const close7 = parseFloat(klines[7][4])
                reaction.d7 = parseFloat(((close7 - close0) / close0 * 100).toFixed(2))
            }

            return reaction
        } catch (e) {
            logger.error(`Failed to calc BTC reaction for ${dateStr}`, e)
            return null
        }
    }

    public static async syncAll() {
        const supabase = createAdminClient()
        logger.info('Starting FRED data sync', { feature: 'fred-sync' })

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

        // Helper to update event with actual and reaction
        const updateEvent = async (eventId: string, actual: number, dateStr: string) => {
            const reaction = await this.getBtcReaction(dateStr)
            const updatePayload: any = { actual }

            if (reaction) {
                updatePayload.market_reaction = reaction
            }

            await supabase.from('macro_events').update(updatePayload).eq('id', eventId)
        }

        // ========== Sync CPI ==========
        try {
            logger.info('Fetching CPI data', { feature: 'fred-sync' })
            const cpiObservations = await fetchFredSeries(FRED_SERIES.CPI, { startDate: '2022-01-01', limit: 48 })
            const yoyMap = calculateYoY(cpiObservations)

            for (const [fredDate, yoyValue] of yoyMap.entries()) {
                const eventId = this.matchEventByDate(fredDate, eventsByType['cpi'])
                if (eventId) {
                    await updateEvent(eventId, yoyValue, fredDate)
                    results.cpi++
                }
            }
        } catch (e: any) {
            results.errors.push(`CPI Sync Error: ${e.message}`)
        }

        // ========== Sync NFP ==========
        try {
            logger.info('Fetching NFP data', { feature: 'fred-sync' })
            const nfpObservations = await fetchFredSeries(FRED_SERIES.NFP, { startDate: '2022-01-01', limit: 48 })
            const momMap = calculateMoMChange(nfpObservations)

            for (const [fredDate, changeValue] of momMap.entries()) {
                const eventId = this.matchEventByDate(fredDate, eventsByType['nfp'])
                if (eventId) {
                    await updateEvent(eventId, changeValue, fredDate)
                    results.nfp++
                }
            }
        } catch (e: any) {
            results.errors.push(`NFP Sync Error: ${e.message}`)
        }

        // ========== Sync FOMC (Fed Funds Rate) ==========
        try {
            logger.info('Fetching FOMC data', { feature: 'fred-sync' })
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
                    const dateStr = closestEvent.occurs_at.split('T')[0]
                    await updateEvent(closestEvent.id, rateValue, dateStr)
                    results.fomc++
                }
            }
        } catch (e: any) {
            results.errors.push(`FOMC Sync Error: ${e.message}`)
        }

        // ========== Sync UNRATE ==========
        try {
            logger.info('Fetching UNRATE data', { feature: 'fred-sync' })
            const unrateObservations = await fetchFredSeries(FRED_SERIES.UNRATE, { startDate: '2022-01-01', limit: 48 })

            for (const obs of unrateObservations) {
                if (obs.value === '.') continue
                const rateValue = parseFloat(obs.value)
                const eventId = this.matchEventByDate(obs.date, eventsByType['unrate'])

                if (eventId) {
                    await updateEvent(eventId, rateValue, obs.date)
                    results.unrate++
                }
            }
        } catch (e: any) {
            results.errors.push(`UNRATE Sync Error: ${e.message}`)
        }

        // ========== Sync PPI ==========
        try {
            logger.info('Fetching PPI data', { feature: 'fred-sync' })
            const ppiObservations = await fetchFredSeries(FRED_SERIES.PPI, { startDate: '2022-01-01', limit: 48 })
            const yoyMap = calculateYoY(ppiObservations)

            for (const [fredDate, yoyValue] of yoyMap.entries()) {
                const eventId = this.matchEventByDate(fredDate, eventsByType['ppi'])
                if (eventId) {
                    await updateEvent(eventId, yoyValue, fredDate)
                    results.ppi++
                }
            }
        } catch (e: any) {
            results.errors.push(`PPI Sync Error: ${e.message}`)
        }

        logger.info('Fred data sync complete', { feature: 'fred-sync', results })
        return results
    }
}
