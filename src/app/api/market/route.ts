import { NextResponse } from 'next/server'

// In-memory cache
let marketCache: { data: any, timestamp: number } | null = null
let fgiCache: { data: any, timestamp: number } | null = null
let globalCache: { data: any, timestamp: number } | null = null

const MARKET_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const FGI_CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const GLOBAL_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Format large numbers (e.g. 1.5T, 180B, 50M)
function formatNumber(num: number): string {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e8) return `${(num / 1e8).toFixed(1)}億`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    return num.toFixed(0)
}

// Fetch CoinGecko Market Data (with images)
async function fetchCoinGeckoMarketData() {
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
            { next: { revalidate: 300 } }
        )
        const json = await res.json()

        if (Array.isArray(json)) {
            // Filter out stablecoins
            const ignored = ['usdt', 'usdc', 'fdusd', 'tusd', 'busd', 'dai', 'usdp', 'frax', 'usdd']
            const filtered = json.filter((c: any) => !ignored.includes(c.id))

            // Sort by 24h price change
            const sorted = [...filtered].sort((a: any, b: any) =>
                (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
            )

            const gainers = sorted.slice(0, 10).map((c: any) => ({
                id: c.id,
                symbol: c.symbol,
                name: c.name,
                image: c.image,
                current_price: c.current_price,
                price_change_percentage_24h: c.price_change_percentage_24h || 0,
                market_cap_rank: c.market_cap_rank,
                market_cap: c.market_cap,
                total_volume: c.total_volume
            }))

            const losers = sorted.slice(-10).reverse().map((c: any) => ({
                id: c.id,
                symbol: c.symbol,
                name: c.name,
                image: c.image,
                current_price: c.current_price,
                price_change_percentage_24h: c.price_change_percentage_24h || 0,
                market_cap_rank: c.market_cap_rank,
                market_cap: c.market_cap,
                total_volume: c.total_volume
            }))

            return { gainers, losers }
        }
        return null
    } catch (e) {
        console.error('[Market API] CoinGecko Markets Error:', e)
        return null
    }
}

// Fetch Fear & Greed Index
async function fetchFearGreedIndex() {
    try {
        const res = await fetch('https://api.alternative.me/fng/')
        const json = await res.json()
        if (json.data && json.data.length > 0) {
            const fg = json.data[0]
            const value = parseInt(fg.value)
            let classification = '極度恐懼'
            if (value >= 75) classification = '極度貪婪'
            else if (value >= 55) classification = '貪婪'
            else if (value >= 45) classification = '中立'
            else if (value >= 25) classification = '恐懼'
            return { value: fg.value, classification }
        }
        return null
    } catch (e) {
        console.error('[Market API] FGI Error:', e)
        return null
    }
}

// Fetch CoinGecko Global Data
async function fetchGlobalData() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/global')
        const json = await res.json()
        if (json.data) {
            const d = json.data
            return {
                totalMarketCap: formatNumber(d.total_market_cap.usd),
                totalVolume: formatNumber(d.total_volume.usd),
                totalVolumeRaw: d.total_volume.usd,
                btcDominance: d.market_cap_percentage.btc.toFixed(1),
                btcMarketCap: formatNumber(d.total_market_cap.usd * (d.market_cap_percentage.btc / 100)),
                stablecoinMarketCap: formatNumber((d.market_cap_percentage.usdt + (d.market_cap_percentage.usdc || 0)) / 100 * d.total_market_cap.usd),
                stablecoinDominance: (d.market_cap_percentage.usdt + (d.market_cap_percentage.usdc || 0)).toFixed(1)
            }
        }
        return null
    } catch (e) {
        console.error('[Market API] CoinGecko Error:', e)
        return null
    }
}

export async function GET() {
    const now = Date.now()

    // Check market cache
    if (!marketCache || now - marketCache.timestamp > MARKET_CACHE_TTL) {
        console.log('[Market API] Fetching fresh CoinGecko market data...')
        const data = await fetchCoinGeckoMarketData()
        if (data) marketCache = { data, timestamp: now }
    }

    // Check FGI cache
    if (!fgiCache || now - fgiCache.timestamp > FGI_CACHE_TTL) {
        console.log('[Market API] Fetching fresh FGI data...')
        const data = await fetchFearGreedIndex()
        if (data) fgiCache = { data, timestamp: now }
    }

    // Check global cache
    if (!globalCache || now - globalCache.timestamp > GLOBAL_CACHE_TTL) {
        console.log('[Market API] Fetching fresh CoinGecko global data...')
        const data = await fetchGlobalData()
        if (data) globalCache = { data, timestamp: now }
    }

    return NextResponse.json({
        market: marketCache?.data || null,
        fearGreed: fgiCache?.data || null,
        global: globalCache?.data || null
    })
}
