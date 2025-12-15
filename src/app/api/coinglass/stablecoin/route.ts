import { NextResponse } from 'next/server'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

export async function GET() {
    try {
        const res = await fetch(`${CG_BASE}/api/index/stableCoin-marketCap-history`, {
            headers: { 'CG-API-KEY': CG_API_KEY },
            next: { revalidate: 3600 } // 1 hour cache
        })

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            return NextResponse.json({ error: 'API error' }, { status: 500 })
        }

        // Parse the data structure - it's {priceList, dateList}
        const { priceList, dateList } = json.data

        if (!priceList || !dateList) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 500 })
        }

        // Get last 30 data points
        const totalPoints = priceList.length
        const last30Prices = priceList.slice(-30)
        const last30Dates = dateList.slice(-30)

        // Latest value
        const latestMarketCap = last30Prices[last30Prices.length - 1]
        const latestDate = new Date(last30Dates[last30Dates.length - 1]).toISOString().split('T')[0]

        // 7 days ago
        const weekAgoMarketCap = last30Prices[last30Prices.length - 8] || last30Prices[0]
        const change7d = ((latestMarketCap - weekAgoMarketCap) / weekAgoMarketCap * 100)

        // 30 days ago
        const monthAgoMarketCap = last30Prices[0]
        const change30d = ((latestMarketCap - monthAgoMarketCap) / monthAgoMarketCap * 100)

        return NextResponse.json({
            latest: {
                date: latestDate,
                marketCap: latestMarketCap,
                marketCapFormatted: `$${(latestMarketCap / 1_000_000_000).toFixed(1)}B`
            },
            change7d: parseFloat(change7d.toFixed(2)),
            change30d: parseFloat(change30d.toFixed(2)),
            history: last30Prices.map((price: number, i: number) => ({
                date: new Date(last30Dates[i]).toISOString().split('T')[0],
                marketCap: price
            }))
        })
    } catch (e) {
        console.error('Stablecoin API error:', e)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
