import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 1800 // 30 minutes cache

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = searchParams.get('limit') || '20'

        // 1. Fetch Pinned Event (Fed Decision)
        const pinnedSlug = 'fed-decision-in-january'
        const pinnedUrl = `https://gamma-api.polymarket.com/events?slug=${pinnedSlug}`

        // 2. Fetch Trending Markets
        const trendingUrl = `https://gamma-api.polymarket.com/markets?limit=${limit}&active=true&closed=false&order=volume&ascending=false`

        const [pinnedRes, trendingRes] = await Promise.all([
            fetch(pinnedUrl, { next: { revalidate: 1800 } }),
            fetch(trendingUrl, { next: { revalidate: 1800 } })
        ])

        let pinnedMarkets: any[] = []
        if (pinnedRes.ok) {
            const pinnedData = await pinnedRes.json()
            if (pinnedData && pinnedData.length > 0 && pinnedData[0].markets) {
                // Determine the image to use (Event image is usually better for grouped markets)
                const eventImage = pinnedData[0].image

                pinnedMarkets = pinnedData[0].markets.map((m: any) => {
                    // Calculate probability
                    let probability = 0
                    try {
                        const prices = JSON.parse(m.outcomePrices)
                        probability = parseFloat(prices[0]) * 100
                    } catch (e) {
                        probability = 50
                    }

                    return {
                        id: m.id,
                        title: m.question,
                        image: eventImage || m.image, // Use event image if available
                        volume: m.volume,
                        probability: probability.toFixed(1),
                        endDate: m.endDate,
                        outcomes: JSON.parse(m.outcomes || '[]')
                    }
                })
            }
        }

        let trendingMarkets: any[] = []
        if (trendingRes.ok) {
            const trendingData = await trendingRes.json()
            trendingMarkets = trendingData.map((m: any) => {
                let probability = 0
                try {
                    const prices = JSON.parse(m.outcomePrices)
                    probability = parseFloat(prices[0]) * 100
                } catch (e) {
                    probability = 50
                }

                return {
                    id: m.id,
                    title: m.question,
                    image: m.image,
                    volume: m.volume,
                    probability: probability.toFixed(1),
                    endDate: m.endDate,
                    outcomes: JSON.parse(m.outcomes || '[]')
                }
            })
        }

        // 3. Merge and Dedup
        const pinnedIds = new Set(pinnedMarkets.map(m => m.id))
        const finalMarkets = [
            ...pinnedMarkets,
            ...trendingMarkets.filter(m => !pinnedIds.has(m.id))
        ]

        return NextResponse.json({ markets: finalMarkets })

    } catch (e: any) {
        console.error('Prediction API Error:', e)
        return NextResponse.json({ error: 'Failed to fetch prediction markets' }, { status: 500 })
    }
}
