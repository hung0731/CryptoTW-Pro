import { NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

interface FundingRateData {
    symbol: string
    uMarginList: Array<{
        exchangeName: string
        rate: number
        nextFundingTime: number
    }>
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'ALL'

    try {
        // Fetch funding rate data
        const data = await coinglassRequest<FundingRateData[]>(
            '/public/v2/funding',
            symbol !== 'ALL' ? { symbol } : {}
        )

        if (!data) {
            return NextResponse.json({
                error: 'Failed to fetch funding rate data',
                fundingRates: getDemoData()
            })
        }

        // Process and sort by rate
        const processed = data.map(item => {
            // Calculate average rate across exchanges
            const rates = item.uMarginList?.map(e => e.rate) || []
            const avgRate = rates.length > 0
                ? rates.reduce((a, b) => a + b, 0) / rates.length
                : 0

            return {
                symbol: item.symbol,
                rate: avgRate,
                annualizedRate: avgRate * 3 * 365 * 100, // 8h funding * 3 * 365 days
                exchanges: item.uMarginList?.slice(0, 5).map(e => ({
                    name: e.exchangeName,
                    rate: e.rate
                })) || []
            }
        })

        // Sort: extreme positive first, then extreme negative
        const extremePositive = processed
            .filter(p => p.rate > 0.0005) // > 0.05%
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 10)

        const extremeNegative = processed
            .filter(p => p.rate < -0.0002) // < -0.02%
            .sort((a, b) => a.rate - b.rate)
            .slice(0, 10)

        const normal = processed
            .filter(p => p.rate >= -0.0002 && p.rate <= 0.0005)
            .sort((a, b) => Math.abs(b.rate) - Math.abs(a.rate))
            .slice(0, 5)

        return NextResponse.json({
            fundingRates: {
                extremePositive, // Bearish signal (too many longs)
                extremeNegative, // Bullish signal (too many shorts)
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
            { symbol: 'ARB', rate: -0.0005, annualizedRate: -54.75, exchanges: [] },
        ],
        normal: [
            { symbol: 'BTC', rate: 0.0001, annualizedRate: 10.95, exchanges: [] },
            { symbol: 'ETH', rate: 0.00008, annualizedRate: 8.76, exchanges: [] },
        ],
        lastUpdated: new Date().toISOString()
    }
}
