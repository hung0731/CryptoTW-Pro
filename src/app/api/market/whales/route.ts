import { NextResponse } from 'next/server'
import { getHyperliquidWhaleAlerts, getHyperliquidWhalePositions } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [alerts, positions] = await Promise.all([
            getHyperliquidWhaleAlerts(),
            getHyperliquidWhalePositions()
        ])

        return NextResponse.json({
            whales: {
                alerts: alerts || [],
                positions: positions || []
            }
        })
    } catch (error) {
        console.error('Whale Watch API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch whale data' }, { status: 500 })
    }
}
