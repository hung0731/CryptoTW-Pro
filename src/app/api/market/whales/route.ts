import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { getCache, setCache } from '@/lib/cache'
import { generateWhaleSummary } from '@/lib/ai'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'whales_data'
const CACHE_TTL = 120 // 2 minutes

// Coinglass Whale Position response type
interface WhalePosition {
    user: string
    symbol: string
    position_size: number
    entry_price: number
    mark_price: number
    liq_price: number
    leverage: number
    margin_balance: number
    position_value_usd: number
    unrealized_pnl: number
    funding_fee: number
    margin_mode: string
    create_time: number
    update_time: number
}

export async function getWhaleData() {
    // Check cache first
    const cached = await getCache<any>(CACHE_KEY)
    if (cached) {
        logger.debug('[Cache HIT] whales_data', { feature: 'market-api', endpoint: 'whales' })
        return cached
    }

    logger.debug('[Cache MISS] whales_data - fetching fresh data', { feature: 'market-api', endpoint: 'whales' })

    const [alerts, positions] = await Promise.all([
        coinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}),
        coinglassV4Request<WhalePosition[]>('/api/hyperliquid/whale-position', {})
    ])

    const top20Positions = (positions || [])
        .sort((a, b) => Math.abs(b.position_value_usd) - Math.abs(a.position_value_usd))
        .slice(0, 20)

    const summaryInput = top20Positions.map((p, i) => ({
        rank: i + 1,
        symbol: p.symbol,
        side: (p.position_size > 0 ? 'LONG' : 'SHORT') as 'LONG' | 'SHORT',
        valueUsd: Math.abs(p.position_value_usd),
        pnl: p.unrealized_pnl,
        leverage: p.leverage
    }))

    const summary = await generateWhaleSummary(summaryInput)

    const result = {
        alerts: alerts || [],
        positions: top20Positions,
        summary: summary
    }

    // Cache for 2 minutes
    await setCache(CACHE_KEY, result, CACHE_TTL)

    return result
}

export async function GET() {
    try {
        const data = await getWhaleData()
        return NextResponse.json({ whales: data })
    } catch (error) {
        logger.error('Whale Watch API Error', error, { feature: 'market-api', endpoint: 'whales' })
        return NextResponse.json({ error: 'Failed to fetch whale data' }, { status: 500 })
    }
}
