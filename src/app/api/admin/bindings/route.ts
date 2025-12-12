import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
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
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Fetch Bindings Error', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ bindings: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
