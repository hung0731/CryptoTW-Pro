import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { cachedCoinglassV4Request } from '@/lib/coinglass'
import { logger } from '@/lib/logger'

// ============================================================================
// Service: Seasonality Heatmap
// ============================================================================
const TIMEFRAME_SEASONALITY = 'binance:seasonality:btc'

export interface SeasonalityData {
    years: number[]
    months: { [year: number]: { [month: number]: number } }
    stats: { [month: number]: { avg: number; winRate: number } }
}

export async function getSeasonalityData(): Promise<SeasonalityData> {
    // 1. Check Cache
    const cached = await getCache<SeasonalityData>(TIMEFRAME_SEASONALITY)
    if (cached) return cached

    // 2. Fetch
    const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1M&limit=1000')
    if (!res.ok) throw new Error(`Binance API Error: ${res.status}`)

    const rawData = await res.json()
    const data: SeasonalityData = { years: [], months: {}, stats: {} }

    rawData.forEach((candle: any[]) => {
        const date = new Date(candle[0])
        const year = date.getUTCFullYear()
        const month = date.getUTCMonth() + 1
        const open = parseFloat(candle[1])
        const close = parseFloat(candle[4])

        if (!data.months[year]) {
            data.months[year] = {}
            if (!data.years.includes(year)) data.years.push(year)
        }
        data.months[year][month] = ((close - open) / open) * 100
    })

    data.years.sort((a, b) => b - a)

    for (let m = 1; m <= 12; m++) {
        let totalReturn = 0, wins = 0, count = 0
        data.years.forEach(year => {
            const val = data.months[year]?.[m]
            if (val !== undefined) {
                totalReturn += val
                if (val > 0) wins++
                count++
            }
        })
        data.stats[m] = {
            avg: count > 0 ? totalReturn / count : 0,
            winRate: count > 0 ? (wins / count) * 100 : 0
        }
    }

    // 3. Set Cache
    await setCache(TIMEFRAME_SEASONALITY, data, CacheTTL.MEDIUM)
    return data
}

// ============================================================================
// Service: Halving Cycles
// ============================================================================
const CACHE_KEY_HALVING = 'halving:current-cycle'
const HALVING_DATE_2024 = new Date('2024-04-20').getTime()
const HALVING_PRICE_2024 = 63900

export async function getHalvingData() {
    // 1. Check Cache
    const cached = await getCache(CACHE_KEY_HALVING)
    if (cached) return cached

    // 2. Fetch Price
    const startTime = new Date('2024-04-01').getTime()
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&limit=1000`)
    if (!res.ok) throw new Error('Binance API Error')

    const rawData = await res.json()
    const currentCycleData = rawData.map((k: any[]) => {
        const time = k[0]
        const close = parseFloat(k[4])
        const diffDays = Math.floor((time - HALVING_DATE_2024) / (1000 * 60 * 60 * 24))
        return {
            day: diffDays,
            roi: close / HALVING_PRICE_2024,
            price: close,
            date: time
        }
    }).filter((d: any) => d.day >= -20)

    // 3. Fetch Block Height
    let currentBlockHeight = 0
    try {
        const blockRes = await fetch('https://blockchain.info/q/getblockcount', { next: { revalidate: 60 } })
        if (blockRes.ok) {
            const text = await blockRes.text()
            currentBlockHeight = parseInt(text, 10)
        }
    } catch (e) {
        const daysSinceHalving = (Date.now() - HALVING_DATE_2024) / (1000 * 60 * 60 * 24)
        currentBlockHeight = 840000 + Math.floor(daysSinceHalving * 144)
    }

    const responseData = {
        cycle: {
            name: 'Current (2024)',
            halvingDate: '2024-04-20',
            data: currentCycleData
        },
        currentBlockHeight
    }

    // 4. Set Cache
    await setCache(CACHE_KEY_HALVING, responseData, CacheTTL.MEDIUM)
    return responseData
}

// ============================================================================
// Service: Divergence Screener
// ============================================================================
const CACHE_KEY_DIVERGENCE = 'alpha:divergence-screener-v2'

export interface DivergenceItem {
    symbol: string
    price: number
    priceChange: number
    oiChange: number
    volume: number
    score: number
    signal: 'absorption' | 'distribution' | 'overheated' | 'neutral'
}

export async function getDivergenceData() {
    // 1. Check Cache
    const cached = await getCache<DivergenceItem[]>(CACHE_KEY_DIVERGENCE)
    if (cached) return { data: cached, isDemo: false }

    try {
        // 2. Fetch Binance Top List
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/24hr')
        if (!binanceRes.ok) throw new Error('Binance API Fail')
        const binanceData = await binanceRes.json()

        const topCoins = binanceData
            .filter((t: any) => t.symbol.endsWith('USDT'))
            .filter((t: any) => !['USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT'].includes(t.symbol))
            .filter((t: any) => parseFloat(t.quoteVolume) > 50000000)
            .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 50)

        // 3. Fetch OI Data (Try Coinglass)
        const oiDataMap: Record<string, number> = {}
        try {
            const oiRank = await cachedCoinglassV4Request<any[]>('/api/futures/open-interest/rank', { interval: 'h24' })
            if (oiRank && Array.isArray(oiRank)) {
                oiRank.forEach(item => oiDataMap[item.symbol] = item.h24Change)
            }
        } catch (e) { /* ignore */ }

        const results: DivergenceItem[] = topCoins.map((t: any) => {
            const symbol = t.symbol.replace('USDT', '')
            const priceChange = parseFloat(t.priceChangePercent)
            const oiChange = oiDataMap[symbol] ?? 0

            let signal: any = 'neutral'
            let score = 0

            // Logic: Absorption
            if (priceChange < -2 && oiChange > 5) {
                signal = 'absorption'
                score = Math.abs(priceChange) + Math.abs(oiChange)
            }
            // Distribution
            else if (priceChange > 2 && oiChange < -5) {
                signal = 'distribution'
                score = Math.abs(priceChange) + Math.abs(oiChange)
            }
            // Overheated
            else if (priceChange > 5 && oiChange > 10) {
                signal = 'overheated'
                score = Math.abs(priceChange) + Math.abs(oiChange)
            }

            return {
                symbol,
                price: parseFloat(t.lastPrice),
                priceChange,
                oiChange,
                volume: parseFloat(t.quoteVolume),
                score,
                signal
            }
        })
            .filter((item: DivergenceItem) => item.signal !== 'neutral')
            .sort((a: any, b: any) => b.score - a.score)

        // 4. Fallback Demo Mode
        if (results.length === 0) {
            const demoSignals = generateDemoSignals(topCoins)
            await setCache(CACHE_KEY_DIVERGENCE, demoSignals, CacheTTL.FAST)
            return { data: demoSignals, isDemo: true }
        }

        await setCache(CACHE_KEY_DIVERGENCE, results, CacheTTL.FAST)
        return { data: results, isDemo: false }

    } catch (error) {
        logger.error('Divergence Fetch Error:', error as Error, { feature: 'market-data' })
        throw error
    }
}

function generateDemoSignals(topCoins: any[]): DivergenceItem[] {
    const signals: DivergenceItem[] = topCoins.slice(0, 5).map((t: any, i: number) => {
        const isBullish = i % 2 === 0
        const priceChange = parseFloat(t.priceChangePercent)
        const mockOiChange = isBullish ? (Math.abs(priceChange) + 5) : -(Math.abs(priceChange) + 5)
        return {
            symbol: t.symbol.replace('USDT', ''),
            price: parseFloat(t.lastPrice),
            priceChange: priceChange,
            oiChange: mockOiChange,
            volume: parseFloat(t.quoteVolume),
            score: Math.abs(priceChange) + Math.abs(mockOiChange),
            signal: isBullish ? 'absorption' : 'distribution'
        } as DivergenceItem
    })

    if (topCoins.length > 5) {
        const t = topCoins[5]
        signals.push({
            symbol: t.symbol.replace('USDT', ''),
            price: parseFloat(t.lastPrice),
            priceChange: 8.5,
            oiChange: 12.0,
            volume: parseFloat(t.quoteVolume),
            score: 20.5,
            signal: 'overheated'
        } as DivergenceItem)
    }
    return signals
}
