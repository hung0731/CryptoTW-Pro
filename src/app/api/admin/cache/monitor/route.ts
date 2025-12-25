import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import {
    getRedisMemoryInfo,
    getRedisStats,
    getRedisSlowLog,
    getRedisClients,
    checkRedisHealth
} from '@/lib/cache-monitor'
import { getHotKeys } from '@/lib/cache-smart-ttl'

/**
 * Redis 監控 API
 * GET /api/admin/cache/monitor
 * 
 * 返回 Redis 狀態、記憶體、效能統計
 */
export async function GET(request: NextRequest) {
    try {
        // 檢查健康狀態
        const health = await checkRedisHealth()

        if (!health.healthy) {
            return NextResponse.json(
                {
                    status: 'unhealthy',
                    error: health.error,
                    mode: 'in-memory'
                },
                { status: 503 }
            )
        }

        // 並行獲取所有監控資訊
        const [memInfo, stats, slowlog, clients, hotKeys] = await Promise.all([
            getRedisMemoryInfo(),
            getRedisStats(),
            getRedisSlowLog(10),
            getRedisClients(),
            getHotKeys(20)
        ])

        // 計算健康分數
        const healthScore = calculateHealthScore({ memInfo, stats })

        return NextResponse.json({
            status: 'healthy',
            latency: health.latency,
            healthScore,
            memory: memInfo,
            stats,
            performance: {
                slowQueries: slowlog.length,
                slowlog: slowlog.slice(0, 5),  // 只返回前 5 個
                clients
            },
            hotKeys: hotKeys.slice(0, 10),  // 前 10 個熱門 keys
            timestamp: new Date().toISOString()
        })
    } catch (e) {
        logger.error('Failed to get Redis monitor data', e as Error, {
            feature: 'admin-cache-monitor'
        })

        return NextResponse.json(
            { error: 'Failed to fetch monitor data' },
            { status: 500 }
        )
    }
}

/**
 * 計算健康分數 (0-100)
 */
function calculateHealthScore({ memInfo, stats }: any): number {
    let score = 100

    // Memory 使用率懲罰
    if (memInfo) {
        const memUsagePercent = memInfo.totalSystemMemory
            ? (memInfo.usedMemory / memInfo.totalSystemMemory) * 100
            : 0

        if (memUsagePercent > 90) score -= 30
        else if (memUsagePercent > 80) score -= 20
        else if (memUsagePercent > 70) score -= 10

        // 碎片率懲罰
        if (memInfo.memFragmentationRatio > 2) score -= 20
        else if (memInfo.memFragmentationRatio > 1.5) score -= 10

        // 淘汰 keys 懲罰
        if (memInfo.evictedKeys > 1000) score -= 15
        else if (memInfo.evictedKeys > 100) score -= 10
    }

    // Hit Rate 懲罰
    if (stats) {
        if (stats.hitRate < 70) score -= 20
        else if (stats.hitRate < 80) score -= 10
        else if (stats.hitRate < 90) score -= 5
    }

    return Math.max(0, score)
}

/**
 * POST - 清除快取
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, pattern } = body

        if (action === 'clear') {
            const { clearAllCache } = await import('@/lib/cache')
            await clearAllCache()

            logger.info('Cache cleared via admin API', {
                feature: 'admin-cache-monitor'
            })

            return NextResponse.json({ success: true, message: 'All cache cleared' })
        }

        if (action === 'clear-pattern' && pattern) {
            // 清除符合 pattern 的 keys
            const { redis } = await import('@/lib/cache-internal')

            if (redis) {
                const keys = await redis.keys(pattern)
                if (keys.length > 0) {
                    await redis.unlink(...keys)
                }

                logger.info('Cache pattern cleared', {
                    feature: 'admin-cache-monitor',
                    pattern,
                    count: keys.length
                })

                return NextResponse.json({
                    success: true,
                    message: `Cleared ${keys.length} keys matching pattern`,
                    count: keys.length
                })
            }
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )
    } catch (e) {
        logger.error('Cache admin operation failed', e as Error, {
            feature: 'admin-cache-monitor'
        })

        return NextResponse.json(
            { error: 'Operation failed' },
            { status: 500 }
        )
    }
}
