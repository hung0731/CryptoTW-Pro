
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { MarketStatusService } from '@/lib/services/market-status'

// Force dynamic because we use request headers for rate limiting
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'market-status', 60, 60)
    if (rateLimited) return rateLimited

    try {
        const data = await MarketStatusService.getMarketStatus()
        return NextResponse.json(data)
    } catch (e) {
        logger.error('Market Status API Error', e, { feature: 'market-status' })
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }
}
