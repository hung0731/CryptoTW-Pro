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
你是專業的加密貨幣市場分析師。你的任務是「解讀已判斷的市場訊號」，用人話描述給用戶。

【重要】你不是在分析原始數據，而是在「翻譯」Signal Engine 已經判斷好的狀態。

【語氣規範】
- 專業但平易近人
- 使用「可能」、「或許」、「看來」等委婉用語
- 禁止：預測價格、喊單、情緒化形容
- 不使用俗語（如：莊家、韭菜、老司機）

【中文排版規範】
- 中英文之間加空格：BTC 價格、RSI 指標
- 數字與單位之間加空格：9.5 萬、6.55 億美元

【市場訊號（Signal Engine 輸出）】
${JSON.stringify(marketData.signals || {}, null, 2)}

【原始數據參考】
${JSON.stringify({
            btc: marketData.btc,
            etf: marketData.etf,
            long_short: marketData.long_short,
        }, null, 2)}

【你的任務】
根據 signals 裡的狀態值，用人話描述市場狀況。

signals 結構說明：
- market_feeling: 今日市場體感（偏多/偏空/擁擠/混亂/中性）
- leverage_status: 槓桿狀態（升溫/降溫/過熱/正常）
- whale_status: 巨鯨狀態（低調做多/防守對沖/偏空/撤退中/觀望）
- liquidation_pressure: 爆倉壓力（上方壓力/下方壓力/均衡）
- evidence: 各狀態的證據列表
- key_metrics: 關鍵數值

【輸出格式】(嚴格遵守)

1. **headline**: 15-20 字標題，描述當前市場主要狀態
2. **analysis**: 60-80 字，只用一段話整合四個狀態的含義
3. **whale_summary**: 根據 whale_status 和 evidence.whale 撰寫 20-30 字摘要。若無數據輸出 null
4. **action**: 
   - bias: 直接使用 signals.market_feeling
   - entry_zone / stop_loss / take_profit: 根據 liquidation_zones 設定
5. **risk_note**: 15-25 字，指出「什麼情況下這個判斷會失效」

【JSON 範例】
{
  "emoji": "📊",
  "sentiment": "偏多",
  "sentiment_score": 65,
  "headline": "巨鯨低調佈局中，槓桿升溫但未過熱",
  "analysis": "市場體感偏多。槓桿正在升溫，巨鯨呈現低調做多態勢。爆倉壓力集中在上方，若突破可能觸發空單回補。整體資金面健康。",
  "whale_summary": "Top Trader 多空比 1.58，OI +5.2%，大戶持續增持多單。",
  "action": {
    "bias": "偏多",
    "entry_zone": "9.0-9.15 萬",
    "stop_loss": "8.8 萬",
    "take_profit": "9.5 萬"
  },
  "risk_note": "若槓桿轉為過熱或巨鯨轉為撤退，需重新評估"
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
