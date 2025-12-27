import { NextRequest, NextResponse } from 'next/server'
import { generateMarketContextBrief } from '@/lib/ai'
import { multicastMessage } from '@/lib/line-bot'
import { setCache, CacheTTL } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase-admin'
import { THEME, createProLabel, createSharedFooter } from '@/lib/bot/ui/flex-generator'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET || 'cryptotw-cron-secret'

/**
 * Daily Market Report Cron Job
 * 
 * Runs at 9:00 AM Taiwan time (UTC+8)
 * Generates AI market summary and pushes to all subscribed LINE users
 */
export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret')
    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        logger.info('[CRON] Starting daily market report generation...', { feature: 'cron' })

        // 1. Get all LINE users who have subscribed
        const supabase = createAdminClient()
        const { data: subscribers, error: dbError } = await supabase
            .from('users')
            .select('line_user_id')
            .not('line_user_id', 'is', null)

        if (dbError) {
            logger.error('[CRON] Failed to fetch subscribers', dbError, { feature: 'cron' })
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!subscribers || subscribers.length === 0) {
            logger.info('[CRON] No subscribers found, skipping daily report', { feature: 'cron' })
            return NextResponse.json({ success: true, message: 'No subscribers' })
        }

        const userIds = subscribers.map(u => u.line_user_id).filter(Boolean) as string[]

        // 2. Fetch market data
        const apiKey = process.env.COINGLASS_API_KEY
        if (!apiKey) throw new Error('COINGLASS_API_KEY not configured')

        const [newsRes, fgiRes, frRes, priceRes] = await Promise.all([
            fetch('https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/index/fear-greed-history', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/futures/funding-rate/vol?symbol=BTC&type=U', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/futures/price?symbol=BTC', { headers: { 'CG-API-KEY': apiKey } })
        ])

        const newsJson = newsRes.ok ? await newsRes.json() : null
        const fgiJson = fgiRes.ok ? await fgiRes.json() : null
        const frJson = frRes.ok ? await frRes.json() : null
        const priceJson = priceRes.ok ? await priceRes.json() : null

        const btcPrice = priceJson?.data?.price || 0
        const fgi = fgiJson?.data?.[0]?.values?.[0]?.value || 'N/A'

        // 3. Generate AI summary
        const context = await generateMarketContextBrief(newsJson?.data || [], {
            fgi: fgiJson?.data?.[0]?.values?.[0]?.value,
            fundingRate: frJson?.data?.[0]?.rate
        })

        // 4. Build LINE Flex Message (matching flex-generator.ts style)
        const today = new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })

        const message = {
            type: 'flex' as const,
            altText: `📊 ${today} 每日市場報告`,
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
                                { type: 'text' as const, text: '📊 每日市場報告', weight: 'bold' as const, size: THEME.sizes.title, color: THEME.colors.brand, flex: 1 },
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
                        // Big Price Number
                        {
                            type: 'box' as const,
                            layout: 'baseline' as const,
                            margin: 'xs' as const,
                            contents: [
                                { type: 'text' as const, text: `${Math.round(btcPrice).toLocaleString()}`, weight: 'bold' as const, size: 'xxl' as const, color: THEME.colors.text, flex: 0 },
                                { type: 'text' as const, text: ' USDT', weight: 'bold' as const, size: THEME.sizes.body, color: THEME.colors.text, flex: 0 }
                            ]
                        },
                        // Context Subtext
                        {
                            type: 'box' as const,
                            layout: 'baseline' as const,
                            margin: 'xs' as const,
                            contents: [
                                { type: 'text' as const, text: `${today} `, size: 'md' as const, color: THEME.colors.textSub, flex: 0 },
                                { type: 'text' as const, text: `FGI: ${fgi}`, size: 'md' as const, color: THEME.colors.textSub, weight: 'bold' as const, flex: 0 }
                            ]
                        },
                        { type: 'separator' as const, margin: 'md' as const, color: THEME.colors.separator },
                        // AI Summary Highlights
                        {
                            type: 'box' as const,
                            layout: 'vertical' as const,
                            margin: 'md' as const,
                            spacing: 'sm' as const,
                            contents: (context?.highlights || []).slice(0, 4).map((item) => ({
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                contents: [
                                    { type: 'text' as const, text: `[${item.impact}]`, size: THEME.sizes.sub, color: THEME.colors.brand, flex: 0 },
                                    { type: 'text' as const, text: item.title, size: THEME.sizes.sub, color: THEME.colors.textSub, flex: 1, wrap: true, margin: 'sm' as const }
                                ]
                            }))
                        },
                        { type: 'separator' as const, margin: 'md' as const, color: THEME.colors.separator },
                        { type: 'text' as const, text: '點擊查看完整報告', size: THEME.sizes.tiny, color: THEME.colors.textLight, margin: 'md' as const, align: 'center' as const }
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
                            action: { type: 'uri' as const, label: '查看完整報告', uri: 'https://cryptotw.pro/news' },
                            color: THEME.colors.brand
                        }
                    ]
                },
                styles: { footer: { separator: true } }
            }
        }

        // 5. Send to all subscribers
        const success = await multicastMessage(userIds, [message])

        logger.info(`[CRON] Daily report sent to ${userIds.length} users`, { feature: 'cron', success })

        return NextResponse.json({
            success,
            message: `Daily report sent to ${userIds.length} users`,
            btcPrice,
            fgi
        })

    } catch (error) {
        logger.error('[CRON] Daily report error', error, { feature: 'cron' })
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
