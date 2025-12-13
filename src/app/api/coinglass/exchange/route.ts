import { NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        // Fetch exchange balance data
        const data = await coinglassRequest<any[]>(
            '/public/v2/exchange/balance',
            { symbol }
        )

        if (!data) {
            return NextResponse.json({
                error: 'Failed to fetch exchange data',
                exchange: getDemoData()
            })
        }

        // Process data
        const processed = data
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 10)
            .map(item => ({
                name: item.exchangeName,
                balance: item.balance,
                balanceFormatted: formatNumber(item.balance),
                change24h: item.changeH24 || 0,
                change24hPercent: calculateChangePercent(item.balance, item.changeH24),
                reserves: '100%+', // Placeholder as API doesn't provide this directly
                flow: item.changeH24 > 0 ? 'in' : 'out'
            }))

        // Summary stats
        const totalBalance = processed.reduce((sum, item) => sum + item.balance, 0)
        const totalChange = processed.reduce((sum, item) => sum + item.change24h, 0)

        return NextResponse.json({
            exchange: {
                totalBalance,
                totalBalanceFormatted: formatNumber(totalBalance),
                totalChange,
                totalChangeFormatted: formatNumber(Math.abs(totalChange)),
                netFlow: totalChange > 0 ? 'in' : 'out',
                items: processed,
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Exchange API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            exchange: getDemoData()
        })
    }
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toFixed(0)
}

function calculateChangePercent(balance: number, change: number): number {
    if (!balance || !change) return 0
    const prevBalance = balance - change
    return ((change / prevBalance) * 100)
}

function getDemoData() {
    return {
        totalBalance: 2500000,
        totalBalanceFormatted: '2.50M',
        totalChange: -5000,
        totalChangeFormatted: '5K',
        netFlow: 'out',
        items: [
            { name: 'Binance', balance: 650000, balanceFormatted: '650K', change24h: -2300, change24hPercent: -0.35, reserves: '109%', flow: 'out' },
            { name: 'OKX', balance: 420000, balanceFormatted: '420K', change24h: 450, change24hPercent: 0.11, reserves: '105%', flow: 'in' },
            { name: 'Bybit', balance: 380000, balanceFormatted: '380K', change24h: 120, change24hPercent: 0.03, reserves: '102%', flow: 'in' },
            { name: 'Bitget', balance: 210000, balanceFormatted: '210K', change24h: -50, change24hPercent: -0.02, reserves: '98%', flow: 'out' },
        ],
        lastUpdated: new Date().toISOString()
    }
}
