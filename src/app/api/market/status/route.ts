
import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { unstable_cache } from 'next/cache'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { MarketStatusData } from '@/lib/types'

// Force dynamic because we use request headers for rate limiting
export const dynamic = 'force-dynamic'

// --- Data Fetching & Processing Logic (Cached) ---
const getMarketStatusData = async () => {
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
        fetchSafe(coinglassV4Request<any[]>('/api/futures/ticker', { symbol: 'BTCUSDT', exchange: 'Binance' }), 'Ticker'),
        fetchSafe(coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }), 'Funding'),
        fetchSafe(coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', { symbol: 'BTC', interval: '1d', limit: 1, exchange_list: 'Binance' }), 'Liquidation 24H'),
        fetchSafe(coinglassV4Request<any[]>('/api/futures/liquidation/aggregated-history', { symbol: 'BTC', interval: '1h', limit: 1, exchange_list: 'Binance' }), 'Liquidation 1H'),
        fetchSafe(coinglassV4Request<any[]>('/api/index/fear-greed-history', { limit: 1 }), 'FearGreed'),
        fetchSafe(coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', { symbol: 'BTCUSDT', exchange: 'Binance', interval: '1h', limit: 1 }), 'WhaleRatio')
    ])

    // --- 1. Market Regime (市場狀態) ---
    let regime = '穩定'
    let regimeCode = 'stable'

    if (tickerData && tickerData.length > 0) {
        const t = tickerData.find((x: any) => x.symbol === 'BTC' || x.symbol === 'BTCUSDT') || tickerData[0]
        if (t) {
            const change = Math.abs(parseFloat(t.priceChangePercent || '0'))
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

    // FR
    if (fundingData && fundingData.length > 0) {
        const list = fundingData[0]?.uMarginList || fundingData[0]?.marginList || []
        const binance = list.find((e: any) => e.exchangeName === 'Binance')
        if (binance) {
            frVal = Math.abs(binance.rate * 100)
        }
    }

    // Liq 24H
    if (liquidation24h && liquidation24h.length > 0) {
        const l = liquidation24h[0]
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
        const calculatedLong = (longRatio / (longRatio + 1)) * 100
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

    if (liquidation1h && liquidation1h.length > 0) {
        const l = liquidation1h[0]
        const longLiq = l.aggregated_long_liquidation_usd || l.buyVolUsd || l.longLiquidation || 0
        const shortLiq = l.aggregated_short_liquidation_usd || l.sellVolUsd || l.shortLiquidation || 0
        liq1hVal = longLiq + shortLiq
    }

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

    const status: MarketStatusData = {
        regime: { label: regime, code: regimeCode, value: regime },
        leverage: { label: leverage, code: leverageCode, value: leverage },
        sentiment: { label: sentiment, code: sentimentCode, value: sentiment },
        whale: { label: whale, code: whaleCode, value: whale },
        volatility: { label: volatility, code: volatilityCode, value: volatility },
        // V2 Data Population
        market_structure: { bias: regime }, // Reuse regime as bias
        long_short: { ratio: 1.1 }, // Default or mapped if available (Need to extract logic below)
        funding_rates: { average: frVal },
        volatility_raw: { value: 30 } // Placeholder or derived
    }

    // Correcting long_short and volatility_raw with real data if available
    if (whaleGlobal && whaleGlobal.length > 0) {
        const w = whaleGlobal[0]
        // This is whale L/S, not retail. But for now we use it or default to 1.1 if not present
        const longRatio = w.global_account_long_short_ratio || 1.1
        status.long_short = { ratio: longRatio }
    }

    // FearGreed as proxy for volatility if no specific VI
    status.volatility_raw = { value: fgIndex }

    // --- Market Tools Status ---
    const toolContracts = {
        title: '合約市場',
        status: leverage === '冷靜' ? '狀態穩定' : `槓桿情緒：${leverage}`,
        active: leverage !== '冷靜',
        href: '/market'
    }

    const toolWhales = {
        title: '巨鯨動態',
        status: whale === '觀望' ? '近 1 小時：無明顯單邊' : `大戶傾向：${whale}`,
        active: whale !== '觀望',
        href: '/market/whales'
    }

    const toolFunding = {
        title: '資金費率',
        status: frVal > 0.03 ? '部分幣種費率偏高' : '整體偏中性',
        active: frVal > 0.03,
        href: '/market/funding'
    }

    const toolPrediction = {
        title: '市場預期',
        status: '降息機率未變',
        active: false,
        href: '/prediction'
    }

    const alertCount = volatilityCode === 'high' ? 2 : (volatilityCode === 'medium' ? 1 : 0)
    const toolAlerts = {
        title: '異常警報',
        status: alertCount > 0 ? `今日 ${alertCount} 則` : '目前無',
        active: alertCount > 0,
        href: '/alerts'
    }

    const tools = [toolContracts, toolWhales, toolFunding, toolPrediction, toolAlerts]

    // --- Generate AI Conclusion ---
    const generateConclusion = () => {
        const bullishSignals = [
            sentimentCode === 'fear',
            whaleCode === 'bullish',
            leverageCode === 'cool',
        ].filter(Boolean).length

        const bearishSignals = [
            sentimentCode === 'greed',
            whaleCode === 'bearish',
            leverageCode === 'overheated',
        ].filter(Boolean).length

        const cautionSignals = [
            regimeCode === 'pressure',
            volatilityCode === 'high',
        ].filter(Boolean).length

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
            reasoning: reasons.slice(0, 3).join('、') || '綜合指標中性',
            sentiment_score: fgIndex // Use Fear & Greed Index as score
        }
    }

    return { status, tools, conclusion: generateConclusion() }
}

// Cached version
const getCachedMarketStatusData = unstable_cache(
    getMarketStatusData,
    ['global-market-status-v1'], // Cache Key
    { revalidate: 60 } // Revalidate every 60 seconds
)

export async function GET(req: NextRequest) {
    const rateLimited = await simpleApiRateLimit(req, 'market-status', 60, 60)
    if (rateLimited) return rateLimited

    try {
        const data = await getCachedMarketStatusData()
        return NextResponse.json(data)
    } catch (e) {
        console.error('Market Status API Error:', e)
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }
}
