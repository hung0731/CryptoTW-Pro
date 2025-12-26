import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET(request: NextRequest) {
    // Rate limit: 60 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(request, 'cg-ls', 60, 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC'
    const cacheKey = `api:long-short:${symbol}`

    try {
        // Check cache first (1 min)
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        // Fetch long/short ratio from V4
        const [globalData, topAccountData] = await Promise.all([
            coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', {
                symbol: symbol === 'BTC' ? 'BTCUSDT' : symbol, // V4 requires pair
                exchange: 'Binance',
                interval: '1h',
                limit: 1
            }),
            coinglassV4Request<any[]>('/api/futures/top-long-short-account-ratio/history', {
                symbol: symbol === 'BTC' ? 'BTCUSDT' : symbol,
                exchange: 'Binance',
                interval: '1h',
                limit: 1
            })
        ])

        // Process data
        const global = globalData?.[0] || null
        const topAccount = topAccountData?.[0] || null

        // Helper to formatting rate to percentage (0-100)
        const formatRate = (rate: number) => {
            if (rate <= 1) return rate * 100
            return rate
        }

        const globalLongRate = global?.global_account_long_percent || global?.longRate ? formatRate(global.global_account_long_percent || global.longRate) : 50
        const globalShortRate = global?.global_account_short_percent || global?.shortRate ? formatRate(global.global_account_short_percent || global.shortRate) : 50

        const topLongRate = topAccount?.top_account_long_account || topAccount?.longRate ? formatRate(topAccount.top_account_long_account || topAccount.longRate) : 50
        const topShortRate = topAccount?.top_account_short_account || topAccount?.shortRate ? formatRate(topAccount.top_account_short_account || topAccount.shortRate) : 50

        if (!global && !topAccount) {
            // throw new Error('No data returned') // Soft fail instead
        }

        // Re-construct objects for frontend compatibility
        const globalObj = global ? {
            longRate: globalLongRate,
            shortRate: globalShortRate,
            ratio: global.global_account_long_short_ratio || global.longShortRatio
        } : null

        const topAccountObj = topAccount ? {
            longRate: topLongRate,
            shortRate: topShortRate,
            ratio: topAccount.top_account_long_short_ratio || topAccount.longShortRatio
        } : null

        // Calculate sentiment signal
        const signal = calculateSignal(globalObj, topAccountObj)

        const result = {
            longShort: {
                global: globalObj,
                topAccounts: topAccountObj,
                signal,
                lastUpdated: new Date().toISOString()
            }
        }

        // Cache for 1 minute
        await setCache(cacheKey, result, CacheTTL.FAST)

        return NextResponse.json(result, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (error) {
        logger.error('Long/Short API error', error, { feature: 'coinglass-api', endpoint: 'long-short' })
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
