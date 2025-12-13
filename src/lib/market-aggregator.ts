import { coinglassV4Request } from './coinglass'

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
    console.log('[MarketAggregator] Fear & Greed:', fearGreed?.[0])
    console.log('[MarketAggregator] Funding Rates:', fundingRates?.[0])
    console.log('[MarketAggregator] ETF Flows:', etfFlows?.[0])
    console.log('[MarketAggregator] Taker Buy/Sell:', takerBuySell?.[0])

    // Calculate aggregated OI
    const totalOI = openInterest?.reduce((sum: number, ex: any) => sum + (ex.openInterest || 0), 0) || 0

    // Consolidate Data
    return {
        timestamp: new Date().toISOString(),

        // 價格動能 (from CoinGecko)
        btc: {
            price: btcPrice?.price,
            change_24h_percent: btcPrice?.change_24h,
        },

        // 市場情緒 (from Coinglass)
        sentiment: {
            fear_greed_index: fearGreed?.[0]?.value,
            fear_greed_label: fearGreed?.[0]?.value >= 75 ? '極度貪婪' :
                fearGreed?.[0]?.value >= 55 ? '貪婪' :
                    fearGreed?.[0]?.value >= 45 ? '中性' :
                        fearGreed?.[0]?.value >= 25 ? '恐懼' : '極度恐懼',
        },

        // 資金熱度 (from Coinglass V4)
        capital_flow: {
            funding_rate: fundingRates?.[0]?.stablecoin_margin_list?.[0]?.funding_rate,
            funding_rate_exchange: fundingRates?.[0]?.stablecoin_margin_list?.[0]?.exchange,
            open_interest_total: totalOI,
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

        // Hyperliquid 鯨魚 (from Coinglass V4)
        whales: {
            hyperliquid_alerts: hyperliquidWhales?.slice(0, 5) || [],
            has_data: (hyperliquidWhales?.length || 0) > 0,
        }
    }
}





