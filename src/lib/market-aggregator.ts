import { cachedCoinglassV4Request } from './coinglass'
import { CacheTTL } from './cache'
import { fetchBinanceRSI } from './technical-analysis'
import { generateMarketSignals, type MarketSignals, type RawMarketData } from './signal-engine'

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
        console.error('Binance BTC Ticker fetch error', e)
        return null
    }
}

export async function getMarketSnapshot() {
    const [
        btcPrice,
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
        liquidationHeatmap
    ] = await Promise.all([
        fetchBtcTicker(),
        fetchBinanceRSI('BTCUSDT', '1h'),
        // 恐懼貪婪指數 (15 min cache - daily data)
        cachedCoinglassV4Request<any[]>('/api/index/fear-greed-history', { limit: 1 }, CacheTTL.SLOW),
        // 資金費率 (5 min cache - 8hr settlement)
        cachedCoinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }, CacheTTL.MEDIUM),
        // 全球多空比 (5 min cache)
        cachedCoinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', { symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1 }, CacheTTL.MEDIUM),
        // 大戶多空比 (5 min cache)
        cachedCoinglassV4Request<any[]>('/api/futures/top-long-short-account-ratio/history', { symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1 }, CacheTTL.MEDIUM),
        // 持倉量 (1 min cache - changes faster)
        cachedCoinglassV4Request<any[]>('/api/futures/open-interest/exchange-list', { symbol: 'BTC' }, CacheTTL.FAST),
        // 爆倉 (1 min cache)
        cachedCoinglassV4Request<any[]>('/api/futures/liquidation/history', { symbol: 'BTC', interval: '1h', limit: 1 }, CacheTTL.FAST),
        // 主動買賣比 (1 min cache)
        cachedCoinglassV4Request<any>('/api/futures/taker-buy-sell-volume/exchange-list', { symbol: 'BTC', range: '1h' }, CacheTTL.FAST),
        // BTC ETF 資金流 (15 min cache - daily data)
        cachedCoinglassV4Request<any[]>('/api/etf/bitcoin/flow-history', { limit: 1 }, CacheTTL.SLOW).catch(() => null),
        // Coinbase 溢價 (5 min cache)
        cachedCoinglassV4Request<any[]>('/api/coinbase-premium-index', { limit: 1 }, CacheTTL.MEDIUM).catch(() => null),
        // Hyperliquid 鯨魚 (1 min cache)
        cachedCoinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}, CacheTTL.FAST).catch(() => null),
        // 清算地圖 (5 min cache - compute heavy)
        cachedCoinglassV4Request<any>('/api/futures/liquidation-heatmap', { symbol: 'BTC', range: '3d' }, CacheTTL.MEDIUM).catch(() => null)
    ])

    // Debug logging
    console.log('[MarketAggregator] BTC Price:', btcPrice)
    console.log('[MarketAggregator] RSI:', rsi)
    console.log('[MarketAggregator] Fear & Greed:', fearGreed?.[0])
    console.log('[MarketAggregator] Open Interest Changes:', openInterest?.[0])
    console.log('[MarketAggregator] ETF Flows:', etfFlows?.[0])
    console.log('[MarketAggregator] Taker Buy/Sell:', takerBuySell?.[0])

    // Calculate aggregated OI
    const totalOI = openInterest?.reduce((sum: number, ex: any) => sum + (ex.openInterest || 0), 0) || 0
    const oiChange1h = openInterest?.[0]?.open_interest_change_percent_1h || 0
    const oiChange4h = openInterest?.[0]?.open_interest_change_percent_4h || 0

    // Consolidate Data
    return {
        timestamp: new Date().toISOString(),

        // 價格動能 (from CoinGecko + Binance RSI)
        btc: {
            price: btcPrice?.price,
            change_24h_percent: btcPrice?.change_24h,
            high_24h: btcPrice?.high_24h,
            low_24h: btcPrice?.low_24h,
            volume_24h: btcPrice?.volume_24h,
            rsi_1h: rsi,
            rsi_status: rsi > 70 ? '超買' : rsi < 30 ? '超賣' : '中性',
        },

        // 市場情緒 (from Coinglass)
        sentiment: {
            fear_greed_index: fearGreed?.[0]?.value,
            fear_greed_label: fearGreed?.[0]?.value >= 75 ? '極度貪婪' :
                fearGreed?.[0]?.value >= 55 ? '貪婪' :
                    fearGreed?.[0]?.value >= 45 ? '中性' :
                        fearGreed?.[0]?.value >= 25 ? '恐懼' : '極度恐懼',
        },

        // 資金熱度 & 趨勢 (from Coinglass V4)
        capital_flow: {
            funding_rate: fundingRates?.[0]?.stablecoin_margin_list?.[0]?.funding_rate,
            funding_rate_exchange: fundingRates?.[0]?.stablecoin_margin_list?.[0]?.exchange,
            open_interest_total: totalOI,
            oi_change_1h: oiChange1h,
            oi_change_4h: oiChange4h,
            trend_signal: (oiChange1h > 0 && (btcPrice?.change_24h || 0) > 0) ? '強勢上漲' :
                (oiChange1h > 0 && (btcPrice?.change_24h || 0) < 0) ? '建倉下跌' :
                    (oiChange1h < 0 && (btcPrice?.change_24h || 0) < 0) ? '多頭止損' : '震盪整理',
        },

        // 多空比 (from Coinglass V4)
        long_short: {
            global_ratio: globalLongShort?.[0]?.longShortRatio,
            global_long_rate: globalLongShort?.[0]?.longRate,
            whale_ratio: topLongShort?.[0]?.longShortRatio,
            whale_long_rate: topLongShort?.[0]?.longRate,
        },

        // 爆倉數據 (from Coinglass V4)
        liquidations: {
            long_liquidated: liquidations?.[0]?.longLiquidationUsd,
            short_liquidated: liquidations?.[0]?.shortLiquidationUsd,
            total_liquidated: (liquidations?.[0]?.longLiquidationUsd || 0) + (liquidations?.[0]?.shortLiquidationUsd || 0),
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
            daily_flow_usd: etfFlows?.[0]?.flow_usd,
            price_usd: etfFlows?.[0]?.price_usd,
            flow_direction: (etfFlows?.[0]?.flow_usd || 0) > 0 ? '淨流入' : (etfFlows?.[0]?.flow_usd || 0) < 0 ? '淨流出' : '持平',
            has_data: !!etfFlows?.[0],
        },

        // Coinbase 溢價 (NEW)
        coinbase_premium: {
            premium: coinbasePremium?.[0]?.premium,
            premium_percent: coinbasePremium?.[0]?.premiumRate,
            signal: coinbasePremium?.[0]?.premiumRate > 0 ? '美國買盤強' : coinbasePremium?.[0]?.premiumRate < 0 ? '美國賣壓' : '持平',
            has_data: !!coinbasePremium?.[0],
        },

        // Hyperliquid 巨鯨動態 (from Coinglass V4)
        whales: processWhaleAlerts(hyperliquidWhales),

        // 清算地圖 (Liquidation Heatmap)
        liquidation_map: processLiquidationHeatmap(liquidationHeatmap, btcPrice?.price),

        // ===== Signal Engine 輸出 =====
        signals: generateMarketSignals({
            oi_change_24h: oiChange4h, // 使用 4h 變化
            funding_rate: fundingRates?.[0]?.stablecoin_margin_list?.[0]?.funding_rate,
            long_short_ratio: globalLongShort?.[0]?.longShortRatio,
            top_trader_long_short_ratio: topLongShort?.[0]?.longShortRatio,
            liquidation_above_usd: processLiquidationHeatmap(liquidationHeatmap, btcPrice?.price)?.summary?.total_above_usd,
            liquidation_below_usd: processLiquidationHeatmap(liquidationHeatmap, btcPrice?.price)?.summary?.total_below_usd,
            liquidation_above_price: processLiquidationHeatmap(liquidationHeatmap, btcPrice?.price)?.summary?.resistance_1,
            liquidation_below_price: processLiquidationHeatmap(liquidationHeatmap, btcPrice?.price)?.summary?.support_1,
            price: btcPrice?.price,
            price_change_24h: btcPrice?.change_24h,
            price_high_24h: btcPrice?.high_24h,
            price_low_24h: btcPrice?.low_24h,
            whale_long_count: processWhaleAlerts(hyperliquidWhales)?.summary?.long_count,
            whale_short_count: processWhaleAlerts(hyperliquidWhales)?.summary?.short_count,
            whale_long_value: processWhaleAlerts(hyperliquidWhales)?.summary?.total_long_value_usd,
            whale_short_value: processWhaleAlerts(hyperliquidWhales)?.summary?.total_short_value_usd,
        }),
    }
}

// Process whale alerts into useful summary
function processWhaleAlerts(alerts: any[] | null) {
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
    const btcAlerts = recentAlerts.filter((a: any) => a.symbol === 'BTC')
    const openPositions = recentAlerts.filter((a: any) => a.position_action === 1)
    const closePositions = recentAlerts.filter((a: any) => a.position_action === 2)

    // Long vs Short (positive position_size = long, negative = short)
    const longAlerts = recentAlerts.filter((a: any) => a.position_size > 0)
    const shortAlerts = recentAlerts.filter((a: any) => a.position_size < 0)

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
            total_alerts_24h: recentAlerts.length,
            btc_alerts: btcAlerts.length,
            open_count: openPositions.length,
            close_count: closePositions.length,
            long_count: longAlerts.length,
            short_count: shortAlerts.length,
            total_long_value_usd: totalLongValue,
            total_short_value_usd: totalShortValue,
            whale_sentiment: whaleSentiment,
        },
        recent_alerts: recentAlerts.slice(0, 3).map((a: any) => ({
            symbol: a.symbol,
            side: a.position_size > 0 ? 'LONG' : 'SHORT',
            action: a.position_action === 1 ? 'OPEN' : 'CLOSE',
            value_usd: a.position_value_usd,
            entry_price: a.entry_price,
            time: new Date(a.create_time).toISOString(),
        }))
    }
}

// Process liquidation heatmap into key levels
function processLiquidationHeatmap(data: any, currentPrice: number | undefined) {
    if (!data || !currentPrice) {
        return { has_data: false, summary: null }
    }

    const levels = data.levels || data.priceList || []
    if (levels.length === 0) {
        return { has_data: false, summary: null }
    }

    // Find liquidation levels above and below current price
    const aboveLevels = levels
        .filter((l: any) => (l.price || l.p) > currentPrice)
        .sort((a: any, b: any) => (a.price || a.p) - (b.price || b.p))
        .slice(0, 3)
        .map((l: any) => ({
            price: l.price || l.p,
            liq_usd: l.longLiquidation || l.liqLong || 0,
        }))

    const belowLevels = levels
        .filter((l: any) => (l.price || l.p) < currentPrice)
        .sort((a: any, b: any) => (b.price || b.p) - (a.price || a.p))
        .slice(0, 3)
        .map((l: any) => ({
            price: l.price || l.p,
            liq_usd: l.shortLiquidation || l.liqShort || 0,
        }))

    // Calculate total liquidation pressure
    const totalAbove = aboveLevels.reduce((sum: number, l: any) => sum + l.liq_usd, 0)
    const totalBelow = belowLevels.reduce((sum: number, l: any) => sum + l.liq_usd, 0)

    // Find max liquidation level (max pain)
    const allLevels = [...aboveLevels, ...belowLevels]
    const maxPainLevel = allLevels.reduce((max: any, l: any) =>
        l.liq_usd > (max?.liq_usd || 0) ? l : max, allLevels[0])

    // Determine signal
    let signal = '均衡'
    let direction = 'neutral'
    if (totalAbove > totalBelow * 1.5) {
        signal = '上方阻力強'
        direction = 'bearish'
    } else if (totalBelow > totalAbove * 1.5) {
        signal = '下方支撐弱'
        direction = 'bullish'  // Price tends to hunt weak side
    }

    // Format for AI consumption
    const formatPrice = (p: number) => p >= 1000 ? `${(p / 1000).toFixed(1)}K` : p.toFixed(0)
    const formatUsd = (u: number) => {
        if (u >= 1e9) return `${(u / 1e9).toFixed(1)}B`
        if (u >= 1e6) return `${(u / 1e6).toFixed(0)}M`
        return `${(u / 1e3).toFixed(0)}K`
    }

    return {
        has_data: true,
        summary: {
            current_price: currentPrice,
            resistance_1: aboveLevels[0]?.price,
            resistance_1_liq: formatUsd(aboveLevels[0]?.liq_usd || 0),
            support_1: belowLevels[0]?.price,
            support_1_liq: formatUsd(belowLevels[0]?.liq_usd || 0),
            total_above_usd: totalAbove,
            total_below_usd: totalBelow,
            max_pain_price: maxPainLevel?.price,
            signal: signal,
            direction: direction,
        }
    }
}
