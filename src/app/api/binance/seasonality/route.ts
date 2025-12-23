import { NextResponse } from 'next/server'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const revalidate = 3600 // 1 hour

const CACHE_KEY = 'binance:seasonality:btc'

interface SeasonalityData {
    years: number[]
    months: {
        [year: number]: {
            [month: number]: number // percentage return
        }
    }
    stats: {
        [month: number]: {
            avg: number
            winRate: number
        }
    }
}

export async function GET() {
    try {
        // Check cache
        const cached = await getCache<SeasonalityData>(CACHE_KEY)
        if (cached) {
            return NextResponse.json({ data: cached, source: 'cache' })
        }

        // Fetch from Binance (Public API, no key needed)
        // limit=1000 guarantees we get data back to 2017 (12*8 = 96), actually way more.
        // Binance monthly klines start from 2017-08 for BTCUSDT usually, 
        // but let's try just standard endpoint.
        const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1M&limit=1000')

        if (!res.ok) {
            throw new Error(`Binance API Error: ${res.status}`)
        }

        const rawData = await res.json()
        // Format: [Open Time, Open, High, Low, Close, Volume, Close Time, ...]

        const data: SeasonalityData = {
            years: [],
            months: {},
            stats: {}
        }

        // Process data
        rawData.forEach((candle: any[]) => {
            const openTime = candle[0]
            const open = parseFloat(candle[1])
            const close = parseFloat(candle[4])

            const date = new Date(openTime)
            const year = date.getUTCFullYear()
            const month = date.getUTCMonth() + 1 // 1-12

            if (!data.months[year]) {
                data.months[year] = {}
                if (!data.years.includes(year)) {
                    data.years.push(year)
                }
            }

            const percentChange = ((close - open) / open) * 100
            data.months[year][month] = percentChange
        })

        // Sort years descending (newest first)
        data.years.sort((a, b) => b - a)

        // Calculate Stats (Avg Return & Win Rate per Month)
        for (let m = 1; m <= 12; m++) {
            let totalReturn = 0
            let wins = 0
            let count = 0

            data.years.forEach(year => {
                const val = data.months[year]?.[m]
                // 排除當前年份未發生的月份 (undefined)
                // 排除當前正在進行的月份？通常包含，因為是 "Month to Date"
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

        // Cache for 1 hour (Fast access)
        await setCache(CACHE_KEY, data, CacheTTL.MEDIUM)

        return NextResponse.json({ data })

    } catch (error) {
        console.error('Seasonality API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch seasonality data' }, { status: 500 })
    }
}
