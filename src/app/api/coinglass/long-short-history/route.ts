import { NextRequest, NextResponse } from 'next/server'
import { getCoinglassApiKey } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

// Coinglass V4 Long/Short Ratio History response
interface LSRatioHistoryItem {
    time: number                              // timestamp in ms
    global_account_long_percent: number       // long %
    global_account_short_percent: number      // short %
    global_account_long_short_ratio: number   // long/short ratio
}

interface HistoryDataPoint {
    date: number
    value: number  // Long/Short ratio (> 1 = more longs, < 1 = more shorts)
    price: number
}

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'cg-lsr-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        // Use correct V4 endpoint: /api/futures/global-long-short-account-ratio/history
        // Requires exchange and symbol (as pair like BTCUSDT)
        const url = `https://open-api-v4.coinglass.com/api/futures/global-long-short-account-ratio/history?exchange=Binance&symbol=${symbol}USDT&interval=h4&limit=1000`

        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': apiKey,
                'accept': 'application/json'
            },
            next: { revalidate: 3600 }
        })

        if (!res.ok) {
            console.error(`Long/Short V4 API error: ${res.status}`)
            return NextResponse.json({ error: 'Upstream API error' }, { status: 502 })
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data || !Array.isArray(json.data)) {
            console.error('Long/Short V4 API error:', json.msg)
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        // Parse data
        const allData: HistoryDataPoint[] = json.data.map((item: LSRatioHistoryItem) => ({
            date: item.time,
            value: item.global_account_long_short_ratio || 1,
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

        const maxPoints = range === '1Y' ? 90 : range === '3M' ? 60 : 30
        const downsampled = downsample(filtered, maxPoints)

        const current = allData[allData.length - 1]

        return NextResponse.json({
            history: downsampled,
            current: {
                value: current?.value || 1,
                date: current?.date || Date.now(),
                price: current?.price || 0,
            },
            range,
            symbol,
        })
    } catch (error) {
        console.error('Long/Short Ratio History API error:', error)
        return NextResponse.json({ error: 'Failed to fetch long/short ratio history' }, { status: 500 })
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

