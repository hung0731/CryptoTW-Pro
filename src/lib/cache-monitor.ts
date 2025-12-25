/**
 * Redis 監控工具
 * 提供 Memory、效能、健康狀態監控
 */

import { logger } from './logger'

export interface RedisMemoryInfo {
    usedMemory: number
    usedMemoryHuman: string
    usedMemoryPeak: number
    usedMemoryPeakHuman: string
    memFragmentationRatio: number
    evictedKeys: number
    totalSystemMemory?: number
}

export interface RedisStats {
    uptime: number
    connections: number
    commandsProcessed: number
    opsPerSecond: number
    hitRate: number
    keyspace: {
        db0?: {
            keys: number
            expires: number
            avgTTL: number
        }
    }
}

/**
 * 獲取 Redis Memory 資訊
 */
export async function getRedisMemoryInfo(): Promise<RedisMemoryInfo | null> {
    try {
        const { redis } = await import('./cache-internal')
        if (!redis) return null

        const info = await redis.info('memory')
        const lines = info.split('\r\n')

        const memoryInfo: Record<string, string> = {}
        lines.forEach(line => {
            const [key, value] = line.split(':')
            if (key && value) {
                memoryInfo[key] = value
            }
        })

        return {
            usedMemory: parseInt(memoryInfo.used_memory || '0'),
            usedMemoryHuman: memoryInfo.used_memory_human || '0B',
            usedMemoryPeak: parseInt(memoryInfo.used_memory_peak || '0'),
            usedMemoryPeakHuman: memoryInfo.used_memory_peak_human || '0B',
            memFragmentationRatio: parseFloat(memoryInfo.mem_fragmentation_ratio || '0'),
            evictedKeys: parseInt(memoryInfo.evicted_keys || '0'),
            totalSystemMemory: parseInt(memoryInfo.total_system_memory || '0'),
        }
    } catch (e) {
        logger.error('Failed to get Redis memory info', e as Error, {
            feature: 'cache-monitor'
        })
        return null
    }
}

/**
 * 獲取 Redis 統計資訊
 */
export async function getRedisStats(): Promise<RedisStats | null> {
    try {
        const { redis } = await import('./cache-internal')
        if (!redis) return null

        const [statsInfo, keyspaceInfo] = await Promise.all([
            redis.info('stats'),
            redis.info('keyspace')
        ])

        const stats: Record<string, string> = {}
        statsInfo.split('\r\n').forEach(line => {
            const [key, value] = line.split(':')
            if (key && value) stats[key] = value
        })

        const keyspace: Record<string, string> = {}
        keyspaceInfo.split('\r\n').forEach(line => {
            const [key, value] = line.split(':')
            if (key && value) keyspace[key] = value
        })

        // 解析 keyspace hits/misses
        const hits = parseInt(stats.keyspace_hits || '0')
        const misses = parseInt(stats.keyspace_misses || '0')
        const total = hits + misses
        const hitRate = total > 0 ? (hits / total) * 100 : 0

        // 解析 db0 keyspace
        let db0Data = null
        if (keyspace.db0) {
            const match = keyspace.db0.match(/keys=(\d+),expires=(\d+),avg_ttl=(\d+)/)
            if (match) {
                db0Data = {
                    keys: parseInt(match[1]),
                    expires: parseInt(match[2]),
                    avgTTL: parseInt(match[3]),
                }
            }
        }

        return {
            uptime: parseInt(stats.uptime_in_seconds || '0'),
            connections: parseInt(stats.total_connections_received || '0'),
            commandsProcessed: parseInt(stats.total_commands_processed || '0'),
            opsPerSecond: parseFloat(stats.instantaneous_ops_per_sec || '0'),
            hitRate,
            keyspace: {
                db0: db0Data || undefined
            }
        }
    } catch (e) {
        logger.error('Failed to get Redis stats', e as Error, {
            feature: 'cache-monitor'
        })
        return null
    }
}

/**
 * 獲取 Slow Log
 */
export async function getRedisSlowLog(count: number = 10): Promise<any[]> {
    try {
        const { redis } = await import('./cache-internal')
        if (!redis) return []

        // 使用 call 方法來調用 slowlog 命令
        const slowlog = await redis.call('slowlog', 'get', count) as any[]
        return slowlog || []
    } catch (e) {
        logger.error('Failed to get Redis slowlog', e as Error, {
            feature: 'cache-monitor'
        })
        return []
    }
}

/**
 * 獲取 Redis 客戶端列表
 */
export async function getRedisClients(): Promise<number> {
    try {
        const { redis } = await import('./cache-internal')
        if (!redis) return 0

        const clientList = await redis.call('client', 'list') as string
        const clients = clientList.split('\n').filter((line: string) => line.trim())
        return clients.length
    } catch (e) {
        logger.error('Failed to get Redis clients', e as Error, {
            feature: 'cache-monitor'
        })
        return 0
    }
}

/**
 * 檢查 Redis 健康狀態
 */
export async function checkRedisHealth(): Promise<{
    healthy: boolean
    latency?: number
    error?: string
}> {
    try {
        const { redis } = await import('./cache-internal')
        if (!redis) {
            return { healthy: false, error: 'Redis not configured' }
        }

        const start = Date.now()
        await redis.ping()
        const latency = Date.now() - start

        return {
            healthy: true,
            latency
        }
    } catch (e) {
        return {
            healthy: false,
            error: (e as Error).message
        }
    }
}

/**
 * 啟動定期監控（可選）
 */
export function startRedisMonitoring(intervalMs: number = 60000) {
    setInterval(async () => {
        const memInfo = await getRedisMemoryInfo()
        const stats = await getRedisStats()

        if (memInfo || stats) {
            logger.info('Redis Monitoring', {
                feature: 'cache-monitor',
                memory: memInfo ? {
                    used: memInfo.usedMemoryHuman,
                    fragmentation: memInfo.memFragmentationRatio,
                    evicted: memInfo.evictedKeys
                } : null,
                stats: stats ? {
                    hitRate: `${stats.hitRate.toFixed(2)}%`,
                    opsPerSec: stats.opsPerSecond,
                    keys: stats.keyspace.db0?.keys
                } : null
            })

            // 警告：記憶體使用超過 80%
            if (memInfo && memInfo.totalSystemMemory) {
                const usagePercent = (memInfo.usedMemory / memInfo.totalSystemMemory) * 100
                if (usagePercent > 80) {
                    logger.warn('Redis memory usage > 80%', {
                        feature: 'cache-monitor',
                        usagePercent: `${usagePercent.toFixed(2)}%`,
                        used: memInfo.usedMemoryHuman
                    })
                }
            }

            // 警告：碎片率過高
            if (memInfo && memInfo.memFragmentationRatio > 1.5) {
                logger.warn('High Redis memory fragmentation', {
                    feature: 'cache-monitor',
                    ratio: memInfo.memFragmentationRatio
                })
            }

            // 警告：Hit Rate 過低
            if (stats && stats.hitRate < 80) {
                logger.warn('Low Redis cache hit rate', {
                    feature: 'cache-monitor',
                    hitRate: `${stats.hitRate.toFixed(2)}%`
                })
            }
        }
    }, intervalMs)

    logger.info('Redis monitoring started', {
        feature: 'cache-monitor',
        interval: `${intervalMs / 1000}s`
    })
}
