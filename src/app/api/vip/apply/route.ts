import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { sendAdminNotification } from '@/lib/notify'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, contact_method, contact_handle, asset_tier, trading_volume_monthly, preferred_exchange, user_id, notes } = body

        if (!name || !contact_handle || !asset_tier) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createClient()
        const { error } = await supabase
            .from('vip_applications')
            .insert({
                name,
                contact_method,
                contact_handle,
                asset_tier,
                trading_volume_monthly,
                preferred_exchange,
                user_id,
                notes,
                status: 'new'
            })

        if (error) throw error

        // Send Admin Notification
        await sendAdminNotification(`\n🐳 新增 Pro Prime 申請:\n姓名: ${name}\n級別: ${asset_tier}\n聯絡: ${contact_method} (${contact_handle})\n備註: ${notes || '無'}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('VIP Application Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
