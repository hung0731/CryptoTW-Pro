/**
 * Cache Aside Pattern 優化實作
 * 包含防止快取擊穿、降級策略、錯誤處理
 */

import { logger } from './logger'
import { getCache, setCache, acquireLock, releaseLock } from './cache'

export interface CacheAsideOptions<T> {
    key: string
    ttl: number
    fetcher: () => Promise<T>
    lockTTL?: number
    staleWhileRevalidate?: boolean
    onError?: (error: Error) => T | null | Promise<T | null>
    skipCache?: boolean
}

/**
 * Cache Aside Pattern with Lock
 * 
 * 流程：
 * 1. 嘗試從快取獲取
 * 2. 若未命中，獲取鎖
 * 3. 再次檢查快取（double-check）
 * 4. 執行 fetcher
 * 5. 寫入快取並釋放鎖
 */
export async function cacheAside<T>({
    key,
    ttl,
    fetcher,
    lockTTL = 10,
    staleWhileRevalidate = false,
    onError,
    skipCache = false
}: CacheAsideOptions<T>): Promise<T | null> {

    // 如果跳過快取，直接執行 fetcher
    if (skipCache) {
        try {
            return await fetcher()
        } catch (error) {
            logger.error('Fetcher failed (cache skipped)', error as Error, {
                feature: 'cache-aside',
                key
            })
            if (onError) {
                return await onError(error as Error)
            }
            throw error
        }
    }

    // 1. 嘗試從快取獲取
    const cached = await getCache<T>(key)
    if (cached !== null) {
        logger.debug('Cache hit', {
            feature: 'cache-aside',
            key
        })
        return cached
    }

    logger.debug('Cache miss', {
        feature: 'cache-aside',
        key
    })

    // 2. 獲取鎖（防止快取擊穿）
    const lockKey = `lock:${key}`
    const hasLock = await acquireLock(lockKey, lockTTL)

    if (!hasLock) {
        // 沒有獲得鎖，等待其他請求完成
        logger.debug('Waiting for lock', {
            feature: 'cache-aside',
            key
        })

        await new Promise(resolve => setTimeout(resolve, 100))

        // 3. 再次嘗試獲取快取（double-check）
        const retried = await getCache<T>(key)
        if (retried !== null) {
            logger.debug('Cache hit after lock wait', {
                feature: 'cache-aside',
                key
            })
            return retried
        }

        // 仍然沒有，降級處理
        logger.warn('Cache still empty after lock wait', {
            feature: 'cache-aside',
            key
        })

        if (onError) {
            return await onError(new Error('Cache miss after lock wait'))
        }
        return null
    }

    // 4. 執行 fetcher
    try {
        logger.debug('Executing fetcher', {
            feature: 'cache-aside',
            key
        })

        const data = await fetcher()

        // 5. 寫入快取
        await setCache(key, data, ttl)

        logger.debug('Cache populated', {
            feature: 'cache-aside',
            key,
            ttl
        })

        // 釋放鎖
        await releaseLock(lockKey)

        return data
    } catch (error) {
        logger.error('Fetcher failed', error as Error, {
            feature: 'cache-aside',
            key
        })

        // 釋放鎖
        await releaseLock(lockKey)

        // 錯誤處理
        if (onError) {
            return await onError(error as Error)
        }

        throw error
    }
}

/**
 * 批次 Cache Aside
 * 用於一次獲取多個資料
 */
export async function cacheAsideBatch<T>(
    items: Array<{
        key: string
        ttl: number
        fetcher: () => Promise<T>
    }>
): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    // 並行執行所有 cacheAside
    const promises = items.map(async ({ key, ttl, fetcher }) => {
        try {
            const data = await cacheAside({
                key,
                ttl,
                fetcher,
                onError: () => null
            })

            if (data !== null) {
                results.set(key, data)
            }
        } catch (e) {
            logger.error('Batch cache aside failed for key', e as Error, {
                feature: 'cache-aside-batch',
                key
            })
        }
    })

    await Promise.allSettled(promises)

    return results
}

/**
 * Stale While Revalidate Pattern
 * 返回舊資料，背景更新
 */
export async function staleWhileRevalidate<T>({
    key,
    ttl,
    fetcher,
    staleTTL = 3600
}: {
    key: string
    ttl: number
    fetcher: () => Promise<T>
    staleTTL?: number
}): Promise<T | null> {

    // 嘗試獲取快取
    const cached = await getCache<T>(key)

    // 如果有快取，立即返回
    if (cached !== null) {
        // 背景重新驗證（不等待）
        setTimeout(async () => {
            try {
                const fresh = await fetcher()
                await setCache(key, fresh, ttl)
                logger.debug('Background revalidation completed', {
                    feature: 'stale-while-revalidate',
                    key
                })
            } catch (e) {
                logger.error('Background revalidation failed', e as Error, {
                    feature: 'stale-while-revalidate',
                    key
                })
            }
        }, 0)

        return cached
    }

    // 沒有快取，正常執行
    return cacheAside({
        key,
        ttl,
        fetcher
    })
}
