import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { HomeRouterService } from '@/lib/services/home-router'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // 1 min cache

export async function GET() {
    try {
        const data = await HomeRouterService.getRouterData()
        return NextResponse.json({ router: data })
    } catch (error) {
        logger.error('Home Router API Error:', error as Error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
