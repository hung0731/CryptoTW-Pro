import Redis from 'ioredis'
import { logger } from "@/lib/logger"

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

// Runtime warning for production without Redis (non-blocking)
let redisWarningShown = false
const checkRedisConfig = () => {
    if (process.env.NODE_ENV === 'production' && !REDIS_URL && !redisWarningShown) {
        redisWarningShown = true
        logger.warn('Redis not configured in production. Using in-memory cache (not recommended for serverless).', {
            feature: 'cache',
            env: process.env.NODE_ENV
        })
    }
}

if (REDIS_URL) {
    logger.info('Initializing Redis Cache...')
    redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1, // Fail fast on dev
        connectTimeout: 2000,
        retryStrategy: (times) => {
            if (times > 3) {
                logger.warn('Redis connection failed, switching to in-memory mode.', { times })
                return null // Stop retrying
            }
            return Math.min(times * 50, 2000)
        }
    })

    redis.on('error', (err) => {
        // Suppress loud errors in dev if Redis isn't running
        if (process.env.NODE_ENV === 'development') return
        logger.error('Redis Error', err, { feature: 'cache' })
    })
}

/**
 * Get cached data (Async)
 */
export async function getCache<T>(key: string): Promise<T | null> {
    checkRedisConfig()
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
            logger.warn('Redis get failed', { key, error: String(e) })
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
    checkRedisConfig()
    // 1. Try Redis
    if (redis) {
        try {
            await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
            // Also update local for redundancy? No, stick to one source of truth per key preferably, 
            // but for fallback safety we COULD. For now, Keep it simple: Redis OR Local.
            return
        } catch (e) {
            logger.warn('Redis set failed', { key, error: String(e) })
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
    checkRedisConfig()
    if (redis) {
        try {
            await redis.del(key)
        } catch (e) {
            logger.warn('Redis del failed', { key, error: String(e) })
        }
    }
    localCache.delete(key)
}

// Alias
export const clearCache = invalidateCache

/**
 * Clear all cache (admin)
 */
export async function clearAllCache(): Promise<void> {
    checkRedisConfig()
    if (redis) {
        try {
            await redis.flushdb()
        } catch (e) {
            logger.error('Redis flush failed', e as Error)
        }
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
 * Increment a key (Atomic) - For Rate Limiting
 * Returns the new value
 */
export async function increment(key: string, ttlSeconds: number): Promise<number> {
    checkRedisConfig()
    if (redis) {
        try {
            const multi = redis.multi()
            multi.incr(key)
            multi.expire(key, ttlSeconds)
            const results = await multi.exec()
            if (results && results[0]) {
                return results[0][1] as number
            }
            return 1
        } catch (e) {
            // Fallback to local memory
            logger.warn('Redis incr failed', { key, error: String(e) })
        }
    }

    // Local Fallback
    const entry = localCache.get(key)
    let val = 1
    if (entry && Date.now() < entry.expiry) {
        val = (entry.data as number) + 1
    }
    localCache.set(key, {
        data: val,
        expiry: Date.now() + ttlSeconds * 1000
    })
    return val
}

/**
 * Acquire a Lock (Mutex) - For Cache Stampede Protection
 * Returns true if lock acquired, false if already locked
 */
export async function acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    checkRedisConfig()
    const lockKey = `lock:${key}`
    if (redis) {
        try {
            // SET lockKey "locked" EX ttl NX
            // Returns 'OK' if set, null if not set (already exists)
            const res = await redis.set(lockKey, '1', 'EX', ttlSeconds, 'NX')
            return res === 'OK'
        } catch (e) {
            logger.warn('Redis lock failed', { key, error: String(e) })
            return true // Fail open (allow execution) if Redis errors to prevent deadlock
        }
    }

    // Local Fallback (Single instance locking)
    const entry = localCache.get(lockKey)
    if (entry && Date.now() < entry.expiry) {
        return false // Already locked
    }
    localCache.set(lockKey, {
        data: '1',
        expiry: Date.now() + ttlSeconds * 1000
    })
    return true
}

/**
 * Release a Lock
 */
export async function releaseLock(key: string): Promise<void> {
    checkRedisConfig()
    const lockKey = `lock:${key}`
    if (redis) {
        try {
            await redis.del(lockKey)
        } catch (e) {
            // Ignore error for unlock
        }
    }
    localCache.delete(lockKey)
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
    MINUTE: 60         // Rate limit window
} as const
