import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025'

export interface MarketSummaryResult {
    emoji: string
    sentiment: '偏多' | '偏空' | '震盪'
    sentiment_score: number
    headline: string

    analysis: {
        price_momentum: { summary: string; signal: string }
        capital_flow: { summary: string; interpretation: string }
        whale_activity: { summary: string; interpretation: string }
        retail_sentiment: { summary: string; interpretation: string }
        risk_zones: { summary: string; interpretation: string }
    }

    action_suggestion: {
        bias: string
        entry_zone: string
        stop_loss_zone: string
        take_profit_zone: string
        risk_note: string
    }
}

export async function generateMarketSummary(marketData: any): Promise<MarketSummaryResult | null> {
    if (!genAI) {
        console.error('Gemini API Key is missing')
        return null
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
你是幣圈老司機。看數據，給分析。解釋要清楚，操作建議要具體。

【數據】
${JSON.stringify(marketData, null, 2)}

【分析邏輯】
1. **趨勢判斷**：
   - 價格漲 + OI漲 = 強勢上漲 (Trend Following)
   - 價格跌 + OI漲 = 主力建倉空單 (Short Build)
   - 價格漲 + OI跌 = 空頭回補 (Short Cover)
   - 價格跌 + OI跌 = 多頭止損 (Long Liquidation)

2. **背離信號 (Divergence)**：
   - 價格創新高 + RSI 未創新高 = 頂背離 (看跌)
   - 價格創新低 + RSI 未創新低 = 底背離 (看漲)
   - 價格跌 + Taker Buy 強勢 = 主力吸籌 (Absorption)

3. **關鍵指標**：
   - RSI > 70 過熱 | < 30 超賣
   - 資金費率 > 0.05% 偏高 | < -0.05% 偏低
   - ETF 淨流入 = 機構買盤支撐

【輸出要求】
1. summary 15-25 個字，包含關鍵數據變化
2. interpretation 15-25 個字，解讀背後資金意圖
3. 價格用簡寫：10萬、9.8萬
4. headline 20-30 個字，必須包含「趨勢」或「背離」關鍵字
5. risk_note 要具體說明理由 (如：RSI頂背離、費率過熱)

【JSON】
{
  "emoji": "🔥",
  "sentiment": "偏多",
  "sentiment_score": 72,
  "headline": "BTC 突破 10 萬大關，量價配合完美，RSI 未見背離，趨勢強勁",
  
  "analysis": {
    "price_momentum": {
      "summary": "報價 10.2 萬，RSI 68 接近超買但未背離",
      "signal": "多頭"
    },
    "capital_flow": {
      "summary": "OI 1H 增加 2.5%，費率 0.02% 健康",
      "interpretation": "價格與持倉量同步上漲，標準的趨勢延續信號"
    },
    "whale_activity": {
      "summary": "大戶持倉比 1.35，ETF 淨流入 2.3 億",
      "interpretation": "機構持續買入，籌碼集中度提高，主力控盤"
    },
    "retail_sentiment": {
      "summary": "恐懼貪婪 65，Taker 買跌比 1.2",
      "interpretation": "散戶情緒樂觀但未瘋狂，主動買盤承接力強"
    },
    "risk_zones": {
      "summary": "上方壓力 10.5 萬，下方爆倉密集區 9.8 萬",
      "interpretation": "若跌破 9.8 萬將觸發大量多單止損，需防守"
    }
  },
  
  "action_suggestion": {
    "bias": "偏多",
    "entry_zone": "9.9-10.0萬",
    "stop_loss_zone": "9.7萬",
    "take_profit_zone": "10.8萬",
    "risk_note": "雖趨勢看多，但 RSI 已高，避免追高，等待回踩支撐進場"
  }
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
