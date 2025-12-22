import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { generateMarketContextBrief, generateAIDecision } from '@/lib/gemini'
import { getCache, setCache, CacheTTL, clearCache } from '@/lib/cache'
import { coinglassV4Request, getCoinglassApiKey } from '@/lib/coinglass'

// Admin API: Manage AI-generated content
// GET - View current AI cache status
// POST - Regenerate AI content

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        // Get cache status for AI content
        const marketContext = await getCache('market_context')
        const aiDecision = await getCache('ai_decision')
        const coinglassNews = await getCache('coinglass_news')

        return NextResponse.json({
            caches: {
                market_context: {
                    exists: !!marketContext,
                    data: marketContext,
                    description: 'AI 新聞懶人包 (10 則排序新聞)'
                },
                ai_decision: {
                    exists: !!aiDecision,
                    data: aiDecision,
                    description: 'AI 市場決策分析'
                },
                coinglass_news: {
                    exists: !!coinglassNews,
                    itemCount: Array.isArray(coinglassNews) ? coinglassNews.length : 0,
                    description: 'Coinglass 原始新聞快取'
                }
            },
            lastChecked: new Date().toISOString()
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const { action, type } = await req.json()

        if (action === 'regenerate') {
            // Fetch fresh news directly from Coinglass API
            let newsItems: any[] = []
            const apiKey = getCoinglassApiKey()
            if (apiKey) {
                try {
                    const res = await fetch('https://open-api-v4.coinglass.com/api/newsflash/list?language=zh-tw', {
                        headers: { 'CG-API-KEY': apiKey }
                    })
                    const json = await res.json()
                    if (json.code === '0' && Array.isArray(json.data)) {
                        newsItems = json.data
                    }
                } catch (e) {
                    console.error('News fetch error:', e)
                }
            }

            if (type === 'market_context' || type === 'all') {
                // Regenerate market context
                const result = await generateMarketContextBrief(newsItems)
                if (result) {
                    await setCache('market_context', result, CacheTTL.SLOW) // 15 min
                }
            }

            if (type === 'ai_decision' || type === 'all') {
                // Get dashboard data directly
                const [fundingData, liquidationData, longShortData] = await Promise.all([
                    coinglassV4Request<any[]>('/api/futures/funding-rate/exchange-list', { symbol: 'BTC' }).catch(() => []),
                    coinglassV4Request<any[]>('/api/futures/liquidation/history', { symbol: 'BTC', interval: '1d', limit: 1 }).catch(() => []),
                    coinglassV4Request<any[]>('/api/futures/global-long-short-account-ratio/history', {
                        symbol: 'BTC', exchange: 'Binance', interval: '1h', limit: 1
                    }).catch(() => [])
                ])

                // Extract funding rate
                let fundingRate = 0
                if (fundingData && fundingData.length > 0) {
                    const marginList = fundingData[0]?.stablecoin_margin_list || []
                    const binance = marginList.find((e: any) => e.exchange === 'Binance')
                    fundingRate = binance?.funding_rate || 0
                }

                // Extract liquidation
                const liq = liquidationData?.[0] || {}
                const totalLiq = (liq.longLiquidationUsd || 0) + (liq.shortLiquidationUsd || 0)

                // Extract long/short
                const ls = longShortData?.[0] || {}
                const longRate = ls.longRate || 50
                const shortRate = ls.shortRate || 50

                const marketData = {
                    fundingRate,
                    longShortRatio: longRate / (shortRate || 1),
                    totalLiquidation: totalLiq,
                    sentimentScore: 50,
                    whaleStatus: '觀望中'
                }

                const marketContext = await getCache<{ highlights?: { title: string }[] }>('market_context')
                const newsHighlights = marketContext?.highlights?.slice(0, 3).map(h => h.title) || []

                const result = await generateAIDecision(marketData, newsHighlights)
                if (result) {
                    await setCache('ai_decision', result, CacheTTL.MEDIUM) // 5 min
                }
            }

            return NextResponse.json({
                success: true,
                message: `已重新生成 ${type === 'all' ? '全部 AI 內容' : type}`,
                regeneratedAt: new Date().toISOString()
            })
        }

        if (action === 'clear') {
            // Clear specific cache
            if (type === 'market_context' || type === 'all') {
                await clearCache('market_context')
            }
            if (type === 'ai_decision' || type === 'all') {
                await clearCache('ai_decision')
            }
            if (type === 'coinglass_news' || type === 'all') {
                await clearCache('coinglass_news')
            }

            return NextResponse.json({
                success: true,
                message: `已清除 ${type === 'all' ? '全部快取' : type} 快取`,
                clearedAt: new Date().toISOString()
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (e: any) {
        console.error('AI Admin API Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
