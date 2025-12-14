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
    // New Unified Context Field
    market_context?: {
        summary: string
        highlights: Array<{
            theme: string
            impact: string
        }>
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
    recentAlerts: any[] = [],
    rssTitles: string = '' // New parameter for unified context
): Promise<MarketSummaryResult | null> {
    if (!genAI) {
        console.error('Gemini API Key is missing')
        return null
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
你是專業的加密貨幣市場分析師。你的任務是綜合「新聞脈絡」與「技術數據」來解讀市場。

【嚴重警告：禁止提供交易建議】
❌ 絕對禁止使用：「操作策略」、「進場」、「止損」、「目標」、「買入」、「賣出」
✅ 必須使用：「市場結構」、「關注區」、「結構失效」、「潛在壓力」、「流動性分佈」

【語氣與內容規範】
1. **精準具體**：雖然要總結脈絡，但**必須包含關鍵人名或項目名稱** (如：川普、馬斯克、Hyperliquid、Uniswap)，避免過於模糊。
2. **完全改寫**：請將新聞內化後，用**台灣幣圈常用語**重寫，嚴禁直接翻譯或抄錄。
3. **因果整合**：整合「新聞消息」與「數據變化」的因果關係。

【輸入數據 1：技術面】
${JSON.stringify(marketData.signals || {}, null, 2)}
Alert Events (12H): ${recentAlerts.length > 0 ? JSON.stringify(recentAlerts, null, 2) : "無顯著異常"}
原始數據: ${JSON.stringify({ btc: marketData.btc, etf: marketData.etf, long_short: marketData.long_short }, null, 2)}

【輸入數據 2：消息面 (過去 24 小時新聞快訊 - 標題與重點)】
${rssTitles || '無新聞數據'}

【輸出格式】(Strict JSON)

**sentiment_score**: 0-100 分 (請嚴格依照以下權重自行計算)
   - 消息面 (RSS) 40%: 新聞偏多或偏空
   - 價格動能 (Momentum) 30%: 技術指標趨勢
   - 市場波動 (Volatility) 30%: 恐慌程度
**sentiment**: 根據分數標記 (>=75 貪婪/偏多, <=25 恐懼/偏空, 其他為中性/震盪)
**headline**: 15-20 字標題，描述當前市場主要結構狀態
**analysis**: 80-100 字，整合「技術面」與「消息面」。解釋價格行為背後可能的新聞驅動因素，**需提到具體影響事件的項目或人物**。
**whale_summary**: 巨鯨動態摘要
**market_structure**: (技術面)
   - bias: 直接使用 signals.market_feeling
   - focus_zone: 關注區間
   - invalidation_zone: 失效區間
   - resistance_zone: 壓力區間
**risk_note**: 結構風險提示
**market_context**: (消息面 - 獨立區塊)
   - summary: 1-2 句市場關注焦點總結，需包含關鍵詞 (如：Base 鏈、川普政策)。
   - highlights: Array of { theme: "主題 (含關鍵名詞)", impact: "影響層面" } (2-4 個)

【JSON 範例】
Note: emoji 必須根據 sentiment 選擇，例如：
- 偏多/樂觀: 🚀 📈 💪 🔥 ✨
- 偏空/風險: 🔻 ⚠️ 🌧️ 📉 💨
- 震盪/中性: 📊 ⚖️ 🔄 ⏳ 🎢
{
  "emoji": "📊",
  "sentiment": "中性",
  "sentiment_score": 50,
  "headline": "聯準會暗示利率維持，BTC 結構震盪等待指引",
  "analysis": "受聯準會暫緩降息預期影響 (消息面)，比特幣在 9.1 萬區間縮量震盪。鏈上數據顯示長期持有者未動，但短線 OI 隨新聞波動 (技術面)。巨鯨多空比收斂，市場結構暫無明確方向。",
  "whale_summary": "Top Trader 多空比 1.05，大戶持倉觀望。",
  "market_structure": {
    "bias": "中性",
    "focus_zone": "8.9萬 - 9.1萬",
    "invalidation_zone": "8.8萬以下",
    "resistance_zone": "9.25萬 - 9.35萬"
  },
  "risk_note": "留意明晚 CPI 數據發布後的波動風險",
  "market_context": {
    "summary": "市場聚焦於美國利率政策路徑及近期監管動態，避險情緒略有升溫。",
    "highlights": [
      { "theme": "聯準會利率政策討論", "impact": "風險資產定價預期" },
      { "theme": "SEC 對交易所監管", "impact": "市場流動性擔憂" }
    ]
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

export async function generateDerivativesSummary(data: any): Promise<string | null> {
    if (!genAI) return null
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })
        const prompt = `
你是一個加密貨幣衍生品交易專家。
請根據以下「合約數據」生成一段簡短的「短線快照分析」。

【輸入數據】
1. 資金費率 (Funding Rate): ${JSON.stringify(data.fundingRates?.extremePositive?.[0] || {}, null, 2)} (正值=多頭付費)
2. 爆倉數據 (Liquidation): 多單爆倉 ${data.liquidations?.summary?.longLiquidatedFormatted || '0'}, 空單爆倉 ${data.liquidations?.summary?.shortLiquidatedFormatted || '0'}
3. 多空比 (Long/Short): ${data.longShort?.global?.longShortRatio || '未知'} (散戶情緒)

【輸出要求】
1. **長度限制**：50-80 字 (繁體中文)
2. **語氣**：戰術性、簡潔、直接 (像交易室裡的對話)
3. **內容**：
   - 判斷當前多空擁擠度
   - 識別潛在風險 (如軋空、殺多)
   - 給出一個明確的「短線傾向」(例如：偏向回調接多、偏向高空、觀望)

【範例】
「費率飆升顯示多頭過熱，且大戶多空比下降，暗示主力正在出貨。即使價格硬撐，短線追高風險極大，偏向反彈找空點。」
「空單爆倉量巨大，顯示燃料已被清空。費率回歸中性，結構轉強，短線適合回調接多。」

請直接輸出分析內容，不要標題。
`
        const result = await model.generateContent(prompt)
        return result.response.text().trim()
    } catch (e) {
        console.error('Gemini Derivatives Summary Error:', e)
        return null
    }
}

export interface MarketContextBrief {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary: string // AI 對市場的一句話總結
    highlights: Array<{
        title: string    // 新聞標題
        reason: string   // 為何這是重大新聞
        impact: '高' | '中' | '低'
    }>
}

export async function generateMarketContextBrief(
    newsItems: any[]
): Promise<MarketContextBrief | null> {
    if (!genAI) return null

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
你是專業的加密貨幣市場分析師。請從以下 Coinglass 繁體中文快訊中，挑選過去 24 小時「對幣價影響最大」的新聞事件。

【你的任務】
1. 精選 10 則最重要的新聞（按影響力排序）
2. 每則新聞提煉成一句精簡標題（15 字內）
3. 簡述為何這則新聞重要（對幣價的潛在影響）
4. 最後用一句話總結當前市場狀態

【影響力評分標準】（高→低）
🔴 Level 5 - 極高影響：
   - BTC/ETH 大幅價格波動 (>5%)
   - 大規模爆倉事件 (>1億美元)
   - ETF 資金大幅異動
   - 重大監管決策（SEC 批准/拒絕）

� Level 4 - 高影響：
   - 機構大額買賣（貝萊德、灰度、MicroStrategy）
   - 央行利率決策
   - 巨鯨錢包異動 (>1000 BTC)
   
� Level 3 - 中高影響：
   - 交易所儲備變化
   - 主要幣種技術升級
   - 知名人士表態（馬斯克、川普）

🟢 Level 2 - 中影響：
   - 項目融資、空投
   - 鏈上數據異動
   
🔵 Level 1 - 低影響：
   - 一般市場評論
   - 技術更新公告

【排除】
❌ 廣告軟文、重複新聞、無實質內容

【輸入快訊 (Coinglass 繁體中文)】
${JSON.stringify(newsItems.slice(0, 40).map(n => ({
            title: n.newsflash_title || n.title,
            content: (n.newsflash_content || n.content || '').slice(0, 200)
        })), null, 2)}

【輸出格式】(Strict JSON，使用繁體中文)
{
  "sentiment": "樂觀" | "保守" | "恐慌" | "中性",
  "summary": "25-40字的市場總結，說明當前市場狀態和主要關注點",
  "highlights": [
    {
      "title": "精簡事件標題 (15字內)",
      "reason": "為何重要/對幣價影響 (12字內)",
      "impact": "高" | "中" | "低"
    }
  ]
}

重要：
- 使用繁體中文（台灣用語）
- highlights 必須有 10 則
- 按影響程度由高到低排序
- 輸出純 JSON，不要 Markdown
`

        const result = await model.generateContent(prompt)
        const text = result.response.text()

        // Clean markdown if present
        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || text.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[0])
        }

        return JSON.parse(text)

    } catch (e) {
        console.error('Gemini Market Context Brief Error:', e)
        return null
    }
}

// ============================================
// AI Decision Generator (Decision-First UX)
// ============================================

export interface AIDecision {
    conclusion: string       // "震盪偏空｜短線風險上升"
    bias: '偏多' | '偏空' | '震盪' | '中性'
    risk_level: '低' | '中' | '中高' | '高'
    action: string           // "降低槓桿 / 等待確認"
    reasoning: string        // 展開後的詳細分析
    tags: {
        btc: string
        alt: string
        sentiment: string
    }
}

export async function generateAIDecision(
    marketData: {
        fundingRate: number
        longShortRatio: number
        totalLiquidation: number
        sentimentScore: number
        whaleStatus: string
    },
    newsHighlights: string[] = []
): Promise<AIDecision | null> {
    if (!genAI) return null

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
你是一個加密貨幣市場分析 AI，專門幫用戶做「決策判讀」。
你的任務不是給數據，而是給出「結論」—— 告訴用戶：「現在市場怎麼樣？我該怎麼做？」

【嚴重警告】
❌ 禁止：投資建議、買入賣出、目標價、止損
✅ 必須：狀態描述、風險提示、觀察重點

【輸入數據】
1. 資金費率 (Funding Rate): ${(marketData.fundingRate * 100).toFixed(4)}%
   - > 0.05% = 多頭過熱
   - < -0.03% = 空頭擁擠
   
2. 多空比 (Long/Short): ${marketData.longShortRatio.toFixed(2)}
   - > 1.2 = 散戶偏多
   - < 0.8 = 散戶偏空
   
3. 4H 爆倉量: $${(marketData.totalLiquidation / 1000000).toFixed(1)}M
   - > 100M = 劇烈波動
   
4. 情緒指數: ${marketData.sentimentScore}/100
   - > 75 = 貪婪
   - < 25 = 恐懼
   
5. 巨鯨狀態: ${marketData.whaleStatus}

6. 近期新聞重點:
${newsHighlights.slice(0, 3).map(n => `- ${n}`).join('\n') || '無特別消息'}

【輸出格式】(Strict JSON)
{
  "conclusion": "10-15字，市場狀態一句話 (例：震盪偏空｜短線風險上升)",
  "bias": "偏多" | "偏空" | "震盪" | "中性",
  "risk_level": "低" | "中" | "中高" | "高",
  "action": "10-20字，操作建議 (例：降低槓桿，等待方向確認)",
  "reasoning": "50-80字，解釋為什麼這樣判斷，提到具體數據",
  "tags": {
    "btc": "4字狀態 (例：整理中)",
    "alt": "4字狀態 (例：偏弱)",
    "sentiment": "4字狀態 (例：修復中)"
  }
}

請直接輸出 JSON，不要 Markdown。
`

        const result = await model.generateContent(prompt)
        const text = result.response.text()

        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || text.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[0])
        }

        return JSON.parse(text)

    } catch (e) {
        console.error('Gemini AI Decision Error:', e)
        return null
    }
}

