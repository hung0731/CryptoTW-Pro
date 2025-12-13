import { coinglassRequest } from './coinglass'

// Coinglass BTC Price API
async function fetchBtcPriceFromCoinglass() {
    try {
        const data = await coinglassRequest<any>('/public/v2/index', { symbol: 'BTC' })
        return {
            price: data?.price,
            change_24h: data?.priceChangePercent
        }
    } catch (e) {
        console.error('BTC Price fetch error', e)
        return null
    }
}

// Fear & Greed from Coinglass
async function fetchFearGreedFromCoinglass() {
    try {
        const data = await coinglassRequest<any>('/public/v2/index', { symbol: 'BTC' })
        return {
            value: data?.fearGreedIndex,
            label: data?.fearGreedIndex > 70 ? '貪婪' :
                data?.fearGreedIndex < 30 ? '恐懼' : '中性'
        }
    } catch (e) {
        return null
    }
}

export async function getMarketSnapshot() {
    const [
        btcIndex,
        fundingRates,
        globalLongShort,
        topLongShort,
        openInterest,
        liquidations,
        exchangeReserve,
        heatmap,
        hyperliquidWhales
    ] = await Promise.all([
        coinglassRequest<any>('/public/v2/index', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/funding', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/long-short-ratio/global-account', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/long-short-ratio/top-account-ratio', { symbol: 'BTC' }),
        coinglassRequest<any>('/public/v2/open_interest', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/liquidation/history', { symbol: 'BTC', interval: '1h' }),
        coinglassRequest<any[]>('/public/v2/exchange/balance', { symbol: 'BTC' }),
        coinglassRequest<any>('/public/v2/liquidation-heatmap', { symbol: 'BTC', range: '3d' }).catch(() => null),
        coinglassRequest<any[]>('/public/v2/hyperliquid/whale-position', {}).catch(() => null)
    ])

    // Calculate exchange reserve totals
    const totalReserve = exchangeReserve?.reduce((sum: number, ex: any) => sum + (ex.balance || 0), 0) || 0
    const netChange24h = exchangeReserve?.reduce((sum: number, ex: any) => sum + (ex.changeH24 || 0), 0) || 0

    // Consolidate Data with full Coinglass integration
    return {
        timestamp: new Date().toISOString(),

        // 價格動能
        btc: {
            price: btcIndex?.price,
            change_24h_percent: btcIndex?.priceChangePercent,
            high_24h: btcIndex?.high24h,
            low_24h: btcIndex?.low24h,
        },

        // 市場情緒
        sentiment: {
            fear_greed_index: btcIndex?.fearGreedIndex,
            fear_greed_label: btcIndex?.fearGreedIndex > 70 ? '貪婪' :
                btcIndex?.fearGreedIndex < 30 ? '恐懼' : '中性',
            btc_dominance: btcIndex?.btcDominance,
        },

        // 資金熱度
        capital_flow: {
            funding_rate: fundingRates?.[0]?.uMarginList?.[0]?.rate,
            funding_rate_annualized: (fundingRates?.[0]?.uMarginList?.[0]?.rate || 0) * 3 * 365,
            open_interest: openInterest?.openInterest,
            open_interest_change_24h: openInterest?.h24Change,
            open_interest_change_4h: openInterest?.h4Change,
            open_interest_change_1h: openInterest?.h1Change,
        },

        // 多空比
        long_short: {
            global_ratio: globalLongShort?.[0]?.longShortRatio,
            global_long_rate: globalLongShort?.[0]?.longRate,
            whale_ratio: topLongShort?.[0]?.longShortRatio,
            whale_long_rate: topLongShort?.[0]?.longRate,
            divergence: Math.abs((topLongShort?.[0]?.longShortRatio || 1) - (globalLongShort?.[0]?.longShortRatio || 1)),
        },

        // 爆倉數據
        liquidations: {
            long_liquidated_1h: liquidations?.[0]?.longLiquidationUsd,
            short_liquidated_1h: liquidations?.[0]?.shortLiquidationUsd,
            total_liquidated_1h: (liquidations?.[0]?.longLiquidationUsd || 0) + (liquidations?.[0]?.shortLiquidationUsd || 0),
        },

        // 交易所儲備
        exchange_reserve: {
            total_btc: totalReserve,
            net_change_24h: netChange24h,
            flow_direction: netChange24h > 0 ? '流入' : netChange24h < 0 ? '流出' : '持平',
        },

        // 爆倉熱力圖 (簡化版)
        liquidation_zones: heatmap ? {
            data_available: true,
            // 如果 API 返回具體數據再解析
        } : {
            data_available: false,
        },

        // Hyperliquid 鯨魚
        whales: {
            hyperliquid_positions: hyperliquidWhales?.slice(0, 5) || [],
            has_data: (hyperliquidWhales?.length || 0) > 0,
        }
    }
}


