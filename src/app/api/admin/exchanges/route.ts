
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('exchanges')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) throw error
        return NextResponse.json({ exchanges: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, name, referral_link, is_active, sort_order, slug } = body

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const { data, error } = await supabase
            .from('exchanges')
            .update({
                name,
                referral_link,
                is_active,
                sort_order,
                slug // slug is usually immutable but we allow edits if needed
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ exchange: data })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
