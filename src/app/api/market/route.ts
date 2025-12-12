import { NextResponse } from 'next/server'

// In-memory cache
let marketCache: { data: any, timestamp: number } | null = null
let fgiCache: { data: any, timestamp: number } | null = null
let globalCache: { data: any, timestamp: number } | null = null

const MARKET_CACHE_TTL = 10 * 60 * 1000 // 10 minutes
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

// Fetch OKX market data
async function fetchOkxMarketData() {
    try {
        const res = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT')
        const json = await res.json()

        if (json.code === '0' && json.data) {
            const usdtPairs = json.data.filter((t: any) => t.instId.endsWith('-USDT'))
            const withChange = usdtPairs.map((t: any) => {
                const last = parseFloat(t.last)
                const open = parseFloat(t.open24h)
                const change = open > 0 ? ((last - open) / open * 100) : 0
                return {
                    symbol: t.instId.replace('-USDT', ''),
                    lastPrice: t.last,
                    priceChangePercent: change.toFixed(2)
                }
            })
            const ignored = ['USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP']
            const filtered = withChange.filter((t: any) => !ignored.includes(t.symbol))
            filtered.sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
            return {
                gainers: filtered.slice(0, 5),
                losers: filtered.slice(-5).reverse()
            }
        }
        return null
    } catch (e) {
        console.error('[Market API] OKX Error:', e)
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
        console.log('[Market API] Fetching fresh OKX data...')
        const data = await fetchOkxMarketData()
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
