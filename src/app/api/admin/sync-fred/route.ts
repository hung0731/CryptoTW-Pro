/**
 * Admin API: Sync FRED Economic Data
 * 
 * POST /api/admin/sync-fred
 * 
 * Fetches latest economic indicator data from FRED API
 * and updates src/data/macro-indicators.json
 */

import { NextRequest, NextResponse } from 'next/server'
import { FredSyncService } from '@/lib/services/fred-sync'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
    try {
        const results = await FredSyncService.syncAll()

        return NextResponse.json({
            success: true,
            message: 'DB Sync completed',
            results
        })

    } catch (error: any) {
        logger.error('Sync Fatal Error', { feature: 'admin', endpoint: 'sync-fred', error: error.message })
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ status: 'Use POST to sync' })
}
