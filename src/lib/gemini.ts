import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025'

export interface MarketSummaryResult {
    emoji: string
    sentiment: '偏多' | '偏空' | '震盪'
    sentiment_score: number
    headline: string
    analysis: string  // 整合段落
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

【語氣要求】
- 專業但平易近人，語氣柔和、不武斷
- 使用「可能」、「或許」、「看來」等委婉用語
- 避免命令式語句，改用「可以考慮」、「建議留意」
- 不使用俗語 (如：莊家、韭菜、老司機)

【數據】
${JSON.stringify(marketData, null, 2)}

【分析邏輯參考】
- 價格漲 + OI漲 = 趨勢增強
- 價格跌 + OI漲 = 賣壓增加
- RSI > 70 偏熱 | < 30 偏冷
- ETF 淨流入 = 機構資金支撐

【輸出格式】
1. **headline**: 15-25 字的日報標題，簡潔點出市場狀態
2. **analysis**: 50-80 字的整合段落，將價格、技術指標、資金流向、機構動態融合為流暢敘述
3. **action**: 操作參考 (偏多/偏空/觀望 + 進場區 + 止損 + 目標)
4. **risk_note**: 15-30 字的風險提示，語氣溫和

【JSON 範例】
{
  "emoji": "📊",
  "sentiment": "偏多",
  "sentiment_score": 65,
  "headline": "BTC 回測支撐後企穩，機構資金持續流入",
  "analysis": "目前價格在 9.1 萬附近整理，RSI 回落至 40 左右，技術面呈現超賣後的修復態勢。持倉量小幅回升，資金費率維持中性，顯示市場槓桿水位健康。ETF 昨日淨流入約 2 億美元，機構買盤仍在，整體來看短線或有反彈空間。",
  "action": {
    "bias": "偏多",
    "entry_zone": "9.0-9.15萬",
    "stop_loss": "8.75萬",
    "take_profit": "9.5萬"
  },
  "risk_note": "若跌破 8.8 萬支撐，建議重新評估多頭策略"
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
