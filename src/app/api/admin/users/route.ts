import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const q = searchParams.get('q') || ''

        const supabase = createAdminClient()
        const from = (page - 1) * limit
        const to = from + limit - 1

        let query = supabase
            .from('users')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (q) {
            query = query.or(`display_name.ilike.%${q}%,id.eq.${q}`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Fetch users error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            data,
            meta: {
                total: count,
                page,
                limit,
                totalPages: count ? Math.ceil(count / limit) : 0
            }
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const body = await req.json()
        const { id, membership_status } = body

        if (!id || !membership_status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('users')
            .update({ membership_status })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
