import { NextRequest, NextResponse } from 'next/server'
import { multicastMessage } from '@/lib/line-bot'
import { getCache, setCache } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase-admin'
import { THEME, createProLabel, createSharedFooter } from '@/lib/bot/ui/flex-generator'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const CRON_SECRET = process.env.CRON_SECRET || 'cryptotw-cron-secret'

// Key price levels to monitor (in USD)
const PRICE_LEVELS = [
    { level: 100000, label: '10 萬美元關口' },
    { level: 95000, label: '9.5 萬美元' },
    { level: 90000, label: '9 萬美元心理關卡' },
    { level: 85000, label: '8.5 萬' },
    { level: 80000, label: '8 萬美元' },
    { level: 75000, label: '7.5 萬' },
    { level: 70000, label: '7 萬美元' },
]

// Anti-spam: cooldown period in seconds (1 hour)
const ALERT_COOLDOWN = 3600

/**
 * BTC Price Breakthrough Alert
 * 
 * Monitors BTC price and sends LINE alerts when breaking key levels
 * Anti-spam protection: 
 * - Tracks last alerted level in Redis
 * - 1-hour cooldown per level per direction
 */
export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret')
    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Get current BTC price
        const apiKey = process.env.COINGLASS_API_KEY
        if (!apiKey) throw new Error('COINGLASS_API_KEY not configured')

        const priceRes = await fetch('https://open-api-v4.coinglass.com/api/futures/price?symbol=BTC', {
            headers: { 'CG-API-KEY': apiKey }
        })

        if (!priceRes.ok) throw new Error('Failed to fetch BTC price')

        const priceJson = await priceRes.json()
        const currentPrice = priceJson?.data?.price

        if (!currentPrice) {
            return NextResponse.json({ error: 'Invalid price data' }, { status: 500 })
        }

        logger.info(`[CRON] BTC Price Check: $${currentPrice}`, { feature: 'price-alert' })

        // 2. Get last known price from Redis
        const lastPriceKey = 'price_alert:btc:last_price'
        const lastPrice = await getCache(lastPriceKey) as number | null

        // 3. Check if any level was crossed
        const alerts: { level: number; label: string; direction: 'up' | 'down' }[] = []

        if (lastPrice) {
            for (const { level, label } of PRICE_LEVELS) {
                // Crossed UP
                if (lastPrice < level && currentPrice >= level) {
                    const cooldownKey = `price_alert:btc:cooldown:${level}:up`
                    const cooldown = await getCache(cooldownKey)

                    if (!cooldown) {
                        alerts.push({ level, label, direction: 'up' })
                        await setCache(cooldownKey, Date.now(), ALERT_COOLDOWN)
                    }
                }
                // Crossed DOWN
                else if (lastPrice > level && currentPrice <= level) {
                    const cooldownKey = `price_alert:btc:cooldown:${level}:down`
                    const cooldown = await getCache(cooldownKey)

                    if (!cooldown) {
                        alerts.push({ level, label, direction: 'down' })
                        await setCache(cooldownKey, Date.now(), ALERT_COOLDOWN)
                    }
                }
            }
        }

        // 4. Save current price
        await setCache(lastPriceKey, currentPrice, 86400) // 24 hours

        // 5. If no alerts, exit early
        if (alerts.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No price alerts triggered',
                currentPrice,
                lastPrice
            })
        }

        // 6. Get all LINE subscribers
        const supabase = createAdminClient()
        const { data: subscribers, error: dbError } = await supabase
            .from('users')
            .select('line_user_id')
            .not('line_user_id', 'is', null)

        if (dbError) {
            logger.error('[CRON] Failed to fetch subscribers', dbError, { feature: 'price-alert' })
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        const userIds = (subscribers || []).map(u => u.line_user_id).filter(Boolean) as string[]

        if (userIds.length === 0) {
            return NextResponse.json({ success: true, message: 'No subscribers', alerts })
        }

        // 7. Send alerts (matching flex-generator.ts THEME style)
        for (const alert of alerts) {
            const emoji = alert.direction === 'up' ? '🚀' : '📉'
            const action = alert.direction === 'up' ? '突破' : '跌破'
            const color = alert.direction === 'up' ? THEME.colors.up : THEME.colors.down

            const message = {
                type: 'flex' as const,
                altText: `${emoji} BTC ${action} ${alert.label}`,
                contents: {
                    type: 'bubble' as const,
                    size: THEME.sizes.bubble,
                    header: {
                        type: 'box' as const,
                        layout: 'vertical' as const,
                        contents: [
                            {
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                contents: [
                                    { type: 'text' as const, text: `${emoji} 價格警報`, weight: 'bold' as const, size: THEME.sizes.title, color: THEME.colors.brand, flex: 1 },
                                    createProLabel()
                                ]
                            }
                        ],
                        paddingBottom: '0px'
                    },
                    body: {
                        type: 'box' as const,
                        layout: 'vertical' as const,
                        contents: [
                            // Big Number
                            {
                                type: 'box' as const,
                                layout: 'baseline' as const,
                                margin: 'xs' as const,
                                contents: [
                                    { type: 'text' as const, text: alert.label, weight: 'bold' as const, size: 'xxl' as const, color: color, flex: 0 }
                                ]
                            },
                            // Context
                            {
                                type: 'box' as const,
                                layout: 'baseline' as const,
                                margin: 'xs' as const,
                                contents: [
                                    { type: 'text' as const, text: `BTC `, size: 'md' as const, color: THEME.colors.textSub, flex: 0 },
                                    { type: 'text' as const, text: action, size: 'md' as const, color: THEME.colors.textSub, weight: 'bold' as const, flex: 0 },
                                    { type: 'text' as const, text: ` ${alert.label}`, size: 'md' as const, color: THEME.colors.textSub, flex: 0 }
                                ]
                            },
                            { type: 'separator' as const, margin: 'md' as const, color: THEME.colors.separator },
                            // Current Price Row
                            {
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                margin: 'md' as const,
                                contents: [
                                    { type: 'text' as const, text: '現價', size: THEME.sizes.body, color: THEME.colors.textSub, flex: 1 },
                                    { type: 'text' as const, text: `$${Number(currentPrice).toLocaleString()}`, size: THEME.sizes.body, color: THEME.colors.text, weight: 'bold' as const, align: 'end' as const, flex: 1 }
                                ]
                            },
                            { type: 'separator' as const, margin: 'md' as const, color: THEME.colors.separator },
                            { type: 'text' as const, text: '剛剛更新', size: THEME.sizes.tiny, color: THEME.colors.textLight, margin: 'md' as const, align: 'center' as const }
                        ]
                    },
                    footer: {
                        type: 'box' as const,
                        layout: 'vertical' as const,
                        contents: [
                            {
                                type: 'button' as const,
                                style: 'primary' as const,
                                height: 'sm' as const,
                                action: { type: 'uri' as const, label: '查看即時行情', uri: 'https://cryptotw.pro' },
                                color: color
                            }
                        ]
                    },
                    styles: { footer: { separator: true } }
                }
            }

            await multicastMessage(userIds, [message])

            logger.info(`[CRON] Price alert sent: BTC ${action} ${alert.label}`, {
                feature: 'price-alert',
                level: alert.level,
                direction: alert.direction,
                recipients: userIds.length
            })
        }

        return NextResponse.json({
            success: true,
            alerts,
            currentPrice,
            lastPrice,
            recipientCount: userIds.length
        })

    } catch (error) {
        logger.error('[CRON] Price alert error', error, { feature: 'price-alert' })
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
