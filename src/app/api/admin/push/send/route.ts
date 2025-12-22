import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { multicastMessage } from '@/lib/line-bot'

export async function POST(req: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { message_content, target_audience, image_url, action_link } = await req.json()

        console.log('[Push] Request:', { message_content, target_audience })

        // 1. Determine Audience
        let userQuery = supabase.from('users').select('line_user_id')

        if (target_audience === 'vip') {
            userQuery = userQuery.eq('membership_status', 'vip')
        } else if (target_audience === 'pending_vip') {
            // Target users who are legally pending or have vip applications
            // Simplified: target users with 'pending' status for now
            userQuery = userQuery.eq('membership_status', 'pending')
        } else if (target_audience === 'all') {
            // No filter
        }

        const { data: users, error: userError } = await userQuery

        if (userError || !users) {
            return NextResponse.json({ error: 'Failed to fetch audience' }, { status: 500 })
        }

        const userIds = users.map((u) => u.line_user_id).filter(Boolean)

        if (userIds.length === 0) {
            return NextResponse.json({ message: 'No users found for this audience' }, { status: 200 })
        }

        console.log(`[Push] Target User Count: ${userIds.length}`)

        // 2. Construct LINE Message
        const { createBrandedFlexMessage } = require('@/lib/bot/ui/base')
        const messages: any[] = []

        // Use branded flex message for the main content
        const flexMessage = createBrandedFlexMessage({
            title: 'CryptoTW 公告', // Default title
            mainText: message_content || (image_url ? '圖片訊息' : '無內容'),
            heroImageUrl: image_url,
            actionLabel: action_link ? '前往查看' : undefined,
            actionUrl: action_link
        })

        messages.push(flexMessage)

        // 3. Send via Multicast (Batch of 450 max per request)
        const CHUNK_SIZE = 450 // Safe limit below 500
        const chunks = []
        for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
            chunks.push(userIds.slice(i, i + CHUNK_SIZE));
        }

        let successCount = 0;

        for (const chunk of chunks) {
            try {
                // Use our local helper
                const success = await multicastMessage(chunk, messages)
                if (success) {
                    successCount += chunk.length;
                }
            } catch (e) {
                console.error('[Push] Multicast Error:', e)
            }
        }

        // 4. Log to DB
        await supabase.from('push_messages').insert({
            message_content: message_content || 'Image Only',
            target_audience: target_audience,
            recipient_count: successCount,
            status: successCount > 0 ? 'sent' : 'failed',
        })

        return NextResponse.json({ success: true, count: successCount })
    } catch (error) {
        console.error('[Push] Fatal Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
