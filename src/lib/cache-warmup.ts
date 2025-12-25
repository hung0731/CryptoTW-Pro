/**
 * 快取預熱機制
 * 在應用啟動或定期執行，預先載入熱資料
 */

import { logger } from './logger'
import { setCache, CacheTTL } from './cache'

/**
 * 預熱配置項目
 */
interface WarmupItem {
    key: string
    fetcher: () => Promise<any>
    ttl: number
    priority?: 'high' | 'medium' | 'low'  // 優先級
    conditional?: () => boolean | Promise<boolean>  // 條件檢查
}

/**
 * 預設預熱配置
 */
const DEFAULT_WARMUP_CONFIG: WarmupItem[] = [
    // 市場狀態（高優先級）
    {
        key: 'crypto:market:status:v1',
        fetcher: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/market/status`)
            return response.json()
        },
        ttl: CacheTTL.FAST,
        priority: 'high'
    },

    // 恐懼貪婪指數
    {
        key: 'crypto:indicator:fear-greed:v1',
        fetcher: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coinglass/fear-greed`)
            return response.json()
        },
        ttl: CacheTTL.SLOW,
        priority: 'high'
    },

    // 資金費率
    {
        key: 'crypto:indicator:funding-rate:v1',
        fetcher: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coinglass/funding-rate`)
            return response.json()
        },
        ttl: CacheTTL.MEDIUM,
        priority: 'medium'
    },

    // 多空比
    {
        key: 'crypto:indicator:long-short:v1',
        fetcher: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coinglass/long-short`)
            return response.json()
        },
        ttl: CacheTTL.MEDIUM,
        priority: 'medium'
    },

    // 市場上下文
    {
        key: 'crypto:market:context:v1',
        fetcher: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/market-context`)
            return response.json()
        },
        ttl: CacheTTL.SLOW,
        priority: 'medium'
    }
]

/**
 * 執行快取預熱
 */
export async function warmupCache(
    config: WarmupItem[] = DEFAULT_WARMUP_CONFIG
): Promise<{
    total: number
    successful: number
    failed: number
    skipped: number
}> {
    logger.info('Starting cache warmup...', {
        feature: 'cache-warmup',
        items: config.length
    })

    const startTime = Date.now()
    let successful = 0
    let failed = 0
    let skipped = 0

    // 按優先級分組
    const highPriority = config.filter(item => item.priority === 'high')
    const mediumPriority = config.filter(item => !item.priority || item.priority === 'medium')
    const lowPriority = config.filter(item => item.priority === 'low')

    // 高優先級：串行執行（確保完成）
    for (const item of highPriority) {
        const result = await warmupItem(item)
        if (result === 'success') successful++
        else if (result === 'failed') failed++
        else skipped++
    }

    // 中優先級：並行執行
    const mediumResults = await Promise.allSettled(
        mediumPriority.map(item => warmupItem(item))
    )

    mediumResults.forEach(result => {
        if (result.status === 'fulfilled') {
            if (result.value === 'success') successful++
            else if (result.value === 'failed') failed++
            else skipped++
        } else {
            failed++
        }
    })

    // 低優先級：並行執行（不等待）
    Promise.allSettled(
        lowPriority.map(item => warmupItem(item))
    ).then(results => {
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                if (result.value === 'success') successful++
                else if (result.value === 'failed') failed++
                else skipped++
            } else {
                failed++
            }
        })
    })

    const duration = Date.now() - startTime

    logger.info('Cache warmup completed', {
        feature: 'cache-warmup',
        total: config.length,
        successful,
        failed,
        skipped,
        duration: `${duration}ms`
    })

    return {
        total: config.length,
        successful,
        failed,
        skipped
    }
}

/**
 * 預熱單個項目
 */
async function warmupItem(item: WarmupItem): Promise<'success' | 'failed' | 'skipped'> {
    try {
        // 檢查條件
        if (item.conditional) {
            const shouldWarmup = await item.conditional()
            if (!shouldWarmup) {
                logger.debug('Warmup skipped (conditional)', {
                    feature: 'cache-warmup',
                    key: item.key
                })
                return 'skipped'
            }
        }

        // 執行 fetcher
        const data = await item.fetcher()

        // 寫入快取
        await setCache(item.key, data, item.ttl)

        logger.debug('Warmup successful', {
            feature: 'cache-warmup',
            key: item.key,
            ttl: item.ttl
        })

        return 'success'
    } catch (e) {
        logger.error('Warmup failed', e as Error, {
            feature: 'cache-warmup',
            key: item.key
        })
        return 'failed'
    }
}

/**
 * 定期預熱（可選）
 */
export function scheduleWarmup(
    intervalMs: number = 3600000,  // 預設每小時
    config?: WarmupItem[]
) {
    // 立即執行一次
    warmupCache(config)

    // 定期執行
    const intervalId = setInterval(() => {
        warmupCache(config)
    }, intervalMs)

    logger.info('Cache warmup scheduled', {
        feature: 'cache-warmup',
        interval: `${intervalMs / 1000}s`
    })

    return intervalId
}

/**
 * 停止定期預熱
 */
export function stopWarmup(intervalId: NodeJS.Timeout) {
    clearInterval(intervalId)
    logger.info('Cache warmup stopped', {
        feature: 'cache-warmup'
    })
}
