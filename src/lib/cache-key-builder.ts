/**
 * Cache Key Builder
 * 
 * 正規化 cache key 避免：
 * 1. 同參數不同順序產生不同 key
 * 2. 未驗證參數導致 cache 爆炸
 * 3. 惡意請求製造無限 cache key
 */

import { z } from 'zod'
import { logger } from '@/lib/logger'

// ================================================
// Query Parameter Schema (白名單)
// ================================================

export const CoinglassQuerySchema = z.object({
    symbol: z.string().default('BTC'),
    interval: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']).default('1h'),
    limit: z.number().int().min(1).max(1000).default(100),
    exchange: z.string().optional()
})

export type CoinglassQuery = z.infer<typeof CoinglassQuerySchema>

// ================================================
// Cache Key Builder
// ================================================

interface CacheKeyOptions {
    baseKey: string
    params: Record<string, unknown>
    schema?: z.ZodSchema
}

/**
 * Build normalized cache key
 * 
 * Example:
 *   buildCacheKey({ 
 *     baseKey: 'coinglass_funding', 
 *     params: { symbol: 'BTC', interval: '1h' }
 *   })
 *   => 'coinglass_funding:interval=1h:symbol=BTC'
 */
export function buildCacheKey(options: CacheKeyOptions): string {
    const { baseKey, params, schema } = options

    // Validate params if schema provided
    let validParams: Record<string, unknown> = params
    if (schema) {
        const result = schema.safeParse(params)
        if (!result.success) {
            // Log but don't throw - use defaults
            logger.warn('[CacheKey] Invalid params, using defaults:', { feature: 'cache-key', error: result.error })
            const defaults = schema.parse({})
            validParams = defaults as Record<string, unknown>
        } else {
            validParams = result.data as Record<string, unknown>
        }
    }

    // Sort keys for consistent ordering
    const sortedKeys = Object.keys(validParams).sort()

    // Build key parts
    const parts = sortedKeys
        .filter(key => validParams[key] !== undefined && validParams[key] !== null)
        .map(key => `${key}=${validParams[key]}`)

    if (parts.length === 0) {
        return baseKey
    }

    return `${baseKey}:${parts.join(':')}`
}

// ================================================
// Specialized Builders
// ================================================

export function buildCoinglassCacheKey(
    endpoint: string,
    params: Partial<CoinglassQuery>
): string {
    return buildCacheKey({
        baseKey: `coinglass_${endpoint}`,
        params,
        schema: CoinglassQuerySchema
    })
}
