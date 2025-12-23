import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getCoinglassApiKey } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

interface PremiumItem {
    time: number // seconds usually for Index APIs, checking docs... User doc says: "time": 1658880000 (seconds)
    premium: number
    premium_rate: number
}

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'cg-premium', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        // V4 Coinbase Premium Index
        // https://open-api-v4.coinglass.com/api/coinbase-premium-index
        const url = `https://open-api-v4.coinglass.com/api/coinbase-premium-index?interval=1d&limit=4500`

        const res = await fetch(url, {
            headers: {
                'CG-API-KEY': apiKey,
                'accept': 'application/json'
            },
            next: { revalidate: 3600 }
        })

        if (!res.ok) {
            return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status })
        }

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            return NextResponse.json({ error: json.msg || 'No data' }, { status: 500 })
        }

        const rawList: PremiumItem[] = json.data

        const history = rawList.map(item => ({
            date: new Date(item.time * 1000).toISOString().split('T')[0],
            timestamp: item.time * 1000,
            value: item.premium_rate * 100,
            price: 0
        })).sort((a, b) => a.timestamp - b.timestamp)

        return NextResponse.json({ history })

    } catch (error) {
        logger.error('Premium API Error', error, { feature: 'coinglass-api', endpoint: 'premium' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
