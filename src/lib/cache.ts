/**
 * Simple In-Memory Cache for API responses
 * Note: In Vercel Serverless, cache is per-instance and may not persist across requests.
 * For production with high traffic, consider Upstash Redis.
 */

type CacheEntry<T> = {
    data: T
    expiry: number
}

const cache = new Map<string, CacheEntry<any>>()

/**
 * Get cached data if valid
 */
export function getCache<T>(key: string): T | null {
    const entry = cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
        cache.delete(key)
        return null
    }

    return entry.data as T
}

/**
 * Set cache with TTL in seconds
 */
export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
    cache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000
    })
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key: string): void {
    cache.delete(key)
}

/**
 * Clear all cache (useful for admin/debug)
 */
export function clearAllCache(): void {
    cache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
    return {
        size: cache.size,
        keys: Array.from(cache.keys())
    }
}

// TTL Presets (in seconds)
export const CacheTTL = {
    REALTIME: 30,      // BTC Price, critical data
    FAST: 60,          // OI, Liquidations (1 min)
    MEDIUM: 300,       // Funding, LSR, Heatmap (5 min)
    SLOW: 900,         // Fear/Greed, ETF (15 min)
    HOURLY: 3600,      // Calendar, Exchange list (1 hour)
} as const
