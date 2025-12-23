import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getDivergenceData } from '@/lib/services/market-data'

export const revalidate = 300 // 5 minutes

export async function GET() {
    try {
        const { data, isDemo } = await getDivergenceData()
        return NextResponse.json({ data, isDemo })
    } catch (error) {
        logger.error('Divergence API Error', error, { feature: 'alpha-api', endpoint: 'divergence' })
        return NextResponse.json({ error: 'Failed to fetch divergence data' }, { status: 500 })
    }
}
