import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        // In a real app, verify Admin Session here!
        // For MVP/Demo, we assume the route is protected by knowledge or simple header check if needed.

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
