import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (id) {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('is_active', true)
                .eq('id', id)
                .single()

            if (error) throw error
            return NextResponse.json({ activity: data })
        } else {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return NextResponse.json({ activities: data })
        }
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
