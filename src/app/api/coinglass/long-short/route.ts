import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        // Fetch long/short ratio from V4
        const [globalData, topAccountData] = await Promise.all([
            coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', {
                symbol,
                exchange: 'Binance', // V4 often requires exchange, default to Binance for major liquidity
                interval: '1h',
                limit: 1
            }),
            coinglassV4Request<any[]>('/api/futures/top-long-short-account-ratio/history', {
                symbol,
                exchange: 'Binance',
                interval: '1h',
                limit: 1
            })
        ])

        // Process data
        const global = globalData?.[0] || null
        const topAccount = topAccountData?.[0] || null

        // Helper to formatting rate to percentage (0-100)
        // V4 usually returns like 55.5 for 55.5% or 0.555. Safe check.
        const formatRate = (rate: number) => {
            if (rate <= 1) return rate * 100
            return rate
        }

        const globalLongRate = global?.longRate ? formatRate(global.longRate) : 0
        const globalShortRate = global?.shortRate ? formatRate(global.shortRate) : 0

        const topLongRate = topAccount?.longRate ? formatRate(topAccount.longRate) : 0
        const topShortRate = topAccount?.shortRate ? formatRate(topAccount.shortRate) : 0

        if (!global && !topAccount) {
            throw new Error('No data returned')
        }

        // Re-construct objects for frontend compatibility
        const globalObj = global ? {
            longRate: globalLongRate,
            shortRate: globalShortRate,
            ratio: global.longShortRatio
        } : null

        const topAccountObj = topAccount ? {
            longRate: topLongRate,
            shortRate: topShortRate,
            ratio: topAccount.longShortRatio
        } : null

        // Calculate sentiment signal
        const signal = calculateSignal(globalObj, topAccountObj)

        return NextResponse.json({
            longShort: {
                global: globalObj,
                topAccounts: topAccountObj,
                signal,
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Long/Short API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            longShort: getDemoData()
        })
    }
}

interface LongShortStats {
    longRate: number
    shortRate: number
    ratio: number
}

function calculateSignal(global: LongShortStats | null, topAccount: LongShortStats | null) {
    if (!global) return { type: 'neutral', text: '數據不足' }

    const retailLong = global.longRate
    const whaleLong = topAccount ? topAccount.longRate : 50

    // Contrarian signal: if retail is extremely long, potential top
    if (retailLong > 65) {
        if (whaleLong < 50) {
            return { type: 'bearish', text: '散戶極度看多 + 大戶看空 = 頂部訊號' }
        }
        return { type: 'warning', text: '散戶極度看多 = 需謹慎' }
    }

    if (retailLong < 35) {
        if (whaleLong > 50) {
            return { type: 'bullish', text: '散戶極度看空 + 大戶看多 = 底部訊號' }
        }
        return { type: 'neutral', text: '散戶看空中' }
    }

    // Divergence signal
    if (Math.abs(retailLong - whaleLong) > 15) {
        if (whaleLong > retailLong) {
            return { type: 'bullish', text: '大戶比散戶更樂觀 = 偏多' }
        }
        return { type: 'bearish', text: '大戶比散戶更悲觀 = 偏空' }
    }

    return { type: 'neutral', text: '多空相對均衡' }
}

function getDemoData() {
    return {
        global: {
            longRate: 62,
            shortRate: 38,
            ratio: 1.63
        },
        topAccounts: {
            longRate: 55,
            shortRate: 45,
            ratio: 1.22
        },
        signal: { type: 'warning', text: '散戶較大戶更看多 = 謹慎做多' },
        lastUpdated: new Date().toISOString()
    }
}
