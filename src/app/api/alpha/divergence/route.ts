import { NextResponse } from 'next/server'
import { getDivergenceData } from '@/lib/services/market-data'

export const revalidate = 300 // 5 minutes

export async function GET() {
    try {
        const { data, isDemo } = await getDivergenceData()
        return NextResponse.json({ data, isDemo })
    } catch (error) {
        console.error('Divergence API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch divergence data' }, { status: 500 })
    }
}
