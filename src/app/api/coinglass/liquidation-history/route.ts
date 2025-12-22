import { NextRequest, NextResponse } from 'next/server'
import { getCoinglassApiKey } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

// Coinglass V4 Liquidation Aggregated History response
interface LiquidationHistoryItem {
    time: number                           // timestamp (seconds or ms)
    aggregated_long_liquidation_usd: string  // long liq USD
    aggregated_short_liquidation_usd: string // short liq USD
}

interface HistoryDataPoint {
    date: number
    value: number  // Total liquidation in millions
    price: number
    longLiq?: number
    shortLiq?: number
}

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'cg-liquidation-history', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        // Use correct V4 endpoint: /api/futures/liquidation/aggregated-history
        const url = `https://open-api-v4.coinglass.com/api/futures/liquidation/aggregated-history?exchange_list=Binance,OKX,Bybit&symbol=${symbol}&interval=1d&limit=365`

        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': apiKey,
                'accept': 'application/json'
            },
            next: { revalidate: 3600 }
        })

        if (!res.ok) {
            console.error(`Liquidation V4 API error: ${res.status}`)
            return NextResponse.json({ error: 'Upstream API error' }, { status: 502 })
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data || !Array.isArray(json.data)) {
            console.error('Liquidation V4 API error:', json.msg)
            return NextResponse.json({ error: 'No data available' }, { status: 500 })
        }

        // Parse data
        const allData: HistoryDataPoint[] = json.data.map((item: LiquidationHistoryItem) => {
            const longLiq = parseFloat(item.aggregated_long_liquidation_usd) || 0
            const shortLiq = parseFloat(item.aggregated_short_liquidation_usd) || 0
            const total = longLiq + shortLiq
            // Normalize timestamp (V4 may use seconds)
            const timestamp = item.time < 10000000000 ? item.time * 1000 : item.time

            return {
                date: timestamp,
                value: total / 1_000_000,  // Convert to millions
                price: 0,
                longLiq: longLiq / 1_000_000,
                shortLiq: shortLiq / 1_000_000,
            }
        })

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

