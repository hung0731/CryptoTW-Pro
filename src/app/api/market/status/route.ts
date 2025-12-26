
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { MarketStatusService } from '@/lib/services/market-status'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

const CACHE_KEY = 'api:market-status'

// Force dynamic because we use request headers for rate limiting
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'market-status', 60, 60)
    if (rateLimited) return rateLimited

    try {
        // Check cache first (60 second TTL)
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
                }
            })
        }

        // Cache miss - fetch fresh data
        const data = await MarketStatusService.getMarketStatus()

        if (data) {
            // Store in cache
            await setCache(CACHE_KEY, data, CacheTTL.FAST)
        }

        return NextResponse.json(data, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        })
    } catch (e) {
        logger.error('Market Status API Error', e, { feature: 'market-status' })
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }
}
