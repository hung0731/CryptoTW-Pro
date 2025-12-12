import { createSafeServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET: List all triggers
export async function GET() {
    try {
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)

        const { data, error } = await supabase
            .from('bot_triggers')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// POST: Create new trigger
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)
        const body = await req.json()

        const { keywords, reply_type, reply_content, is_active } = body

        if (!keywords || !reply_content) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('bot_triggers')
            .insert([{ keywords, reply_type, reply_content, is_active }])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// PUT: Update trigger
export async function PUT(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)
        const body = await req.json()
        const { id, keywords, reply_type, reply_content, is_active } = body

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const { data, error } = await supabase
            .from('bot_triggers')
            .update({ keywords, reply_type, reply_content, is_active, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// DELETE: Remove trigger
export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const { error } = await supabase
            .from('bot_triggers')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
