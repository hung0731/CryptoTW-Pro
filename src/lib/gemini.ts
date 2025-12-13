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
你是幣圈交易老手。看數據，給結論。說話要像交易群裡的老司機：直白、有料、不囉嗦。

【數據】
${JSON.stringify(marketData, null, 2)}

【分析邏輯】
• 費率 > 0.05% = 多頭過熱
• 費率 < -0.05% = 空頭過熱
• OI 漲 + 價漲 = 趨勢強
• OI 漲 + 價跌 = 有人在建空單
• 大戶多空比 > 1.2 = 大戶看多
• 大戶多空比 < 0.8 = 大戶看空
• 大戶 vs 散戶方向相反 = 跟大戶
• 交易所 BTC 流入 = 準備賣
• 交易所 BTC 流出 = 在囤貨

【輸出要求】
1. 每段話不超過 15 個字
2. 用大白話，不要專業術語
3. 操作建議給具體價格
4. Emoji 選一個最傳神的

【JSON 格式】
{
  "emoji": "🔥",
  "sentiment": "偏多",
  "sentiment_score": 72,
  "headline": "大戶加倉，散戶還在猶豫",
  
  "analysis": {
    "price_momentum": {
      "summary": "BTC 10萬，小漲1%",
      "signal": "多頭"
    },
    "capital_flow": {
      "summary": "費率0.01%，OI漲3%",
      "interpretation": "新資金在進場做多"
    },
    "whale_activity": {
      "summary": "大戶多空比1.35",
      "interpretation": "大戶在押注上漲"
    },
    "retail_sentiment": {
      "summary": "恐懼指數45，偏恐懼",
      "interpretation": "散戶怕高，反而是好事"
    },
    "risk_zones": {
      "summary": "爆倉集中在9.5萬",
      "interpretation": "小心別被洗下車"
    }
  },
  
  "action_suggestion": {
    "bias": "偏多",
    "entry_zone": "$98K-$99K",
    "stop_loss_zone": "$94K",
    "take_profit_zone": "$108K",
    "risk_note": "別追高，等回調"
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
