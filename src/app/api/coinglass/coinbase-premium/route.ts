import { NextResponse } from 'next/server'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

export async function GET() {
    try {
        const res = await fetch(`${CG_BASE}/api/coinbase-premium-index`, {
            headers: { 'CG-API-KEY': CG_API_KEY },
            next: { revalidate: 300 } // 5 min cache
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
        const last30Prices = priceList.slice(-30)
        const last30Dates = dateList.slice(-30)

        // Latest value (premium is in percentage)
        const latestPremium = last30Prices[last30Prices.length - 1]
        const latestDate = new Date(last30Dates[last30Dates.length - 1]).toISOString().split('T')[0]

        // Average of last 7 days
        const last7Prices = last30Prices.slice(-7)
        const avg7d = last7Prices.reduce((a: number, b: number) => a + b, 0) / last7Prices.length

        return NextResponse.json({
            latest: {
                date: latestDate,
                premium: latestPremium,
                premiumFormatted: `${latestPremium >= 0 ? '+' : ''}${latestPremium.toFixed(3)}%`
            },
            avg7d: parseFloat(avg7d.toFixed(4)),
            history: last30Prices.map((price: number, i: number) => ({
                date: new Date(last30Dates[i]).toISOString().split('T')[0],
                premium: price
            }))
        })
    } catch (e) {
        console.error('Coinbase Premium API error:', e)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
