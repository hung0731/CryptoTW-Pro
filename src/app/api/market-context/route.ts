import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { generateMarketContextBrief } from '@/lib/ai'
import { getCache, setCache, CacheTTL } from '@/lib/cache'
import { CACHE_KEYS } from '@/lib/cache-keys'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes

export async function GET(req: NextRequest) {
    // Rate limit: 30 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(req, 'market-context', 30, 60)
    if (rateLimited) return rateLimited

    try {
        // 1. Check cache first
        const cached = await getCache(CACHE_KEYS.MARKET_CONTEXT)
        if (cached) {
            logger.info('[Cache HIT] Market Context (API)', { feature: 'market-context' })
            return NextResponse.json({ context: cached, cached: true })
        }

        logger.info('[Cache MISS] Market Context - generating fresh AI context', { feature: 'market-context' })

        // Fetch news from Coinglass API (NOT RSS)
        const apiKey = process.env.COINGLASS_API_KEY
        if (!apiKey) {
            throw new Error('COINGLASS_API_KEY not configured')
        }

        // Parallel fetch: News + Indicators
        const [newsRes, fgiRes, frRes] = await Promise.all([
            fetch('https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/index/fear-greed-history', { headers: { 'CG-API-KEY': apiKey } }),
            fetch('https://open-api-v4.coinglass.com/api/futures/funding-rate/vol?symbol=BTC&type=U', { headers: { 'CG-API-KEY': apiKey } })
        ])

        if (!newsRes.ok) throw new Error(`Coinglass API error: ${newsRes.status}`)

        const newsJson = await newsRes.json()
        const fgiJson = fgiRes.ok ? await fgiRes.json() : null
        const frJson = frRes.ok ? await frRes.json() : null

        if (newsJson.code !== '0' || !Array.isArray(newsJson.data)) {
            throw new Error('Invalid Coinglass response')
        }

        const newsItems = newsJson.data

        // Process Indicators
        const indicators = {
            fgi: fgiJson?.data?.[0]?.values?.[0]?.value || null, // Latest FGI
            fundingRate: frJson?.data?.[0]?.rate || null // BTC Funding Rate
        }

        // Generate AI context using Coinglass news + Indicators
        const context = await generateMarketContextBrief(newsItems, indicators)

        if (!context) {
            throw new Error('AI generation failed')
        }

        // Cache the result
        await setCache(CACHE_KEYS.MARKET_CONTEXT, context, CacheTTL.SLOW) // 15 min

        return NextResponse.json({ context })

    } catch (error) {
        logger.error('Market Context API Error', error, { feature: 'market-context' })

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
