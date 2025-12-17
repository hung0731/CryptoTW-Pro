import { NextRequest, NextResponse } from 'next/server'
import { getCoinglassApiKey } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

interface StablecoinHistoryData {
    data_list: number[]
    price_list: number[] // often empty or null
    time_list: number[]  // seconds
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

        if (!dataObj) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 500 })
        }

        const { time_list, data_list } = dataObj

        const history = time_list.map((t, i) => ({
            date: new Date(t * 1000).toISOString().split('T')[0],
            timestamp: t * 1000,
            value: data_list[i], // Market Cap Value usually in USD
            price: 0
        })).sort((a, b) => a.timestamp - b.timestamp)

        return NextResponse.json({ history })

    } catch (error) {
        console.error('Stablecoin API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
