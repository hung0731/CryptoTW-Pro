import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || 'pending'
        const exchange = searchParams.get('exchange') // optional filter

        const supabase = createAdminClient()

        let query = supabase
            .from('exchange_bindings')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    picture_url,
                    line_user_id
                )
            `)
            .eq('status', status)
            .order('created_at', { ascending: false })

        // Optional exchange filter
        if (exchange) {
            query = query.eq('exchange_name', exchange)
        }

        const { data, error } = await query

        if (error) {
            console.error('Fetch Bindings Error', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ bindings: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
