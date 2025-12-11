import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createAdminClient()

        // 1. Total Users
        const { count: totalUsers, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })

        if (usersError) throw usersError

        // 2. Verified Users (Pro)
        const { count: verifiedUsers, error: proError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('membership_status', 'pro')

        if (proError) throw proError

        // 3. Pending Bindings
        const { count: pendingBindings, error: bindingError } = await supabase
            .from('exchange_bindings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')

        if (bindingError) throw bindingError

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            verifiedUsers: verifiedUsers || 0,
            pendingBindings: pendingBindings || 0
        })

    } catch (e) {
        console.error('Stats API Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
