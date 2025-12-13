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
你是專業的加密貨幣市場分析師。請基於以下數據撰寫一份簡潔但有深度的市場日報。

【語氣規範】
- 專業但平易近人，語氣柔和
- 使用「可能」、「或許」、「看來」等委婉用語
- 避免命令式語句，改用「可以考慮」、「建議留意」
- 不使用俗語（如：莊家、韭菜、老司機）

【中文排版規範】(重要)
- 中英文之間加空格：BTC 價格、RSI 指標、ETF 資金
- 數字與單位之間加空格：9.5 萬、6.55 億美元、+2.5%
- 全形標點與其他字符之間不加空格

【市場數據】
${JSON.stringify(marketData, null, 2)}

【核心分析框架】

1. **技術面判斷**
   - RSI > 70 = 超買風險，可能回調
   - RSI < 30 = 超賣機會，可能反彈
   - RSI 40-60 = 中性，趨勢不明

2. **資金面判斷**
   - OI 增加 + 價格上漲 = 多頭趨勢確認
   - OI 增加 + 價格下跌 = 空頭力量增強
   - ETF 持續淨流入 = 機構買盤支撐
   - 資金費率過高 (>0.1%) = 多頭過熱，回調風險

3. **清算地圖判斷** (重要！)
   - liquidation_map.summary 包含關鍵支撐阻力位
   - 上方清算量大 = 價格上攻阻力強
   - 下方清算量大 = 價格下跌時有磁吸效應
   - max_pain_price = 最大痛苦點，價格可能被吸引過去
   - 根據清算分布設定止損和目標價位

4. **巨鯨動態判斷**
   - whales.summary 包含巨鯨多空統計
   - 多單總值 >> 空單 = 聰明資金看多
   - 空單總值 >> 多單 = 聰明資金看空
   - 開倉數 > 平倉數 = 建倉階段
   - 平倉數 > 開倉數 = 獲利了結

【輸出格式】(嚴格遵守)

1. **headline**: 15-20 字標題，突出最關鍵的市場訊號
2. **analysis**: 80-120 字整合段落，需包含：
   - 價格位置和技術面狀態
   - 資金流向（ETF、OI 變化）
   - 清算地圖觀察（關鍵支撐/阻力位）
   - 巨鯨動向（若有數據）
3. **whale_summary**: 20-35 字巨鯨動態摘要，格式如：「過去 24 小時巨鯨開多 X 筆、平倉 X 筆，多單總值約 X 億美元」。若無數據則輸出 null
4. **action**: 操作參考
   - bias: 偏多/偏空/觀望
   - entry_zone: 根據支撐位設定
   - stop_loss: 根據清算密集區下方設定
   - take_profit: 根據阻力位設定
5. **risk_note**: 15-25 字風險提示，針對最大風險點

【JSON 範例】
{
  "emoji": "📊",
  "sentiment": "偏多",
  "sentiment_score": 68,
  "headline": "清算地圖顯示下方支撐強，巨鯨持續加碼多單",
  "analysis": "BTC 在 9.1 萬美元附近整理，RSI 55 處於中性。清算地圖顯示下方 8.8 萬有約 12 億美元空單累積，形成強支撐；上方 9.5 萬阻力約 8 億美元。過去 24 小時巨鯨淨開多 5 筆，總值約 2 億美元。ETF 昨日淨流入 6 億美元，機構買盤不減。",
  "whale_summary": "過去 24 小時巨鯨開多 8 筆、平倉 3 筆，多單總值約 2.1 億美元，偏向看多。",
  "action": {
    "bias": "偏多",
    "entry_zone": "8.9-9.1 萬",
    "stop_loss": "8.75 萬",
    "take_profit": "9.5 萬"
  },
  "risk_note": "若跌破 8.8 萬將觸發連環清算，建議嚴格止損"
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
