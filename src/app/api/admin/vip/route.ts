import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('vip_applications')
            .select(`
                *,
                user:users(display_name, picture_url)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ applications: data })
    } catch (error) {
        logger.error('Admin VIP Fetch Error', error, { feature: 'admin-api', endpoint: 'vip' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
