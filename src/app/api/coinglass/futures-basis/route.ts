import { NextRequest, NextResponse } from 'next/server'
import { getCoinglassApiKey } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'

interface BasisItem {
    time: number
    open_basis: number
    close_basis: number
    open_change: number
    close_change: number
}

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'cg-basis', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol') || 'BTC'
    // Convert symbol to pair if needed, but defaults usually BTCUSDT for Binance
    const pair = symbol.includes('USDT') ? symbol : `${symbol}USDT`

    try {
        const apiKey = getCoinglassApiKey()
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
        }

        // V4 Basis History
        // https://open-api-v4.coinglass.com/api/futures/basis/history
        const url = `https://open-api-v4.coinglass.com/api/futures/basis/history?exchange=Binance&symbol=${pair}&interval=1d&limit=4500`

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

        const rawList: BasisItem[] = json.data

        // Map to standard format
        const history = rawList.map(item => ({
            date: new Date(item.time).toISOString().split('T')[0],
            timestamp: item.time,
            value: item.close_basis * 100, // Convert decimal to percentage (e.g. 0.05 -> 5%)
            price: 0 // Basis API doesn't return price context usually, or we can fetch separately if needed. For now 0.
        })).sort((a, b) => a.timestamp - b.timestamp)

        return NextResponse.json({ history })

    } catch (error) {
        console.error('Basis API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
