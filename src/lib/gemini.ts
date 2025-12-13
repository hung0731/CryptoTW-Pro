import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025'

export interface MarketSummaryResult {
    emoji: string
    sentiment: '偏多' | '偏空' | '震盪'
    sentiment_score: number
    headline: string
    analysis: string
    whale_summary?: string  // 巨鯨動態摘要
    action: {
        bias: string
        entry_zone: string
        stop_loss: string
        take_profit: string
    }
    risk_note: string
}

export async function generateMarketSummary(marketData: any): Promise<MarketSummaryResult | null> {
    if (!genAI) {
        console.error('Gemini API Key is missing')
        return null
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
你是專業的加密貨幣市場分析師。請基於以下數據撰寫一份簡潔的市場日報。

【語氣規範】
- 專業但平易近人，語氣柔和
- 使用「可能」、「或許」、「看來」等委婉用語
- 避免命令式語句，改用「可以考慮」、「建議留意」
- 不使用俗語（如：莊家、韭菜、老司機）

【中文排版規範】(重要)
- 中英文之間加空格：BTC 價格、RSI 指標、ETF 資金
- 數字與單位之間加空格：9.5 萬、6.55 億美元、+2.5%
- 全形標點與其他字符之間不加空格：好開心！而非 好開心 ！
- 專有名詞保持正確格式：Bitcoin、Ethereum、RSI、MACD

【數據】
${JSON.stringify(marketData, null, 2)}

【分析邏輯】
- 價格漲 + OI 漲 = 趨勢增強
- 價格跌 + OI 漲 = 賣壓增加
- RSI > 70 偏熱｜< 30 偏冷
- ETF 淨流入 = 機構資金支撐
- 巨鯨多單 > 空單 = 聰明資金看多｜空單 > 多單 = 聰明資金看空

【輸出格式】
1. **headline**: 15-20 字標題，精簡點出核心觀點
2. **analysis**: 60-100 字整合段落，融合價格、技術面、資金面
3. **whale_summary**: 15-30 字巨鯨動態摘要（如：過去 24 小時巨鯨開多 X 筆、平倉 X 筆，總值約 X 億美元）。若無數據則輸出 null
4. **action**: 操作參考（bias + entry_zone + stop_loss + take_profit）
5. **risk_note**: 15-25 字風險提示

【JSON 範例】
{
  "emoji": "�",
  "sentiment": "偏多",
  "sentiment_score": 68,
  "headline": "巨鯨看多搭配 ETF 資金流入，BTC 短線偏強",
  "analysis": "BTC 目前在 9.1 萬美元附近震盪。技術面 RSI 約 55，處於中性區域。持倉量小幅回升，資金費率中性。ETF 昨日淨流入約 2 億美元，機構買盤持續。",
  "whale_summary": "過去 24 小時巨鯨開多 8 筆、平倉 3 筆，多單總值約 1.2 億美元，偏向看多。",
  "action": {
    "bias": "偏多",
    "entry_zone": "9.0-9.15 萬",
    "stop_loss": "8.75 萬",
    "take_profit": "9.5 萬"
  },
  "risk_note": "若跌破 8.8 萬支撐，建議暫時觀望"
}
`

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Extract JSON from markdown code block if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)

        if (jsonMatch) {
            const jsonStr = jsonMatch[1]
            return JSON.parse(jsonStr)
        }

        return JSON.parse(text)

    } catch (e) {
        console.error('Gemini Generation Error:', e)
        return null
    }
}
