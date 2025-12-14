
import { NextResponse } from 'next/server'
import { getDerivativesData } from '../derivatives/route'
import { getWhaleData } from '../whales/route'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // 1 min cache

export async function GET() {
    try {
        // Parallel fetch
        const [derivatives, whales, sentimentRes] = await Promise.all([
            getDerivativesData().catch(e => null),
            getWhaleData().catch(e => null),
            supabase.from('market_reports').select('*').order('created_at', { ascending: false }).limit(1)
        ])

        const sentimentReport = sentimentRes?.data?.[0]

        // 1. Build Mainline Status
        // Use Sentiment Report headline if available, otherwise fallback
        const headline = sentimentReport?.summary || "數據整合中..."

        // Dimensions
        // A. Derivatives
        const fundingRate = derivatives?.metrics?.fundingRate || 0
        const lsRatio = derivatives?.metrics?.lsRatio || 1
        let derivStatus = '中性'
        if (fundingRate > 0.0003) derivStatus = '過熱'
        else if (fundingRate < -0.0003) derivStatus = '偏空'

        // B. Whales
        // Check whale_sentiment from report or calculate from whale data
        const whaleSummary = whales?.summary || "" // AI summary
        // Extract status from text if possible, or use simplified metric if available
        // For now, use "監控中" or sentiment from metadata if available
        const whaleStatus = sentimentReport?.metadata?.market_structure?.bias || '中性'

        // C. Sentiment
        const sentimentScore = sentimentReport?.sentiment_score || 50
        const sentimentLabel = sentimentReport?.sentiment || "中性"

        // 2. Build Anomalies
        const anomalies = []
        // Check Funding
        if (fundingRate > 0.0005) anomalies.push({ type: 'Funding', message: 'BTC 費率異常飆高', link: '/derivatives' })
        if (fundingRate < -0.0005) anomalies.push({ type: 'Funding', message: 'BTC 費率顯著負值', link: '/derivatives' })
        // Check Liquidation
        const longLiq = derivatives?.metrics?.longLiq || 0
        const shortLiq = derivatives?.metrics?.shortLiq || 0
        if (longLiq > 50000000) anomalies.push({ type: 'Liquidation', message: '多單爆倉激增 (>$50M)', link: '/derivatives' })
        if (shortLiq > 50000000) anomalies.push({ type: 'Liquidation', message: '空單爆倉激增 (>$50M)', link: '/derivatives' })

        // 3. Build Cross Refs (Teasers)
        const crossRefs = []
        if (whales?.summary) {
            crossRefs.push({
                source: 'Smart Money',
                text: whales.summary.slice(0, 30) + '...',
                link: '/smart-money'
            })
        }
        if (derivatives?.summary) {
            crossRefs.push({
                source: 'Derivatives',
                text: derivatives.summary.slice(0, 30) + '...',
                link: '/derivatives'
            })
        }

        return NextResponse.json({
            router: {
                mainline: {
                    headline,
                    dimensions: [
                        { name: '合約面', status: derivStatus, text: `費率 ${(fundingRate * 100).toFixed(3)}%` },
                        { name: '巨鯨面', status: whaleStatus, text: whaleSummary ? '巨鯨動態更新' : '監控中' },
                        { name: '情緒面', status: sentimentLabel, text: `指數 ${sentimentScore}` }
                    ]
                },
                anomalies,
                crossRefs
            }
        })

    } catch (error) {
        console.error('Home Router API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
