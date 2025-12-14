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
        const [fundingData, liquidationData, longShortGlobal, longShortTop] = await Promise.all([
            // BTC Funding Rate (Binance)
            coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }),
            // 24H Liquidation
            coinglassV4Request<any[]>('/api/futures/liquidation/history', { symbol: 'BTC', interval: '1d', limit: 1 }),
            // Global Long/Short
            coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', {
                symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1
            }),
            // Top Accounts Long/Short
            coinglassV4Request<any[]>('/api/futures/top-long-short-account-ratio/history', {
                symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1
            })
        ])

        // Process Funding Rate
        let btcFundingRate = 0
        if (fundingData && fundingData.length > 0) {
            const marginList = fundingData[0]?.stablecoin_margin_list || []
            const binanceData = marginList.find((e: any) => e.exchange === 'Binance')
            if (binanceData) {
                btcFundingRate = binanceData.funding_rate
            }
        }

        // Process Liquidation
        const liqData = liquidationData?.[0] || {}
        const longLiq = liqData.longLiquidationUsd || 0
        const shortLiq = liqData.shortLiquidationUsd || 0

        // Process Long/Short
        const formatRate = (rate: number) => rate <= 1 ? rate * 100 : rate
        const globalLS = longShortGlobal?.[0] || null
        const topLS = longShortTop?.[0] || null

        const globalLongRate = globalLS?.longRate ? formatRate(globalLS.longRate) : 50
        const globalShortRate = globalLS?.shortRate ? formatRate(globalLS.shortRate) : 50
        const topLongRate = topLS?.longRate ? formatRate(topLS.longRate) : 50
        const topShortRate = topLS?.shortRate ? formatRate(topLS.shortRate) : 50

        // Construct dashboard object
        const dashboard = {
            // BTC Funding Rate
            funding: {
                rate: btcFundingRate,
                ratePercent: (btcFundingRate * 100).toFixed(4),
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
                signal: getLSSignal(globalLongRate, topLongRate)
            },

            // Open Interest (placeholder - will fetch from derivatives API)
            openInterest: {
                value: 0,
                change24h: 0,
                formatted: '$0'
            },

            lastUpdated: new Date().toISOString()
        }

        // Try to get OI data
        try {
            const oiData = await coinglassV4Request<any>('/api/futures/open-interest/aggregated-history', {
                symbol: 'BTC', interval: '1d', limit: 2
            })
            if (oiData && oiData.length >= 1) {
                const current = oiData[0]?.open_interest || 0
                const previous = oiData[1]?.open_interest || current
                const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
                dashboard.openInterest = {
                    value: current,
                    change24h: change,
                    formatted: formatUsd(current)
                }
            }
        } catch (e) {
            console.error('OI fetch error:', e)
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
