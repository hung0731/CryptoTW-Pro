import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { generateIndicatorSummary, IndicatorSummaryInput } from '@/lib/gemini'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes cache

export async function POST(request: Request) {
    try {
        const data: IndicatorSummaryInput = await request.json()

        // Validate required fields
        if (!data.fearGreedIndex || data.fundingRate === undefined || data.longShortRatio === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const result = await generateIndicatorSummary(data)

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to generate summary' },
                { status: 500 }
            )
        }

        return NextResponse.json(result)
    } catch (error) {
        logger.error('Indicator Summary API Error', error, { feature: 'ai-api', endpoint: 'indicator-summary' })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
