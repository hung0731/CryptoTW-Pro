
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    // 1. Verify Admin
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    // 2. Fetch Logs
    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        const level = searchParams.get('level')

        const supabase = createAdminClient()
        let query = supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (level && level !== 'all') {
            query = query.eq('level', level)
        }

        const { data: logs, error } = await query

        if (error) throw error

        return NextResponse.json({ logs })
    } catch (error) {
        console.error('Error fetching logs:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
