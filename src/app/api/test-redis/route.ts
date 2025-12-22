import { NextResponse } from 'next/server'
import { getCache, setCache, getCacheStatus } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 1. Check Status
        const status = await getCacheStatus()

        // 2. Perform Read/Write Test
        const testKey = 'redis_test_' + Date.now()
        await setCache(testKey, { success: true }, 60)
        const retrieved = await getCache(testKey)

        return NextResponse.json({
            status,
            test: {
                key: testKey,
                persisted: !!retrieved,
                data: retrieved
            },
            timestamp: new Date().toISOString()
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
