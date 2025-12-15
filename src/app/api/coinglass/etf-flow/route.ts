import { NextResponse } from 'next/server'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

export async function GET() {
    try {
        const res = await fetch(`${CG_BASE}/api/etf/bitcoin/flow-history`, {
            headers: { 'CG-API-KEY': CG_API_KEY },
            next: { revalidate: 300 } // 5 min cache
        })

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            return NextResponse.json({ error: 'API error' }, { status: 500 })
        }

        // Get last 30 days
        const recentData = json.data.slice(-30)

        // Calculate totals
        const last7Days = recentData.slice(-7)
        const last30Days = recentData

        const flow7d = last7Days.reduce((sum: number, d: any) => sum + (d.flow_usd || 0), 0)
        const flow30d = last30Days.reduce((sum: number, d: any) => sum + (d.flow_usd || 0), 0)

        // Latest day
        const latest = recentData[recentData.length - 1]

        return NextResponse.json({
            latest: {
                date: new Date(latest.timestamp).toISOString().split('T')[0],
                flowUsd: latest.flow_usd,
                priceUsd: latest.price_usd,
                etfFlows: latest.etf_flows
            },
            flow7d,
            flow30d,
            history: recentData.map((d: any) => ({
                date: new Date(d.timestamp).toISOString().split('T')[0],
                flowUsd: d.flow_usd,
                priceUsd: d.price_usd
            }))
        })
    } catch (e) {
        console.error('ETF Flow API error:', e)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
