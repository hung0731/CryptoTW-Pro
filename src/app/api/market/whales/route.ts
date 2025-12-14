import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

// Coinglass Whale Position response type
interface WhalePosition {
    user: string                  // User address
    symbol: string                // Token symbol
    position_size: number         // Position size (positive: long, negative: short)
    entry_price: number           // Entry price
    mark_price: number            // Current mark price
    liq_price: number             // Liquidation price
    leverage: number              // Leverage
    margin_balance: number        // Margin balance (USD)
    position_value_usd: number    // Position value (USD)
    unrealized_pnl: number        // Unrealized PnL (USD)
    funding_fee: number           // Funding fee (USD)
    margin_mode: string           // Margin mode (cross / isolated)
    create_time: number           // Entry time (timestamp in ms)
    update_time: number           // Last updated time
}

async function generateWhaleSummary(positions: WhalePosition[]): Promise<string | null> {
    if (!genAI || !positions || positions.length === 0) return null

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

        // Prepare simplified data for AI
        const top20 = positions.slice(0, 20).map((p, i) => ({
            rank: i + 1,
            symbol: p.symbol,
            side: p.position_size > 0 ? 'LONG' : 'SHORT',
            valueUsd: Math.abs(p.position_value_usd),
            pnl: p.unrealized_pnl,
            leverage: p.leverage
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
            coinglassV4Request<WhalePosition[]>('/api/hyperliquid/whale-position', {})
        ])

        // Get top 20 positions sorted by position value
        const top20Positions = (positions || [])
            .sort((a, b) => Math.abs(b.position_value_usd) - Math.abs(a.position_value_usd))
            .slice(0, 20)

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
