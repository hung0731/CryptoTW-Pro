import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

// Coinglass Long/Short Ratio History response
interface LSRatioHistoryResponse {
    dataList?: number[]  // Ratio values
    priceList?: number[]
    dateList?: number[]
}

interface HistoryDataPoint {
    date: number
    value: number  // Long/Short ratio (> 1 = more longs, < 1 = more shorts)
    price: number
}

export async function GET(req: NextRequest) {
    const rateLimited = simpleApiRateLimit(req, 'cg-lsr-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        const res = await coinglassV4Request<LSRatioHistoryResponse>(
            '/api/futures/global-long-short-account-ratio/history',
            { symbol, interval: 'h4' }
        )

        if (!res || !res.dateList || res.dateList.length === 0) {
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        const allData: HistoryDataPoint[] = res.dateList.map((time, i) => ({
            date: time,
            value: res.dataList?.[i] || 1,  // Default to neutral
            price: res.priceList?.[i] || 0,
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
