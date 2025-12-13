import { NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC'
    const range = searchParams.get('range') || '3d' // 1d, 3d, 7d, 1m

    try {
        const data = await coinglassRequest<any>(
            '/public/v2/liquidation-heatmap',
            { symbol, range },
            { next: { revalidate: 300 } } // Cache for 5 minutes
        )

        if (!data) {
            return NextResponse.json({
                error: 'Failed to fetch heatmap data',
                heatmap: getDemoData()
            })
        }

        // Process heatmap data
        const processed = processHeatmapData(data)

        return NextResponse.json({
            heatmap: {
                ...processed,
                symbol,
                range,
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Heatmap API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            heatmap: getDemoData()
        })
    }
}

function processHeatmapData(data: any) {
    // Find current price and max pain point
    const currentPrice = data.currentPrice || 99800
    const levels = data.levels || []

    // Separate above and below current price
    const above = levels
        .filter((l: any) => l.price > currentPrice)
        .sort((a: any, b: any) => a.price - b.price)
        .slice(0, 5)
        .map((l: any) => ({
            price: l.price,
            priceFormatted: formatPrice(l.price),
            liquidationUsd: l.longLiquidation || 0,
            liquidationFormatted: formatAmount(l.longLiquidation || 0),
            type: 'long'
        }))

    const below = levels
        .filter((l: any) => l.price < currentPrice)
        .sort((a: any, b: any) => b.price - a.price)
        .slice(0, 5)
        .map((l: any) => ({
            price: l.price,
            priceFormatted: formatPrice(l.price),
            liquidationUsd: l.shortLiquidation || 0,
            liquidationFormatted: formatAmount(l.shortLiquidation || 0),
            type: 'short'
        }))

    // Find max pain (price level with highest liquidation)
    const allLevels = [...above, ...below]
    const maxPain = allLevels.reduce((max, l) =>
        l.liquidationUsd > (max?.liquidationUsd || 0) ? l : max,
        allLevels[0]
    )

    return {
        currentPrice,
        currentPriceFormatted: formatPrice(currentPrice),
        above: above.reverse(), // Highest first
        below,
        maxPain: maxPain ? {
            price: maxPain.price,
            priceFormatted: maxPain.priceFormatted,
            type: maxPain.type
        } : null,
        signal: generateSignal(above, below, currentPrice)
    }
}

function formatPrice(price: number): string {
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`
    return `$${price.toFixed(0)}`
}

function formatAmount(usd: number): string {
    if (usd >= 1000000000) return `$${(usd / 1000000000).toFixed(1)}B`
    if (usd >= 1000000) return `$${(usd / 1000000).toFixed(0)}M`
    if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}K`
    return `$${usd.toFixed(0)}`
}

function generateSignal(above: any[], below: any[], currentPrice: number) {
    const totalAbove = above.reduce((sum, l) => sum + l.liquidationUsd, 0)
    const totalBelow = below.reduce((sum, l) => sum + l.liquidationUsd, 0)

    if (totalAbove > totalBelow * 1.5) {
        return {
            type: 'resistance',
            text: `上方有大量清算壓力，$${(above[0]?.price || currentPrice * 1.05).toLocaleString()} 阻力強`
        }
    }
    if (totalBelow > totalAbove * 1.5) {
        return {
            type: 'support',
            text: `下方清算較少，$${(below[0]?.price || currentPrice * 0.95).toLocaleString()} 支撐較弱`
        }
    }
    return {
        type: 'neutral',
        text: '上下清算分布均衡'
    }
}

function getDemoData() {
    return {
        currentPrice: 99800,
        currentPriceFormatted: '$99.8K',
        above: [
            { price: 105000, priceFormatted: '$105K', liquidationUsd: 2100000000, liquidationFormatted: '$2.1B', type: 'long' },
            { price: 102000, priceFormatted: '$102K', liquidationUsd: 890000000, liquidationFormatted: '$890M', type: 'long' },
            { price: 100000, priceFormatted: '$100K', liquidationUsd: 320000000, liquidationFormatted: '$320M', type: 'long' },
        ],
        below: [
            { price: 97000, priceFormatted: '$97K', liquidationUsd: 450000000, liquidationFormatted: '$450M', type: 'short' },
            { price: 95000, priceFormatted: '$95K', liquidationUsd: 780000000, liquidationFormatted: '$780M', type: 'short' },
            { price: 92000, priceFormatted: '$92K', liquidationUsd: 1200000000, liquidationFormatted: '$1.2B', type: 'short' },
        ],
        maxPain: { price: 98500, priceFormatted: '$98.5K', type: 'short' },
        signal: { type: 'resistance', text: '上方$102K有巨大清算壓力' },
        symbol: 'BTC',
        range: '3d',
        lastUpdated: new Date().toISOString()
    }
}
