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
    // 1. Parallel Fetching
    const [
        globalData,
        fgi,
        fundingRates,
        longShortRatio,
        liquidations
    ] = await Promise.all([
        fetchCoinGeckoGlobal(),
        fetchFearGreed(),
        coinglassRequest<any[]>('/public/v2/funding', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/long-short-account-ratio', { symbol: 'BTC' }),
        coinglassRequest<any[]>('/public/v2/liquidation/history', { symbol: 'BTC', interval: '4h' })
    ])

    // 2. Synthesize Data
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
            btc_funding_rate: fundingRates?.[0]?.uMarginList?.[0]?.rate || 'Unknown', // Primary exchange
            long_short_ratio: longShortRatio?.[0]?.longShortRatio,
            recent_liquidations_4h: liquidations?.[0] // Last 4h bar
        }
    }
}
