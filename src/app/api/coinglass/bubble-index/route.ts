import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

const CG_API_KEY = process.env.COINGLASS_API_KEY || ''
const CG_BASE = 'https://open-api-v4.coinglass.com'
const CACHE_KEY = 'api:bubble-index'

export async function GET() {
    try {
        // Check cache first (1 hour for daily data)
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const res = await fetch(`${CG_BASE}/api/index/bitcoin/bubble-index`, {
            headers: { 'CG-API-KEY': CG_API_KEY },
            next: { revalidate: 3600 } // 1 hour cache (daily data)
        })

        const json = await res.json()
        if (json.code !== '0' || !json.data) {
            return NextResponse.json({ error: 'API error' }, { status: 500 })
        }

        // Get latest data
        const latest = json.data[json.data.length - 1]

        // Get history for chart (last 30 days)
        const history = json.data.slice(-30).map((d: any) => ({
            date: d.date_string,
            price: d.price,
            bubbleIndex: d.bubble_index
        }))

        const result = {
            latest: {
                date: latest.date_string,
                price: latest.price,
                bubbleIndex: latest.bubble_index,
                miningDifficulty: latest.mining_difficulty,
                transactionCount: latest.transaction_count
            },
            history
        }

        // Cache for 1 hour
        await setCache(CACHE_KEY, result, CacheTTL.HOURLY)

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Bubble Index API error', err, { feature: 'coinglass-api', endpoint: 'bubble-index' })
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
