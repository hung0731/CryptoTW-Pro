import { coinglassRequest } from './coinglass'

// CoinGecko as fallback for BTC price
async function fetchBtcPriceFromCoinGecko() {
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

// Fear & Greed from Alternative.me
async function fetchFearGreed() {
    try {
        const res = await fetch('https://api.alternative.me/fng/', { next: { revalidate: 300 } })
        const json = await res.json()
        const data = json.data?.[0]
        return {
            value: parseInt(data?.value || '50'),
            label: data?.value_classification || '中性'
        }
    } catch (e) {
        return { value: 50, label: '中性' }
    }
}

export async function getMarketSnapshot() {
    const [
        btcPrice,
        fgi,
        fundingRates,
        globalLongShort,
        topLongShort,
        openInterest,
        liquidations,
        hyperliquidWhales
    ] = await Promise.all([
        fetchBtcPriceFromCoinGecko(),
        fetchFearGreed(),
        coinglassRequest<any[]>('/public/v2/funding', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/long-short-ratio/global-account', { symbol: 'BTC', interval: '1h' }),
        coinglassRequest<any[]>('/public/v2/long-short-ratio/top-account-ratio', { symbol: 'BTC', interval: '1h' }),
        coinglassRequest<any>('/public/v2/open_interest', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/liquidation/history', { symbol: 'BTC', interval: '1h' }),
        coinglassRequest<any[]>('/public/v2/hyperliquid/whale-position', {}).catch(() => null)
    ])

    // Debug logging
    console.log('[MarketAggregator] BTC Price:', btcPrice)
    console.log('[MarketAggregator] Funding Rates:', fundingRates?.[0]?.uMarginList?.[0])
    console.log('[MarketAggregator] Long/Short:', globalLongShort?.[0])
    console.log('[MarketAggregator] Open Interest:', openInterest)

    // Consolidate Data
    return {
        timestamp: new Date().toISOString(),

        // 價格動能 (from CoinGecko)
        btc: {
            price: btcPrice?.price,
            change_24h_percent: btcPrice?.change_24h,
        },

        // 市場情緒 (from Alternative.me)
        sentiment: {
            fear_greed_index: fgi?.value,
            fear_greed_label: fgi?.label,
        },

        // 資金熱度 (from Coinglass)
        capital_flow: {
            funding_rate: fundingRates?.[0]?.uMarginList?.[0]?.rate,
            funding_rate_annualized: (fundingRates?.[0]?.uMarginList?.[0]?.rate || 0) * 3 * 365,
            open_interest: openInterest?.openInterest,
            open_interest_change_24h: openInterest?.h24Change,
        },

        // 多空比 (from Coinglass)
        long_short: {
            global_ratio: globalLongShort?.[0]?.longShortRatio,
            global_long_rate: globalLongShort?.[0]?.longRate,
            whale_ratio: topLongShort?.[0]?.longShortRatio,
            whale_long_rate: topLongShort?.[0]?.longRate,
        },

        // 爆倉數據 (from Coinglass)
        liquidations: {
            long_liquidated_1h: liquidations?.[0]?.longLiquidationUsd,
            short_liquidated_1h: liquidations?.[0]?.shortLiquidationUsd,
            total_liquidated_1h: (liquidations?.[0]?.longLiquidationUsd || 0) + (liquidations?.[0]?.shortLiquidationUsd || 0),
        },

        // Hyperliquid 鯨魚 (from Coinglass)
        whales: {
            hyperliquid_positions: hyperliquidWhales?.slice(0, 5) || [],
            has_data: (hyperliquidWhales?.length || 0) > 0,
        }
    }
}



