import { NextResponse } from 'next/server'

// BTC Price Prediction from Polymarket
// Cache for 5 minutes
let btcPriceCache: { data: any, timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

interface PriceTarget {
    price: number
    label: string
    probability: number
    direction: 'up' | 'down'
    volume: number
    closed: boolean
}

export async function GET() {
    const now = Date.now()

    // Return cache if fresh
    if (btcPriceCache && now - btcPriceCache.timestamp < CACHE_TTL) {
        return NextResponse.json(btcPriceCache.data)
    }

    try {
        const res = await fetch(
            'https://gamma-api.polymarket.com/events?slug=what-price-will-bitcoin-hit-in-2025',
            { next: { revalidate: 300 } }
        )
        const events = await res.json()

        if (!events || events.length === 0) {
            return NextResponse.json({ error: 'No data' }, { status: 404 })
        }

        const event = events[0]
        const markets = event.markets || []

        // Parse each market into price targets
        const priceTargets: PriceTarget[] = markets
            .filter((m: any) => m.active && !m.archived)
            .map((m: any) => {
                const groupTitle = m.groupItemTitle || ''

                // Parse direction: ↑ means bullish target, ↓ means bearish dip
                const isUp = groupTitle.includes('↑') || (!groupTitle.includes('↓') && m.question?.includes('reach'))
                const isDown = groupTitle.includes('↓') || m.question?.includes('dip')

                // Extract price from title
                const priceMatch = groupTitle.match(/[\d,]+/) || m.question?.match(/\$([\d,]+)/)
                const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0

                // Get probability (Yes price)
                let probability = 0
                try {
                    const prices = JSON.parse(m.outcomePrices || '[]')
                    probability = parseFloat(prices[0]) || 0
                } catch {
                    probability = 0
                }

                return {
                    price,
                    label: `$${price.toLocaleString()}`,
                    probability,
                    direction: isDown ? 'down' : 'up',
                    volume: m.volumeNum || 0,
                    closed: m.closed || false
                }
            })
            .filter((t: PriceTarget) => t.price > 0 && !t.closed) // Only active markets
            .sort((a: PriceTarget, b: PriceTarget) => b.probability - a.probability) // Sort by probability

        // Group by direction
        const bullish = priceTargets.filter(t => t.direction === 'up').sort((a, b) => a.price - b.price)
        const bearish = priceTargets.filter(t => t.direction === 'down').sort((a, b) => b.price - a.price)

        // Find top 3 most likely outcomes
        const topPredictions = priceTargets.slice(0, 3)

        const result = {
            title: 'BTC 2025 價格預測',
            slug: event.slug,
            totalVolume: event.volume,
            bullish,
            bearish,
            topPredictions,
            updatedAt: new Date().toISOString()
        }

        // Cache result
        btcPriceCache = { data: result, timestamp: now }

        return NextResponse.json(result)
    } catch (error) {
        console.error('BTC Price Prediction API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
}
