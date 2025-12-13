import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 300

const TOP_TOKENS = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'SUI', 'ADA', 'AVAX', 'LINK']

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbolParam = searchParams.get('symbol')

    // If a specific symbol is requested, just fetch that. Otherwise fetch top tokens.
    const symbols = symbolParam && symbolParam !== 'ALL' ? [symbolParam] : TOP_TOKENS

    try {
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

                // Calculate average funding rate
                const rates = marginList.map((e: any) => e.funding_rate).filter((r: any) => r !== undefined)
                const avgRate = rates.length > 0
                    ? rates.reduce((a: number, b: number) => a + b, 0) / rates.length
                    : 0

                return {
                    symbol: sym,
                    rate: avgRate,
                    annualizedRate: avgRate * 3 * 365 * 100,
                    exchanges: marginList.slice(0, 3).map((e: any) => ({
                        name: e.exchange || 'Unknown',
                        rate: e.funding_rate
                    }))
                }
            })
        )

        const processed = results.filter(item => item !== null)

        // Sort: extreme positive first, then extreme negative
        const extremePositive = [...processed]
            .filter(p => p!.rate > 0.0001) // Slightly lower threshold as we have fewer tokens
            .sort((a, b) => b!.rate - a!.rate)

        const extremeNegative = [...processed]
            .filter(p => p!.rate < 0)
            .sort((a, b) => a!.rate - b!.rate)

        // Fill normal if empty
        const normal = processed.filter(p => p!.rate >= 0 && p!.rate <= 0.0001)

        return NextResponse.json({
            fundingRates: {
                extremePositive: extremePositive.length > 0 ? extremePositive : normal.slice(0, 3),
                extremeNegative: extremeNegative.length > 0 ? extremeNegative : [],
                normal,
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Funding rate API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            fundingRates: getDemoData()
        })
    }
}

function getDemoData() {
    return {
        extremePositive: [
            { symbol: 'DOGE', rate: 0.0015, annualizedRate: 164.25, exchanges: [] },
            { symbol: 'PEPE', rate: 0.0012, annualizedRate: 131.40, exchanges: [] },
            { symbol: 'WIF', rate: 0.0010, annualizedRate: 109.50, exchanges: [] },
        ],
        extremeNegative: [
            { symbol: 'APT', rate: -0.0008, annualizedRate: -87.60, exchanges: [] },
        ],
        normal: [
            { symbol: 'BTC', rate: 0.0001, annualizedRate: 10.95, exchanges: [] },
            { symbol: 'ETH', rate: 0.00008, annualizedRate: 8.76, exchanges: [] },
        ],
        lastUpdated: new Date().toISOString()
    }
}
