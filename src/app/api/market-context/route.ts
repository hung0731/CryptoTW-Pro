import { NextRequest, NextResponse } from 'next/server'
import { generateMarketContextBrief } from '@/lib/gemini'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes

const CACHE_KEY = 'market_context'

export async function GET(req: NextRequest) {
    // Rate limit: 30 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(req, 'market-context', 30, 60)
    if (rateLimited) return rateLimited

    try {
        // Check cache first
        // Check cache first
        const cached = await getCache(CACHE_KEY)
        if (cached) {
            console.log('[Cache HIT] market_context')
            return NextResponse.json({ context: cached, cached: true })
        }

        console.log('[Cache MISS] market_context - generating fresh AI context')

        // Fetch news from Coinglass API (NOT RSS)
        const apiKey = process.env.COINGLASS_API_KEY
        if (!apiKey) {
            throw new Error('COINGLASS_API_KEY not configured')
        }

        const newsRes = await fetch(
            'https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw',
            { headers: { 'CG-API-KEY': apiKey } }
        )

        if (!newsRes.ok) {
            throw new Error(`Coinglass API error: ${newsRes.status}`)
        }

        const newsJson = await newsRes.json()

        if (newsJson.code !== '0' || !Array.isArray(newsJson.data)) {
            throw new Error('Invalid Coinglass response')
        }

        const newsItems = newsJson.data

        // Generate AI context using Coinglass news
        const context = await generateMarketContextBrief(newsItems)

        if (!context) {
            throw new Error('AI generation failed')
        }

        // Cache the result
        // Cache the result
        await setCache(CACHE_KEY, context, CacheTTL.SLOW) // 15 min

        return NextResponse.json({ context })

    } catch (error) {
        console.error('Market Context API Error:', error)

        // Return fallback
        return NextResponse.json({
            context: {
                sentiment: '中性',
                summary: 'AI 正在分析最新市場數據，這可能需要幾秒鐘...',
                highlights: [
                    {
                        title: '⚡️ AI 分析運算中...',
                        reason: '正在解讀最新市場新聞與數據，請稍後刷新頁面查看結果。',
                        impact: '中',
                        bias: '中性',
                        impact_note: 'Analyzing...'
                    }
                ]
            },
            error: true
        }, { status: 500 })
    }
}
