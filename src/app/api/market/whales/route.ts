import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

// Hyperliquid Leaderboard API (7D window)
async function fetchHyperliquidLeaderboard(): Promise<any[]> {
    try {
        const res = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'leaderboard', timeWindow: '7d' })
        })
        if (!res.ok) return []
        const data = await res.json()
        // Return top 20 from 7-day leaderboard
        return (data.leaderboardRows || data || []).slice(0, 20)
    } catch (e) {
        console.error('Hyperliquid Leaderboard Error:', e)
        return []
    }
}

async function generateWhaleSummary(positions: any[]): Promise<string | null> {
    if (!genAI || !positions || positions.length === 0) return null

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

        // Prepare simplified data for AI
        const top20 = positions.slice(0, 20).map((p, i) => ({
            rank: i + 1,
            address: p.ethAddress || p.user || 'Unknown',
            pnl: p.accountValue || p.pnl || 0,
            windowPerformance: p.windowPerformances || []
        }))

        const prompt = `
你是加密貨幣分析師。根據以下 Hyperliquid All-Time Leaderboard 前 20 名數據，用 1-2 句話總結他們的動態。

【數據】
${JSON.stringify(top20, null, 2)}

【要求】
1. 用繁體中文
2. 精簡摘要（30-50字）
3. 重點：整體盈虧狀況、頂級交易者表現
4. 不要給投資建議

【輸出】
直接輸出摘要文字，不要有其他格式。
`
        const result = await model.generateContent(prompt)
        return result.response.text().trim()
    } catch (e) {
        console.error('Whale Summary AI Error:', e)
        return null
    }
}

export async function GET() {
    try {
        // Fetch Hyperliquid Leaderboard (top 20 all-time)
        const [alerts, leaderboard] = await Promise.all([
            coinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}),
            fetchHyperliquidLeaderboard()
        ])

        // Generate AI summary
        const summary = await generateWhaleSummary(leaderboard)

        return NextResponse.json({
            whales: {
                alerts: alerts || [],
                positions: leaderboard,
                summary: summary
            }
        })
    } catch (error) {
        console.error('Whale Watch API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch whale data' }, { status: 500 })
    }
}
