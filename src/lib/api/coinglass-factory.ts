/**
 * Coinglass API Route Factory
 * 
 * 統一所有 Coinglass API routes：
 * - Cache key 正規化
 * - Query parameter 驗證
 * - 錯誤處理一致
 * - Rate limit 統一
 */

import { NextRequest, NextResponse } from 'next/server'
import { cachedCoinglassV4Request } from '@/lib/coinglass'
import { buildCoinglassCacheKey, CoinglassQuerySchema } from '@/lib/cache-key-builder'
import { logger, logApiEvent } from '@/lib/logger'
import { ok, err, toApiResponse, createError, getStatusCode } from '@/domain/result'
import type { Result } from '@/domain/result'

// ================================================
// Config Interface
// ================================================

interface CoinglassRouteConfig {
    /** Coinglass API path (e.g., '/api/index/fear-greed-history') */
    apiPath: string

    /** Cache TTL in seconds */
    cacheTTL: number

    /** Optional: Override default query schema */
    querySchema?: typeof CoinglassQuerySchema

    /** Optional: Transform response before caching */
    transform?: (data: unknown) => unknown
}

// ================================================
// Factory Function
// ================================================

export function createCoinglassRoute(config: CoinglassRouteConfig) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        const startTime = Date.now()
        const { searchParams } = new URL(request.url)

        // Parse and validate query params
        const schema = config.querySchema || CoinglassQuerySchema
        const paramsParse = schema.safeParse({
            symbol: searchParams.get('symbol'),
            interval: searchParams.get('interval'),
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
            exchange: searchParams.get('exchange')
        })

        if (!paramsParse.success) {
            logger.warn('Invalid query parameters', {
                feature: 'coinglass_api',
                path: config.apiPath,
                errors: paramsParse.error.issues
            })

            const error = createError(
                'VALIDATION_ERROR',
                'Invalid query parameters',
                { errors: paramsParse.error.issues }
            )

            return NextResponse.json(
                toApiResponse(err(error)),
                { status: 400 }
            )
        }

        const params = paramsParse.data

        // Build normalized cache key
        const cacheKey = buildCoinglassCacheKey(
            config.apiPath.split('/').pop() || 'unknown',
            params
        )

        try {
            // Fetch with cache
            let data = await cachedCoinglassV4Request(
                config.apiPath,
                params,
                config.cacheTTL
            )

            // Optional transform
            if (config.transform) {
                data = config.transform(data)
            }

            const latency = Date.now() - startTime

            logApiEvent({
                endpoint: config.apiPath,
                method: 'GET',
                status: 200,
                latency_ms: latency,
                cached: latency < 50 // Heuristic: very fast = likely cached
            })

            return NextResponse.json(toApiResponse(ok(data)))

        } catch (error) {
            const latency = Date.now() - startTime

            logger.error('Coinglass API failed', error as Error, {
                feature: 'coinglass_api',
                path: config.apiPath,
                params,
                latency_ms: latency
            })

            const appError = createError(
                'UPSTREAM_ERROR',
                'Failed to fetch data from Coinglass',
                { path: config.apiPath }
            )

            logApiEvent({
                endpoint: config.apiPath,
                method: 'GET',
                status: 502,
                latency_ms: latency
            })

            return NextResponse.json(
                toApiResponse(err(appError)),
                { status: getStatusCode(appError) }
            )
        }
    }
}

// ================================================
// Usage Example (will replace existing routes)
// ================================================

// Before: api/coinglass/fear-greed/route.ts (50+ lines)
// After: api/coinglass/fear-greed/route.ts (3 lines)
/*
import { createCoinglassRoute } from '@/lib/api/coinglass-factory'
import { CacheTTL } from '@/lib/cache'

export const GET = createCoinglassRoute({
    apiPath: '/api/index/fear-greed-history',
    cacheTTL: CacheTTL.SLOW
})
*/
