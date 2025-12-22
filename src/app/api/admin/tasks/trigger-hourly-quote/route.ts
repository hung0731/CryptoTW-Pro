import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { multicastMessage } from '@/lib/line-bot'
import { getMarketSnapshot } from '@/lib/market-aggregator'

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
        const btc = snapshot.btc
        const price = btc.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
        const change = btc.change_24h.toFixed(2)
        const emoji = btc.change_24h >= 0 ? '🟢' : '🔴'
        const trend = btc.change_24h >= 0 ? '上漲' : '下跌'

        // 3. Format LINE Message
        const message = {
            type: 'flex',
            altText: `BTC 報價: $${price} (${change}%)`,
            contents: {
                "type": "bubble",
                "size": "giga",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "backgroundColor": "#171717",
                    "paddingAll": "20px",
                    "contents": [
                        {
                            "type": "text",
                            "text": "BTC 每小時報價",
                            "color": "#888888",
                            "size": "xs",
                            "weight": "bold",
                            "align": "center"
                        },
                        {
                            "type": "separator",
                            "margin": "md",
                            "color": "#333333"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "lg",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "Bitcoin",
                                    "color": "#ffffff",
                                    "size": "md",
                                    "weight": "bold"
                                },
                                {
                                    "type": "text",
                                    "text": `$${price}`,
                                    "color": btc.change_24h >= 0 ? "#22c55e" : "#ef4444",
                                    "size": "4xl",
                                    "weight": "bold",
                                    "margin": "sm"
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "md",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${emoji} ${change}% (24h)`,
                                    "color": btc.change_24h >= 0 ? "#86efac" : "#fca5a5",
                                    "size": "sm"
                                },
                                {
                                    "type": "text",
                                    "text": `Vol: ${(btc.volume_24h / 1000000).toFixed(0)}M`,
                                    "color": "#888888",
                                    "size": "sm",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "backgroundColor": "#171717",
                    "paddingAll": "15px",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "查看詳細圖表",
                                "uri": "https://cryptotw.app/" // TODO: Deep link
                            },
                            "color": "#3b82f6",
                            "style": "secondary"
                        }
                    ]
                }
            }
        }

        // 4. Send
        // Simple chunking for Alpha (assuming < 450 users)
        await multicastMessage(userIds.slice(0, 450), [message])

        return NextResponse.json({
            success: true,
            count: userIds.length,
            data: { price, change }
        })

    } catch (e: any) {
        console.error('[TriggerQuote] Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
