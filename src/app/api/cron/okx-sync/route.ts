import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getInviteeDetail, parseOkxData, batchSyncInvitees } from '@/lib/okx-affiliate'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large batches

/**
 * Cron Job: Sync OKX affiliate data for all verified bindings
 * Recommended schedule: Daily at 00:00 UTC
 * 
 * Usage:
 * - GET /api/cron/okx-sync?secret=YOUR_CRON_SECRET
 * - POST /api/cron/okx-sync (with Authorization header)
 */
export async function GET(req: NextRequest) {
    // Verify cron secret (Vercel Cron or manual trigger)
    const authHeader = req.headers.get('authorization')
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')
    const cronSecret = process.env.CRON_SECRET

    // Allow if: Bearer token matches OR secret query param matches
    const isAuthorized =
        authHeader === `Bearer ${cronSecret}` ||
        secret === cronSecret

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const startTime = Date.now()
    const syncResults = {
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [] as string[],
    }

    try {
        // 1. Get all verified OKX bindings
        const { data: bindings, error } = await supabase
            .from('exchange_bindings')
            .select('id, exchange_uid, last_synced_at')
            .eq('exchange_name', 'okx')
            .eq('status', 'verified')

        if (error) throw error

        if (!bindings || bindings.length === 0) {
            return NextResponse.json({
                message: 'No OKX bindings to sync',
                duration: Date.now() - startTime,
            })
        }

        syncResults.total = bindings.length
        console.log(`[OKX Sync] Starting sync for ${bindings.length} bindings`)

        // 2. Extract UIDs
        const uids = bindings.map(b => b.exchange_uid)

        // 3. Batch sync with OKX API
        const okxResults = await batchSyncInvitees(uids, (completed, total) => {
            console.log(`[OKX Sync] Progress: ${completed}/${total}`)
        })

        // 4. Update database with results
        for (const binding of bindings) {
            const okxData = okxResults.get(binding.exchange_uid)

            if (okxData) {
                const updateData = parseOkxData(okxData)

                const { error: updateError } = await supabase
                    .from('exchange_bindings')
                    .update(updateData)
                    .eq('id', binding.id)

                if (updateError) {
                    syncResults.failed++
                    syncResults.errors.push(`${binding.exchange_uid}: ${updateError.message}`)
                } else {
                    syncResults.success++
                }
            } else {
                // OKX API returned null - user might not be a valid invitee
                syncResults.skipped++
                console.warn(`[OKX Sync] No data for UID: ${binding.exchange_uid}`)
            }
        }

        const duration = Date.now() - startTime
        console.log(`[OKX Sync] Completed in ${duration}ms:`, syncResults)

        // 5. Log sync result to system_logs if table exists
        try {
            await supabase.from('system_logs').insert({
                event_type: 'okx_sync',
                data: {
                    ...syncResults,
                    duration_ms: duration,
                },
            })
        } catch (e) {
            // Ignore if system_logs doesn't exist
        }

        return NextResponse.json({
            message: 'OKX sync completed',
            ...syncResults,
            duration_ms: duration,
        })

    } catch (e: any) {
        console.error('[OKX Sync] Fatal error:', e)
        return NextResponse.json({
            error: e.message,
            ...syncResults,
            duration_ms: Date.now() - startTime,
        }, { status: 500 })
    }
}

// POST method for manual trigger from admin
export async function POST(req: NextRequest) {
    return GET(req)
}
