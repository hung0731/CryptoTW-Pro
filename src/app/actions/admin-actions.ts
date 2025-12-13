'use server'

import { updateMarketSummary } from '@/lib/market-service'
import { createSafeServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function triggerMarketSummaryAction() {
    const cookieStore = cookies()
    const supabase = createSafeServerClient(cookieStore)

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 2. Check Admin Role
    const { data: userData } = await supabase
        .from('users')
        .select('membership_status')
        .eq('id', user.id)
        .single()

    // Allow 'admin' or temporary bypass if needed for initial setup (comment out if strict)
    if (userData?.membership_status !== 'admin') {
        return { success: false, error: 'Forbidden: Admins Only' }
    }

    // 3. Run Workflow
    try {
        const report = await updateMarketSummary()
        return { success: true, report }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
