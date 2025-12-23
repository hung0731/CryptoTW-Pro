import { NextResponse } from 'next/server'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { subDays } from 'date-fns'

export const revalidate = 3600 // 1 hour

const CACHE_KEY = 'halving:current-cycle'
const HALVING_DATE_2024 = new Date('2024-04-20').getTime()
const HALVING_PRICE_2024 = 63900 // Approx close price on halving day

export async function GET() {
    try {
        // Check cache
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached)
        }

        // Fetch daily klines from Binance starting from a bit before halving
        // Start date: 2024-04-01 (approx)
        const startTime = new Date('2024-04-01').getTime()
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&limit=1000`)

        if (!res.ok) {
            throw new Error('Binance API Error')
        }

        const rawData = await res.json()

        const currentCycleData = rawData.map((k: any[]) => {
            const time = k[0]
            const close = parseFloat(k[4])

            // Calculate "Days Since Halving"
            // Day 0 = 2024-04-20
            const diffTime = time - HALVING_DATE_2024
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

            // ROI = Price / HalvingPrice
            const roi = close / HALVING_PRICE_2024

            return {
                day: diffDays,
                roi: roi,
                price: close,
                date: time
            }
        })

        // Filter to reasonable range (e.g. start from -20 days)
        const filteredData = currentCycleData.filter((d: { day: number }) => d.day >= -20)

        const responseData = {
            cycle: {
                name: 'Current (2024)',
                halvingDate: '2024-04-20',
                data: filteredData
            }
        }

        await setCache(CACHE_KEY, responseData, CacheTTL.MEDIUM)

        return NextResponse.json(responseData)

    } catch (error) {
        console.error('Halving API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch halving data' }, { status: 500 })
    }
}
