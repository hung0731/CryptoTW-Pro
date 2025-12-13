import { NextRequest, NextResponse } from 'next/server'

// Unified Crypto Price Prediction API
// Supports: BTC, ETH from Polymarket
// Cache for 5 minutes
let priceCache: { [key: string]: { data: any, timestamp: number } } = {}
const CACHE_TTL = 5 * 60 * 1000

interface PriceTarget {
    price: number
    label: string
    probability: number
    direction: 'up' | 'down'
    volume: number
    closed: boolean
}

const CRYPTO_CONFIG: { [key: string]: { slug: string, name: string, icon: string } } = {
    btc: {
        slug: 'what-price-will-bitcoin-hit-in-2025',
        name: 'BTC 2025',
        icon: '🔶'
    },
    eth: {
        slug: 'what-price-will-ethereum-hit-in-2025',
        name: 'ETH 2025',
        icon: '💎'
    }
}

async function fetchPriceData(crypto: string) {
    const config = CRYPTO_CONFIG[crypto]
    if (!config) return null

    try {
        const res = await fetch(
            `https://gamma-api.polymarket.com/events?slug=${config.slug}`,
            { next: { revalidate: 300 } }
        )
        const events = await res.json()

        if (!events || events.length === 0) return null

        const event = events[0]
        const markets = event.markets || []

        // Parse each market into price targets
        const priceTargets: PriceTarget[] = markets
            .filter((m: any) => m.active && !m.archived)
            .map((m: any) => {
                const groupTitle = m.groupItemTitle || ''

                // Parse direction: check for ↑/↓ or "reach"/"dip"
                const isDown = groupTitle.includes('↓') || m.question?.toLowerCase().includes('dip')

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
            .filter((t: PriceTarget) => t.price > 0 && !t.closed)
            .sort((a: PriceTarget, b: PriceTarget) => b.probability - a.probability)

        // Group by direction
        const bullish = priceTargets.filter(t => t.direction === 'up').sort((a, b) => a.price - b.price)
        const bearish = priceTargets.filter(t => t.direction === 'down').sort((a, b) => b.price - a.price)

        // Find top 3 most likely outcomes
        const topPredictions = priceTargets.slice(0, 3)

        return {
            crypto,
            name: config.name,
            icon: config.icon,
            slug: event.slug,
            totalVolume: event.volume,
            bullish,
            bearish,
            topPredictions
        }
    } catch (error) {
        console.error(`Crypto Price API Error (${crypto}):`, error)
        return null
    }
}

export async function GET(req: NextRequest) {
    const crypto = req.nextUrl.searchParams.get('crypto') || 'btc'
    const now = Date.now()

    // Return cache if fresh
    if (priceCache[crypto] && now - priceCache[crypto].timestamp < CACHE_TTL) {
        return NextResponse.json(priceCache[crypto].data)
    }

    const data = await fetchPriceData(crypto)

    if (!data) {
        return NextResponse.json({ error: 'No data' }, { status: 404 })
    }

    // Cache result
    priceCache[crypto] = { data, timestamp: now }

    return NextResponse.json(data)
}
