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
        price_momentum: {
            summary: string
            signal: string
        }
        capital_flow: {
            summary: string
            interpretation: string
        }
        whale_activity: {
            summary: string
            interpretation: string
        }
        retail_sentiment: {
            summary: string
            interpretation: string
        }
        risk_zones: {
            summary: string
            interpretation: string
        }
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
你是一位專業的加密貨幣交易分析師，請根據以下 Coinglass 數據生成一份「可操作」的市場分析報告。

【即時數據】
${JSON.stringify(marketData, null, 2)}

【分析框架 - 5 個維度】

1. **價格動能**：BTC 目前價格、24H 漲跌、趨勢方向
2. **資金熱度**：
   - 資金費率 > 0.1% = 過熱，可能回調
   - 資金費率 < -0.1% = 過冷，可能反彈
   - 持倉量 (OI) 變化 + 價格變化 = 趨勢確認
3. **大戶動向**：
   - 大戶多空比 > 1.2 = 大戶看多
   - 大戶多空比 < 0.8 = 大戶看空
   - 大戶 vs 散戶分歧 = 跟隨大戶
4. **散戶情緒**：
   - 恐懼貪婪指數
   - 散戶多空比（通常做反向指標）
5. **風險區域**：
   - 交易所儲備流入 = 賣壓增加
   - 交易所儲備流出 = 囤積信號
   - 過去 1H 爆倉量

【輸出規則】
1. 用繁體中文，口語化，像在跟朋友分享交易想法
2. 說話直接，不要模稜兩可
3. 操作建議要具體：給價格區間
4. 風險提醒要明確
5. 選一個最能代表市場氣氛的 Emoji

【嚴格 JSON 輸出格式】
{
  "emoji": "一個 Emoji",
  "sentiment": "偏多" | "偏空" | "震盪",
  "sentiment_score": 0-100,
  "headline": "一句話總結，像新聞標題",
  
  "analysis": {
    "price_momentum": {
      "summary": "BTC 現價如何？漲還是跌？",
      "signal": "多頭/空頭/中性"
    },
    "capital_flow": {
      "summary": "資金費率多少？持倉量變化？",
      "interpretation": "這代表什麼意思？"
    },
    "whale_activity": {
      "summary": "大戶多空比多少？在做什麼？",
      "interpretation": "這對價格有什麼影響？"
    },
    "retail_sentiment": {
      "summary": "散戶情緒如何？恐懼還是貪婪？",
      "interpretation": "散戶通常是反向指標"
    },
    "risk_zones": {
      "summary": "最近爆倉狀況？交易所資金流向？",
      "interpretation": "目前的風險在哪裡？"
    }
  },
  
  "action_suggestion": {
    "bias": "偏多/偏空/觀望",
    "entry_zone": "建議進場價格區間",
    "stop_loss_zone": "建議止損價格",
    "take_profit_zone": "建議止盈價格",
    "risk_note": "最重要的風險提醒"
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


