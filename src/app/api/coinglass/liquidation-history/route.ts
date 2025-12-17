import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

// Coinglass Liquidation Aggregated History response
interface LiquidationHistoryResponse {
    dataMap?: {
        longLiquidation?: number[]
        shortLiquidation?: number[]
    }
    dateList?: number[]
    priceList?: number[]
}

interface HistoryDataPoint {
    date: number
    value: number  // Net liquidation (positive = more longs, negative = more shorts)
    price: number
    longLiq?: number
    shortLiq?: number
}

export async function GET(req: NextRequest) {
    const rateLimited = simpleApiRateLimit(req, 'cg-liquidation-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        const res = await coinglassV4Request<LiquidationHistoryResponse>(
            '/api/futures/liquidation/aggregated-history',
            { symbol, interval: 'h4' }
        )

        if (!res || !res.dateList || res.dateList.length === 0) {
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        const longLiqs = res.dataMap?.longLiquidation || []
        const shortLiqs = res.dataMap?.shortLiquidation || []

        const allData: HistoryDataPoint[] = res.dateList.map((time, i) => {
            const longLiq = longLiqs[i] || 0
            const shortLiq = shortLiqs[i] || 0
            // Total liquidation volume (both sides)
            const total = longLiq + shortLiq

            return {
                date: time,
                value: total / 1_000_000,  // Convert to millions
                price: res.priceList?.[i] || 0,
                longLiq: longLiq / 1_000_000,
                shortLiq: shortLiq / 1_000_000,
            }
        })

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

        const maxPoints = range === '1Y' ? 120 : range === '3M' ? 90 : 45
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
        console.error('Liquidation History API error:', error)
        return NextResponse.json({ error: 'Failed to fetch liquidation history' }, { status: 500 })
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
