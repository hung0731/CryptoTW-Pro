import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const MODEL_NAME = 'gemini-2.5-flash-lite-preview-09-2025'

export interface MarketSummaryResult {
    emoji: string
    sentiment: '偏多' | '偏空' | '震盪'
    sentiment_score: number
    headline: string
    analysis: string
    whale_summary?: string
    market_structure: {
        bias: string // '偏多' | '偏空' | '中性'
        focus_zone: string     // 市場關注區 (原 entry_zone)
        invalidation_zone: string // 結構失效區 (原 stop_loss)
        resistance_zone: string   // 潛在壓力區 (原 take_profit)
    }
    risk_note: string
}

export async function generateAlertExplanation(alert: any): Promise<string | null> {
    if (!genAI) return null
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })
        const prompt = `
你是一個加密貨幣市場快訊解讀 AI。
請將以下「市場快訊事件」翻譯成白話文，並解釋其「常見市場含義」。

【嚴重限制】
1. 輸出長度：限 30-50 字 (非常精簡)
2. 語氣：客觀、冷靜、事實陳述
3. ❌ 禁止預測未來價格
4. ❌ 禁止給予投資建議 (如買入、賣出、止損)
5. ✅ 重點解釋：這個訊號通常代表什麼？(例如：OI 上升代表波動可能放大)

【快訊事件】
類型：${alert.type}
摘要：${alert.summary}
數據：${JSON.stringify(alert.metrics)}

【輸出】(直接輸出文字，不要有其他廢話)
`
        const result = await model.generateContent(prompt)
        return result.response.text().trim()
    } catch (e) {
        console.error('Gemini Alert Explainer Error:', e)
        return null // Fallback to static text
    }
}

export async function generateMarketSummary(
    marketData: any,
    recentAlerts: any[] = [] // New parameter
): Promise<MarketSummaryResult | null> {
    if (!genAI) {
        console.error('Gemini API Key is missing')
        return null
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
你是專業的加密貨幣市場分析師。你的任務是「解讀已判斷的市場訊號」。

【嚴重警告：禁止提供交易建議】
❌ 絕對禁止使用：「操作策略」、「進場」、「止損」、「目標」、「買入」、「賣出」
✅ 必須使用：「市場結構」、「關注區」、「結構失效」、「潛在壓力」、「流動性分佈」

【語氣規範】
- 客觀、中性、結構化
- 使用「市場目前位於...」、「流動性集中於...」
- 禁止情緒化喊單
- **引用最近事件**：如「下午出現 OI 快速上升」、「稍早發生多單爆倉」

【價格描述規範】
- ❌ 禁止單點價格 (如：$91,234)
- ✅ 必須使用「區間 / 壓力帶」(如：$9.11萬 - $9.15萬)
- 單位統一使用 萬 (如：7.2萬, 9.5 萬)

【市場訊號（Signal Engine 輸出）】
${JSON.stringify(marketData.signals || {}, null, 2)}

【最近 12 小時市場異動（Alert Events）】
${recentAlerts.length > 0 ? JSON.stringify(recentAlerts, null, 2) : "無顯著異常事件"}

【原始數據參考】
${JSON.stringify({
            btc: marketData.btc,
            etf: marketData.etf,
            long_short: marketData.long_short,
        }, null, 2)}

【輸出格式】(嚴格遵守)

1. **headline**: 15-20 字標題，描述當前市場主要結構狀態
2. **analysis**: 60-80 字，整合四個狀態的含義。若有「Alert Events」，請務必在文中引用（例如：「稍早的 OI 激增顯示...」）作為佐證，增加敘事可信度。
3. **whale_summary**: 巨鯨動態摘要
4. **market_structure**: 市場結構區間
   - bias: 直接使用 signals.market_feeling
   - focus_zone (市場關注區): 當前交易密集或關鍵支撐區間
   - invalidation_zone (結構失效區): 若跌破/突破此區間則原判斷失效 (原止損概念，但改為結構觀點)
   - resistance_zone (潛在壓力區): 上方/下方主要流動性壓力區 (原目標概念)
5. **risk_note**: 15-25 字，指出結構風險

【JSON 範例】
{
  "emoji": "📊",
  "sentiment": "中性",
  "sentiment_score": 50,
  "headline": "市場處於結構調整期，巨鯨保持觀望",
  "analysis": "目前價格在 9.1 萬區間震盪，槓桿與籌碼分佈均衡。巨鯨多空比收斂，未見明顯方向性佈局。市場等待進一步流動性指引。",
  "whale_summary": "Top Trader 多空比 1.05，OI 持平，大戶無顯著動作。",
  "market_structure": {
    "bias": "中性",
    "focus_zone": "8.9萬 - 9.1萬",
    "invalidation_zone": "8.8萬以下",
    "resistance_zone": "9.25萬 - 9.35萬"
  },
  "risk_note": "若跌破失效區，需留意結構是否轉弱"
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
