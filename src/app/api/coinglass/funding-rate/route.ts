import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 300

const TOP_TOKENS = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'SUI', 'ADA', 'AVAX', 'LINK']

export async function GET(request: NextRequest) {
    // Rate limit: 60 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(request, 'cg-funding', 60, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(request.url)
    const symbolParam = searchParams.get('symbol')

    // If a specific symbol is requested, just fetch that. Otherwise fetch top tokens.
    const symbols = symbolParam && symbolParam !== 'ALL' ? [symbolParam] : TOP_TOKENS
    const cacheKey = `api:funding-rate:${symbols.join(',')}`

    try {
        // Check cache first (5 min)
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const results = await Promise.all(
            symbols.map(async (sym) => {
                const data = await coinglassV4Request<any[]>(
                    '/api/futures/funding-rate/exchange-list',
                    { symbol: sym }
                )
                if (!data || data.length === 0) return null

                // Extract data from stablecoin_margin_list (USDT margin)
                const marginList = data[0]?.stablecoin_margin_list || []
                if (marginList.length === 0) return null

                // Filter for Binance (User Request)
                const binanceData = marginList.find((e: any) => e.exchange === 'Binance')

                // Fallback to average if Binance not found (rare for top tokens, but safe)
                let finalRate = 0
                if (binanceData) {
                    finalRate = binanceData.funding_rate
                } else {
                    const rates = marginList.map((e: any) => e.funding_rate).filter((r: any) => r !== undefined)
                    if (rates.length > 0) {
                        finalRate = rates.reduce((a: number, b: number) => a + b, 0) / rates.length
                    }
                }

                return {
                    symbol: sym,
                    rate: finalRate,
                    annualizedRate: finalRate * 3 * 365 * 100,
                    exchanges: marginList.slice(0, 3).map((e: any) => ({
                        name: e.exchange || 'Unknown',
                        rate: e.funding_rate
                    }))
                }
            })
        )

        const processed = results.filter(item => item !== null)

        // If no data fetched (API failure or empty)
        if (processed.length === 0) {
            logger.warn('Funding Rate API returned empty', { feature: 'coinglass-api', endpoint: 'funding-rate' })
            return NextResponse.json(
                { error: '資料存取失敗 (API Empty)' },
                { status: 503 }
            )
        }

        // Sort: extreme positive first, then extreme negative
        const extremePositive = [...processed]
            .filter(p => p!.rate > 0.0001) // Slightly lower threshold as we have fewer tokens
            .sort((a, b) => b!.rate - a!.rate)

        const extremeNegative = [...processed]
            .filter(p => p!.rate < 0)
            .sort((a, b) => a!.rate - b!.rate)

        // Fill normal if empty
        const normal = processed.filter(p => p!.rate >= 0 && p!.rate <= 0.0001)

        const result = {
            fundingRates: {
                extremePositive: extremePositive.length > 0 ? extremePositive : normal.slice(0, 3),
                extremeNegative: extremeNegative.length > 0 ? extremeNegative : [],
                normal,
                lastUpdated: new Date().toISOString()
            }
        }

        // Cache for 5 minutes
        await setCache(cacheKey, result, CacheTTL.MEDIUM)

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (error) {
        logger.error('Funding rate API error', error, { feature: 'coinglass-api', endpoint: 'funding-rate' })
        return NextResponse.json(
            { error: '資料存取失敗 (Server Error)' },
            { status: 500 }
        )
    }
}
