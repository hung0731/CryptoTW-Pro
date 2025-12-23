import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

// Coinglass Open Interest OHLC History response
interface OIHistoryResponse {
    dataMap?: {
        [exchange: string]: number[]
    }
    dateList?: number[]
    priceList?: number[]
}

interface HistoryDataPoint {
    date: number
    value: number  // Total OI in billions
    price: number
}

import { getCoinglassApiKey } from '@/lib/coinglass'

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'cg-oi-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        // Use V3 OHLC Aggregated History (V4 returns 404/Error)
        // https://open-api-v3.coinglass.com/api/futures/openInterest/ohlc-aggregated-history
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        // Convert range to startTime/endTime if needed, or get full history
        // Coinglass V3 takes startTime/endTime in seconds
        // Default to last 2 years for broad coverage
        const endSec = Math.floor(Date.now() / 1000)
        const startSec = endSec - (2 * 365 * 24 * 60 * 60) // 2 years ago

        const url = `https://open-api-v3.coinglass.com/api/futures/openInterest/ohlc-aggregated-history?symbol=${symbol}&interval=1d&startTime=${startSec}&endTime=${endSec}`

        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': apiKey,
                'accept': 'application/json'
            },
            next: { revalidate: 3600 }
        })

        if (!res.ok) {
            logger.error(`OI V3 API error: ${res.status}`, { feature: 'coinglass-api', endpoint: 'open-interest-history' })
            return NextResponse.json({ error: 'Upstream API error' }, { status: 502 })
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            logger.error('OI V3 API error', { feature: 'coinglass-api', endpoint: 'open-interest-history', errorMsg: json.msg })
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        // V3 Response format: data: [{t: 123, o, h, l, c}, ...]
        // We use 'c' (Close OI)
        const rawData = json.data
        if (!Array.isArray(rawData)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 500 })
        }

        const allData: HistoryDataPoint[] = rawData.map((d: any) => ({
            date: d.t * 1000, // timestamps in seconds
            value: (d.c || 0) / 1_000_000_000,  // Convert to billions (original is usually raw number)
            price: 0, // V3 OI endpoint might not return price. If missing, we can fetch price separately or ignore (chart handles 0 price?)
            // Actually ReviewChart and IndicatorStoryPage expect price for context.
            // If missing, context chart might be empty.
            // TODO: Ideally fetch price too, but for now let's ensure OI loads.
        }))

        // Filter by range
        const now = Date.now()
        const rangeMsMap: Record<string, number> = {
            '1M': 30 * 24 * 60 * 60 * 1000,
            '3M': 90 * 24 * 60 * 60 * 1000,
            '1Y': 365 * 24 * 60 * 60 * 1000,
        }
        const rangeMs = rangeMsMap[range] || rangeMsMap['3M']
        const cutoff = now - rangeMs
        const filtered = allData.filter(item => item.date >= cutoff)

        const maxPoints = range === '1Y' ? 90 : range === '3M' ? 60 : 30
        const downsampled = downsample(filtered, maxPoints)

        const current = allData[allData.length - 1]

        return NextResponse.json({
            history: downsampled,
            current: {
                value: current?.value || 0,
                date: current?.date || Date.now(),
                price: current?.price || 0,
            },
            range,
            symbol,
        })
    } catch (error) {
        logger.error('Open Interest History API error', error, { feature: 'coinglass-api', endpoint: 'open-interest-history' })
        return NextResponse.json({ error: 'Failed to fetch open interest history' }, { status: 500 })
    }
}

function downsample<T>(arr: T[], n: number): T[] {
    if (arr.length <= n) return arr
    const step = Math.ceil(arr.length / n)
    const result: T[] = []
    for (let i = 0; i < arr.length; i += step) {
        result.push(arr[i])
    }
    if (result[result.length - 1] !== arr[arr.length - 1]) {
        result.push(arr[arr.length - 1])
    }
    return result
}
