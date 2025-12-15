import { NextResponse } from 'next/server'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

export async function GET() {
    try {
        const res = await fetch(`${CG_BASE}/api/futures/taker-buy-sell-volume/exchange-list?symbol=BTC&range=4h`, {
            headers: { 'CG-API-KEY': CG_API_KEY },
            next: { revalidate: 300 } // 5 min cache
        })

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            return NextResponse.json({ error: 'API error' }, { status: 500 })
        }

        // Aggregate all exchanges
        const data = json.data
        let totalBuy = 0
        let totalSell = 0

        data.forEach((exchange: any) => {
            totalBuy += exchange.buy_volume_usd || 0
            totalSell += exchange.sell_volume_usd || 0
        })

        const ratio = totalSell > 0 ? totalBuy / totalSell : 1

        return NextResponse.json({
            totalBuyUsd: totalBuy,
            totalSellUsd: totalSell,
            ratio: parseFloat(ratio.toFixed(3)),
            byExchange: data.slice(0, 5).map((d: any) => ({
                exchange: d.exchange,
                buyVolumeUsd: d.buy_volume_usd,
                sellVolumeUsd: d.sell_volume_usd,
                ratio: d.sell_volume_usd > 0 ? parseFloat((d.buy_volume_usd / d.sell_volume_usd).toFixed(3)) : 1
            }))
        })
    } catch (e) {
        console.error('Taker Volume API error:', e)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
