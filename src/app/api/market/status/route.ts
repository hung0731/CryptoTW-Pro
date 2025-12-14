
import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // 1 minute

const CACHE_KEY = 'market_status_cards'

export async function GET(req: NextRequest) {
    const rateLimited = simpleApiRateLimit(req, 'market-status', 60, 60)
    if (rateLimited) return rateLimited

    try {
        const cached = getCache(CACHE_KEY)
        if (cached) return NextResponse.json({ status: cached, cached: true })

        // 1. Fetch all necessary data in parallel
        const [ohlc1d, ohlc1h, funding, liquidation24h, liquidation1h, fearGreed, whaleRatio] = await Promise.all([
            // Regime: BTC 1D OHLC (Price Change & Amp) - using CoinGlass or generic price API
            // Coinglass price history
            coinglassV4Request<any[]>('/api/index/bitcoin/price/history', { symbol: 'BTC', interval: '1d', limit: 2 }),

            // Volatility: BTC 1H OHLC
            coinglassV4Request<any[]>('/api/index/bitcoin/price/history', { symbol: 'BTC', interval: '1h', limit: 2 }),

            // Leverage: BTC Funding Rate
            coinglassV4Request<any[]>('/api/futures/fundingRate/ohlc-history', { symbol: 'BTC', interval: '1d', limit: 1 }),

            // Leverage: 24H Liquidation
            coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', { symbol: 'BTC', interval: '1d', limit: 1 }),

            // Volatility: 1H Liquidation
            coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', { symbol: 'BTC', interval: '1h', limit: 1 }),

            // Sentiment: Fear & Greed
            coinglassV4Request<any[]>('/api/index/fear-greed-history', { limit: 1 }),

            // Whale: Long/Short Position Ratio (Proxy for Whale Bias if specific whale alert stats unavailable)
            // Or use Top Accounts Long/Short Ratio
            coinglassV4Request<any[]>('/api/futures/top-long-short-position-ratio/history', { symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1 })
        ])

        // --- 1. Market Regime (市場狀態) ---
        // Logic: 
        // |Change| < 2% & Amp < 3% -> 穩定
        // |Change| < 3% & Amp >= 3% -> 震盪
        // |Change| >= 3% -> 壓力中
        let regime = '穩定'
        let regimeCode = 'stable' // for styling
        if (ohlc1d && ohlc1d.length >= 2) {
            // Note: Check actual response structure. Assuming [time, open, high, low, close] or similar objects
            // Coinglass /api/index/bitcoin/price/history usually returns object array or similar. 
            // Let's assume standard object access or handle safely.
            // If fetching failed, use defaults.
            const today = ohlc1d[ohlc1d.length - 1] // Latest
            if (today) {
                // If it's an array: [t, o, h, l, c]
                // If object: { o, h, l, c ... }
                // Coinglass often returns { priceList: [...] } or array of objects. 
                // We'll try to handle object.
                const open = today.o || today.open || 0
                const close = today.c || today.close || 0
                const high = today.h || today.high || 0
                const low = today.l || today.low || 0

                if (open > 0) {
                    const change = Math.abs((close - open) / open) * 100
                    const amp = Math.abs((high - low) / low) * 100

                    if (change >= 3) {
                        regime = '壓力中'
                        regimeCode = 'pressure'
                    } else if (change < 3 && amp >= 3) {
                        regime = '震盪'
                        regimeCode = 'volatile'
                    } else {
                        regime = '穩定'
                        regimeCode = 'stable'
                    }
                }
            }
        }

        // --- 2. Leverage Heat (槓桿情緒) ---
        // Logic:
        // FR < 0.03% & Liq < 100M -> 冷靜
        // FR 0.03-0.08% OR Liq 100M-300M -> 偏熱
        // FR > 0.08% OR Liq > 300M -> 過熱
        let leverage = '冷靜'
        let leverageCode = 'cool' // cool, warm, hot

        let frVal = 0 // percent
        let liq24hVal = 0 // USD

        // FR
        if (funding && funding.length > 0) {
            // Usually returns array of { t, r } or similar. r is rate.
            // Check latest.
            const f = funding[funding.length - 1]
            const r = f.r || f.rate || f.fundingRate || 0
            frVal = Math.abs(r * 100) // Convert to positive percent for magnitude check, though usually positive implies heat
        }

        // Liq 24H
        if (liquidation24h && liquidation24h.length > 0) {
            const l = liquidation24h[0]
            const longLiq = l.buyVolUsd || l.longLiquidation || 0
            const shortLiq = l.sellVolUsd || l.shortLiquidation || 0
            liq24hVal = longLiq + shortLiq
        }

        if (frVal > 0.08 || liq24hVal > 300000000) {
            leverage = '過熱'
            leverageCode = 'overheated'
        } else if ((frVal >= 0.03) || (liq24hVal >= 100000000)) {
            leverage = '偏熱'
            leverageCode = 'warm'
        } else {
            leverage = '冷靜'
            leverageCode = 'cool'
        }

        // --- 3. Sentiment (市場情緒) ---
        // Logic: 0-30 恐慌, 31-60 中性, 61-100 貪婪
        let sentiment = '中性'
        let sentimentCode = 'neutral' // fear, neutral, greed
        let fgIndex = 50

        if (fearGreed && fearGreed.length > 0) {
            // usually { value, value_classification }
            // API might return array of objects
            const item = Array.isArray(fearGreed) ? fearGreed[0] : fearGreed
            // data: [ { value: "72", value_classification: "Greed", ... } ]
            // or data: { data: [...] } - Coinglass structure varies, usually Array from our helper
            // Let's assume the helper returns the array.
            // Sometimes coinglassV4Request returns the 'data' field content directly.
            // If array, take first or last. Usually history is desc or asc.
            // Let's look for 'value'.
            const match = Array.isArray(fearGreed) ? fearGreed.find(x => x.value) : fearGreed
            if (match) {
                fgIndex = parseInt(match.value, 10)
            }
        }

        if (fgIndex <= 30) {
            sentiment = '恐慌'
            sentimentCode = 'fear'
        } else if (fgIndex <= 60) {
            sentiment = '中性'
            sentimentCode = 'neutral'
        } else {
            sentiment = '貪婪'
            sentimentCode = 'greed'
        }

        // --- 4. Whale Bias (大戶動向) ---
        // Logic: Top Position Ratio
        // Long > 52% -> 偏多
        // Long < 48% -> 偏空
        // Else -> 觀望
        // (Using Top Trader Position Ratio as proxy if tx flow not available)
        let whale = '觀望'
        let whaleCode = 'watch' // bullish, watch, bearish

        if (whaleRatio && whaleRatio.length > 0) {
            const w = whaleRatio[whaleRatio.length - 1]
            const longRatio = w.longRatio || w.longRate || 50

            if (longRatio > 52) {
                whale = '偏多'
                whaleCode = 'bullish'
            } else if (longRatio < 48) {
                whale = '偏空'
                whaleCode = 'bearish'
            } else {
                whale = '觀望'
                whaleCode = 'watch'
            }
        }

        // --- 5. Volatility (短線波動) ---
        // Logic: 1H Amp & 1H Liq
        // Amp < 1% & Liq < 50M -> 低
        // Amp 1-2% OR Liq 50M-150M -> 中
        // Amp > 2% OR Liq > 150M -> 高
        let volatility = '低'
        let volatilityCode = 'low' // low, med, high

        let amp1h = 0
        let liq1hVal = 0

        // 1H Amp
        if (ohlc1h && ohlc1h.length > 0) {
            const h = ohlc1h[ohlc1h.length - 1]
            const high = h.h || h.high || 0
            const low = h.l || h.low || 1
            if (high > 0) {
                amp1h = Math.abs((high - low) / low) * 100
            }
        }

        // 1H Liq
        if (liquidation1h && liquidation1h.length > 0) {
            const l = liquidation1h[0]
            const longLiq = l.buyVolUsd || l.longLiquidation || 0
            const shortLiq = l.sellVolUsd || l.shortLiquidation || 0
            liq1hVal = longLiq + shortLiq
        }

        if (amp1h > 2 || liq1hVal > 150000000) {
            volatility = '高'
            volatilityCode = 'high'
        } else if (amp1h >= 1 || liq1hVal >= 50000000) {
            volatility = '中'
            volatilityCode = 'medium'
        } else {
            volatility = '低'
            volatilityCode = 'low'
        }

        const data = {
            regime: { label: regime, code: regimeCode, value: regime },
            leverage: { label: leverage, code: leverageCode, value: leverage },
            sentiment: { label: sentiment, code: sentimentCode, value: sentiment },
            whale: { label: whale, code: whaleCode, value: whale },
            volatility: { label: volatility, code: volatilityCode, value: volatility }
        }

        setCache(CACHE_KEY, data, CacheTTL.SHORT) // 1 min

        return NextResponse.json({ status: data })

    } catch (e) {
        console.error('Market Status API Error:', e)
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }
}
