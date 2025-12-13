import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || 'pending'
        const exchange = searchParams.get('exchange') // optional filter

        const supabase = createAdminClient()

        let query = supabase
            .from('exchange_bindings')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    picture_url,
                    line_user_id
                )
            `)
            .eq('status', status)
            .order('created_at', { ascending: false })

        // Optional exchange filter
        if (exchange) {
            query = query.eq('exchange_name', exchange)
        }

        const { data, error } = await query

        if (error) {
            console.error('Fetch Bindings Error', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ bindings: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// Update binding status (verify/reject) or sync OKX data
export async function PUT(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const body = await req.json()
        const { id, action, rejection_reason } = body

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Get binding first
        const { data: binding, error: fetchError } = await supabase
            .from('exchange_bindings')
            .select('*, user:users(id, line_user_id)')
            .eq('id', id)
            .single()

        if (fetchError || !binding) {
            return NextResponse.json({ error: 'Binding not found' }, { status: 404 })
        }

        if (action === 'verify') {
            // Manual verify
            let okxUpdateData = {}

            // Try to fetch OKX data
            if (binding.exchange_name.toLowerCase() === 'okx') {
                try {
                    const { getInviteeDetail, parseOkxData } = await import('@/lib/okx-affiliate')
                    const okxData = await getInviteeDetail(binding.exchange_uid)
                    if (okxData) {
                        okxUpdateData = parseOkxData(okxData)
                    }
                } catch (e) {
                    console.error('OKX API error:', e)
                }
            }

            await supabase
                .from('exchange_bindings')
                .update({
                    status: 'verified',
                    rejection_reason: null,
                    updated_at: new Date().toISOString(),
                    ...okxUpdateData
                })
                .eq('id', id)

            // Upgrade user to pro
            await supabase
                .from('users')
                .update({ membership_status: 'pro', updated_at: new Date().toISOString() })
                .eq('id', binding.user_id)

            return NextResponse.json({ success: true, message: 'Binding verified' })
        }

        if (action === 'reject') {
            await supabase
                .from('exchange_bindings')
                .update({
                    status: 'rejected',
                    rejection_reason: rejection_reason || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)

            // Check if user has other verified bindings
            const { data: otherBindings } = await supabase
                .from('exchange_bindings')
                .select('id')
                .eq('user_id', binding.user_id)
                .eq('status', 'verified')
                .limit(1)

            // Rollback to free if no verified bindings
            if (!otherBindings || otherBindings.length === 0) {
                await supabase
                    .from('users')
                    .update({ membership_status: 'free', updated_at: new Date().toISOString() })
                    .eq('id', binding.user_id)
                    .in('membership_status', ['pending', 'pro'])
            }

            return NextResponse.json({ success: true, message: 'Binding rejected' })
        }

        if (action === 'sync') {
            // Refresh OKX data
            if (binding.exchange_name.toLowerCase() !== 'okx') {
                return NextResponse.json({ error: 'Only OKX bindings can be synced' }, { status: 400 })
            }

            const { getInviteeDetail, parseOkxData } = await import('@/lib/okx-affiliate')
            const okxData = await getInviteeDetail(binding.exchange_uid)

            if (!okxData) {
                return NextResponse.json({ error: 'Failed to fetch OKX data' }, { status: 500 })
            }

            const updateData = parseOkxData(okxData)
            await supabase
                .from('exchange_bindings')
                .update(updateData)
                .eq('id', id)

            return NextResponse.json({ success: true, data: updateData })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (e: any) {
        console.error('Binding PUT error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// Delete a binding
export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing binding ID' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Get binding to check user status after deletion
        const { data: binding } = await supabase
            .from('exchange_bindings')
            .select('user_id, status')
            .eq('id', id)
            .single()

        // Delete binding
        const { error } = await supabase.from('exchange_bindings').delete().eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // If deleted binding was verified, check if user has other verified bindings
        if (binding?.status === 'verified') {
            const { data: otherBindings } = await supabase
                .from('exchange_bindings')
                .select('id')
                .eq('user_id', binding.user_id)
                .eq('status', 'verified')
                .limit(1)

            // Rollback to free if no verified bindings remain
            if (!otherBindings || otherBindings.length === 0) {
                await supabase
                    .from('users')
                    .update({ membership_status: 'free', updated_at: new Date().toISOString() })
                    .eq('id', binding.user_id)
            }
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
