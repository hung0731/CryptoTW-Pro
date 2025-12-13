import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 1800 // 30 minutes cache

export async function GET(req: NextRequest) {
    try {
        // defined events configuration
        const eventsConfig = [
            {
                slug: 'fed-decision-in-january',
                title: '🇺🇸 美國會在 1 月降息嗎',
                id_override: 'fed-jan'
            },
            {
                slug: 'fed-decision-in-march-885',
                title: '🇺🇸 美國會在 3 月降息嗎',
                id_override: 'fed-mar'
            },
            {
                slug: 'fed-decision-in-april',
                title: '🇺🇸 美國會在 4 月降息嗎',
                id_override: 'fed-apr'
            },
            {
                slug: 'will-china-invade-taiwan-in-2025',
                title: '🇹🇼 中國會在 2025 年入侵台灣嗎',
                id_override: 'taiwan-2025'
            },
            {
                slug: 'will-china-invade-taiwan-before-2027',
                title: '🇹🇼 中國會在 2026 年入侵台灣嗎',
                id_override: 'taiwan-2026'
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

            // Translation map for outcomes
            const translations: Record<string, string> = {
                'No change': '維持不變',
                '25 bps decrease': '降息 1 碼',
                '50+ bps decrease': '降息 2 碼以上',
                '25 bps increase': '升息 1 碼',
                '50+ bps increase': '升息 2 碼以上',
                'Yes': '是',
                'No': '否'
            }

            // Process outcomes
            const outcomes = eventData.markets.map((m: any) => {
                let probability = 0
                try {
                    const prices = JSON.parse(m.outcomePrices)
                    probability = parseFloat(prices[0]) // 0-1 scale
                } catch (e) {
                    probability = 0
                }
                const rawLabel = m.groupItemTitle || m.question
                return {
                    id: m.id,
                    name: translations[rawLabel] || rawLabel,
                    probability: probability // 0-1 scale for frontend
                }
            }).sort((a: any, b: any) => b.probability - a.probability)

            return {
                id: config.id_override,
                question: config.title,
                slug: config.slug,
                icon: eventImage,
                volume: eventData.volume,
                type: 'group',
                outcomes: outcomes,
                category: '總經'
            }
        }).filter(Boolean)

        return NextResponse.json({ markets })

    } catch (e: any) {
        console.error('Prediction API Error:', e)
        return NextResponse.json({ error: 'Failed to fetch prediction markets' }, { status: 500 })
    }
}

