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
            .from('exchanges')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) throw error
        return NextResponse.json({ exchanges: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const body = await req.json()
        const { name, referral_link, slug, sort_order } = body

        if (!name || !referral_link || !slug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('exchanges')
            .insert({ name, referral_link, slug, sort_order: sort_order || 0, is_active: true })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ exchange: data })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const body = await req.json()
        const { id, name, referral_link, is_active, sort_order, slug } = body

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('exchanges')
            .update({
                name,
                referral_link,
                is_active,
                sort_order,
                slug
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

export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const supabase = createAdminClient()
        const { error } = await supabase.from('exchanges').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
