import { NextResponse } from 'next/server'
import { getSeasonalityData } from '@/lib/services/market-data'

export const revalidate = 3600 // 1 hour

export async function GET() {
    try {
        const data = await getSeasonalityData()
        return NextResponse.json({ data })
    } catch (error) {
        console.error('Seasonality API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch seasonality data' }, { status: 500 })
    }
}
