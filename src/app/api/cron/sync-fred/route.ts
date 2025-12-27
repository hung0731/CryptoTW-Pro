import { NextRequest, NextResponse } from 'next/server'
import { FredSyncService } from '@/lib/services/fred-sync'
import { logger } from '@/lib/logger'
import { CronLogger } from '@/lib/services/cron-logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow longer runtime for syncing multiple series

const CRON_SECRET = process.env.CRON_SECRET || 'cryptotw-cron-secret'

export async function GET(req: NextRequest) {
    const start = Date.now()
    const secret = req.nextUrl.searchParams.get('secret')

    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await CronLogger.logStart('fred-sync')

        const results = await FredSyncService.syncAll()

        logger.info('[CRON] FRED Sync completed', { results })

        await CronLogger.logSuccess('fred-sync', results, Date.now() - start)

        return NextResponse.json({
            success: true,
            message: 'FRED Sync completed',
            results
        })
    } catch (error: any) {
        logger.error('[CRON] FRED Sync failed', error)
        await CronLogger.logFailure('fred-sync', error, Date.now() - start)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
