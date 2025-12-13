import { NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute

// Bull/Bear Index: Composite indicator from multiple data sources
// Range: 0-100 (0 = Extreme Fear, 100 = Extreme Greed)

export async function GET() {
    try {
        // Fetch all required data in parallel
        const [fundingData, longShortData, oiData] = await Promise.all([
            coinglassRequest<any[]>('/public/v2/funding', { symbol: 'BTC' }),
            coinglassRequest<any[]>('/public/v2/long-short-account-ratio', { symbol: 'BTC' }),
            coinglassRequest<any>('/public/v2/open-interest', { symbol: 'BTC' })
        ])

        // Calculate individual components
        const fundingScore = calculateFundingScore(fundingData)
        const longShortScore = calculateLongShortScore(longShortData)
        const oiScore = calculateOIScore(oiData)

        // Weighted composite
        const bullBearIndex = Math.round(
            fundingScore * 0.35 +
            longShortScore * 0.35 +
            oiScore * 0.30
        )

        // Determine sentiment
        const sentiment = getSentiment(bullBearIndex)

        return NextResponse.json({
            bullBear: {
                index: bullBearIndex,
                sentiment: sentiment.label,
                sentimentCn: sentiment.labelCn,
                color: sentiment.color,
                suggestion: sentiment.suggestion,
                components: {
                    funding: { score: fundingScore, weight: 35 },
                    longShort: { score: longShortScore, weight: 35 },
                    oi: { score: oiScore, weight: 30 }
                },
                change24h: Math.floor(Math.random() * 10) - 5, // TODO: Calculate from historical
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Bull/Bear API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            bullBear: getDemoData()
        })
    }
}

function calculateFundingScore(data: any[] | null): number {
    if (!data || data.length === 0) return 50

    // BTC funding rate
    const btcData = data.find(d => d.symbol === 'BTC')
    if (!btcData) return 50

    const avgRate = btcData.uMarginList?.reduce((sum: number, e: any) => sum + (e.rate || 0), 0) /
        (btcData.uMarginList?.length || 1) || 0

    // Normalize: -0.1% to +0.1% → 0 to 100
    // Positive funding = bullish (longs paying shorts)
    const normalized = ((avgRate + 0.001) / 0.002) * 100
    return Math.max(0, Math.min(100, normalized))
}

function calculateLongShortScore(data: any[] | null): number {
    if (!data || data.length === 0) return 50

    const ratio = data[0]?.longShortRatio || 1

    // Normalize: 0.5 to 2.0 ratio → 0 to 100
    // High long ratio = bullish sentiment
    const normalized = ((ratio - 0.5) / 1.5) * 100
    return Math.max(0, Math.min(100, normalized))
}

function calculateOIScore(data: any | null): number {
    if (!data) return 50

    const change24h = data.h24Change || 0

    // Normalize: -10% to +10% → 0 to 100
    // Increasing OI = bullish
    const normalized = ((change24h + 10) / 20) * 100
    return Math.max(0, Math.min(100, normalized))
}

function getSentiment(index: number): {
    label: string,
    labelCn: string,
    color: string,
    suggestion: string
} {
    if (index >= 75) {
        return {
            label: 'Extreme Greed',
            labelCn: '極度貪婪',
            color: 'red',
            suggestion: '市場過熱，高位追多風險大，建議減倉或觀望'
        }
    }
    if (index >= 55) {
        return {
            label: 'Greed',
            labelCn: '貪婪',
            color: 'orange',
            suggestion: '市場偏多，但需注意回調風險'
        }
    }
    if (index >= 45) {
        return {
            label: 'Neutral',
            labelCn: '中性',
            color: 'gray',
            suggestion: '市場情緒中性，可根據技術面操作'
        }
    }
    if (index >= 25) {
        return {
            label: 'Fear',
            labelCn: '恐懼',
            color: 'blue',
            suggestion: '市場偏空，可能是逢低買入機會'
        }
    }
    return {
        label: 'Extreme Fear',
        labelCn: '極度恐懼',
        color: 'green',
        suggestion: '市場極度恐慌，歷史上是最佳買點'
    }
}

function getDemoData() {
    return {
        index: 68,
        sentiment: 'Greed',
        sentimentCn: '貪婪',
        color: 'orange',
        suggestion: '市場偏多，但需注意回調風險',
        components: {
            funding: { score: 72, weight: 35 },
            longShort: { score: 65, weight: 35 },
            oi: { score: 68, weight: 30 }
        },
        change24h: 5,
        lastUpdated: new Date().toISOString()
    }
}
