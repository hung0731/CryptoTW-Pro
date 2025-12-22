import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

/**
 * Rate limiting middleware for API routes
 * Usage: const rateLimited = await apiRateLimit(req, 'coinglass', 60, 60)
 *        if (rateLimited) return rateLimited
 */
export async function apiRateLimit(
    req: NextRequest,
    prefix: string,
    limit: number = 60,
    windowSeconds: number = 60
): Promise<NextResponse | null> {
    const ip = getClientIP(req)
    const identifier = `${prefix}:${ip}`

    const { success } = await rateLimit(identifier, limit, windowSeconds)

    if (!success) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                message: '請求過於頻繁，請稍後再試',
                retryAfter: windowSeconds
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(windowSeconds),
                    'X-RateLimit-Limit': String(limit),
                    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + windowSeconds)
                }
            }
        )
    }

    return null
}

/**
 * Distributed Rate Limiting using Redis (via cache.ts)
 */
import { increment } from '@/lib/cache'

export async function simpleRateLimit(
    identifier: string,
    limit: number = 60,
    windowSeconds: number = 60
): Promise<{ success: boolean; count: number }> {
    const key = `ratelimit:${identifier}`
    const count = await increment(key, windowSeconds)

    return {
        success: count <= limit,
        count
    }
}

/**
 * Wrapper for simple rate limit that returns response
 */
export async function simpleApiRateLimit(
    req: NextRequest,
    prefix: string,
    limit: number = 60,
    windowSeconds: number = 60
): Promise<NextResponse | null> {
    const ip = getClientIP(req)
    const identifier = `${prefix}:${ip}`

    const { success } = await simpleRateLimit(identifier, limit, windowSeconds)

    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests', message: '請求過於頻繁' },
            { status: 429 }
        )
    }

    return null
}

/**
 * Get client IP from request headers
 */
function getClientIP(req: NextRequest): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        req.headers.get('cf-connecting-ip') ||
        'unknown'
    )
}
