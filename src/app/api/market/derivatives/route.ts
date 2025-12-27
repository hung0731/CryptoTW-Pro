
import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { generateDerivativesSummary } from '@/lib/ai'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 mins

const CACHE_KEY = 'derivatives_data'

export async function getDerivativesData() {
    // Check cache first
    // Check cache first
    const cached = await getCache<any>(CACHE_KEY)
    if (cached) {
        logger.debug('[Cache HIT] derivatives_data', { feature: 'market-api', endpoint: 'derivatives' })
        return cached
    }

    logger.debug('[Cache MISS] derivatives_data - fetching fresh data', { feature: 'market-api', endpoint: 'derivatives' })

    // Fetch key metrics (BTC only as market proxy)
    const [fundingData, liqData, lsData] = await Promise.all([
        coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }),
        coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', { symbol: 'BTC', interval: '1d', limit: 1, exchange_list: 'Binance' }),
        coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', { symbol: 'BTCUSDT', exchange: 'Binance', interval: '1h', limit: 1 })
    ])

    // 1. Process Funding Rate (Binance specific)
    let fundingRate = 0
    if (fundingData && fundingData.length > 0 && fundingData[0]?.stablecoin_margin_list) {
        const list = fundingData[0].stablecoin_margin_list
        const binanceData = list.find((e: any) => e.exchange === 'Binance')

        if (binanceData) {
            fundingRate = binanceData.funding_rate
        } else {
            const validRates = list
                .map((e: any) => e.funding_rate)
                .filter((r: unknown) => typeof r === 'number')

            if (validRates.length > 0) {
                fundingRate = validRates.reduce((a: number, b: number) => a + b, 0) / validRates.length
            }
        }
    }

    // 2. Process Liquidation (Latest 1d)
    const latestLiq = liqData && liqData.length > 0 ? liqData[0] : null
    const longLiq = latestLiq?.aggregated_long_liquidation_usd || latestLiq?.longLiquidation || 0
    const shortLiq = latestLiq?.aggregated_short_liquidation_usd || latestLiq?.shortLiquidation || 0

    // 3. Process Long/Short Ratio
    const latestLS = lsData && lsData.length > 0 ? lsData[0] : null
    const lsRatio = latestLS?.global_account_long_short_ratio || latestLS?.longShortRatio || 0

    // Format for AI
    const aiInput = {
        fundingRates: {
            extremePositive: [{ rate: fundingRate }]
        },
        liquidations: {
            summary: {
                longLiquidatedFormatted: `$${(longLiq / 1000000).toFixed(1)}M`,
                shortLiquidatedFormatted: `$${(shortLiq / 1000000).toFixed(1)}M`
            }
        },
        longShort: {
            global: {
                longShortRatio: lsRatio
            }
        }
    }

    const summary = await generateDerivativesSummary(aiInput)

    const result = {
        summary,
        metrics: { fundingRate, longLiq, shortLiq, lsRatio }
    }

    // Cache result for 5 minutes
    // Cache result for 5 minutes
    await setCache(CACHE_KEY, result, CacheTTL.MEDIUM)

    return result
}

export async function GET() {
    try {
        const data = await getDerivativesData()
        return NextResponse.json(data)
    } catch (error) {
        logger.error('Derivatives API Error', error, { feature: 'market-api', endpoint: 'derivatives' })
        return NextResponse.json({ summary: null, error: 'Internal server error' })
    }
}
