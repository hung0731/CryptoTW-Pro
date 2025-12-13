import { coinglassV4Request } from './coinglass'
import { fetchBinanceRSI } from './technical-analysis'

// CoinGecko for BTC price (more reliable)
async function fetchBtcPrice() {
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            { next: { revalidate: 60 } }
        )
        const json = await res.json()
        return {
            price: json.bitcoin?.usd,
            change_24h: json.bitcoin?.usd_24h_change
        }
    } catch (e) {
        console.error('CoinGecko BTC Price fetch error', e)
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
        hyperliquidWhales
    ] = await Promise.all([
        fetchBtcPrice(),
        fetchBinanceRSI('BTCUSDT', '1h'),
        // 恐懼貪婪指數 (from Coinglass)
        coinglassV4Request<any[]>('/api/index/fear-greed-history', { limit: 1 }),
        // 資金費率
        coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }),
        // 全球多空比
        coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', { symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1 }),
        // 大戶多空比
        coinglassV4Request<any[]>('/api/futures/top-long-short-account-ratio/history', { symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1 }),
        // 持倉量
        coinglassV4Request<any[]>('/api/futures/open-interest/exchange-list', { symbol: 'BTC' }),
        // 爆倉
        coinglassV4Request<any[]>('/api/futures/liquidation/history', { symbol: 'BTC', interval: '1h', limit: 1 }),
        // 主動買賣比
        coinglassV4Request<any>('/api/futures/taker-buy-sell-volume/exchange-list', { symbol: 'BTC', range: '1h' }),
        // BTC ETF 資金流
        coinglassV4Request<any[]>('/api/etf/bitcoin/flow-history', { limit: 1 }).catch(() => null),
        // Coinbase 溢價
        coinglassV4Request<any[]>('/api/coinbase-premium-index', { limit: 1 }).catch(() => null),
        // Hyperliquid 鯨魚
        coinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}).catch(() => null)
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





