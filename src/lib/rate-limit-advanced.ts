/**
 * Advanced Rate Limiting with User Tiers
 * 支援不同用戶等級的速率限制
 */

import { increment } from '@/lib/cache'
import { logger } from '@/lib/logger'

export type RateLimitTier = 'free' | 'pro' | 'admin'

interface RateLimitConfig {
    maxRequests: number
    windowSeconds: number
}

const TIER_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
    free: {
        maxRequests: 100,    // 100 requests
        windowSeconds: 60,   // per minute
    },
    pro: {
        maxRequests: 500,    // 500 requests
        windowSeconds: 60,   // per minute
    },
    admin: {
        maxRequests: 10000,  // 10000 requests
        windowSeconds: 60,   // per minute
    },
}

interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: Date
    retryAfter?: number
}

/**
 * 檢查速率限制
 * @param identifier 用戶識別碼（IP 或 User ID）
 * @param tier 用戶等級
 * @param endpoint 可選的端點名稱（更精細的限制）
 */
export async function checkRateLimit(
    identifier: string,
    tier: RateLimitTier = 'free',
    endpoint?: string
): Promise<RateLimitResult> {
    const config = TIER_LIMITS[tier]
    const key = endpoint
        ? `ratelimit:${tier}:${endpoint}:${identifier}`
        : `ratelimit:${tier}:${identifier}`

    try {
        // 使用 increment 實作滑動視窗
        const current = await increment(key, config.windowSeconds)

        const success = current <= config.maxRequests
        const remaining = Math.max(0, config.maxRequests - current)
        const reset = new Date(Date.now() + config.windowSeconds * 1000)

        // 如果超過限制，記錄警告
        if (!success) {
            logger.warn('Rate limit exceeded', {
                feature: 'rate-limit',
                identifier,
                tier,
                endpoint,
                current,
                limit: config.maxRequests,
            })
        }

        return {
            success,
            limit: config.maxRequests,
            remaining,
            reset,
            retryAfter: success ? undefined : config.windowSeconds,
        }
    } catch (error) {
        logger.error('Rate limit check failed', error as Error, {
            feature: 'rate-limit',
            identifier,
            tier,
        })

        // 失敗時默認允許通過（fail open）
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests,
            reset: new Date(Date.now() + config.windowSeconds * 1000),
        }
    }
}

/**
 * 速率限制 Headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toISOString(),
        ...(result.retryAfter && {
            'Retry-After': result.retryAfter.toString(),
        }),
    }
}

/**
 * IP 位址提取（考慮代理）
 */
export function getClientIP(request: Request): string {
    const headers = request.headers

    // 優先使用 Vercel 的 IP header
    const forwardedFor = headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    // 其他常見 headers
    const realIP = headers.get('x-real-ip')
    if (realIP) return realIP

    const cfConnectingIP = headers.get('cf-connecting-ip')
    if (cfConnectingIP) return cfConnectingIP

    // 預設
    return 'unknown'
}

/**
 * 端點特定的速率限制
 */
export const ENDPOINT_LIMITS: Record<string, Partial<Record<RateLimitTier, RateLimitConfig>>> = {
    '/api/ai/*': {
        free: { maxRequests: 10, windowSeconds: 3600 },   // 10/hour
        pro: { maxRequests: 100, windowSeconds: 3600 },   // 100/hour
    },
    '/api/coinglass/*': {
        free: { maxRequests: 30, windowSeconds: 60 },     // 30/min
        pro: { maxRequests: 200, windowSeconds: 60 },     // 200/min
    },
}
