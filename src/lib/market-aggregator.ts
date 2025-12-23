import { cachedCoinglassV4Request } from './coinglass'
import { CacheTTL } from './cache'
import { fetchBinanceRSI } from './technical-analysis'
import { generateMarketSignals, type MarketSignals, type RawMarketData } from './signal-engine'
import { logger } from '@/lib/logger'

// CoinGecko for BTC price (more reliable)
// Binance for BTC price & volatility data (High/Low)
async function fetchBtcTicker() {
    try {
        const res = await fetch(
            'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
            { next: { revalidate: 30 } }
        )
        const data = await res.json()
        return {
            price: parseFloat(data.lastPrice),
            change_24h: parseFloat(data.priceChangePercent),
            high_24h: parseFloat(data.highPrice),
            low_24h: parseFloat(data.lowPrice),
            volume_24h: parseFloat(data.quoteVolume) // USDT volume
        }
    } catch (e) {
        logger.error('Binance BTC Ticker fetch error', e as Error, { feature: 'market-aggregator' })
        return null
    }
}

export async function getMarketSnapshot(symbol: string = 'BTC') {
    const [
        ticker,
        rsi,
        fearGreed,
        fundingRates,
        globalLongShort,
        topLongShort,
        openInterest,
        liquidations,
        takerBuySell,
        etfFlows,
        coinbasePremium,
        hyperliquidWhales,
        liquidationCoinList
    ] = await Promise.all([
        fetchBtcTicker().catch(() => null),
        fetchBinanceRSI(`${symbol}USDT`, '1h').catch(() => 50), // Default to 50 neutral
        cachedCoinglassV4Request<any[]>('/api/index/fear-greed-history', { limit: 100 }, CacheTTL.SLOW).catch(() => []),
        cachedCoinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: symbol }, CacheTTL.MEDIUM).catch(() => []),
        cachedCoinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', { symbol: `${symbol}USDT`, exchange: 'Binance', interval: '1h', limit: 100 }, CacheTTL.MEDIUM).catch(() => []),
        cachedCoinglassV4Request<any[]>('/api/futures/top-long-short-account-ratio/history', { symbol: `${symbol}USDT`, exchange: 'Binance', interval: '1h', limit: 100 }, CacheTTL.MEDIUM).catch(() => []),
        cachedCoinglassV4Request<any[]>('/api/futures/open-interest/exchange-list', { symbol: symbol }, CacheTTL.FAST).catch(() => []),
        cachedCoinglassV4Request<any[]>('/api/futures/liquidation/history', { symbol: `${symbol}USDT`, exchange: 'Binance', interval: '1h', limit: 100 }, CacheTTL.FAST).catch(() => []),
        cachedCoinglassV4Request<any>('/api/futures/taker-buy-sell-volume/exchange-list', { symbol: `${symbol}USDT`, range: '1h' }, CacheTTL.FAST).catch(() => null),
        symbol === 'BTC' ? cachedCoinglassV4Request<any[]>('/api/etf/bitcoin/flow-history', { limit: 100 }, CacheTTL.SLOW).catch(() => null) : Promise.resolve(null),
        symbol === 'BTC' ? cachedCoinglassV4Request<any[]>('/api/coinbase-premium-index', { limit: 100 }, CacheTTL.MEDIUM).catch(() => null) : Promise.resolve(null),
        cachedCoinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}, CacheTTL.FAST).catch(() => null),
        cachedCoinglassV4Request<any[]>('/api/futures/liquidation/coin-list', {}, CacheTTL.FAST).catch(() => null)
    ])

    // Calculate aggregated OI
    const totalOI = openInterest?.reduce((sum: number, ex: any) => sum + (ex.openInterest || 0), 0) || 0
    const oiChange1h = openInterest?.[0]?.open_interest_change_percent_1h || 0
    const oiChange4h = openInterest?.[0]?.open_interest_change_percent_4h || 0
    const oiChange24h = openInterest?.[0]?.open_interest_change_percent_24h || 0

    // Helper to get latest item (API returns ascending history)
    const getLatest = (arr: any[] | null) => arr && arr.length > 0 ? arr[arr.length - 1] : null;

    // Consolidate Data
    const latestFGI = getLatest(fearGreed);
    const latestFunding = fundingRates?.[0]?.stablecoin_margin_list?.[0]; // Exchange list is not history, [0] is fine (Binance)
    const latestGlobalLS = getLatest(globalLongShort);
    const latestTopLS = getLatest(topLongShort);
    const latestLiq = getLatest(liquidations);
    const latestEtf = getLatest(etfFlows);
    const latestCb = getLatest(coinbasePremium);

    return {
        timestamp: new Date().toISOString(),
        symbol: symbol,
        btc: ticker || { price: 0, change_24h: 0, high_24h: 0, low_24h: 0, volume_24h: 0 },

        // 價格動能 (from CoinGecko + Binance RSI)
        technical: {
            rsi_1h: rsi,
            rsi_status: rsi > 70 ? '超買' : rsi < 30 ? '超賣' : '中性',
        },

        // 市場情緒 (from Coinglass) - MARKET WIDE
        sentiment: {
            fear_greed_index: latestFGI?.value, // Note: FGI uses 'value' (V4 confirmed in log)
            fear_greed_label: latestFGI?.value >= 75 ? '極度貪婪' :
                latestFGI?.value >= 55 ? '貪婪' :
                    latestFGI?.value >= 45 ? '中性' :
                        latestFGI?.value >= 25 ? '恐懼' : '極度恐懼',
        },

        // 資金熱度 & 趨勢 (from Coinglass V4)
        capital_flow: {
            funding_rate: latestFunding?.funding_rate,
            funding_rate_exchange: latestFunding?.exchange,
            open_interest_total: totalOI,
            oi_change_1h: oiChange1h,
            oi_change_4h: oiChange4h,
            oi_change_24h: oiChange24h,
            trend_signal: (oiChange1h > 0) ? '持倉增加' : '持倉減少'
        },

        // 多空比 (from Coinglass V4)
        long_short: {
            global_ratio: latestGlobalLS?.global_account_long_short_ratio,
            global_long_rate: latestGlobalLS?.global_account_long_percent,
            whale_ratio: latestTopLS?.top_account_long_short_ratio, // Guessing snake_case based on global
            whale_long_rate: latestTopLS?.top_account_long_percent,
        },

        // 爆倉數據 (from Coinglass V4)
        liquidations: {
            long_liquidated: latestLiq?.long_liquidation_usd,
            short_liquidated: latestLiq?.short_liquidation_usd,
            total_liquidated: (latestLiq?.long_liquidation_usd || 0) + (latestLiq?.short_liquidation_usd || 0),
        },

        // 主動買賣比 (NEW) - data is object, not array
        taker_flow: {
            buy_volume: takerBuySell?.buy_vol_usd,
            sell_volume: takerBuySell?.sell_vol_usd,
            buy_ratio: takerBuySell?.buy_ratio,
            sell_ratio: takerBuySell?.sell_ratio,
            pressure: (takerBuySell?.buy_ratio || 50) > 50 ? '買壓' : (takerBuySell?.buy_ratio || 50) < 50 ? '賣壓' : '平衡',
        },

        // BTC ETF 資金流 (NEW)
        etf: {
            daily_flow_usd: latestEtf?.flow_usd,
            price_usd: latestEtf?.price_usd,
            flow_direction: (latestEtf?.flow_usd || 0) > 0 ? '淨流入' : (latestEtf?.flow_usd || 0) < 0 ? '淨流出' : '持平',
            has_data: !!latestEtf,
        },

        // Coinbase 溢價 (NEW)
        coinbase_premium: {
            premium: coinbasePremium?.[0]?.premium,
            premium_percent: coinbasePremium?.[0]?.premiumRate,
            signal: coinbasePremium?.[0]?.premiumRate > 0 ? '美國買盤強' : coinbasePremium?.[0]?.premiumRate < 0 ? '美國賣壓' : '持平',
            has_data: !!coinbasePremium?.[0],
        },

        // Hyperliquid 巨鯨動態 (from Coinglass V4)
        whales: processWhaleAlerts(hyperliquidWhales, symbol),

        // 爆倉數據 (from coin-list - 替代 heatmap)
        liquidation_map: processLiquidationCoinList(liquidationCoinList, symbol),
    }
}

// Process whale alerts into useful summary
function processWhaleAlerts(alerts: any[] | null, symbol: string = 'BTC') {
    if (!alerts || alerts.length === 0) {
        return { has_data: false, summary: null, recent_alerts: [] }
    }

    // Filter BTC related alerts and recent ones (last 24h)
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const recentAlerts = alerts
        .filter((a: any) => a.create_time > oneDayAgo)
        .slice(0, 10)

    // Calculate summary stats
    const symbolAlerts = recentAlerts.filter((a: any) => a.symbol === symbol)
    // If no alerts for this symbol, maybe show general market whales? 
    // But logically "Whale Sentiment" should be per token if possible.
    // Let's stick to symbol specific stats if available, fall back to null if no data for this symbol?
    // User wants "Dashboard" look. 
    // Actually, for smaller coins, whale alerts might be rare on Hyperliquid.

    // Let's rely on symbol specific
    if (symbolAlerts.length === 0) {
        return { has_data: false, summary: null, recent_alerts: [] }
    }

    const openPositions = symbolAlerts.filter((a: any) => a.position_action === 1)
    const closePositions = symbolAlerts.filter((a: any) => a.position_action === 2)

    // Long vs Short (positive position_size = long, negative = short)
    const longAlerts = symbolAlerts.filter((a: any) => a.position_size > 0)
    const shortAlerts = symbolAlerts.filter((a: any) => a.position_size < 0)

    // Total value
    const totalLongValue = longAlerts.reduce((sum: number, a: any) => sum + (a.position_value_usd || 0), 0)
    const totalShortValue = shortAlerts.reduce((sum: number, a: any) => sum + (a.position_value_usd || 0), 0)

    // Determine sentiment
    let whaleSentiment = '中性'
    if (totalLongValue > totalShortValue * 1.5) {
        whaleSentiment = '偏多'
    } else if (totalShortValue > totalLongValue * 1.5) {
        whaleSentiment = '偏空'
    }

    return {
        has_data: true,
        summary: {
            total_alerts_24h: symbolAlerts.length,
            btc_alerts: symbolAlerts.length,
            open_count: openPositions.length,
            close_count: closePositions.length,
            long_count: longAlerts.length,
            short_count: shortAlerts.length,
            total_long_value_usd: totalLongValue,
            total_short_value_usd: totalShortValue,
            whale_sentiment: whaleSentiment,
        },
        recent_alerts: symbolAlerts.slice(0, 3).map((a: any) => ({
            symbol: a.symbol,
            side: a.position_size > 0 ? 'LONG' : 'SHORT',
            action: a.position_action === 1 ? 'OPEN' : 'CLOSE',
            value_usd: a.position_value_usd,
            entry_price: a.entry_price,
            time: new Date(a.create_time).toISOString(),
        }))
    }
}

// Process liquidation coin-list into summary (替代 heatmap)
function processLiquidationCoinList(coinList: any[] | null, symbol: string = 'BTC') {
    if (!coinList || coinList.length === 0) {
        return { has_data: false, summary: null }
    }

    // Find Symbol data
    const coinData = coinList.find((c: any) => c.symbol === symbol)
    if (!coinData) {
        return { has_data: false, summary: null }
    }

    const longLiq24h = coinData.long_liquidation_usd_24h || 0
    const shortLiq24h = coinData.short_liquidation_usd_24h || 0
    const totalLiq24h = coinData.liquidation_usd_24h || 0

    // Format helper
    const formatUsd = (u: number) => {
        if (u >= 1e9) return `${(u / 1e9).toFixed(1)}B`
        if (u >= 1e6) return `${(u / 1e6).toFixed(1)}M`
        return `${(u / 1e3).toFixed(0)}K`
    }

    // Determine signal based on long vs short liquidation
    // 多單爆倉多 = 下跌趨勢, 空單爆倉多 = 上漲趨勢
    let signal = '均衡'
    let direction = 'neutral'
    if (longLiq24h > shortLiq24h * 1.5) {
        signal = '多單爆倉主導'
        direction = 'bearish' // 多單爆=下跌
    } else if (shortLiq24h > longLiq24h * 1.5) {
        signal = '空單爆倉主導'
        direction = 'bullish' // 空單爆=上漲
    }

    return {
        has_data: true,
        summary: {
            long_liquidation_24h: longLiq24h,
            short_liquidation_24h: shortLiq24h,
            total_liquidation_24h: totalLiq24h,
            long_liq_formatted: formatUsd(longLiq24h),
            short_liq_formatted: formatUsd(shortLiq24h),
            signal: signal,
            direction: direction,
        }
    }
}
