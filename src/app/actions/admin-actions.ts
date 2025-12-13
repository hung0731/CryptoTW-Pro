'use server'

import { updateMarketSummary } from '@/lib/market-service'
import { createSafeServerClient, createAdminClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function triggerMarketSummaryAction() {
    const cookieStore = await cookies()
    const supabase = createSafeServerClient(cookieStore)

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 2. Check Admin Role (Use AdminClient to bypass RLS infinite recursion)
    const adminClient = createAdminClient()
    const { data: userData, error: userError } = await adminClient
        .from('users')
        .select('membership_status')
        .eq('id', user.id)
        .single()

    console.log('[AdminAction] User:', user.id)
    console.log('[AdminAction] DB Role:', userData?.membership_status)
    console.log('[AdminAction] DB Error:', userError)

    // Allow 'admin' or 'super_admin'
    const allowedRoles = ['admin', 'super_admin']
    if (!userData?.membership_status || !allowedRoles.includes(userData.membership_status)) {
        return { success: false, error: `Forbidden: Admins Only (Role: ${userData?.membership_status || 'None'})` }
    }

    // 3. Run Workflow
    try {
        const report = await updateMarketSummary()
        return { success: true, report }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
