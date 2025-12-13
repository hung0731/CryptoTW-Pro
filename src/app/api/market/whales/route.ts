import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [alerts, positions] = await Promise.all([
            coinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}),
            coinglassV4Request<any[]>('/api/hyperliquid/whale-position', {})
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
