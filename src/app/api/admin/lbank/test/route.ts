import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createSafeServerClient } from '@/lib/supabase'
import { syncAllLBankInvitees, getLBankUserInfo, LBankInviteeData } from '@/lib/lbank-affiliate'
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

        // Check is admin (optional, assuming protected route or middleware)
        // const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
        // if (profile?.role !== 'admin') ...

        // 2. Run Sync Logic or Single User Lookup
        const { uid } = await req.json().catch(() => ({}))
        logger.info('[Admin] LBank Test', { userId: user.id, searchUid: uid })

        // Response state
        let success = false
        let count = 0
        let found = false
        let responseData: LBankInviteeData[] = []
        let errorMsg = ''

        try {
            if (uid) {
                // Optimize: Direct lookup using invite/user/info
                const invitee = await getLBankUserInfo(uid)
                if (invitee) {
                    found = true
                    responseData = [invitee]
                    count = 1
                }
                success = true
            } else {
                // Full Sync Test (Top 10)
                const results = await syncAllLBankInvitees()
                count = results.size
                responseData = Array.from(results.entries())
                    .slice(0, 10)
                    .map(([, data]) => ({ ...data }))
                success = true
            }
        } catch (err) {
            errorMsg = (err as Error).message
            success = false
        }

        return NextResponse.json({
            success,
            count,
            found: uid ? found : undefined,
            error: errorMsg || undefined,
            data: responseData,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        logger.error('[Admin] LBank Test API Error', error as Error)
        return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
    }
}
