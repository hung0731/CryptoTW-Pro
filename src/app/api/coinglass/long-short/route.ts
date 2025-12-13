import { NextResponse } from 'next/server'
import { coinglassRequest } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute

interface LongShortData {
    symbol: string
    longRate: number
    shortRate: number
    longShortRatio: number
    time?: number
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC'

    try {
        // Fetch long/short ratio from multiple sources
        const [globalData, topAccountData] = await Promise.all([
            coinglassRequest<LongShortData[]>('/public/v2/long-short-account-ratio', { symbol }),
            coinglassRequest<LongShortData[]>('/public/v2/long-short-account-ratio/top-account', { symbol })
        ])

        // Process data
        const global = globalData?.[0] || null
        const topAccount = topAccountData?.[0] || null

        if (!global && !topAccount) {
            return NextResponse.json({
                error: 'Failed to fetch long/short data',
                longShort: getDemoData()
            })
        }

        // Calculate sentiment signal
        const signal = calculateSignal(global, topAccount)

        return NextResponse.json({
            longShort: {
                global: global ? {
                    longRate: global.longRate * 100,
                    shortRate: global.shortRate * 100,
                    ratio: global.longShortRatio
                } : null,
                topAccounts: topAccount ? {
                    longRate: topAccount.longRate * 100,
                    shortRate: topAccount.shortRate * 100,
                    ratio: topAccount.longShortRatio
                } : null,
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

function calculateSignal(global: LongShortData | null, topAccount: LongShortData | null) {
    if (!global) return { type: 'neutral', text: '數據不足' }

    const retailLong = global.longRate * 100
    const whaleLong = topAccount?.longRate ? topAccount.longRate * 100 : 50

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
