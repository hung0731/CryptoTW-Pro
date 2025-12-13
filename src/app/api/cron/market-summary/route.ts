import { NextResponse } from 'next/server'
import { updateMarketSummary } from '@/lib/market-service'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60s for AI generation

export async function GET(request: Request) {
    try {
        // Security Check for Cron
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const report = await updateMarketSummary()

        return NextResponse.json({ success: true, report })

    } catch (error: any) {
        console.error('[Cron] Exception:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
