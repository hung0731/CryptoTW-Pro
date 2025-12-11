import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 1800 // 30 minutes cache

export async function GET(req: NextRequest) {
    try {
        // defined events configuration
        const eventsConfig = [
            {
                slug: 'fed-decision-in-january',
                title: '美國聯準會(Fed) 會在 1 月降息嗎',
                id_override: 'fed-jan'
            },
            {
                slug: 'fed-decision-in-march-885',
                title: '美國聯準會(Fed) 會在 3 月降息嗎',
                id_override: 'fed-mar'
            },
            {
                slug: 'fed-decision-in-april',
                title: '美國聯準會(Fed) 會在 4 月降息嗎',
                id_override: 'fed-apr'
            }
        ]

        // Fetch all events in parallel
        const responses = await Promise.all(
            eventsConfig.map(config =>
                fetch(`https://gamma-api.polymarket.com/events?slug=${config.slug}`, {
                    next: { revalidate: 1800 }
                }).then(res => res.json().catch(() => null))
            )
        )

        const markets = responses.map((data, index) => {
            if (!data || data.length === 0 || !data[0].markets) return null

            const eventData = data[0]
            const config = eventsConfig[index]
            const eventImage = eventData.image

            // Process outcomes
            const groupOutcomes = eventData.markets.map((m: any) => {
                let probability = 0
                try {
                    const prices = JSON.parse(m.outcomePrices)
                    probability = parseFloat(prices[0]) * 100
                } catch (e) {
                    probability = 0
                }
                return {
                    id: m.id,
                    label: m.groupItemTitle || m.question,
                    probability: probability.toFixed(1),
                    color: probability > 50 ? 'green' : 'neutral'
                }
            }).sort((a: any, b: any) => parseFloat(b.probability) - parseFloat(a.probability))

            return {
                id: config.id_override,
                title: config.title,
                image: eventImage,
                volume: eventData.volume,
                type: 'group',
                groupOutcomes: groupOutcomes
            }
        }).filter(Boolean)

        return NextResponse.json({ markets })

    } catch (e: any) {
        console.error('Prediction API Error:', e)
        return NextResponse.json({ error: 'Failed to fetch prediction markets' }, { status: 500 })
    }
}

