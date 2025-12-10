import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { multicastMessage } from '@/lib/line-bot'

const BATCH_SIZE = 500

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, audience = 'all' } = body

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const supabase = createClient()

        // 1. Create Record
        const { data: record, error: dbError } = await supabase
            .from('push_messages')
            .insert({
                message_content: message,
                target_audience: audience,
                status: 'sending'
            })
            .select()
            .single()

        if (dbError) {
            console.error('DB Error:', dbError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // 2. Fetch Users
        let query = supabase.from('users').select('line_user_id')

        if (audience === 'vip') {
            query = query.eq('membership_status', 'pro')
        } else if (audience === 'pending_vip') {
            query = query.eq('membership_status', 'pending')
        }
        // 'all' fetches everyone

        const { data: users, error: userError } = await query

        if (userError || !users) {
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
        }

        const validUserIds = users.map(u => u.line_user_id).filter(Boolean)
        const totalRecipients = validUserIds.length

        // 3. Batch Send
        let successCount = 0
        const messagesToSend = [{ type: 'text', text: message }]

        for (let i = 0; i < totalRecipients; i += BATCH_SIZE) {
            const batch = validUserIds.slice(i, i + BATCH_SIZE)
            const success = await multicastMessage(batch, messagesToSend)
            if (success) {
                successCount += batch.length
            }
        }

        // 4. Update Record
        await supabase
            .from('push_messages')
            .update({
                recipient_count: successCount,
                status: 'sent',
                sent_at: new Date().toISOString()
            })
            .eq('id', record.id)

        return NextResponse.json({ success: true, count: successCount })

    } catch (e: any) {
        console.error('API Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function GET() {
    try {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('push_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        return NextResponse.json({ history: data })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
