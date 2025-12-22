import Redis from 'ioredis'

/**
 * Hybrid Cache: Redis (Primary) -> In-Memory (Fallback)
 * 
 * Behavior:
 * - If process.env.REDIS_URL is set, uses Redis.
 * - If not set (or connection fails), falls back to In-Memory Map.
 */

type CacheEntry<T> = {
    data: T
    expiry: number
}

// In-Memory Fallback
const localCache = new Map<string, CacheEntry<any>>()

// Redis Client
let redis: Redis | null = null

// Support various env var names (Zeabur uses REDIS_URI or REDIS_CONNECTION_STRING)
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS_CONNECTION_STRING

if (REDIS_URL) {
    console.log('Initializing Redis Cache...')
    redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1, // Fail fast on dev
        connectTimeout: 2000,
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn('Redis connection failed, switching to in-memory mode.')
                return null // Stop retrying
            }
            return Math.min(times * 50, 2000)
        }
    })

    redis.on('error', (err) => {
        // Suppress loud errors in dev if Redis isn't running
        if (process.env.NODE_ENV === 'development') return
        console.error('Redis Error:', err)
    })
}

/**
 * Get cached data (Async)
 */
export async function getCache<T>(key: string): Promise<T | null> {
    // 1. Try Redis
    if (redis) {
        try {
            const result = await redis.get(key)
            if (result) {
                return JSON.parse(result) as T
            }
            return null
        } catch (e) {
            // Redis failed, fall through to local
            // console.warn('Redis get failed', e)
        }
    }

    // 2. Fallback to Local
    const entry = localCache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
        localCache.delete(key)
        return null
    }

    return entry.data as T
}

/**
 * Set cache (Async but void promise)
 */
export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    // 1. Try Redis
    if (redis) {
        try {
            await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
            // Also update local for redundancy? No, stick to one source of truth per key preferably, 
            // but for fallback safety we COULD. For now, Keep it simple: Redis OR Local.
            return
        } catch (e) {
            // Redis failed, fall through
        }
    }

    // 2. Fallback to Local
    localCache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000
    })
}

/**
 * Invalidate a specific cache key
 */
export async function invalidateCache(key: string): Promise<void> {
    if (redis) {
        try {
            await redis.del(key)
        } catch (e) { }
    }
    localCache.delete(key)
}

// Alias
export const clearCache = invalidateCache

/**
 * Clear all cache (admin)
 */
export async function clearAllCache(): Promise<void> {
    if (redis) {
        try {
            await redis.flushdb()
        } catch (e) { }
    }
    localCache.clear()
}

/**
 * Get cache statistics (Local only, Redis stat is expensive)
 */
export async function getCacheStats(): Promise<{ size: number; keys: string[] }> {
    // Note: This only returns local cache stats since scanning Redis is heavy
    return {
        size: localCache.size,
        keys: Array.from(localCache.keys())
    }
}

/**
 * Check Cache Status (Redis vs Memory)
 */
export async function getCacheStatus() {
    if (redis) {
        try {
            const pong = await redis.ping()
            return {
                mode: 'Redis',
                connected: pong === 'PONG',
                url: process.env.REDIS_URL || process.env.REDIS_URI ? 'Configured' : 'Auto-Detected'
            }
        } catch (e: any) {
            return { mode: 'Redis (Error)', connected: false, error: e.message }
        }
    }
    return { mode: 'In-Memory', connected: true }
}

// TTL Presets (in seconds)
export const CacheTTL = {
    REALTIME: 30,      // BTC Price, critical data
    FAST: 60,          // OI, Liquidations (1 min)
    MEDIUM: 300,       // Funding, LSR, Heatmap (5 min)
    SLOW: 900,         // Fear/Greed, ETF (15 min)
    HOURLY: 3600,      // Calendar, Exchange list (1 hour)
} as const
