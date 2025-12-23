import { NextResponse } from 'next/server'
import { getSeasonalityData, getHalvingData, getDivergenceData } from '@/lib/services/market-data'

export const dynamic = 'force-dynamic' // Ensure this always runs when called

export async function GET() {
    try {
        console.log('🔥 System Warmup Triggered...')
        const start = Date.now()

        // Run fetches in parallel
        // We use Promise.allSettled to ensure one failure doesn't stop others
        const results = await Promise.allSettled([
            getSeasonalityData().then(() => 'Seasonality: OK'),
            getHalvingData().then(() => 'Halving: OK'),
            getDivergenceData().then(() => 'Divergence: OK'),
            // Future: getMarketBrief()
        ])

        const summary = results.map(r => r.status === 'fulfilled' ? r.value : `Failed: ${r.reason}`)
        const duration = Date.now() - start

        console.log(`✅ System Warmup Complete in ${duration}ms`, summary)

        return NextResponse.json({
            message: 'System warmup complete',
            duration: `${duration}ms`,
            results: summary
        })

    } catch (error) {
        console.error('Warmup Critical Failure:', error)
        return NextResponse.json({ error: 'Warmup failed' }, { status: 500 })
    }
}
