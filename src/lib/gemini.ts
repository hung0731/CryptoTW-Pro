import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
export const MODEL_NAME = 'gemini-2.5-flash-lite-preview-09-2025'

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
【強制要求排版】中英文、中文與數字、數字與單位之間都一定要加空格如："ABC 中文 123 中文"；°/% 不加。中文用全形標點，不重複；英文句子與書名用半形。數字用半形。專有名詞用官方大小寫，避免亂縮寫。
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

【強制要求排版】中英文、中文與數字、數字與單位之間都一定要加空格如："ABC 中文 123 中文"；°/% 不加。中文用全形標點，不重複；英文句子與書名用半形。數字用半形。專有名詞用官方大小寫，避免亂縮寫。

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
【強制要求排版】中英文、中文與數字、數字與單位之間都一定要加空格如："ABC 中文 123 中文"；°/% 不加。中文用全形標點，不重複；英文句子與書名用半形。數字用半形。專有名詞用官方大小寫，避免亂縮寫。
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
    summary: string
    highlights: Array<{
        title: string        // 新聞標題 (8-14字)
        reason: string       // 25-40字說明 (快訊頁用)
        impact: '高' | '中' | '低'  // 影響力 (快訊頁用)
        bias: '偏多' | '偏空' | '中性'  // 盤勢影響 (首頁用)
        impact_note: string  // 10-20字影響判斷 (首頁用)
    }>
}

export async function generateMarketContextBrief(
    newsItems: any[]
): Promise<MarketContextBrief | null> {
    if (!genAI) return null

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const prompt = `
你是「加密台灣」資深編輯，負責每日幣圈快訊精選。
你的讀者是台灣的加密貨幣交易者，他們需要快速掌握市場動態。

【任務】從以下新聞中精選最多 10 則重要消息，按影響力排序。不足時不硬湊。

【優先順序】
1. 爆倉/清算（直接影響價格）
2. 價格劇烈波動（BTC/ETH 漲跌 >2%）
3. 監管/央行動態（Fed、SEC、各國政策）
4. ETF/機構買賣（灰度、貝萊德、MicroStrategy）
5. 交易所異常（遭駭、暫停提領、破產傳聞）
6. 巨鯨動向（大額轉帳、鏈上異動）

【標題撰寫】8-15 字
✅ 用新聞動詞開頭：突破、失守、重挫、飆漲、爆倉、驚傳、宣布、傳出、證實
✅ 數字具體化：「BTC 失守 10 萬美元」而非「BTC 下跌」
✅ 台灣用語：「美元」非「美金」、「Fed」可用「聯準會」、「回調」非「回撤」
❌ 避免：問句標題、驚嘆號結尾、「震驚」「瘋狂」等聳動詞

【說明撰寫】25-40 字
✅ 必須包含：具體數據 + 市場影響判斷
✅ 結尾給方向：「短線偏空」「多頭警戒」「觀望為主」「支撐有效」
❌ 禁用模糊語：「顯示市場情緒」「反映投資者信心」「值得關注」

【範例】
標題：「BTC 失守 10 萬美元關卡」
說明：「24 小時內超過 2.5 億美元多單遭清算，短線跌勢未止，反彈前建議觀望。」

標題：「貝萊德單日吸金逾 7 億美元」
說明：「持倉量創歷史新高，機構買盤穩定支撐價格，回調空間有限。」

【排版規範】
• 中英文之間加空格（BTC 價格）
• 數字與中文之間加空格（超過 10 億）
• 數字與單位不加空格（10%、100萬）
• 中文用全形標點（，、。）
• 專有名詞用官方寫法（OKX, Binance, SEC）

【加權】優先亞洲時段消息、台灣用戶常用交易所（幣安、OKX、MAX）

【排除】純技術更新、小幣空投、廣告軟文、重複消息

【輸入新聞】
${JSON.stringify(newsItems.slice(0, 40).map(n => ({
            t: n.newsflash_title || n.title,
            c: (n.newsflash_content || n.content || '').slice(0, 150)
        })))}

【輸出格式】JSON，繁體中文
{
  "sentiment": "樂觀|保守|恐慌|中性",
  "summary": "35-60字，用一段話總結今日盤勢重點。語氣像資深分析師對朋友說話：專業、直白、有觀點。範例：「BTC 隔夜失守 10 萬美元後快速反彈，多空雙爆超過 3 億美元，機構買盤仍穩，短線震盪但中期結構未破，逢回可留意。」",
  "highlights": [{
    "title": "8-15字標題",
    "reason": "25-40字說明，含具體數據與方向判斷",
    "impact": "高|中|低",
    "bias": "偏多|偏空|中性",
    "impact_note": "10-20字，給交易者的一句話提醒"
  }]
}`

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
    action: string           // "追價風險高，等待回調"
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
        longLiquidation?: number
        shortLiquidation?: number
        sentimentScore: number
        whaleStatus: string
        oiChange?: number          // OI 變化百分比
        topTraderRatio?: number    // 頂級交易員多空比
    },
    newsHighlights: string[] = []
): Promise<AIDecision | null> {
    if (!genAI) return null

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        // 計算爆倉差值
        const longLiq = marketData.longLiquidation || 0
        const shortLiq = marketData.shortLiquidation || 0
        const liqDiff = longLiq - shortLiq
        const liqDominant = liqDiff > 0 ? '多單' : liqDiff < 0 ? '空單' : '均衡'

        const prompt = `
你是交易室的市場判讀 AI，給出「像下單前一秒」的結論，不是分析報告。

❌禁止：投資建議、目標價、止損價
✅必須：狀態描述、風險提示、結構判讀

【輸入數據】
        1. 費率: ${(marketData.fundingRate * 100).toFixed(4)}% (> 0.05 % 多頭過熱, <-0.03% 空頭擁擠)
        2. 散戶多空比: ${marketData.longShortRatio.toFixed(2)} (> 1.2散戶偏多, <0.8散戶偏空)
        3. 頂級交易員多空比: ${marketData.topTraderRatio?.toFixed(2) || '未知'}
        4. 4H爆倉: $${(marketData.totalLiquidation / 1000000).toFixed(1)} M(多: ${(longLiq / 1000000).toFixed(1)}M 空:${(shortLiq / 1000000).toFixed(1)}M) → ${liqDominant} 被清
    5. OI變化: ${marketData.oiChange ? (marketData.oiChange > 0 ? '+' : '') + marketData.oiChange.toFixed(1) + '%' : '未知'}
    6. 情緒指數: ${marketData.sentimentScore}/100
    7. 巨鯨: ${marketData.whaleStatus}
    8. 新聞: ${newsHighlights.slice(0, 2).join('；') || '無'}

【判讀規則】
    - 費率高 + 未爆倉 = 潛在擁擠
        - 費率高 + 多單開始爆 = 過熱回調風險
            - 價漲 + OI增 = 追價盤進場（危險）
    - 價漲 + OI減 = 空頭回補（健康）
    - 單邊爆倉明顯多 = 該方向燃料已消耗
        - 散戶與頂級交易員方向背離 = 潛在反轉風險

【action 必須是以下其一】
    - 追價風險高，等待回調
        - 反彈找空點
        - 回調接多
        - 結構混亂，觀望
            - 順勢偏多 / 偏空

【強制要求排版】中英文、中文與數字、數字與單位之間都一定要加空格如："ABC 中文 123 中文"；°/% 不加。中文用全形標點，不重複；英文句子與書名用半形。數字用半形。專有名詞用官方大小寫，避免亂縮寫。

【輸出】JSON，繁體中文
    { "conclusion": "10-15字狀態", "bias": "偏多|偏空|震盪|中性", "risk_level": "低|中|中高|高", "action": "上述選項之一", "reasoning": "50-80字，提到具體數據", "tags": { "btc": "4字", "alt": "4字", "sentiment": "4字" } }
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

// ============================================
// Daily Broadcast Polish (AI cannot change stance)
// ============================================

interface StanceDecision {
    stance: string
    rawReasons: string[]
    metrics: {
        fundingRate: number
        longShortRatio: number
        liquidationBias: string
        liquidationTotal: number
        oiChange24h: number
        btcPriceChange24h: number
    }
}

/**
 * 指標卡片結構（用於日報 UX）
 */
export interface IndicatorCard {
    icon: string        // 💰 / 👥 / 💥
    name: string        // 資金費率 / 多空比 / 爆倉
    status: string      // 歸零 / 50:50 / 0 變化
    note: string        // 解釋一句話
}

/**
 * 日報 AI 潤色結果
 */
export interface DailyBroadcastPolishResult {
    oneLiner: string           // 市場一句話（最顯眼）
    indicatorCards: IndicatorCard[]  // 三個指標卡片
    suggestion: string         // 操作建議
    mindset?: string           // 心態提醒
}

export async function generateDailyBroadcastPolish(
    decision: StanceDecision
): Promise<DailyBroadcastPolishResult | null> {
    if (!genAI) return null

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        // 格式化費率顯示
        const fundingDisplay = Math.abs(decision.metrics.fundingRate) < 0.01
            ? '趨近零'
            : decision.metrics.fundingRate > 0.05
                ? '偏高'
                : decision.metrics.fundingRate < -0.03
                    ? '轉負'
                    : '正常'

        // 格式化多空比顯示
        const lsRatio = decision.metrics.longShortRatio
        const lsDisplay = lsRatio > 55 ? `${Math.round(lsRatio)} / ${Math.round(100 - lsRatio)}` : lsRatio < 45 ? `${Math.round(lsRatio)} / ${Math.round(100 - lsRatio)}` : '50 / 50'

        // 格式化爆倉/OI 顯示
        const liqTotal = decision.metrics.liquidationTotal
        const oiChange = decision.metrics.oiChange24h
        const liqOiDisplay = liqTotal > 100_000_000
            ? `${(liqTotal / 1_000_000).toFixed(0)}M 清算`
            : oiChange > 5 || oiChange < -5
                ? `OI ${oiChange > 0 ? '+' : ''}${oiChange.toFixed(1)}%`
                : '極度清淡'

        const prompt = `你是一個加密市場風控分析師，專為交易型 App 日報設計內容。

系統已透過規則判斷今日市場立場為：「${decision.stance}」

⚠️ 此結論不可更改，你只能用專業、冷靜、像風控的語氣來解釋這個結論。

【市場數據】
• 費率：${decision.metrics.fundingRate.toFixed(4)}%（${fundingDisplay}）
• 多空比：${decision.metrics.longShortRatio.toFixed(0)}% 做多
• 爆倉偏向：${decision.metrics.liquidationBias}
• 24H 爆倉總額：$${(decision.metrics.liquidationTotal / 1_000_000).toFixed(1)}M
• OI 24H 變化：${decision.metrics.oiChange24h > 0 ? '+' : ''}${decision.metrics.oiChange24h.toFixed(1)}%
• BTC 24H 變化：${decision.metrics.btcPriceChange24h > 0 ? '+' : ''}${decision.metrics.btcPriceChange24h.toFixed(1)}%

【任務】生成交易型日報卡片內容

【輸出格式】JSON，繁體中文
{
  "oneLiner": "市場一句話",
  "indicatorCards": [
    { "icon": "💰", "name": "資金費率", "status": "${fundingDisplay}", "note": "..." },
    { "icon": "👥", "name": "多空比", "status": "${lsDisplay}", "note": "..." },
    { "icon": "💥", "name": "爆倉 / OI", "status": "${liqOiDisplay}", "note": "..." }
  ],
  "suggestion": "一句話操作建議",
  "mindset": "心態提醒（可選）"
}

【欄位要求】
• oneLiner: 10-18 字，這張卡片存在的理由，是用戶在 3 秒內要看到的核心結論
  - 範例（中性）：「市場缺乏共識，整體進入觀望期」
  - 範例（偏多）：「多頭動能回升，關注突破確認」
  - 範例（偏空）：「短線結構偏弱，留意下探風險」

• indicatorCards: 三個指標卡片，每個包含：
  - icon: 使用提供的 emoji
  - name: 使用提供的名稱
  - status: 使用提供的狀態（可微調文字）
  - note: 8-15 字，解釋這個狀態代表什麼

• suggestion: 10-18 字，像交易室白板的指令
  - 範例：「保持觀望，不追價、不重倉」
  - 範例：「順勢偏多，回調可留意」
  - ❌ 禁止：「建議買入」「建議賣出」

• mindset: 15-25 字，資深交易員對朋友的心理提醒（可為 null）
  - 範例：「沒有方向時，耐心比判斷更重要」
  - 範例：「趨勢確認前，控制倉位優先」

【排版規範】
• 中英文之間加空格（如：BTC 價格）
• 數字與中文之間加空格（如：超過 10 億）
• 數字與單位不加空格（如：10%、100萬）
• 中文用全形標點（，、。）

輸出純 JSON，不要有其他文字。`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[0])
        }

        return JSON.parse(text)
    } catch (e) {
        console.error('[Daily Broadcast] AI Polish Error:', e)
        return null
    }
}

// ============================================
// Fallback Reply (Smart Interpreter)
// ============================================

export interface FallbackResult {
    type: 'price_query' | 'unknown'
    symbol?: string
}

export async function generateFallbackReply(userInput: string): Promise<FallbackResult | null> {
    if (!genAI) return null

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })
        const prompt = `
你是一個加密貨幣意圖分類器。使用者輸入了一段文字，請判斷其意圖。

【使用者輸入】
"${userInput}"

【判斷邏輯】
1. **幣價查詢**：如果使用者在問某個幣的價格、行情、漲跌。
   - 提取幣種代號 (Symbol)，例如 "BTC", "ETH", "DOGE"。
   - 轉為大寫。
2. **其他任何情況**：包含閒聊、問好、無法理解、或是沒有明確幣種。
   - 回傳 unknown。

【輸出格式】(JSON Only)
{
  "type": "price_query" | "unknown",
  "symbol": "BTC" (僅 price_query 需要，若無則 null)
}
`
        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        // Clean markdown
        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || text.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[0])
        }

        return JSON.parse(text)
    } catch (e) {
        console.error('Gemini Fallback Error:', e)
        return null
    }
}
