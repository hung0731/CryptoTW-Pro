
import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { generateDerivativesSummary } from '@/lib/gemini'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 mins

export async function GET() {
    try {
        // Fetch key metrics (BTC only as market proxy)
        const [fundingData, liqData, lsData] = await Promise.all([
            coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }),
            coinglassV4Request<any[]>('/api/futures/liquidation/history', { symbol: 'BTC', timeType: 'h4', limit: 1 }),
            coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', { symbol: 'BTC', timeType: 'h4', limit: 1 })
        ])

        // 1. Process Funding Rate (Avg of top exchanges)
        let fundingRate = 0
        if (fundingData && fundingData.length > 0 && fundingData[0]?.stablecoin_margin_list) {
            const list = fundingData[0].stablecoin_margin_list
            const validRates = list
                .map((e: any) => e.funding_rate)
                .filter((r: unknown) => typeof r === 'number')

            if (validRates.length > 0) {
                fundingRate = validRates.reduce((a: number, b: number) => a + b, 0) / validRates.length
            }
        }

        // 2. Process Liquidation (Latest 4h)
        const latestLiq = liqData && liqData.length > 0 ? liqData[0] : null
        const longLiq = latestLiq?.longVolUsd || 0
        const shortLiq = latestLiq?.shortVolUsd || 0

        // 3. Process Long/Short Ratio
        const latestLS = lsData && lsData.length > 0 ? lsData[0] : null
        const lsRatio = latestLS?.longShortRatio || 0

        // Format for AI
        const aiInput = {
            fundingRates: {
                extremePositive: [{ rate: fundingRate }] // Simplified structure to match prompt expectation
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

        return NextResponse.json({
            summary,
            metrics: { fundingRate, longLiq, shortLiq, lsRatio }
        })

    } catch (error) {
        console.error('Derivatives API Error:', error)
        return NextResponse.json({ summary: null, error: 'Internal server error' })
    }
}
