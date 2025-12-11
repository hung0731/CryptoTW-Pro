import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        let data, error

        if (id) {
            const result = await supabase
                .from('content')
                .select('*')
                .eq('is_published', true)
                .eq('id', id)
                .single()
            data = result.data
            error = result.error
        } else {
            const result = await supabase
                .from('content')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false })
            data = result.data
            error = result.error
        }

        if (error) throw error
        return NextResponse.json({ content: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
