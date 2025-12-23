import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { trackApiCall } from '@/lib/api-usage'

export const dynamic = 'force-dynamic'

// Coinglass Fear & Greed History API response format
interface FGIHistoryResponse {
    data_list: number[];    // FGI values (0-100)
    price_list: number[];   // BTC prices
    time_list: number[];    // timestamps
}

// Processed data point
interface FGIDataPoint {
    date: number;
    value: number;
    price: number;
}

export async function GET(req: NextRequest) {
    // Rate limit: 20 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(req, 'cg-fgi-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'  // 1M, 3M, 1Y

    try {
        // Coinglass Fear & Greed History API
        const fgiRes = await coinglassV4Request<FGIHistoryResponse>(
            '/api/index/fear-greed-history',
            {}
        )

        // 追蹤 API 調用
        trackApiCall('coinglass/fear-greed');

        if (!fgiRes || !fgiRes.data_list || fgiRes.data_list.length === 0) {
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        // Convert to array of data points
        const allData: FGIDataPoint[] = fgiRes.time_list.map((time, i) => ({
            date: time,
            value: fgiRes.data_list[i],
            price: fgiRes.price_list[i],
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

        // Downsample if too many points (for performance)
        const maxPoints = range === '1Y' ? 52 : range === '3M' ? 45 : 30
        const downsampled = downsample(filtered, maxPoints)

        // Get current value (latest)
        const current = allData[allData.length - 1]

        return NextResponse.json({
            history: downsampled,
            current: {
                value: current.value,
                date: current.date,
                price: current.price,
            },
            range,
        })
    } catch (error) {
        logger.error('FGI History API error', error, { feature: 'coinglass-api', endpoint: 'fear-greed' })
        return NextResponse.json({ error: 'Failed to fetch FGI history' }, { status: 500 })
    }
}

// Downsample array to N points
function downsample<T>(arr: T[], n: number): T[] {
    if (arr.length <= n) return arr
    const step = Math.ceil(arr.length / n)
    const result: T[] = []
    for (let i = 0; i < arr.length; i += step) {
        result.push(arr[i])
    }
    // Always include the last point
    if (result[result.length - 1] !== arr[arr.length - 1]) {
        result.push(arr[arr.length - 1])
    }
    return result
}
