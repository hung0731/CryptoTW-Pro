import { AlertEvent } from './alert-engine'
import { multicastMessage } from './line-bot'
import { createAdminClient } from './supabase'
import { generateAlertExplanation } from './gemini'

/**
 * 負責將 AlertEvent 轉換為 LINE Flex Message 並發送
 */
export async function sendAlertNotifications(events: AlertEvent[]) {
    if (events.length === 0) return

    console.log(`[Notification] Preparing to send ${events.length} alerts`)

    // 1. Get Target Users
    const supabase = createAdminClient()
    const { data: users, error } = await supabase
        .from('users')
        .select('line_user_id')
        .eq('membership_status', 'pro')
        .not('line_user_id', 'is', null)

    if (error) {
        console.error('[Notification] Error fetching users:', error)
        return
    }

    const targetIds = users.map(u => u.line_user_id)

    if (targetIds.length === 0) {
        console.log('[Notification] No target users found')
        return
    }

    // 2. Construct Messages
    // Use Promise.all to fetch AI explanations in parallel
    const messages = await Promise.all(
        events.slice(0, 3).map(event => createAlertFlexMessage(event))
    )

    // 3. Send via Multicast
    const chunkSize = 500
    for (let i = 0; i < targetIds.length; i += chunkSize) {
        const chunk = targetIds.slice(i, i + chunkSize)
        await multicastMessage(chunk, messages)
        console.log(`[Notification] Sent to ${chunk.length} users`)
    }
}

/**
 * Create Flex Message for Alert
 */
async function createAlertFlexMessage(event: AlertEvent) {
    const colorMap: Record<string, string> = {
        high: '#D00000', // Red
        medium: '#FF9900', // Orange
        low: '#555555'
    }
    const color = colorMap[event.severity] || '#555555'

    // Use AI to generate educational text
    let contextText = await generateAlertExplanation(event)

    // Fallback if AI fails or returns null
    if (!contextText) {
        const m = event.metrics
        switch (event.type) {
            case 'price_pump': contextText = `BTC 短時上漲 ${m.change}。通常代表買盤強勁，但需留意是否為誘多。`; break;
            case 'price_drop': contextText = `BTC 短時下跌 ${m.change}。通常代表賣壓湧現，需留意支撐位是否守住。`; break;
            case 'volatility_warning': contextText = `價格盤整但 OI 劇烈變化 (${m.oi_change})，通常是大行情的先行指標。`; break;
            case 'heavy_pump': contextText = `空單爆倉 ${m.total}，可能引發軋空行情 (Short Squeeze)。`; break;
            case 'heavy_dump': contextText = `多單爆倉 ${m.total}，可能引發連環下殺 (Long Squeeze)。`; break;
            case 'whale_shift': contextText = `巨鯨行為從 ${m.from} 轉變為 ${m.to}，值得關注大戶動向。`; break;
            case 'funding_high': contextText = `資金費率高達 ${m.funding}，多頭擁擠，留意回調風險。`; break;
            case 'funding_flip_neg': contextText = `資金費率轉負 (${m.funding})，空頭情緒佔優，留意軋空風險。`; break;
            case 'oi_spike': contextText = `持倉量激增 ${m.change}，資金進場，波動即將放大。`; break;
            case 'whale_divergence': contextText = `巨鯨 (${m.whale_lsr}) 與散戶 (${m.retail_lsr}) 看法分歧，通常跟隨巨鯨勝率較高。`; break;
            default: contextText = event.summary;
        }
    }

    return {
        type: 'flex',
        altText: `🔔 [快訊] ${event.summary}`,
        contents: {
            type: 'bubble',
            size: 'kilo',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            {
                                type: 'text',
                                text: '🔔 市場快訊',
                                weight: 'bold',
                                color: color,
                                size: 'xs'
                            },
                            {
                                type: 'text',
                                text: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
                                size: 'xxs',
                                color: '#aaaaaa',
                                align: 'end'
                            }
                        ]
                    },
                    {
                        type: 'text',
                        text: event.summary,
                        weight: 'bold',
                        size: 'md',
                        margin: 'md',
                        wrap: true
                    },
                    {
                        type: 'separator',
                        margin: 'md',
                        color: '#f0f0f0'
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'md',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'text',
                                text: '📊 數據解讀',
                                size: 'xs',
                                color: '#888888',
                                weight: 'bold'
                            },
                            {
                                type: 'text',
                                text: contextText,
                                size: 'xs',
                                color: '#555555',
                                wrap: true
                            }
                        ]
                    }
                ]
            },
            footer: {
                type: "box",
                layout: "horizontal",
                spacing: "sm",
                contents: [
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "uri",
                            label: "查看詳細數據",
                            uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/markets`
                        },
                        color: "#1F1AD9"
                    }
                ]
            }
        }
    }
}
