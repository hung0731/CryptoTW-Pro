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
你是幣圈老司機。看數據，講重點。話要少，但要準。

【數據】
${JSON.stringify(marketData, null, 2)}

【分析邏輯】
• 費率 > 0.05% = 過熱 | < -0.05% = 過冷
• OI漲+價漲=趨勢強 | OI漲+價跌=建空單
• 大戶多空比 > 1.2 看多 | < 0.8 看空
• ETF 淨流入 = 機構在買 | 淨流出 = 機構在賣
• Coinbase 溢價正 = 美國買盤強
• Taker Buy/Sell > 1 = 主動買盤強
• 恐懼貪婪 < 25 = 恐慌拋售機會 | > 75 = 見頂風險

【輸出要求】
1. summary 最多 8 個字
2. interpretation 最多 10 個字
3. 價格用簡寫：10萬、9.8萬、4.5萬
4. 不要 $ 符號
5. headline 最多 15 個字

【JSON】
{
  "emoji": "🔥",
  "sentiment": "偏多",
  "sentiment_score": 72,
  "headline": "ETF資金狂流入，大戶加倉",
  
  "analysis": {
    "price_momentum": {
      "summary": "10萬，漲1%",
      "signal": "多頭"
    },
    "capital_flow": {
      "summary": "費率0.1%，OI增",
      "interpretation": "資金湧入做多"
    },
    "whale_activity": {
      "summary": "大戶比1.35，ETF+",
      "interpretation": "機構在加倉"
    },
    "retail_sentiment": {
      "summary": "恐懼45，買賣比1.2",
      "interpretation": "散戶追漲中"
    },
    "risk_zones": {
      "summary": "爆倉區9.5萬",
      "interpretation": "小心插針洗盤"
    }
  },
  
  "action_suggestion": {
    "bias": "偏多",
    "entry_zone": "9.8-9.9萬",
    "stop_loss_zone": "9.4萬",
    "take_profit_zone": "10.8萬",
    "risk_note": "ETF流入強勢，但別追高"
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
