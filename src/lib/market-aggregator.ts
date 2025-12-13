import { coinglassRequest } from './coinglass'

// Helper to fetch CoinGecko Data (Reused logic to avoid circular deps with API routes)
async function fetchCoinGeckoGlobal() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/global', { next: { revalidate: 300 } })
        const json = await res.json()
        return json.data
    } catch (e) {
        console.error('CoinGecko Global Error', e)
        return null
    }
}

async function fetchFearGreed() {
    try {
        const res = await fetch('https://api.alternative.me/fng/')
        const json = await res.json()
        return json.data?.[0]
    } catch (e) {
        return null
    }
}

export async function getMarketSnapshot() {
    const [
        globalData,
        fgi,
        fundingRates,
        globalLongShort,
        topLongShort,
        hyperliquidWhales
    ] = await Promise.all([
        fetchCoinGeckoGlobal(),
        fetchFearGreed(),
        coinglassRequest<any[]>('/public/v2/funding', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/long-short-ratio/global-account', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/long-short-ratio/top-account-ratio', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/liquidation/history', { symbol: 'BTC', interval: '4h' }) // Keep liquidations
        // Note: Hyperliquid endpoint might not be available on public v2 free tier, trying standard L/S first as proxy for whales
    ])

    // Consolidate Data
    return {
        timestamp: new Date().toISOString(),
        market: {
            btc_dominance: globalData?.market_cap_percentage?.btc,
            total_market_cap: globalData?.total_market_cap?.usd,
            total_volume: globalData?.total_volume?.usd,
        },
        sentiment: {
            fgi_value: fgi?.value,
            fgi_label: fgi?.value_classification
        },
        derivatives: {
            funding_rate: fundingRates?.[0]?.uMarginList?.[0]?.rate,
            long_short: {
                global_ratio: globalLongShort?.[0]?.longShortRatio,
                whale_ratio: topLongShort?.[0]?.longShortRatio, // Top Accounts = Whales
                global_long_rate: globalLongShort?.[0]?.longRate,
                whale_long_rate: topLongShort?.[0]?.longRate,
            },
            liquidations_4h: hyperliquidWhales?.[0]
        }
    }
}
