import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getCoinglassApiKey } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

// Coinglass V4 Funding Rate OI Weight History response
interface FundingRateOHLCItem {
    time: number       // timestamp in ms
    open: string       // opening funding rate
    high: string       // highest funding rate
    low: string        // lowest funding rate
    close: string      // closing funding rate
}

interface HistoryDataPoint {
    date: number
    value: number
    price: number
}

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'cg-funding-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        // Use the correct V4 endpoint: /api/futures/funding-rate/oi-weight-history
        const url = `https://open-api-v4.coinglass.com/api/futures/funding-rate/oi-weight-history?symbol=${symbol}&interval=1d&limit=365`

        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': apiKey,
                'accept': 'application/json'
            },
            next: { revalidate: 3600 }
        })

        if (!res.ok) {
            logger.error(`Funding V4 API error: ${res.status}`, undefined, { feature: 'coinglass-api', endpoint: 'funding-history' })
            return NextResponse.json({ error: 'Upstream API error' }, { status: 502 })
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data || !Array.isArray(json.data)) {
            logger.error('Funding V4 API error', new Error(json.msg), { feature: 'coinglass-api', endpoint: 'funding-history' })
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        // Parse OHLC data - use 'close' as the value
        const allData: HistoryDataPoint[] = json.data.map((item: FundingRateOHLCItem) => ({
            date: item.time,
            value: parseFloat(item.close) * 100, // Convert to percentage
            price: 0
        }))

        // Sort by date ascending
        allData.sort((a, b) => a.date - b.date)

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

        // Downsample
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
        logger.error('Funding Rate History API error', error, { feature: 'coinglass-api', endpoint: 'funding-history' })
        return NextResponse.json({ error: 'Failed to fetch funding rate history' }, { status: 500 })
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

