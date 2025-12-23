import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

// Helper to convert timestamp (handles both seconds and milliseconds)
function toDate(ts: number): Date {
    // If timestamp is in seconds (< 10 billion), convert to ms
    return new Date(ts < 10_000_000_000 ? ts * 1000 : ts)
}

// Helper to sum stablecoin marketcaps from object
function sumMarketCap(data: Record<string, number> | number): number {
    if (typeof data === 'number') return data
    return Object.values(data).reduce((sum, val) => sum + (val || 0), 0)
}

export async function GET() {
    try {
        const res = await fetch(`${CG_BASE}/api/index/stableCoin-marketCap-history`, {
            headers: { 'CG-API-KEY': CG_API_KEY },
            next: { revalidate: 3600 } // 1 hour cache
        })

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            logger.error('Stablecoin API error response', { feature: 'coinglass-api', endpoints: 'stablecoin', response: json })
            return NextResponse.json({ error: 'API error' }, { status: 500 })
        }

        // API returns data as array: [{ data_list, price_list, time_list }]
        const rawData = Array.isArray(json.data) ? json.data[0] : json.data
        const { data_list, time_list } = rawData

        if (!data_list || !time_list || data_list.length === 0) {
            logger.error('Stablecoin missing fields', { feature: 'coinglass-api', endpoints: 'stablecoin', missingFields: Object.keys(rawData || {}) })
            return NextResponse.json({ error: 'Invalid data format' }, { status: 500 })
        }

        // Get last 30 data points
        const last30Data = data_list.slice(-30)
        const last30Times = time_list.slice(-30)

        // Calculate total marketcap for each data point
        // data_list items can be { USDT: x, DAI: y, ... } or just numbers
        const last30Values = last30Data.map(sumMarketCap)

        // Latest value
        const latestMarketCap = last30Values[last30Values.length - 1]
        const latestDate = toDate(last30Times[last30Times.length - 1]).toISOString().split('T')[0]

        // 7 days ago
        const weekAgoMarketCap = last30Values[last30Values.length - 8] || last30Values[0]
        const change7d = weekAgoMarketCap > 0
            ? ((latestMarketCap - weekAgoMarketCap) / weekAgoMarketCap * 100)
            : 0

        // 30 days ago
        const monthAgoMarketCap = last30Values[0]
        const change30d = monthAgoMarketCap > 0
            ? ((latestMarketCap - monthAgoMarketCap) / monthAgoMarketCap * 100)
            : 0

        return NextResponse.json({
            latest: {
                date: latestDate,
                marketCap: latestMarketCap,
                marketCapFormatted: `$${(latestMarketCap / 1_000_000_000).toFixed(1)}B`
            },
            change7d: parseFloat(change7d.toFixed(2)),
            change30d: parseFloat(change30d.toFixed(2)),
            history: last30Values.map((value: number, i: number) => ({
                date: toDate(last30Times[i]).toISOString().split('T')[0],
                marketCap: value
            }))
        })
    } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))
        logger.error('Stablecoin API error', error, { feature: 'coinglass-api', endpoints: 'stablecoin' })
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

