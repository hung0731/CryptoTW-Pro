import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    // Simple admin protection via query param (you can enhance this)
    const secret = req.nextUrl.searchParams.get('secret')
    if (secret !== 'cryptotw') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://localhost:6379'
        const redis = new Redis(redisUrl)

        await redis.flushdb()
        await redis.quit()

        logger.info('Cache cleared via API', { feature: 'admin' })

        return NextResponse.json({
            success: true,
            message: '✅ Redis 快取已全部清除！',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        logger.error('Cache clear error', error, { feature: 'admin' })
        return NextResponse.json({
            error: 'Failed to clear cache',
            details: String(error)
        }, { status: 500 })
    }
}
