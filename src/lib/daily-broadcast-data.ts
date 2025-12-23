/**
 * Daily Broadcast Data Fetcher
 * 
 * Fetches real Coinglass data for the daily broadcast:
 * - Funding Rate (BTC)
 * - Long/Short Ratio
 * - Liquidations (24h)
 * - Open Interest Change
 * - BTC Price Changes (1h, 4h, 12h, 24h)
 */

import { cachedCoinglassV4Request } from './coinglass'
import { CacheTTL } from './cache'
import { logger } from '@/lib/logger'

export interface DailyBroadcastMetrics {
    fundingRate: number
    longShortRatio: number
    liquidationBias: 'long' | 'short' | 'neutral'
    liquidationTotal: number
    oiChange24h: number
    btcPriceChange24h: number
    // BTC price changes for reference
    btcPriceChanges: {
        h1: number
        h4: number
        h12: number
        h24: number
    }
}

/**
 * Fetch all metrics needed for daily broadcast
 */
export async function fetchDailyBroadcastMetrics(): Promise<DailyBroadcastMetrics> {
    const [fundingData, lsrData, liqData, oiData, priceData] = await Promise.all([
        fetchFundingRate(),
        fetchLongShortRatio(),
        fetchLiquidations(),
        fetchOpenInterestChange(),
        fetchBtcPriceChanges()
    ])

    // Debug logging
    logger.debug('[Daily Broadcast] Raw API data:', {
        feature: 'daily-broadcast-data',
        funding: fundingData,
        lsr: lsrData,
        liquidation: liqData,
        oi: oiData,
        price: priceData
    })

    const result = {
        fundingRate: fundingData?.rate ?? 0,
        longShortRatio: lsrData?.longRate ?? 50,
        liquidationBias: liqData?.bias ?? 'neutral',
        liquidationTotal: liqData?.totalUsd ?? 0,
        oiChange24h: oiData?.change24h ?? 0,
        btcPriceChange24h: priceData?.h24 ?? 0,
        btcPriceChanges: priceData ?? { h1: 0, h4: 0, h12: 0, h24: 0 }
    }

    logger.debug('[Daily Broadcast] Final metrics:', { feature: 'daily-broadcast-data', result })

    return result
}

// =============================================
// Individual Data Fetchers
// =============================================

async function fetchFundingRate(): Promise<{ rate: number } | null> {
    try {
        const data = await cachedCoinglassV4Request<any>(
            '/api/futures/funding-rate/exchange-list',
            { symbol: 'BTC' },
            CacheTTL.FAST
        )

        if (data && Array.isArray(data)) {
            // Find Binance funding rate
            const binance = data.find((e: any) => e.exchangeName === 'Binance')
            if (binance?.uMarginList?.[0]?.rate) {
                return { rate: binance.uMarginList[0].rate * 100 } // Convert to percentage
            }
        }
        return null
    } catch (e) {
        logger.error('[Daily Broadcast] Funding rate fetch error:', e as Error, { feature: 'daily-broadcast-data' })
        return null
    }
}

async function fetchLongShortRatio(): Promise<{ longRate: number } | null> {
    try {
        const data = await cachedCoinglassV4Request<any>(
            '/api/futures/global-long-short-account-ratio/history',
            { symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1 },
            CacheTTL.FAST
        )

        if (data && Array.isArray(data) && data.length > 0) {
            const latest = data[data.length - 1]
            // Handle both percentage format (50.5) and ratio format (0.505)
            let longRate = latest.longRate || latest.longAccount || 50
            if (longRate <= 1) {
                longRate = longRate * 100 // Convert ratio to percentage
            }
            return { longRate }
        }
        return null
    } catch (e) {
        logger.error('[Daily Broadcast] Long/Short ratio fetch error:', e as Error, { feature: 'daily-broadcast-data' })
        return null
    }
}

async function fetchLiquidations(): Promise<{ bias: 'long' | 'short' | 'neutral', totalUsd: number } | null> {
    try {
        // Use coin-list endpoint which doesn't require exchange_list
        const data = await cachedCoinglassV4Request<any[]>(
            '/api/futures/liquidation/coin-list',
            {},
            CacheTTL.FAST
        )

        if (data && Array.isArray(data)) {
            // Find BTC data
            const btcData = data.find((item: any) => item.symbol === 'BTC')
            if (btcData) {
                const longLiq = btcData.long_liquidation_usd_24h || btcData.longLiquidationUsd24h || 0
                const shortLiq = btcData.short_liquidation_usd_24h || btcData.shortLiquidationUsd24h || 0
                const total = longLiq + shortLiq

                let bias: 'long' | 'short' | 'neutral' = 'neutral'
                if (total > 0) {
                    const longPct = longLiq / total
                    if (longPct > 0.6) bias = 'long'
                    else if (longPct < 0.4) bias = 'short'
                }

                return { bias, totalUsd: total }
            }
        }
        return null
    } catch (e) {
        logger.error('[Daily Broadcast] Liquidation fetch error:', e as Error, { feature: 'daily-broadcast-data' })
        return null
    }
}

async function fetchOpenInterestChange(): Promise<{ change24h: number } | null> {
    try {
        // Use coin-list endpoint for OI
        const data = await cachedCoinglassV4Request<any[]>(
            '/api/futures/openInterest/coin-list',
            {},
            CacheTTL.FAST
        )

        if (data && Array.isArray(data)) {
            // Find BTC data
            const btcData = data.find((item: any) => item.symbol === 'BTC')
            if (btcData) {
                // Try various field names
                const change = btcData.open_interest_change_percent_24h ||
                    btcData.openInterestChange24hPercent ||
                    btcData.h24Change ||
                    btcData.oiChange24h ||
                    0
                return { change24h: change }
            }
        }
        return null
    } catch (e) {
        logger.error('[Daily Broadcast] OI fetch error:', e as Error, { feature: 'daily-broadcast-data' })
        return null
    }
}

async function fetchBtcPriceChanges(): Promise<{ h1: number, h4: number, h12: number, h24: number } | null> {
    try {
        // Fetch OKX klines for price data
        const [h1Res, h4Res] = await Promise.all([
            fetch('https://www.okx.com/api/v5/market/candles?instId=BTC-USDT&bar=1H&limit=24'),
            fetch('https://www.okx.com/api/v5/market/candles?instId=BTC-USDT&bar=4H&limit=6')
        ])

        const h1Data = await h1Res.json()
        const h4Data = await h4Res.json()

        const candles1h = h1Data?.data || []
        const candles4h = h4Data?.data || []

        // Current price (most recent close)
        const currentPrice = candles1h.length > 0 ? parseFloat(candles1h[0][4]) : 0

        // Calculate changes
        const calcChange = (candles: any[], barsAgo: number): number => {
            if (candles.length > barsAgo) {
                const oldPrice = parseFloat(candles[barsAgo][4])
                return ((currentPrice - oldPrice) / oldPrice) * 100
            }
            return 0
        }

        return {
            h1: calcChange(candles1h, 1),
            h4: calcChange(candles4h, 1),    // 4h ago
            h12: calcChange(candles1h, 12),  // 12h ago
            h24: calcChange(candles1h, 23)   // 24h ago
        }
    } catch (e) {
        logger.error('[Daily Broadcast] Price fetch error:', e as Error, { feature: 'daily-broadcast-data' })
        return null
    }
}
