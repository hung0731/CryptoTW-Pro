// Coinglass API Configuration
// API Documentation: https://docs.coinglass.com

const COINGLASS_BASE_URL = 'https://open-api-v3.coinglass.com/api'

// Get API key from environment
export const getCoinglassApiKey = () => {
    const key = process.env.COINGLASS_API_KEY
    if (!key) {
        console.warn('COINGLASS_API_KEY not configured')
        return null
    }
    return key
}

// Common headers for all Coinglass requests
export const getCoinglassHeaders = () => ({
    'Accept': 'application/json',
    'CG-API-KEY': getCoinglassApiKey() || '',
    'Content-Type': 'application/json'
})

// Helper function to make Coinglass API requests
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
        const url = new URL(`${COINGLASS_BASE_URL}${endpoint}`)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value))
            })
        }

        // Default cache: 60 seconds
        const defaultOptions: RequestInit = {
            next: { revalidate: 60 }
        }

        const response = await fetch(url.toString(), {
            headers: getCoinglassHeaders(),
            ...defaultOptions,
            ...options, // Allow override
        })

        if (!response.ok) {
            console.error(`Coinglass API error: ${response.status} ${response.statusText}`)
            return null
        }

        const data = await response.json()

        if (data.code !== '0') {
            console.error(`Coinglass API error: ${data.msg}`)
            return null
        }

        return data.data as T
    } catch (error) {
        console.error('Coinglass API request failed:', error)
        return null
    }
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

// Exchange Balance Types
export interface ExchangeBalance {
    exchangeName: string
    balance: number
    changeH24: number
    changeH24Percent: number
}

// ============================================
// API Endpoint Functions
// ============================================

// 1. Funding Rate Rankings
export async function getFundingRates(symbol: string = 'BTC') {
    return coinglassRequest<FundingRateExchange[]>(
        '/public/v2/funding-rate/exchange-list',
        { symbol }
    )
}

// 2. Liquidation Orders
export async function getLiquidationOrders(symbol: string = 'BTC', limit: number = 50) {
    return coinglassRequest<LiquidationOrder[]>(
        '/public/v2/liquidation-order',
        { symbol, limit }
    )
}

// 3. Aggregated Liquidation History
export async function getLiquidationHistory(symbol: string = 'BTC', interval: string = '1h') {
    return coinglassRequest<any>(
        '/public/v2/liquidation/history',
        { symbol, interval }
    )
}

// 4. Long/Short Ratio (Global Account)
export async function getLongShortRatio(symbol: string = 'BTC') {
    return coinglassRequest<LongShortRatio[]>(
        '/public/v2/long-short-ratio/global-account',
        { symbol }
    )
}

// 5. Top Account Long/Short Ratio
export async function getTopAccountRatio(symbol: string = 'BTC') {
    return coinglassRequest<LongShortRatio[]>(
        '/public/v2/long-short-ratio/top-account-ratio',
        { symbol }
    )
}

// 6. Open Interest
export async function getOpenInterest(symbol: string = 'BTC') {
    return coinglassRequest<OpenInterest>(
        '/public/v2/open-interest',
        { symbol }
    )
}

// 7. Exchange Balance (Reserve Data)
export async function getExchangeBalance(symbol: string = 'BTC') {
    return coinglassRequest<ExchangeBalance[]>(
        '/public/v2/exchange/balance',
        { symbol }
    )
}

// 8. Liquidation Heatmap
export async function getLiquidationHeatmap(symbol: string = 'BTC', range: string = '3d') {
    return coinglassRequest<any>(
        '/public/v2/liquidation-heatmap',
        { symbol, range }
    )
}

// 9. Hyperliquid Whale Alerts
export async function getHyperliquidWhaleAlerts() {
    return coinglassRequest<any[]>(
        '/public/v2/hyperliquid/whale-alert'
    )
}

// 10. Hyperliquid Whale Positions
export async function getHyperliquidWhalePositions() {
    return coinglassRequest<any[]>(
        '/public/v2/hyperliquid/whale-position'
    )
}
