/**
 * 智能 TTL 管理
 * 根據訪問頻率動態調整快取時間
 */

import { logger } from './logger'

interface AccessStats {
    count: number
    lastAccess: number
    firstAccess: number
}

// 訪問統計（存在 memory 中）
const accessStats = new Map<string, AccessStats>()

// 定期清理舊統計（避免 memory leak）
setInterval(() => {
    const now = Date.now()
    const oneDayAgo = now - 86400000 // 24 hours

    for (const [key, stats] of accessStats.entries()) {
        if (stats.lastAccess < oneDayAgo) {
            accessStats.delete(key)
        }
    }
}, 3600000) // 每小時清理一次

/**
 * 根據訪問頻率計算智能 TTL
 */
export function calculateSmartTTL(
    key: string,
    baseTTL: number,
    options: {
        min?: number
        max?: number
        hotThreshold?: number  // 每小時訪問次數超過此值視為熱資料
        coldThreshold?: number // 每小時訪問次數低於此值視為冷資料
    } = {}
): number {
    const {
        min = 60,          // 最短 1 分鐘
        max = 7200,        // 最長 2 小時
        hotThreshold = 100,  // 熱資料閾值
        coldThreshold = 1    // 冷資料閾值
    } = options

    const stats = accessStats.get(key)
    const now = Date.now()

    if (!stats) {
        // 首次訪問，使用基礎 TTL
        accessStats.set(key, {
            count: 1,
            lastAccess: now,
            firstAccess: now
        })
        return baseTTL
    }

    // 更新統計
    stats.count++
    stats.lastAccess = now

    // 計算訪問頻率（次/小時）
    const durationHours = (now - stats.firstAccess) / 3600000 || 1
    const accessPerHour = stats.count / durationHours

    let smartTTL = baseTTL

    if (accessPerHour > hotThreshold) {
        // 高頻訪問：延長 TTL（減少重新載入）
        smartTTL = Math.min(baseTTL * 1.5, max)

        logger.debug('Hot data detected', {
            feature: 'smart-ttl',
            key,
            accessPerHour: accessPerHour.toFixed(2),
            adjustment: 'extended',
            baseTTL,
            smartTTL
        })
    } else if (accessPerHour < coldThreshold) {
        // 低頻訪問：縮短 TTL（節省 memory）
        smartTTL = Math.max(baseTTL * 0.7, min)

        logger.debug('Cold data detected', {
            feature: 'smart-ttl',
            key,
            accessPerHour: accessPerHour.toFixed(2),
            adjustment: 'reduced',
            baseTTL,
            smartTTL
        })
    }

    return Math.round(smartTTL)
}

/**
 * 帶智能 TTL 的 setCache
 */
export async function setCacheSmart<T>(
    key: string,
    data: T,
    baseTTL: number,
    options?: {
        min?: number
        max?: number
        hotThreshold?: number
        coldThreshold?: number
    }
): Promise<void> {
    const smartTTL = calculateSmartTTL(key, baseTTL, options)

    const { setCache } = await import('./cache')
    await setCache(key, data, smartTTL)

    const adjustmentPercent = ((smartTTL - baseTTL) / baseTTL * 100).toFixed(2)

    if (Math.abs(parseFloat(adjustmentPercent)) > 10) {
        logger.info('Smart TTL applied', {
            feature: 'smart-ttl',
            key,
            baseTTL,
            smartTTL,
            adjustment: `${adjustmentPercent}%`
        })
    }
}

/**
 * 獲取訪問統計
 */
export function getAccessStats(key?: string): Map<string, AccessStats> | AccessStats | null {
    if (key) {
        return accessStats.get(key) || null
    }
    return new Map(accessStats)
}

/**
 * 清除訪問統計
 */
export function clearAccessStats(key?: string): void {
    if (key) {
        accessStats.delete(key)
    } else {
        accessStats.clear()
    }
}

/**
 * 取得熱門 keys（訪問次數最多的前 N 個）
 */
export function getHotKeys(limit: number = 10): Array<{
    key: string
    count: number
    accessPerHour: number
}> {
    const results: Array<{ key: string; count: number; accessPerHour: number }> = []
    const now = Date.now()

    for (const [key, stats] of accessStats.entries()) {
        const durationHours = (now - stats.firstAccess) / 3600000 || 1
        const accessPerHour = stats.count / durationHours

        results.push({
            key,
            count: stats.count,
            accessPerHour
        })
    }

    return results
        .sort((a, b) => b.accessPerHour - a.accessPerHour)
        .slice(0, limit)
}
