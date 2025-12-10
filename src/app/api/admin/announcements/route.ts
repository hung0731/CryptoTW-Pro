
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const { message, level, is_active } = await req.json()

        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

        // If active, turn off others (optional logic, but single banner is cleaner)
        if (is_active) {
            await supabase.from('system_announcements').update({ is_active: false }).neq('id', '0')
        }

        const { data, error } = await supabase
            .from('system_announcements')
            .insert({ message, level, is_active })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ announcement: data })

    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const { data } = await supabase
            .from('system_announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        return NextResponse.json({ announcements: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const { error } = await supabase
            .from('system_announcements')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
