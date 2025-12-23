import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import MACRO_HISTORY from '@/data/macro-history.json'

/**
 * GET /api/macro/[key]
 * Returns historical data and stats for a specific macro event type
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params

        // Validate key
        if (!['cpi', 'nfp', 'fomc'].includes(key)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid event key. Use: cpi, nfp, or fomc'
            }, { status: 400 })
        }

        // @ts-expect-error: Known issue with dynamic property access - JSON import typing
        const eventData = MACRO_HISTORY[key]

        if (!eventData) {
            return NextResponse.json({
                success: false,
                error: 'Event data not found'
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: eventData
        })
    } catch (error) {
        logger.error('Error fetching macro event history', error, { feature: 'macro-api', endpoint: 'history' })
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch event history'
        }, { status: 500 })
    }
}
