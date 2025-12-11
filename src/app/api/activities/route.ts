import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        let query = supabase
            .from('activities')
            .select('*')
            .eq('is_active', true)

        if (id) {
            query = query.eq('id', id).single()
        } else {
            query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query

        if (error) throw error

        // Return structure depends on if it's list or single
        return NextResponse.json(id ? { activity: data } : { activities: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
