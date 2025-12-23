import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const q = searchParams.get('q') || ''
        const includeBindings = searchParams.get('include_bindings') === 'true'

        const supabase = createAdminClient()
        const from = (page - 1) * limit
        const to = from + limit - 1

        let query = supabase
            .from('users')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (q) {
            query = query.or(`display_name.ilike.%${q}%,line_user_id.ilike.%${q}%`)
        }

        const { data: users, error, count } = await query

        if (error) {
            logger.error('Fetch users error', error, { feature: 'admin-api', endpoint: 'users' })
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // If include_bindings, fetch all bindings for these users
        let usersWithBindings = users
        if (includeBindings && users && users.length > 0) {
            const userIds = users.map(u => u.id)

            const { data: bindings } = await supabase
                .from('exchange_bindings')
                .select('*')
                .in('user_id', userIds)
                .order('created_at', { ascending: false })

            // Map bindings to users
            usersWithBindings = users.map(user => ({
                ...user,
                bindings: bindings?.filter(b => b.user_id === user.id) || []
            }))
        }

        return NextResponse.json({
            data: usersWithBindings,
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
            .update({ membership_status, updated_at: new Date().toISOString() })
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

export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Delete user's bindings first
        await supabase.from('exchange_bindings').delete().eq('user_id', id)

        // Delete user
        const { error } = await supabase.from('users').delete().eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
