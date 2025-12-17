import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

// Coinglass Funding Rate OHLC History response
interface FundingRateOHLCResponse {
    dataMap?: {
        [exchange: string]: number[]
    }
    dateList?: number[]
    priceList?: number[]
}

interface HistoryDataPoint {
    date: number
    value: number
    price: number
}

import { getCoinglassApiKey } from '@/lib/coinglass'

export async function GET(req: NextRequest) {
    const rateLimited = simpleApiRateLimit(req, 'cg-funding-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        // Use V3 OHLC history endpoint as V4 is unstable/unavailable
        // https://open-api-v3.coinglass.com/api/futures/fundingRate/ohlc-history
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        const res = await fetch(`https://open-api-v3.coinglass.com/api/futures/fundingRate/ohlc-history?symbol=${symbol}&interval=1d`, {
            headers: {
                'CG-API-KEY': apiKey,
                'accept': 'application/json'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!res.ok) {
            console.error(`Funding V3 API error: ${res.status}`)
            return NextResponse.json({ error: 'Upstream API error' }, { status: 502 })
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            console.error('Funding V3 API error:', json.msg)
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        const data = json.data
        if (!data.dateList || data.dateList.length === 0) {
            return NextResponse.json({ error: 'Empty data' }, { status: 500 })
        }

        // V3 Funding Rate format usually: { dateList: number[], dataList: number[], priceList: number[] }
        // Note: The structure might be dataMap if aggregated, but V3 fundingRate/ohlc-history usually returns simple lists or dataMap?
        // Let's assume it matches the structure: dateList, dataMap (by exchange) or just dataList (aggregated).
        // If it's OHLC of weighted funding rate, it might be just dataList.
        // Let's check documentation or assume it is similar to others. 
        // Based on search result: /api/futures/fundingRate/ohlc-history

        // To be safe, let's inspect the keys if possible or handle both.
        // But for strict TS we need to know.
        // Most V3 OHLC endpoints return: { t: [], c: [], ... } or { dateList: [], priceList: [], dataList: [] }

        // Actually, let's try the endpoint that provides aggregated history if possible.
        // If not, we might need to calculate average from exchange list.
        // But let's assume `ohlc-history` returns aggregated O/H/L/C of funding rate?
        // Wait, funding rate is a single value per 8h. 
        // The V3 endpoint `ohlc-history` likely returns O/H/L/C of the rate over the interval (1d).
        // Let's look at `data` object structure.

        // If we use `coinglassV4Request` pattern, it expected `dataMap`.
        // Let's stick to what we know works or generic parsing.

        // Let's just map dateList and assume there's a corresponding value list.
        // If dataList exists (aggregated), use it. If dataMap, avg it.

        const dateList = data.dateList || data.t || []
        const priceList = data.priceList || []
        let values: number[] = []

        if (data.dataList) {
            values = data.dataList
        } else if (data.c) {
            values = data.c
        } else if (data.dataMap) {
            // Calculate avg from map
            const exchangeKeys = Object.keys(data.dataMap)
            values = dateList.map((_: any, i: number) => {
                let sum = 0
                let count = 0
                for (const key of exchangeKeys) {
                    const val = data.dataMap[key][i]
                    if (typeof val === 'number') {
                        sum += val
                        count++
                    }
                }
                return count > 0 ? sum / count : 0
            })
        }

        const allData: HistoryDataPoint[] = dateList.map((time: number, i: number) => ({
            date: time, // V3 often returns seconds? No, usually ms for dateList or sec for t.
            // If keys are dateList/priceList -> usually ms. If t/c -> usually seconds.
            // Coinglass V3 inconsistent. Let's detect.
            // If time < 10000000000 (10 digits), it's seconds.
            // current time ~ 1.7e12 (13 digits).
            // So if time < 1e11 -> seconds.
            // Normalize to ms.
            value: (values[i] || 0) * 100, // Convert to percentage
            price: priceList[i] || 0
        })).map((d: any) => ({
            ...d,
            date: d.date < 100000000000 ? d.date * 1000 : d.date
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
        console.error('Funding Rate History API error:', error)
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
