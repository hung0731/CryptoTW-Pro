import { NextResponse } from 'next/server'
import { cachedCoinglassV4Request, EconomicData } from '@/lib/coinglass'

export async function GET() {
    try {
        // Cache for 10 minutes (600 seconds) as per Coinglass recommendation
        const data = await cachedCoinglassV4Request<EconomicData[]>(
            '/api/calendar/economic-data',
            {},
            600
        )

        return NextResponse.json({ data: data || [] })
    } catch (error) {
        console.error('Error fetching economic calendar:', error)
        return NextResponse.json({ data: [] }, { status: 500 })
    }
}
