import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCache, setCache } from '@/lib/cache'
import { MODEL_NAME } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

const CACHE_KEY = 'whales_data'
const CACHE_TTL = 120 // 2 minutes

// Coinglass Whale Position response type
interface WhalePosition {
    user: string
    symbol: string
    position_size: number
    entry_price: number
    mark_price: number
    liq_price: number
    leverage: number
    margin_balance: number
    position_value_usd: number
    unrealized_pnl: number
    funding_fee: number
    margin_mode: string
    create_time: number
    update_time: number
}

async function generateWhaleSummary(positions: WhalePosition[]): Promise<string | null> {
    if (!genAI || !positions || positions.length === 0) return null

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

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
2. 極度精簡（25字以內），用詞犀利，直接講重點。
3. 風格範例：「ETH 多空分歧明顯，BTC 持倉相對穩定，各路資金對沖激烈。」
4. 重點：多空爭奪、誰在重倉、市場傾向。
5. ❌ 【嚴重限制】嚴禁使用預測性語言（如：將上漲、即將反轉、看好、目標價）。只描述「當下行為」（加倉 / 對沖 / 減碼 / 觀望）。
6. 不要廢話，不要建議。

【輸出】
直接輸出摘要文字，不要有其他格式。

【強制要求排版】中英文、中文與數字、數字與單位之間都一定要加空格如："ABC 中文 123 中文"；°/% 不加。中文用全形標點，不重複；英文句子與書名用半形。數字用半形。專有名詞用官方大小寫，避免亂縮寫。
`
        const result = await model.generateContent(prompt)
        return result.response.text().trim()
    } catch (e) {
        logger.error('Whale Summary AI Error', e, { feature: 'market-api', endpoint: 'whales' })
        return null
    }
}


export async function getWhaleData() {
    // Check cache first
    // Check cache first
    const cached = await getCache<any>(CACHE_KEY)
    if (cached) {
        logger.debug('[Cache HIT] whales_data', { feature: 'market-api', endpoint: 'whales' })
        return cached
    }

    logger.debug('[Cache MISS] whales_data - fetching fresh data', { feature: 'market-api', endpoint: 'whales' })

    const [alerts, positions] = await Promise.all([
        coinglassV4Request<any[]>('/api/hyperliquid/whale-alert', {}),
        coinglassV4Request<WhalePosition[]>('/api/hyperliquid/whale-position', {})
    ])

    const top20Positions = (positions || [])
        .sort((a, b) => Math.abs(b.position_value_usd) - Math.abs(a.position_value_usd))
        .slice(0, 20)

    const summary = await generateWhaleSummary(top20Positions)

    const result = {
        alerts: alerts || [],
        positions: top20Positions,
        summary: summary
    }

    // Cache for 2 minutes
    // Cache for 2 minutes
    await setCache(CACHE_KEY, result, CACHE_TTL)

    return result
}

export async function GET() {
    try {
        const data = await getWhaleData()
        return NextResponse.json({ whales: data })
    } catch (error) {
        logger.error('Whale Watch API Error', error, { feature: 'market-api', endpoint: 'whales' })
        return NextResponse.json({ error: 'Failed to fetch whale data' }, { status: 500 })
    }
}
