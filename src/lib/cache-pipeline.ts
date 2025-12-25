/**
 * Redis Pipeline 批次操作工具
 * 減少網路 RTT，提升效能
 */

import { logger } from './logger'

/**
 * 批次獲取快取
 */
export async function getCacheBatch<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>()

    if (keys.length === 0) return result

    try {
        // 直接從 cache.ts 獲取 redis 實例
        const { redis } = await import('./cache')

        if (!redis) {
            logger.warn('Redis not available for batch get', { keyCount: keys.length })
            return result
        }

        // 使用 Pipeline 批次獲取
        const pipeline = redis.pipeline()
        keys.forEach(key => pipeline.get(key))

        const results = await pipeline.exec()

        if (results) {
            results.forEach((res: any, index: number) => {
                const [err, data] = res
                if (!err && data) {
                    try {
                        result.set(keys[index], JSON.parse(data as string) as T)
                    } catch (e) {
                        logger.warn('Failed to parse cached data', {
                            key: keys[index],
                            error: String(e)
                        })
                    }
                }
            })
        }

        logger.debug('Batch get completed', {
            feature: 'cache-pipeline',
            requested: keys.length,
            found: result.size,
            hitRate: ((result.size / keys.length) * 100).toFixed(2) + '%'
        })
    } catch (e) {
        logger.error('getCacheBatch failed', e as Error, {
            feature: 'cache-pipeline',
            keyCount: keys.length
        })
    }

    return result
}

/**
 * 批次設定快取
 */
export async function setCacheBatch<T>(
    entries: Array<{ key: string; data: T; ttl: number }>
): Promise<void> {
    if (entries.length === 0) return

    try {
        const { redis } = await import('./cache')

        if (!redis) {
            logger.warn('Redis not available for batch set', { count: entries.length })
            return
        }

        const pipeline = redis.pipeline()

        entries.forEach(({ key, data, ttl }) => {
            pipeline.set(key, JSON.stringify(data), 'EX', ttl)
        })

        await pipeline.exec()

        logger.debug('Batch set completed', {
            feature: 'cache-pipeline',
            count: entries.length
        })
    } catch (e) {
        logger.error('setCacheBatch failed', e as Error, {
            feature: 'cache-pipeline',
            count: entries.length
        })
    }
}

/**
 * 批次刪除快取（使用 UNLINK 而非 DEL，更快）
 */
export async function invalidateCacheBatch(keys: string[]): Promise<void> {
    if (keys.length === 0) return

    try {
        const { redis } = await import('./cache')

        if (!redis) {
            logger.warn('Redis not available for batch delete', { keyCount: keys.length })
            return
        }

        // UNLINK 是非阻塞的 DEL
        await redis.unlink(...keys)

        logger.debug('Batch delete completed', {
            feature: 'cache-pipeline',
            count: keys.length
        })
    } catch (e) {
        logger.error('invalidateCacheBatch failed', e as Error, {
            feature: 'cache-pipeline',
            keyCount: keys.length
        })
    }
}

/**
 * 批次檢查 key 是否存在
 */
export async function existsBatch(keys: string[]): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>()

    if (keys.length === 0) return result

    try {
        const { redis } = await import('./cache')

        if (!redis) return result

        const pipeline = redis.pipeline()
        keys.forEach(key => pipeline.exists(key))

        const results = await pipeline.exec()

        if (results) {
            results.forEach((res: any, index: number) => {
                const [err, exists] = res
                if (!err) {
                    result.set(keys[index], exists === 1)
                }
            })
        }
    } catch (e) {
        logger.error('existsBatch failed', e as Error, { keyCount: keys.length })
    }

    return result
}

/**
 * 批次獲取 TTL
 */
export async function getTTLBatch(keys: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>()

    if (keys.length === 0) return result

    try {
        const { redis } = await import('./cache')

        if (!redis) return result

        const pipeline = redis.pipeline()
        keys.forEach(key => pipeline.ttl(key))

        const results = await pipeline.exec()

        if (results) {
            results.forEach((res: any, index: number) => {
                const [err, ttl] = res
                if (!err && ttl >= 0) {
                    result.set(keys[index], ttl as number)
                }
            })
        }
    } catch (e) {
        logger.error('getTTLBatch failed', e as Error, { keyCount: keys.length })
    }

    return result
}
