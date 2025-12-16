'use server'

import { updateMarketSummary } from '@/lib/market-service'
import { createSafeServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function triggerMarketSummaryAction() {
    const cookieStore = await cookies()
    const supabase = createSafeServerClient(cookieStore)

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { success: false, error: 'Unauthorized' }
    }

    // 2. Check Admin Email Whitelist (server-side only)
    const allowedEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)

    if (allowedEmails.length > 0 && !allowedEmails.includes(user.email)) {
        return { success: false, error: `Forbidden: Email not in admin whitelist` }
    }

    // 3. Run Workflow
    try {
        const report = await updateMarketSummary()
        return { success: true, report }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

