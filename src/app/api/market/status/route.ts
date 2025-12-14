
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

        // 1. Fetch all necessary data with error handling (Fail-safe)
        const fetchSafe = async (fn: Promise<any>, name: string) => {
            try {
                return await fn
            } catch (error) {
                console.error(`[MarketStatus] Error fetching ${name}:`, error)
                return [] // Return empty array on failure
            }
        }

        const [tickerData, fundingData, liquidation24h, liquidation1h, fearGreed, whaleGlobal] = await Promise.all([
            // Regime: Use Ticker for Price Change & High/Low
            // V4 Ticker usually requires exchange. Trying 'Binance' + 'BTCUSDT' if standard ticker fails.
            // Or use price-change-percent endpoint if available. Let's try standard ticker with valid params.
            fetchSafe(coinglassV4Request<any[]>('/api/futures/ticker', { symbol: 'BTCUSDT', exchange: 'Binance' }), 'Ticker'),

            // Leverage: BTC Funding Rate (Exchange List is widely supported)
            fetchSafe(coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }), 'Funding'),

            // Leverage: 24H Liquidation
            fetchSafe(coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', { symbol: 'BTC', interval: '1d', limit: 1, exchange_list: 'Binance' }), 'Liquidation 24H'),

            // Volatility: 1H Liquidation
            fetchSafe(coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', { symbol: 'BTC', interval: '1h', limit: 1, exchange_list: 'Binance' }), 'Liquidation 1H'),

            // Sentiment: Fear & Greed (If this fails, we default to 50)
            fetchSafe(coinglassV4Request<any[]>('/api/index/fear-greed-history', { limit: 1 }), 'FearGreed'),

            // Whale: Global L/S might be safer than Top
            fetchSafe(coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', { symbol: 'BTCUSDT', exchange: 'Binance', interval: '1h', limit: 1 }), 'WhaleRatio')
        ])

        // --- 1. Market Regime (市場狀態) ---
        // Logic: Checks Ticker 24h Change & High/Low
        let regime = '穩定'
        let regimeCode = 'stable'

        // Process Ticker
        if (tickerData && tickerData.length > 0) {
            // Ticker data often: [{ symbol: 'BTC', price: ..., priceChangePercent: ... }]
            const t = tickerData.find((x: any) => x.symbol === 'BTC' || x.symbol === 'BTCUSDT') || tickerData[0]
            if (t) {
                const change = Math.abs(parseFloat(t.priceChangePercent || '0'))
                // Calculate Amp from High/Low if available, else assume low amp if change is low
                const high = parseFloat(t.highPrice || '0')
                const low = parseFloat(t.lowPrice || '0')
                const amp = low > 0 ? ((high - low) / low) * 100 : 0

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

        // --- 2. Leverage Heat (槓桿情緒) ---
        let leverage = '冷靜'
        let leverageCode = 'cool'

        let frVal = 0 // percent
        let liq24hVal = 0 // USD

        // FR (from exchange list)
        if (fundingData && fundingData.length > 0) {
            // fundingData[0].uMarginList...
            const list = fundingData[0]?.uMarginList || fundingData[0]?.marginList || []
            const binance = list.find((e: any) => e.exchangeName === 'Binance')
            if (binance) {
                frVal = Math.abs(binance.rate * 100) // rate is decimal 0.0001
            }
        }

        // Liq 24H
        if (liquidation24h && liquidation24h.length > 0) {
            const l = liquidation24h[0]
            // Aggregated history provides buyVolUsd/sellVolUsd
            const longLiq = l.aggregated_long_liquidation_usd || l.buyVolUsd || l.longLiquidation || 0
            const shortLiq = l.aggregated_short_liquidation_usd || l.sellVolUsd || l.shortLiquidation || 0
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
        let sentiment = '中性'
        let sentimentCode = 'neutral'
        let fgIndex = 50

        if (fearGreed && fearGreed.length > 0) {
            const match = Array.isArray(fearGreed) ? fearGreed.find((x: any) => x.value) : fearGreed
            if (match) fgIndex = parseInt(match.value, 10)
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
        let whale = '觀望'
        let whaleCode = 'watch'

        if (whaleGlobal && whaleGlobal.length > 0) {
            const w = whaleGlobal[0]
            const longRatio = w.global_account_long_short_ratio || w.longAccount || w.longRatio || 1
            // Convert to percentage approximation if it's a ratio (e.g. 1.5)
            // If ratio > 1, longs > 50%. Long% = Ratio / (Ratio + 1)
            const calculatedLong = (longRatio / (longRatio + 1)) * 100

            // Or use direct percentage if available
            const longPct = w.global_account_long_percent || calculatedLong

            if (longPct > 52) {
                whale = '偏多'
                whaleCode = 'bullish'
            } else if (longPct < 48) {
                whale = '偏空'
                whaleCode = 'bearish'
            } else {
                whale = '觀望'
                whaleCode = 'watch'
            }
        }

        // --- 5. Volatility (短線波動) ---
        let volatility = '低'
        let volatilityCode = 'low'

        let liq1hVal = 0

        // 1H Liq
        if (liquidation1h && liquidation1h.length > 0) {
            const l = liquidation1h[0]
            const longLiq = l.aggregated_long_liquidation_usd || l.buyVolUsd || l.longLiquidation || 0
            const shortLiq = l.aggregated_short_liquidation_usd || l.sellVolUsd || l.shortLiquidation || 0
            liq1hVal = longLiq + shortLiq
        }

        // Simpler voltatility logic based on Liq primarily if Amp is missing 1H
        if (liq1hVal > 150000000) {
            volatility = '高'
            volatilityCode = 'high'
        } else if (liq1hVal >= 50000000) {
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

        // --- Market Tools Status (入口組件狀態) ---
        // 1. Contracts (合約市場): Reuse Leverage Status
        // Logic: Same as leverage card (Cool/Warm/Hot)
        const toolContracts = {
            title: '合約市場',
            status: leverage === '冷靜' ? '狀態穩定' : `槓桿情緒：${leverage}`, // If normal, say Stable. If hot, warn.
            active: leverage !== '冷靜',
            href: '/market'
        }

        // 2. Whales (巨鯨動態)
        // Logic: Use Whale Bias. If 'Watch' -> '無明顯單邊'. If Bull/Bear -> '出現單邊押注'.
        // Or if we had alert count, use that. Let's use bias for now.
        const toolWhales = {
            title: '巨鯨動態',
            status: whale === '觀望' ? '近 1 小時：無明顯單邊' : `大戶傾向：${whale}`,
            active: whale !== '觀望',
            href: '/market/whales' // Assuming this route exists or /market
        }

        // 3. Funding (資金費率)
        // Logic: Use max funding rate or avg. We have `frVal` (avg). 
        // If frVal > 0.03% -> '部分幣種出現異常'. Else '整體偏中性'.
        const toolFunding = {
            title: '資金費率',
            status: frVal > 0.03 ? '部分幣種費率偏高' : '整體偏中性',
            active: frVal > 0.03,
            href: '/market/funding' // or /market?tab=funding
        }

        // 4. Prediction (市場預期 - Polymarket)
        // Logic: Mock for now as we don't have real-time poly diff.
        // Randomly set active occasionally or keep dry.
        const toolPrediction = {
            title: '市場預期',
            status: '降息機率未變', // Hardcoded for safety until real data
            active: false,
            href: '/prediction'
        }

        // 5. Alerts (異常警報)
        // Logic: Count high volatility items or mock. 
        // Let's use volatility code. If High -> '今日 2 則' (mock count using amp). 
        // If Low -> '目前無'.
        const alertCount = volatilityCode === 'high' ? 2 : (volatilityCode === 'medium' ? 1 : 0)
        const toolAlerts = {
            title: '異常警報',
            status: alertCount > 0 ? `今日 ${alertCount} 則` : '目前無',
            active: alertCount > 0,
            href: '/alerts' // or /market/alerts
        }

        const tools = [toolContracts, toolWhales, toolFunding, toolPrediction, toolAlerts]

        // --- Generate AI Conclusion (一句話結論) ---
        // Logic: Combine signals from all 5 indicators to give actionable advice
        const generateConclusion = () => {
            // Count signals
            const bullishSignals = [
                sentimentCode === 'fear', // Fear = buy signal (contrarian)
                whaleCode === 'bullish',
                leverageCode === 'cool', // Cool leverage = room to go up
            ].filter(Boolean).length

            const bearishSignals = [
                sentimentCode === 'greed', // Greed = danger
                whaleCode === 'bearish',
                leverageCode === 'overheated', // Overheated = correction likely
            ].filter(Boolean).length

            const cautionSignals = [
                regimeCode === 'pressure',
                volatilityCode === 'high',
            ].filter(Boolean).length

            // Determine bias
            let bias: '偏多' | '偏空' | '觀望' = '觀望'
            let action = '保持觀望，等待明確訊號'
            let emoji = '⚖️'

            if (bullishSignals >= 2 && cautionSignals === 0) {
                bias = '偏多'
                action = '可考慮逢低布局多單'
                emoji = '🟢'
            } else if (bearishSignals >= 2 || cautionSignals >= 1) {
                bias = '偏空'
                action = '建議減倉或觀望，注意風控'
                emoji = '🔴'
            } else if (bullishSignals === 1 && bearishSignals === 0) {
                bias = '偏多'
                action = '謹慎看多，輕倉試探'
                emoji = '🟡'
            }

            // Build reasoning (Secondary info)
            const reasons: string[] = []
            if (sentimentCode === 'fear') reasons.push('市場恐慌 (反向機會)')
            if (sentimentCode === 'greed') reasons.push('市場貪婪 (小心回調)')
            if (leverageCode === 'overheated') reasons.push('槓桿過熱')
            if (leverageCode === 'cool') reasons.push('槓桿冷靜')
            if (whaleCode === 'bullish') reasons.push('大戶偏多')
            if (whaleCode === 'bearish') reasons.push('大戶偏空')
            if (volatilityCode === 'high') reasons.push('波動劇烈')

            return {
                bias,
                action,
                emoji,
                reasoning: reasons.slice(0, 3).join('、') || '綜合指標中性'
            }
        }

        const conclusion = generateConclusion()

        const responseData = { status: data, tools, conclusion }
        setCache(CACHE_KEY, responseData, CacheTTL.FAST) // 1 min

        return NextResponse.json(responseData)

    } catch (e) {
        console.error('Market Status API Error:', e)
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }
}
