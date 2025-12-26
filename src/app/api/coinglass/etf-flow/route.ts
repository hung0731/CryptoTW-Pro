import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'cg-etf-flow', 20, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '3M'
    const cacheKey = `api:etf-flow:${range}`

    try {
        // Check cache first (15 min)
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const res = await fetch(`${CG_BASE}/api/etf/bitcoin/flow-history`, {
            headers: { 'CG-API-KEY': CG_API_KEY },
            next: { revalidate: 300 } // 5 min cache
        })

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            return NextResponse.json({ error: 'API error' }, { status: 500 })
        }

        // Parse all data with proper timestamps
        const allData = json.data.map((d: any) => ({
            date: d.timestamp, // Already in milliseconds from Coinglass
            value: (d.flow_usd || 0) / 1_000_000_000, // Convert to billions for display
            price: d.price_usd || 0
        }))

        // Filter by range
        const now = Date.now()
        const rangeMsMap: Record<string, number> = {
            '1M': 30 * 24 * 60 * 60 * 1000,
            '3M': 90 * 24 * 60 * 60 * 1000,
            '1Y': 365 * 24 * 60 * 60 * 1000,
        }
        const rangeMs = rangeMsMap[range] || rangeMsMap['3M']
        const cutoff = now - rangeMs

        const filtered = allData.filter((item: any) => item.date >= cutoff)

        // Calculate sums for display
        const last7Days = allData.slice(-7)
        const last30Days = allData.slice(-30)
        const flow7d = last7Days.reduce((sum: number, d: any) => sum + (d.value * 1_000_000_000), 0)
        const flow30d = last30Days.reduce((sum: number, d: any) => sum + (d.value * 1_000_000_000), 0)

        // Latest day
        const latest = allData[allData.length - 1]

        const result = {
            latest: {
                date: new Date(latest.date).toISOString().split('T')[0],
                flowUsd: latest.value * 1_000_000_000,
                priceUsd: latest.price,
            },
            flow7d,
            flow30d,
            history: filtered,
            range,
        }

        // Cache for 15 minutes
        await setCache(cacheKey, result, CacheTTL.SLOW)

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (e) {
        logger.error('ETF Flow API error:', e as Error)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
