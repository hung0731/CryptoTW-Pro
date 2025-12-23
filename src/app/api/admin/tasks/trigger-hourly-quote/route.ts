import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { multicastMessage } from '@/lib/line-bot'
import { getMarketSnapshot } from '@/lib/market-aggregator'
import { createBrandedFlexMessage } from '@/lib/bot/ui/base'

export async function POST(req: NextRequest) {
    try {
        const adminClient = createAdminClient()

        // 1. Fetch Admin Users (to send test message to)
        // For Alpha, we send to verified Admins.
        // In production, this would query a specific list or 'all' based on payload.
        const { target = 'admin' } = await req.json()

        let userQuery = adminClient.from('users').select('line_user_id')

        if (target === 'admin') {
            userQuery = userQuery.eq('membership_status', 'vip') // Assuming Admins are VIP for now or use specific admin flag if available. 
            // Ideally we should use the same verification logic as AdminLayout
            // But for testing, let's just send to the caller's ID if possible? 
            // Actually, the request comes from the browser, we don't know the caller's LINE ID easily without auth context mapping.
            // Let's just send to 'vip' as a proxy for "Admins/Team" in this Alpha test.
        } else if (target === 'all') {
            // No filter
        }

        const { data: users, error: userError } = await userQuery
        if (userError || !users) throw new Error('Failed to fetch users')

        const userIds = users.map(u => u.line_user_id).filter(Boolean)

        if (userIds.length === 0) {
            return NextResponse.json({ message: 'No target users found' })
        }

        // 2. Fetch BTC Data
        const snapshot = await getMarketSnapshot('BTC')

        logger.info('[TriggerQuote] Snapshot', { feature: 'tasks', snapshot: JSON.stringify(snapshot, null, 2) })

        const btc = snapshot?.btc || { price: 0, change_24h: 0, high_24h: 0, low_24h: 0, volume_24h: 0 }

        if (!btc.price) {
            logger.warn('[TriggerQuote] BTC Price missing, using default', { feature: 'tasks' })
            btc.price = 0
            btc.change_24h = 0
        }

        const price = (btc.price || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
        const change = (btc.change_24h || 0).toFixed(2)
        const emoji = (btc.change_24h || 0) >= 0 ? '🟢' : '🔴'
        const trend = (btc.change_24h || 0) >= 0 ? '上漲' : '下跌'

        // 3. Format LINE Message (Branded)
        // const { createBrandedFlexMessage } = require('@/lib/bot/ui/base')

        const message = createBrandedFlexMessage({
            title: '每小時行情速報',
            mainText: `BTC: $${price} ${emoji}`,
            subText: `24h 漲跌幅: ${change}% | 趨勢: ${trend}\n成交量: ${(btc.volume_24h / 1000000).toFixed(0)}M USDT`,
            actionLabel: '查看完整圖表',
            actionUrl: 'https://cryptotw.app/dashboard',
            theme: btc.change_24h >= 0 ? 'success' : 'alert'
        })

        // 4. Send
        // Simple chunking for Alpha (assuming < 450 users)
        await multicastMessage(userIds.slice(0, 450), [message])

        return NextResponse.json({
            success: true,
            count: userIds.length,
            data: { price, change }
        })

    } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('[TriggerQuote] Error', err, { feature: 'tasks' })
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
