import { NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute (real-time data)

interface LiquidationItem {
    symbol: string
    side: string // 'BUY' = shorts liquidated, 'SELL' = longs liquidated
    price: number
    volUsd: number
    time: number
    exchangeName?: string
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC'
    const limit = parseInt(searchParams.get('limit') || '30')

    try {
        // Fetch liquidation orders
        const data = await coinglassRequest<LiquidationItem[]>(
            '/public/v2/liquidation/order',
            { symbol, limit },
            { next: { revalidate: 300 } }
        )

        if (!data) {
            return NextResponse.json({
                error: 'Failed to fetch liquidation data',
                liquidations: getDemoData()
            })
        }

        // Process liquidations
        const liquidations = data.map(item => ({
            symbol: item.symbol,
            side: item.side === 'SELL' ? 'LONG' : 'SHORT', // SELL = long liquidated
            price: item.price,
            amount: item.volUsd,
            amountFormatted: formatAmount(item.volUsd),
            time: item.time,
            timeAgo: getTimeAgo(item.time),
            exchange: item.exchangeName || 'Unknown'
        }))

        // Calculate summary stats
        const now = Date.now()
        const oneHourAgo = now - 3600000
        const recentLiquidations = liquidations.filter(l => l.time > oneHourAgo)

        const longLiquidated = recentLiquidations
            .filter(l => l.side === 'LONG')
            .reduce((sum, l) => sum + l.amount, 0)

        const shortLiquidated = recentLiquidations
            .filter(l => l.side === 'SHORT')
            .reduce((sum, l) => sum + l.amount, 0)

        return NextResponse.json({
            liquidations: {
                items: liquidations.slice(0, limit),
                summary: {
                    longLiquidated,
                    shortLiquidated,
                    longLiquidatedFormatted: formatAmount(longLiquidated),
                    shortLiquidatedFormatted: formatAmount(shortLiquidated),
                    ratio: longLiquidated > 0 ? shortLiquidated / longLiquidated : 0,
                    signal: getSignal(longLiquidated, shortLiquidated)
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
    if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`
    if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}K`
    return `$${usd.toFixed(0)}`
}

function getTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return '剛才'
    if (minutes < 60) return `${minutes}分前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小時前`
    return `${Math.floor(hours / 24)}天前`
}

function getSignal(longLiq: number, shortLiq: number): { type: string, text: string } {
    const ratio = longLiq > 0 ? shortLiq / longLiq : 1

    if (ratio > 1.5) {
        return { type: 'bullish', text: '空軍被殺較多 = 潛在看漲訊號' }
    } else if (ratio < 0.67) {
        return { type: 'bearish', text: '多軍被殺較多 = 潛在看跌訊號' }
    }
    return { type: 'neutral', text: '多空清算均衡' }
}

function getDemoData() {
    const now = Date.now()
    return {
        items: [
            { symbol: 'BTC', side: 'LONG', price: 99500, amount: 2300000, amountFormatted: '$2.30M', time: now - 120000, timeAgo: '2分前', exchange: 'Binance' },
            { symbol: 'ETH', side: 'SHORT', price: 3850, amount: 890000, amountFormatted: '$890K', time: now - 300000, timeAgo: '5分前', exchange: 'OKX' },
            { symbol: 'SOL', side: 'LONG', price: 215, amount: 450000, amountFormatted: '$450K', time: now - 480000, timeAgo: '8分前', exchange: 'Bybit' },
        ],
        summary: {
            longLiquidated: 45000000,
            shortLiquidated: 32000000,
            longLiquidatedFormatted: '$45.00M',
            shortLiquidatedFormatted: '$32.00M',
            ratio: 0.71,
            signal: { type: 'bearish', text: '多軍被殺較多 = 潛在看跌訊號' }
        },
        lastUpdated: new Date().toISOString()
    }
}
