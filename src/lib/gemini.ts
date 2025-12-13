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
• 費率 > 0.1% = 過熱，回調風險 | < -0.1% = 恐慌拋售，反彈機會
• OI漲+價漲=趨勢延續 | OI漲+價跌=大戶建空單 | OI跌+價跌=多頭拋售
• 大戶多空比 > 1.2 = 大戶看多 | < 0.8 = 大戶看空
• ETF 淨流入 = 機構在吸貨 | 淨流出 = 機構在出貨
• Coinbase 溢價正 = 美國買盤強勁 | 負 = 美國賣壓
• Taker Buy > 52% = 主動買盤強 | < 48% = 主動賣盤強
• 恐懼貪婪 < 25 = 恐慌底部 | > 75 = 貪婪頂部

【輸出要求】
1. summary 15-25 個字，說清楚數據
2. interpretation 15-25 個字，說清楚含義
3. 價格用簡寫：10萬、9.8萬
4. headline 20-30 個字
5. risk_note 要具體說明理由

【JSON】
{
  "emoji": "🔥",
  "sentiment": "偏多",
  "sentiment_score": 72,
  "headline": "ETF 連續流入 2.3 億美元，大戶多空比創新高，短期偏多",
  
  "analysis": {
    "price_momentum": {
      "summary": "BTC 報價 10.2 萬，24H 漲幅 2.3%，站穩 10 萬關口",
      "signal": "多頭"
    },
    "capital_flow": {
      "summary": "Binance 資金費率 0.08%，持倉量 24H 增加 5%",
      "interpretation": "槓桿資金持續進場做多，但費率偏高需注意回調"
    },
    "whale_activity": {
      "summary": "大戶多空比 1.35，ETF 今日淨流入 2.3 億美元",
      "interpretation": "機構和大戶同步加倉，短期看多信號明確"
    },
    "retail_sentiment": {
      "summary": "恐懼貪婪指數 65 偏貪婪，Taker 買賣比 54%",
      "interpretation": "散戶情緒樂觀，主動買盤佔優，但需警惕見頂"
    },
    "risk_zones": {
      "summary": "過去 1H 爆倉 1.2 億，主要集中在 9.8 萬價位",
      "interpretation": "9.8 萬以下有大量爆倉籌碼，可能成為支撐位"
    }
  },
  
  "action_suggestion": {
    "bias": "偏多",
    "entry_zone": "9.9-10.0萬",
    "stop_loss_zone": "9.6萬",
    "take_profit_zone": "10.8萬",
    "risk_note": "資金費率偏高，不建議追高，等回調至 10 萬附近再考慮進場"
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
