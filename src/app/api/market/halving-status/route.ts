import { NextResponse } from 'next/server'
import { getHalvingData } from '@/lib/services/market-data'

export const revalidate = 3600 // 1 hour

export async function GET() {
    try {
        const data = await getHalvingData()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Halving API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch halving data' }, { status: 500 })
    }
}
