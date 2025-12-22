
import { NextResponse } from 'next/server'
import { increment, acquireLock, releaseLock, getCacheStatus } from '@/lib/cache'
import { simpleRateLimit as distributedRateLimit } from '@/lib/api-rate-limit'

export async function GET() {
    const status = await getCacheStatus()
    const results: any = {
        status,
        tests: {}
    }

    // Test 1: Rate Limit Increment
    try {
        const key = 'test:rate_limit:inc'
        const val1 = await increment(key, 60)
        const val2 = await increment(key, 60)
        results.tests.increment = {
            success: val2 > val1,
            val1,
            val2
        }
    } catch (e: any) {
        results.tests.increment = { success: false, error: e.message }
    }

    // Test 2: Distributed Locking (Mutex)
    try {
        const lockKey = 'test:lock:mutex'
        // Cleanup first
        await releaseLock(lockKey)

        const lock1 = await acquireLock(lockKey, 10)
        const lock2 = await acquireLock(lockKey, 10) // Should fail

        await releaseLock(lockKey)
        const lock3 = await acquireLock(lockKey, 10) // Should succeed

        results.tests.locking = {
            success: lock1 === true && lock2 === false && lock3 === true,
            details: { lock1, lock2, lock3 }
        }
        await releaseLock(lockKey)
    } catch (e: any) {
        results.tests.locking = { success: false, error: e.message }
    }

    // Test 3: API Rate Limiter
    try {
        const limitRes = await distributedRateLimit('test-user', 5, 60)
        results.tests.apiRateLimit = {
            success: typeof limitRes.success === 'boolean' && typeof limitRes.count === 'number',
            current: limitRes
        }
    } catch (e: any) {
        results.tests.apiRateLimit = { success: false, error: e.message }
    }

    return NextResponse.json(results)
}
