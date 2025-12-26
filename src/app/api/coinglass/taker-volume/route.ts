import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'
const CACHE_KEY = 'api:taker-volume'

export async function GET() {
    try {
        // Check cache first (5 min)
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

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

        const result = {
            totalBuyUsd: totalBuy,
            totalSellUsd: totalSell,
            ratio: parseFloat(ratio.toFixed(3)),
            byExchange: data.slice(0, 5).map((d: any) => ({
                exchange: d.exchange,
                buyVolumeUsd: d.buy_volume_usd,
                sellVolumeUsd: d.sell_volume_usd,
                ratio: d.sell_volume_usd > 0 ? parseFloat((d.buy_volume_usd / d.sell_volume_usd).toFixed(3)) : 1
            }))
        }

        // Cache for 5 minutes
        await setCache(CACHE_KEY, result, CacheTTL.MEDIUM)

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))
        logger.error('Taker Volume API error', error, { feature: 'coinglass-api', endpoint: 'taker-volume' })
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
