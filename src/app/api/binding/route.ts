import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { lineUserId, exchange, uid } = await req.json()

        if (!lineUserId || !exchange || !uid) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // 1. Get User ID from line_user_id
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('line_user_id', lineUserId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Insert Binding
        const { data, error } = await supabase
            .from('exchange_bindings')
            .insert({
                user_id: user.id,
                exchange_name: exchange,
                exchange_uid: uid,
                status: 'pending' // Default status
            })
            .select()
            .single()

        if (error) {
            // Handle unique constraint (User already bound this exchange)
            if (error.code === '23505') { // Postgres unique violation code
                return NextResponse.json({ error: 'You have already submitted a UID for this exchange.' }, { status: 409 })
            }
            console.error('Binding Error', error)
            return NextResponse.json({ error: 'Failed to submit binding' }, { status: 500 })
        }

        // 3. Update User Status to pending if currently free?
        // The requirement says "Automatic upgrade to pro on verification".
        // For pending, we might want to set membership to 'pending' if it's currently 'free'.
        // Let's do that to reflect state in UI.

        await supabase.from('users').update({ membership_status: 'pending' }).eq('id', user.id).eq('membership_status', 'free')

        return NextResponse.json({ success: true, binding: data })
    } catch (e) {
        console.error('API Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
