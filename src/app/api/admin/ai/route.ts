import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { generateMarketContextBrief, generateAIDecision } from '@/lib/gemini'
import { getCache, setCache, CacheTTL, clearCache } from '@/lib/cache'

// Admin API: Manage AI-generated content
// GET - View current AI cache status
// POST - Regenerate AI content

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        // Get cache status for AI content
        const marketContext = getCache('market_context')
        const aiDecision = getCache('ai_decision')
        const coinglassNews = getCache('coinglass_news')

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
            // Fetch fresh news from Coinglass
            const newsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/coinglass/news`)
            const newsJson = await newsRes.json()
            const newsItems = newsJson.news || []

            if (type === 'market_context' || type === 'all') {
                // Regenerate market context
                const result = await generateMarketContextBrief(newsItems)
                if (result) {
                    setCache('market_context', result, CacheTTL.SLOW) // 30 min
                }
            }

            if (type === 'ai_decision' || type === 'all') {
                // Regenerate AI decision (needs dashboard data)
                const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/coinglass/dashboard`)
                const dashboardJson = await dashboardRes.json()
                const dashboard = dashboardJson.dashboard

                if (dashboard) {
                    const marketData = {
                        fundingRate: dashboard.funding?.rate || 0,
                        longShortRatio: (dashboard.longShort?.global?.longRate || 50) / (dashboard.longShort?.global?.shortRate || 50),
                        totalLiquidation: dashboard.liquidation?.total || 0,
                        sentimentScore: 50,
                        whaleStatus: '觀望中'
                    }

                    const marketContext = getCache<{ highlights?: { title: string }[] }>('market_context')
                    const newsHighlights = marketContext?.highlights?.slice(0, 3).map(h => h.title) || []

                    const result = await generateAIDecision(marketData, newsHighlights)
                    if (result) {
                        setCache('ai_decision', result, CacheTTL.MEDIUM) // 5 min
                    }
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
                clearCache('market_context')
            }
            if (type === 'ai_decision' || type === 'all') {
                clearCache('ai_decision')
            }
            if (type === 'coinglass_news' || type === 'all') {
                clearCache('coinglass_news')
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
