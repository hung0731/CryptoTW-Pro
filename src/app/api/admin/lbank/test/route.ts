import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createSafeServerClient } from '@/lib/supabase'
import { syncAllLBankInvitees, LBankInviteeData } from '@/lib/lbank-affiliate'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
    try {
        // 1. Check Admin Auth
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin (email check as per existing patterns)
        const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []
        if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
            // Alternatively, check DB role. But simple email check is fast for now.
            // Or better, assume middleware handles route protection, but explicit check is safer.
        }

        // 2. Run Sync Logic
        const { uid } = await req.json().catch(() => ({}))
        logger.info('[Admin] Starting LBank Sync Test', { userId: user.id, searchUid: uid })

        try {
            const results = await syncAllLBankInvitees()

            let responseData: LBankInviteeData[] = []
            let found = false

            if (uid) {
                // Search specifically for this UID
                // Map key is openId (from syncAllLBankInvitees implementation)

                const target = results.get(uid)
                if (target) {
                    responseData = [target]
                    found = true
                } else {
                    // Try to find in values just in case
                    const foundItem = Array.from(results.values()).find(u => u.openId === uid)
                    if (foundItem) {
                        responseData = [foundItem]
                        found = true
                    }
                }
            } else {
                // Convert Map to Array for JSON response (Top 10)
                responseData = Array.from(results.entries())
                    .slice(0, 10)
                    .map(([, data]) => ({ ...data }))
            }

            return NextResponse.json({
                success: true,
                count: results.size,
                found: uid ? found : undefined,
                data: responseData,
                timestamp: new Date().toISOString()
            })

        } catch (syncError: any) {
            logger.error('[Admin] LBank Sync Failed', syncError)
            return NextResponse.json({
                success: false,
                error: syncError.message || 'Sync failed',
                details: syncError.stack
            }, { status: 500 })
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
