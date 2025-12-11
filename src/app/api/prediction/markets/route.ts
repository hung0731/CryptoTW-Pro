import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 1800 // 30 minutes cache

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = searchParams.get('limit') || '20'

        // Polymarket Gamma API
        // Fetching markets sorted by volume to get trending ones.
        // We use 'volume' query param if supported or filtering. 
        // Based on research, we can use parameters to filter/sort.
        // Let's try basic fetching first, then sort locally if needed or use known params.
        // Gamma API usually supports: limit, offset, order, ascending.

        const apiUrl = `https://gamma-api.polymarket.com/markets?limit=${limit}&active=true&closed=false&order=volume&ascending=false`

        const res = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 1800 }
        })

        if (!res.ok) {
            throw new Error(`Polymarket API Error: ${res.statusText}`)
        }

        const data = await res.json()

        // Simplify Data for Frontend
        // We need: id, question (title), image, outcomes (Yes/No), prices (probability), volume
        const markets = data.map((m: any) => {
            // Outcome prices usually in 'outcomePrices' array (JSON string) or separate fields
            // Gamma API structure might vary, let's assume standard Gamma format.
            // Usually: market_slug, question, volume, outcomePrices (as json string array like '["0.1", "0.9"]')

            let probability = 0
            try {
                const prices = JSON.parse(m.outcomePrices)
                // Assuming Binary market (Yes/No), usually index 0 is Yes or No depending on market?
                // Actually usually index 0 is first outcome, index 1 is second.
                // For "Will X happen?", outcomes are ["Yes", "No"] usually.
                // We want the probability of the "Yes" outcome or the main outcome.
                probability = parseFloat(prices[0]) * 100
            } catch (e) {
                probability = 50 // fallback
            }

            return {
                id: m.id,
                title: m.question,
                image: m.image,
                volume: m.volume,
                probability: probability.toFixed(1), // Keep 1 decimal
                endDate: m.endDate,
                outcomes: JSON.parse(m.outcomes || '[]')
            }
        })

        return NextResponse.json({ markets })

    } catch (e: any) {
        console.error('Prediction API Error:', e)
        return NextResponse.json({ error: 'Failed to fetch prediction markets' }, { status: 500 })
    }
}
