// Coinglass API Configuration
// API Documentation: https://docs.coinglass.com

import { getCache, setCache, CacheTTL } from './cache'

// V2 API (legacy)
const COINGLASS_V2_URL = 'https://open-api.coinglass.com'
// V4 API (new, for Hyperliquid etc.)
const COINGLASS_V4_URL = 'https://open-api-v4.coinglass.com'

// Get API key from environment
export const getCoinglassApiKey = () => {
    const key = process.env.COINGLASS_API_KEY
    if (!key) {
        console.warn('COINGLASS_API_KEY not configured')
        return null
    }
    return key
}

// V2 headers (uses coinglassSecret)
export const getCoinglassV2Headers = () => ({
    'Accept': 'application/json',
    'coinglassSecret': getCoinglassApiKey() || '',
    'Content-Type': 'application/json'
})

// V4 headers (uses CG-API-KEY)
export const getCoinglassV4Headers = () => ({
    'Accept': 'application/json',
    'CG-API-KEY': getCoinglassApiKey() || '',
    'Content-Type': 'application/json'
})

// Legacy alias
export const getCoinglassHeaders = getCoinglassV2Headers

// Helper function to make Coinglass V2 API requests
export async function coinglassRequest<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    options?: RequestInit
): Promise<T | null> {
    const apiKey = getCoinglassApiKey()
    if (!apiKey) {
        console.error('Coinglass API key not configured')
        return null
    }

    try {
        const url = new URL(`${COINGLASS_V2_URL}${endpoint}`)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value))
            })
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout (Fail fast)

        try {
            const response = await fetch(url.toString(), {
                headers: getCoinglassV2Headers(),
                next: { revalidate: 60 },
                ...options,
                signal: controller.signal
            })

            if (!response.ok) {
                console.error(`Coinglass V2 API error: ${response.status} ${response.statusText}`)
                return null
            }

            const data = await response.json()

            if (data.code !== '0') {
                console.error(`Coinglass V2 API error: ${data.msg}`)
                return null
            }

            return data.data as T
        } finally {
            clearTimeout(timeoutId)
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('Coinglass V2 API request timed out')
        } else {
            console.error('Coinglass V2 API request failed:', error)
        }
        return null
    }
}

// Helper function to make Coinglass V4 API requests
export async function coinglassV4Request<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    options?: RequestInit
): Promise<T | null> {
    const apiKey = getCoinglassApiKey()
    if (!apiKey) {
        console.error('Coinglass API key not configured')
        return null
    }

    try {
        const url = new URL(`${COINGLASS_V4_URL}${endpoint}`)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value))
            })
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout (Fail fast)

        try {
            const response = await fetch(url.toString(), {
                headers: getCoinglassV4Headers(),
                next: { revalidate: 60 },
                ...options,
                signal: controller.signal
            })

            if (!response.ok) {
                console.error(`Coinglass V4 API error: ${response.status} ${response.statusText}`)
                return null
            }

            const data = await response.json()

            if (data.code !== '0') {
                console.error(`Coinglass V4 API error [${endpoint}]: ${data.msg}`)
                return null
            }

            return data.data as T
        } finally {
            clearTimeout(timeoutId)
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Coinglass V4 API request timed out [${endpoint}]`)
        } else {
            console.error('Coinglass V4 API request failed:', error)
        }
        return null
    }
}

/**
 * Cached version of coinglassV4Request
 * Uses in-memory cache to reduce API calls
 */
export async function cachedCoinglassV4Request<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    ttlSeconds: number = CacheTTL.FAST
): Promise<T | null> {
    const cacheKey = `coinglass:${endpoint}:${JSON.stringify(params || {})}`

    // Check cache first
    const cached = getCache<T>(cacheKey)
    if (cached !== null) {
        return cached
    }

    // Fetch from API
    const data = await coinglassV4Request<T>(endpoint, params)

    // Cache successful responses
    if (data !== null) {
        setCache(cacheKey, data, ttlSeconds)
    }

    return data
}

// ============================================
// API Endpoint Types
// ============================================

// Funding Rate Types
export interface FundingRateItem {
    symbol: string
    rate: number
    nextFundingTime: number
    predictedRate?: number
}

export interface FundingRateExchange {
    exchangeName: string
    uMarginList: FundingRateItem[]
}

// Liquidation Types
export interface LiquidationOrder {
    symbol: string
    side: 'BUY' | 'SELL'  // BUY = shorts liquidated, SELL = longs liquidated
    price: number
    volUsd: number
    time: number
    exchangeName: string
}

// Long/Short Ratio Types
export interface LongShortRatio {
    symbol: string
    longRate: number
    shortRate: number
    longShortRatio: number
    time: number
}

// OI Types
export interface OpenInterest {
    symbol: string
    openInterest: number
    openInterestAmount: number
    h1Change: number
    h4Change: number
    h24Change: number
}

// News Flash Types
export interface NewsFlashItem {
    id: string
    title: string
    content: string
    url: string
    source: string // "Coinglass", "Binance", etc.
    createTime: number // Timestamp
    highlight: boolean
    images?: string[]
}

// Economic Calendar Types
export interface EconomicData {
    calendar_name: string
    country_code: string
    country_name: string
    data_effect: string
    forecast_value: string
    revised_previous_value: string
    previous_value: string
    publish_timestamp: number
    published_value: string
    importance_level: number // 1, 2, 3
    has_exact_publish_time: number
}

// ============================================
// API Endpoint Functions (All migrated to V4)
// ============================================
// Note: Individual API endpoints are now called directly in their respective
// route handlers using coinglassV4Request. The legacy functions below have
// been removed as they used the deprecated V2 API.
//
// V4 Endpoints used in this project:
// - /api/index/fear-greed-history (Bull/Bear)
// - /api/futures/funding-rate/exchange-list (Funding Rates)
// - /api/futures/liquidation/history (Liquidations)
// - /api/futures/global-long-short-account-ratio/history (Long/Short Global)
// - /api/futures/top-long-short-account-ratio/history (Long/Short Top)
// - /api/futures/open-interest/exchange-list (Open Interest)
// - /api/futures/taker-buy-sell-volume/exchange-list (Taker Buy/Sell)
// - /api/etf/bitcoin/flow-history (BTC ETF)
// - /api/coinbase-premium-index (Coinbase Premium)
// - /api/hyperliquid/whale-alert (Whale Alerts)
// - /api/futures/liquidation-heatmap (Heatmap)
// - /api/spot/exchange-balance-list (Exchange Balance)
// - /api/newsflash/list (Crypto News) [NEW]
