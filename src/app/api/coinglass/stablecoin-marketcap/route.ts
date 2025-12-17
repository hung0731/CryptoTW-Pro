import { NextRequest, NextResponse } from 'next/server'
import { getCoinglassApiKey } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

interface StablecoinHistoryData {
    data_list: (Record<string, number> | number)[]  // Can be objects with USDT/DAI/USDC etc or numbers
    price_list: number[] // often empty or null
    time_list: number[]  // seconds
}

// Helper to convert timestamp (handles both seconds and milliseconds)
function toDate(ts: number): Date {
    return new Date(ts < 10_000_000_000 ? ts * 1000 : ts)
}

// Helper to sum stablecoin marketcaps from object
function sumMarketCap(data: Record<string, number> | number): number {
    if (typeof data === 'number') return data
    return Object.values(data).reduce((sum, val) => sum + (val || 0), 0)
}

export async function GET(req: NextRequest) {
    const rateLimited = simpleApiRateLimit(req, 'cg-stablecoin', 20, 60)
    if (rateLimited) return rateLimited

    try {
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        // V4 Stablecoin MarketCap
        // https://open-api-v4.coinglass.com/api/index/stableCoin-marketCap-history
        const url = `https://open-api-v4.coinglass.com/api/index/stableCoin-marketCap-history`

        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': apiKey,
                'accept': 'application/json'
            },
            next: { revalidate: 3600 * 24 } // Daily update
        })

        if (!res.ok) {
            return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status })
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            return NextResponse.json({ error: json.msg || 'No data' }, { status: 500 })
        }

        let dataObj: StablecoinHistoryData | null = null
        if (Array.isArray(json.data) && json.data.length > 0) {
            dataObj = json.data[0]
        } else if (!Array.isArray(json.data) && json.data.time_list) {
            dataObj = json.data
        }

        if (!dataObj || !dataObj.time_list || !dataObj.data_list) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 500 })
        }

        const { time_list, data_list } = dataObj

        const history = time_list.map((t, i) => ({
            date: toDate(t).toISOString().split('T')[0],
            timestamp: toDate(t).getTime(),
            value: sumMarketCap(data_list[i]), // Sum all stablecoin marketcaps
            price: 0
        })).sort((a, b) => a.timestamp - b.timestamp)

        return NextResponse.json({ history })

    } catch (error) {
        console.error('Stablecoin API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

