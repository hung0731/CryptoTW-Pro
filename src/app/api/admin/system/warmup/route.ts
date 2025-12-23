import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getSeasonalityData, getHalvingData, getDivergenceData } from '@/lib/services/market-data'

export const dynamic = 'force-dynamic' // Ensure this always runs when called

export async function GET() {
    try {
        logger.info('🔥 System Warmup Triggered...', { feature: 'system-warmup' })
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

        logger.info(`✅ System Warmup Complete in ${duration}ms`, { feature: 'system-warmup', summary })

        return NextResponse.json({
            message: 'System warmup complete',
            duration: `${duration}ms`,
            results: summary
        })

    } catch (error) {
        logger.error('Warmup Critical Failure', error, { feature: 'system-warmup' })
        return NextResponse.json({ error: 'Warmup failed' }, { status: 500 })
    }
}
