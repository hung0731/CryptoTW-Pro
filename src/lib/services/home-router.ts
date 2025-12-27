import { logger } from '@/lib/logger'
import { getDerivativesData } from '@/app/api/market/derivatives/route'
import { getWhaleData } from '@/app/api/market/whales/route'
import { supabase } from '@/lib/supabase'
import { cachedCoinglassV4Request } from '@/lib/coinglass'
import { generateMarketContextBrief, generateAIDecision, AIDecision } from '@/lib/ai'
import { MarketContext } from '@/lib/types'
import { getCache, setCache } from '@/lib/cache'

export interface HomeRouterData {
    aiDecision: AIDecision | null
    mainline: {
        headline: string
        actionHint: string
        actionColor: string
        dimensions: {
            name: string
            status: string
            color: string
        }[]
    }
    anomaly: {
        type: string
        title: string
        message: string
        reason: string
        risk: string
        link: string
    } | null
    crossRefs: {
        source: string
        implication: string
        link: string
    }[]
    focusToday: {
        name: string
        status: string
        link: string
    }[]
    marketContext: MarketContext | null
}

export class HomeRouterService {
    static async getRouterData(): Promise<HomeRouterData> {
        try {
            // Parallel fetch
            const [derivatives, whales, sentimentRes] = await Promise.all([
                getDerivativesData().catch(e => {
                    logger.error('Failed to get derivatives data', e, { feature: 'home-router' })
                    return null
                }),
                getWhaleData().catch(e => {
                    logger.error('Failed to get whale data', e, { feature: 'home-router' })
                    return null
                }),
                supabase.from('market_reports').select('*').order('created_at', { ascending: false }).limit(1)
            ])

            // --- Market Context + AI Decision Logic ---
            let marketContext: MarketContext | null = await getCache('market_context_brief')
            let aiDecision: AIDecision | null = await getCache('ai_decision')

            // Fetch news for both AI models
            const news = await cachedCoinglassV4Request<any[]>('/api/newsflash/list', {
                limit: 40, lang: 'zh-tw'
            }, 300)

            // Generate Market Context (for news highlights)
            let contextPromise = Promise.resolve(marketContext)
            if (!marketContext && news && Array.isArray(news)) {
                contextPromise = generateMarketContextBrief(news).then(async res => {
                    if (res) await setCache('market_context_brief', res, 1800) // 30 mins
                    return res
                })
            }

            // Generate AI Decision (main conclusion - first screen)
            const sentimentReport = sentimentRes?.data?.[0]
            const fundingRate = derivatives?.metrics?.fundingRate || 0
            const lsRatio = derivatives?.metrics?.lsRatio || 1
            const totalLiq = (derivatives?.metrics?.longLiq || 0) + (derivatives?.metrics?.shortLiq || 0)
            const sentimentScore = sentimentReport?.sentiment_score || 50
            const whaleStatus = sentimentReport?.metadata?.market_structure?.bias || '中性'

            let decisionPromise = Promise.resolve(aiDecision)
            if (!aiDecision) {
                // Use raw news titles immediately to allow parallel execution
                const rawNewsTitles = Array.isArray(news)
                    ? news.slice(0, 5).map(n => n.newsflash_title || n.title || "").filter(Boolean)
                    : []

                decisionPromise = generateAIDecision({
                    fundingRate,
                    longShortRatio: lsRatio,
                    totalLiquidation: totalLiq,
                    sentimentScore,
                    whaleStatus
                }, rawNewsTitles).then(async res => {
                    if (res) await setCache('ai_decision', res, 900) // 15 mins cache
                    return res
                })
            }

            // Await parallel execution
            const [newContext, newDecision] = await Promise.all([contextPromise, decisionPromise])
            marketContext = newContext
            aiDecision = newDecision
            // -----------------------------------------

            // 1. Build Mainline Status
            const headline = sentimentReport?.summary || "數據整合中..."

            // Dimensions & Status
            const sentimentLabel = sentimentReport?.sentiment || "中性"

            let derivStatus = '中性'
            if (fundingRate > 0.0003) derivStatus = '過熱'
            else if (fundingRate < -0.0003) derivStatus = '偏空'

            // Action Hint Logic
            let actionHint = "🟡 偏觀察｜多看少做" // Default
            let actionColor = "yellow"

            if (sentimentScore >= 75 || fundingRate > 0.0005) {
                actionHint = "🔴 高風險｜避免追高，分批止盈"
                actionColor = "red"
            } else if (sentimentScore <= 25 || fundingRate < -0.0005) {
                actionHint = "🟢 偏佈局｜恐慌區間，尋找買點"
                actionColor = "green"
            } else if (Math.abs(fundingRate) < 0.0001 && sentimentScore > 40 && sentimentScore < 60) {
                actionHint = "🟡 震盪｜區間操作，低買高賣"
                actionColor = "yellow"
            }

            // 2. Build Anomalies (Single Critical Only)
            let primaryAnomaly = null

            // Priority 1: High Liquidation (Volatility)
            const longLiq = derivatives?.metrics?.longLiq || 0
            const shortLiq = derivatives?.metrics?.shortLiq || 0

            if (totalLiq > 100000000) { // > 100M
                const type = longLiq > shortLiq ? '多單爆倉' : '空單爆倉'
                primaryAnomaly = {
                    type: 'Liquidation',
                    title: `${type} 激增`,
                    message: `4 小時內爆倉量達 $${(totalLiq / 1000000).toFixed(0)} M`,
                    reason: '市場劇烈波動，槓桿遭到清洗',
                    risk: '短期波動加劇，建議降低槓桿',
                    link: '/prediction?tab=derivatives'
                }
            }

            // Priority 2: Extreme Funding (Reversal) - Only if no Liq anomaly
            if (!primaryAnomaly) {
                if (fundingRate > 0.0005) {
                    primaryAnomaly = {
                        type: 'Funding',
                        title: '費率過熱警告',
                        message: `BTC 費率達 ${(fundingRate * 100).toFixed(3)}%`,
                        reason: '多頭情緒過度樂觀，成本過高',
                        risk: '存在多頭踩踏與回調風險',
                        link: '/prediction?tab=derivatives'
                    }
                } else if (fundingRate < -0.0005) {
                    primaryAnomaly = {
                        type: 'Funding',
                        title: '費率過冷警告',
                        message: `BTC 費率低至 ${(fundingRate * 100).toFixed(3)}%`,
                        reason: '空頭情緒過度悲觀，做空擁擠',
                        risk: '存在軋空反彈風險',
                        link: '/prediction?tab=derivatives'
                    }
                }
            }

            // 3. Build Cross Refs (Source + Implication)
            const crossRefs = []
            if (whales?.summary) {
                crossRefs.push({
                    source: '巨鯨動態',
                    implication: whaleStatus === '偏多' ? '大戶持續吸籌，支撐轉強' : whaleStatus === '偏空' ? '大戶正在派發，壓力沈重' : '大戶持倉觀望，方向不明',
                    link: '/prediction?tab=smartmoney'
                })
            }

            // Derivatives Ref
            let derivImplication = '市場情緒分歧，需觀察'
            if (derivStatus === '過熱') derivImplication = '多頭成本過高，追價風險大'
            if (derivStatus === '偏空') derivImplication = '空頭情緒主導，留意反彈'

            crossRefs.push({
                source: '合約數據',
                implication: derivImplication,
                link: '/prediction?tab=derivatives'
            })

            // 4. Focus Today (Nav List)
            const focusToday = [
                { name: 'BTC 巨鯨流向', status: whaleStatus, link: '/prediction?tab=smartmoney' },
                { name: '財經日曆', status: '今日事件', link: '/calendar' }
            ]

            return {
                aiDecision,
                mainline: {
                    headline,
                    actionHint,
                    actionColor,
                    dimensions: [
                        { name: '合約', status: derivStatus, color: derivStatus === '過熱' ? 'red' : derivStatus === '偏空' ? 'green' : 'neutral' },
                        { name: '大戶', status: whaleStatus, color: whaleStatus.includes('多') ? 'red' : whaleStatus.includes('空') ? 'green' : 'neutral' },
                        { name: '情緒', status: sentimentLabel, color: sentimentLabel.includes('貪婪') ? 'red' : sentimentLabel.includes('恐懼') ? 'green' : 'neutral' }
                    ]
                },
                anomaly: primaryAnomaly,
                crossRefs,
                focusToday,
                marketContext
            }
        } catch (error) {
            logger.error('HomeRouterService Error', error as Error, { feature: 'home-router' })
            throw error // Re-throw to be handled by action
        }
    }
}
