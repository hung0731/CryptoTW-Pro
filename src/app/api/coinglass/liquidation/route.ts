import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC'
    const timeframe = searchParams.get('timeframe') || '1h' // 1h, 4h, 12h, 24h

    // Map timeframe to Coinglass interval
    // Coinglass supports: 1h, 4h, 12h, 24h (or 1d)
    let interval = timeframe
    if (timeframe === '24h') interval = '1d'

    try {
        // Fetch liquidation history (aggregated) instead of raw orders
        // limit=1 gives us the latest completed bar, or current bar
        const data = await coinglassV4Request<any[]>(
            '/api/futures/liquidation/history',
            { symbol, interval, limit: 1 }
        )

        if (!data || data.length === 0) {
            throw new Error('No data returned')
        }

        const latest = data[0]
        const longLiquidation = latest.longLiquidationUsd || 0
        const shortLiquidation = latest.shortLiquidationUsd || 0

        return NextResponse.json({
            liquidations: {
                // We no longer have raw items list from this endpoint, return empty or mock if needed
                items: [],
                summary: {
                    longLiquidated: longLiquidation,
                    shortLiquidated: shortLiquidation,
                    longLiquidatedFormatted: formatAmount(longLiquidation),
                    shortLiquidatedFormatted: formatAmount(shortLiquidation),
                    ratio: longLiquidation > 0 ? shortLiquidation / longLiquidation : 0,
                    signal: getSignal(longLiquidation, shortLiquidation)
                },
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Liquidation API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            liquidations: getDemoData()
        })
    }
}

function formatAmount(usd: number): string {
    if (usd >= 100000000) return `$${(usd / 100000000).toFixed(2)}B`
    if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`
    if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}K`
    return `$${usd.toFixed(0)}`
}

function getSignal(longLiq: number, shortLiq: number): { type: string, text: string } {
    const ratio = longLiq > 0 ? shortLiq / longLiq : 1

    if (ratio > 1.2) {
        return { type: 'bullish', text: '空單爆倉多 = 軋空上漲' }
    } else if (ratio < 0.8) {
        return { type: 'bearish', text: '多單爆倉多 = 多殺多下跌' }
    }
    return { type: 'neutral', text: '多空爆倉均衡' }
}

function getDemoData() {
    return {
        items: [],
        summary: {
            longLiquidated: 45000000,
            shortLiquidated: 32000000,
            longLiquidatedFormatted: '$45.00M',
            shortLiquidatedFormatted: '$32.00M',
            ratio: 0.71,
            signal: { type: 'bearish', text: '多單爆倉多 = 多殺多下跌' }
        },
        lastUpdated: new Date().toISOString()
    }
}
