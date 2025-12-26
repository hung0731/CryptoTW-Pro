import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { syncAllLBankInvitees, parseLBankData } from '@/lib/lbank-affiliate'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

/**
 * Cron Job: Sync LBank affiliate data
 * LBank API provides a "Team List" which we fetch entirely and match against our DB.
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
        return NextResponse.json({ error: 'CRON_SECRET missing' }, { status: 500 })
    }

    const isAuthorized = authHeader === `Bearer ${cronSecret}` || secret === cronSecret
    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const startTime = Date.now()
    const stats = {
        found_in_lbank: 0,
        matched_in_db: 0,
        updated: 0,
        errors: 0
    }

    try {
        logger.info('[LBank Sync] Starting sync...', { feature: 'cron-job' })

        // 1. Fetch all LBank Invitees
        const lbankUsersMap = await syncAllLBankInvitees()
        stats.found_in_lbank = lbankUsersMap.size

        if (stats.found_in_lbank === 0) {
            return NextResponse.json({ message: 'No users found in LBank team', stats })
        }

        // 2. Fetch all 'verified' LBank bindings from DB
        const { data: bindings, error } = await supabase
            .from('exchange_bindings')
            .select('id, exchange_uid')
            .eq('exchange_name', 'lbank')
            .eq('status', 'verified')

        if (error) throw error

        // 3. Match and Update
        for (const binding of bindings || []) {
            const remoteUser = lbankUsersMap.get(binding.exchange_uid)
            if (remoteUser) {
                stats.matched_in_db++

                const updateData = parseLBankData(remoteUser)

                // Update Binding
                const { error: updateErr } = await supabase
                    .from('exchange_bindings')
                    .update(updateData)
                    .eq('id', binding.id)

                if (updateErr) {
                    logger.error(`[LBank Sync] Update failed for ${binding.exchange_uid}`, updateErr, { feature: 'cron-job' })
                    stats.errors++
                } else {
                    stats.updated++
                }
            }
        }

        const duration = Date.now() - startTime
        logger.info('[LBank Sync] Completed', { feature: 'cron-job', stats, duration })

        // Log to system_logs
        try {
            await supabase.from('system_logs').insert({
                event_type: 'lbank_sync',
                data: { ...stats, duration_ms: duration }
            })
        } catch (logErr) {
            logger.error('[LBank Sync] Failed to insert system log', logErr as Error, { feature: 'cron-job' })
        }

        return NextResponse.json({
            message: 'LBank sync completed',
            stats,
            duration_ms: duration
        })

    } catch (e: any) {
        logger.error('[LBank Sync] Fatal error', e, { feature: 'cron-job' })
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    return GET(req)
}
