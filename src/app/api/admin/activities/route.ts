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
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ activities: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const body = await req.json()
        const { title, exchange_name, description, content, url, is_active, end_date } = body

        if (!title || !exchange_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('activities')
            .insert({
                title,
                exchange_name,
                description,
                content,
                url,
                start_date: new Date().toISOString(),
                end_date: end_date || null,
                is_active: is_active || false
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ activity: data })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const body = await req.json()
        const { id, title, exchange_name, description, content, url, is_active, end_date } = body

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('activities')
            .update({
                title,
                exchange_name,
                description,
                content,
                url,
                end_date: end_date || null,
                is_active,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ activity: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const supabase = createAdminClient()
        const { error } = await supabase.from('activities').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
