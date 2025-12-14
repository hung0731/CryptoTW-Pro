import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 120 // 2 minutes

const CACHE_KEY = 'coinglass_dashboard'

// Aggregated Dashboard API - Single endpoint for all derivatives data
// Reduces frontend API calls from 4 → 1
export async function GET(req: NextRequest) {
    // Rate limit: 60 requests per minute per IP
    const rateLimited = simpleApiRateLimit(req, 'cg-dashboard', 60, 60)
    if (rateLimited) return rateLimited

    try {
        // Check cache first
        const cached = getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json({ dashboard: cached, cached: true })
        }

        // Parallel fetch all data
        // Parallel fetch all data with error handling for individual failures
        const results = await Promise.allSettled([
            // BTC Funding Rate (Binance)
            coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }),

            // 24H Liquidation (verified working with exchange_list)
            coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', {
                symbol: 'BTC', interval: '1d', limit: 1, exchange_list: 'Binance'
            }),

            // Global Long/Short (verified working with BTCUSDT + exchange)
            coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', {
                symbol: 'BTCUSDT', exchange: 'Binance', interval: '1h', limit: 1
            }),

            // Top Accounts Long/Short (verified working with BTCUSDT + exchange)
            coinglassV4Request<any[]>('/api/futures/top-long-short-account-ratio/history', {
                symbol: 'BTCUSDT', exchange: 'Binance', interval: '1h', limit: 1
            }),

            // Open Interest - Use exchange-list endpoint (returns all exchanges)
            coinglassV4Request<any[]>('/api/futures/open-interest/exchange-list', {
                symbol: 'BTC'
            })
        ])

        // Helper to unwrap settled promises safely
        const getData = (index: number) => {
            const res = results[index]
            return res.status === 'fulfilled' ? res.value : null
        }

        const fundingData = getData(0)
        const liquidationData = getData(1)
        const longShortGlobal = getData(2)
        const longShortTop = getData(3)
        const oiData = getData(4)

        // Process Funding Rate
        // API returns rate as decimal (e.g., 0.0001 = 0.01%)
        let btcFundingRate = 0
        if (fundingData && fundingData.length > 0) {
            const marginList = fundingData[0]?.stablecoin_margin_list ||
                fundingData[0]?.uMarginList ||
                fundingData[0]?.marginList || []
            const binanceData = marginList.find((e: any) =>
                e.exchange === 'Binance' || e.exchangeName === 'Binance'
            )
            if (binanceData) {
                btcFundingRate = binanceData.funding_rate || binanceData.fundingRate || 0
            }
        }

        // Process Liquidation
        // API returns: longLiquidationUsd, shortLiquidationUsd 
        // OR aggregated_long_liquidation_usd (verified key)
        const liqData = liquidationData?.[0] || {}
        const longLiq = liqData.longLiquidationUsd || liqData.long_liquidation_usd ||
            liqData.longLiquidation || liqData.aggregated_long_liquidation_usd || 0
        const shortLiq = liqData.shortLiquidationUsd || liqData.short_liquidation_usd ||
            liqData.shortLiquidation || liqData.aggregated_short_liquidation_usd || 0

        // Process Long/Short (Global)
        // V4 Key: global_account_long_percent, global_account_short_percent
        // or old V3 keys as fallback
        const globalLS = longShortGlobal?.[0] || {}
        const globalLongRate = globalLS.global_account_long_percent || globalLS.longRate || globalLS.longRatio || 50
        const globalShortRate = globalLS.global_account_short_percent || globalLS.shortRate || globalLS.shortRatio || 50

        // Process Long/Short (Top Accounts)
        // V4 Keys usually similar: top_account_long_percent ...
        // We'll inspect or fallback. Assuming similar to global but with 'top' prefix or same structure
        const topLS = longShortTop?.[0] || {}
        // V4 Top Accounts usually returns: longAccount, shortAccount, longShortRatio
        const topLongRate = topLS.longAccount || topLS.longRate || topLS.top_account_long_account || 50
        const topShortRate = topLS.shortAccount || topLS.shortRate || topLS.top_account_short_account || 50

        // Process OI from exchange-list
        // Returns: [{ exchange: "All", open_interest_usd, open_interest_change_percent_24h, ... }]
        let oiValue = 0
        let oiChange = 0

        if (oiData && Array.isArray(oiData) && oiData.length > 0) {
            // Find "All" aggregate or use first entry
            const allData = oiData.find((e: any) => e.exchange === 'All') || oiData[0]
            oiValue = allData.open_interest_usd || 0
            oiChange = allData.open_interest_change_percent_24h || 0
        }

        // Construct dashboard object
        const dashboard = {
            // BTC Funding Rate (note: rate is already in decimal form, e.g., 0.0001 = 0.01%)
            funding: {
                rate: btcFundingRate,
                ratePercent: (btcFundingRate * 100).toFixed(4), // Convert to percentage
                status: btcFundingRate > 0.0005 ? 'high' : btcFundingRate < 0 ? 'negative' : 'normal'
            },

            // 24H Liquidation
            liquidation: {
                longLiq,
                shortLiq,
                longFormatted: formatUsd(longLiq),
                shortFormatted: formatUsd(shortLiq),
                total: longLiq + shortLiq,
                totalFormatted: formatUsd(longLiq + shortLiq),
                signal: getLiqSignal(longLiq, shortLiq)
            },

            // Long/Short Ratio
            longShort: {
                global: { longRate: globalLongRate, shortRate: globalShortRate },
                topAccounts: { longRate: topLongRate, shortRate: topShortRate },
                signal: getLSSignal(globalLongRate, topLongRate),
                // Top trader ratio for AI Decision
                topTraderRatio: topLongRate > 0 ? topLongRate / (100 - topLongRate) : 1
            },

            // Open Interest
            openInterest: {
                value: oiValue,
                change24h: oiChange,
                formatted: oiValue > 0 ? formatUsd(oiValue) : '—',
                available: oiValue > 0
            },

            lastUpdated: new Date().toISOString()
        }

        // Cache result
        setCache(CACHE_KEY, dashboard, CacheTTL.MEDIUM) // 5 mins

        return NextResponse.json({ dashboard })
    } catch (error) {
        console.error('Dashboard API error:', error)
        return NextResponse.json({
            error: 'Failed to fetch dashboard data',
            dashboard: getDemoData()
        }, { status: 500 })
    }
}

function formatUsd(val: number): string {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`
    if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`
    return `$${val.toFixed(0)}`
}

function getLiqSignal(longLiq: number, shortLiq: number): { type: string; text: string } {
    const ratio = longLiq > 0 ? shortLiq / longLiq : 1
    if (ratio > 1.2) return { type: 'bullish', text: '空單爆倉多' }
    if (ratio < 0.8) return { type: 'bearish', text: '多單爆倉多' }
    return { type: 'neutral', text: '均衡' }
}

function getLSSignal(retailLong: number, whaleLong: number): { type: string; text: string } {
    if (retailLong > 65 && whaleLong < 50) return { type: 'bearish', text: '散戶極多，大戶看空' }
    if (retailLong < 35 && whaleLong > 50) return { type: 'bullish', text: '散戶極空，大戶看多' }
    if (retailLong > 60) return { type: 'warning', text: '偏多需謹慎' }
    return { type: 'neutral', text: '多空均衡' }
}

function getDemoData() {
    return {
        funding: { rate: 0.0001, ratePercent: '0.0100', status: 'normal' },
        liquidation: {
            longLiq: 50000000, shortLiq: 40000000,
            longFormatted: '$50.0M', shortFormatted: '$40.0M',
            total: 90000000, totalFormatted: '$90.0M',
            signal: { type: 'neutral', text: '均衡' }
        },
        longShort: {
            global: { longRate: 55, shortRate: 45 },
            topAccounts: { longRate: 52, shortRate: 48 },
            signal: { type: 'neutral', text: '多空均衡' }
        },
        openInterest: { value: 30000000000, change24h: 2.5, formatted: '$30.00B' },
        lastUpdated: new Date().toISOString()
    }
}
