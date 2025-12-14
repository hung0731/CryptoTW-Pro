import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

async function generateWhaleSummary(positions: any[]): Promise<string | null> {
    if (!genAI || !positions || positions.length === 0) return null

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

        // Prepare simplified data for AI
        const top20 = positions.slice(0, 20).map((p, i) => ({
            rank: i + 1,
            symbol: p.symbol || p.coin,
            side: p.side || (parseFloat(p.szi || '0') > 0 ? 'LONG' : 'SHORT'),
            size: parseFloat(p.amount || p.szi || '0')
        }))

        const prompt = `
你是加密貨幣分析師。根據以下 Hyperliquid 前 20 名巨鯨持倉數據，用 1-2 句話總結他們的動態。

【數據】
${JSON.stringify(top20, null, 2)}

【要求】
1. 用繁體中文
2. 精簡摘要（30-50字）
3. 重點：多空分佈、重倉幣種、整體傾向
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
        const [alerts, positions] = await Promise.all([
            coinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}),
            coinglassV4Request<any[]>('/api/hyperliquid/whale-position', {})
        ])

        // Get top 20 positions
        const top20Positions = (positions || []).slice(0, 20)

        // Generate AI summary
        const summary = await generateWhaleSummary(top20Positions)

        return NextResponse.json({
            whales: {
                alerts: alerts || [],
                positions: top20Positions,
                summary: summary
            }
        })
    } catch (error) {
        console.error('Whale Watch API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch whale data' }, { status: 500 })
    }
}
