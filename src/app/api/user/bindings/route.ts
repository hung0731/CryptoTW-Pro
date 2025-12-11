import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { lineUserId } = await req.json()

        if (!lineUserId) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 })
        }

        // 1. Get User ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('line_user_id', lineUserId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Fetch Bindings
        const { data, error } = await supabase
            .from('exchange_bindings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ bindings: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
