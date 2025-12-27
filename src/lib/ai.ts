
import OpenAI from 'openai'
import { formatTaiwaneseText, formatObjectStrings } from './format-utils'
import { acquireLock, releaseLock } from './cache'
import { logger } from '@/lib/logger'
import { MarketContext } from '@/lib/types'

// ==========================================
// xAI (Grok) Configuration
// ==========================================
const apiKey = process.env.XAI_API_KEY || process.env.GEMINI_API_KEY // Fallback for transition
const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.x.ai/v1',
}) : null

export const MODEL_NAME = 'grok-4-1-fast-non-reasoning-latest'

const VOICE_PACK = `
【CryptoTW 台灣用語 Voice Pack（MANDATORY）】
你是在台灣幣圈做交易的資深人，寫給台灣用戶看。

語氣：直白、冷靜、像群組裡的老手，不做作、不官腔。
句型：短句為主，少形容詞，多結論 + 依據。
用詞偏好（優先用這些）：
- 「美元」不是「美金」
- 「回調」不是「回撤」
- 「爆倉」/「清算」都可，但用一次就好，別來回切換
- 「槓桿」/「籌碼」/「費率」/「OI」/「多空比」/「主力」/「散戶」/「大戶」
- 「偏多」「偏空」「震盪」「觀望」「結構未破」「動能轉弱」「擁擠」「燃料耗盡」「雙爆」

禁用詞（出現就算失敗）：
- 「投資建議」「操作策略」「建議買入/賣出」「目標價」「止損」
- 過度文青或媒體腔：「值得關注」「引發市場關注」「反映投資人信心」「情緒升溫」「市場觀望氣氛」
- 中國用語：回撤、承压、走強、走弱（可用「轉強/轉弱」但不要「走強/走弱」）

台灣慣用寫法：
- 數字要具體（$ 多少 M、% 多少），不要「大量」「明顯」
- 能用「先…再…」「如果…那…」「目前…但…」就用，避免長句
- 句末不要驚嘆號
`

const CONSISTENCY_CHECK = `
【一致性檢查】
輸出前自檢：是否像台灣幣圈群組會講的話？若像新聞稿或研究報告，重寫成更口語、更短句。
`

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
    if (!openai) return null
    try {
        const prompt = `
${VOICE_PACK}

你是一個加密貨幣市場快訊解讀 AI。
請將以下「市場快訊事件」翻譯成白話文，並解釋其「常見市場含義」。

【嚴重限制】
1. 輸出長度：限 30-50 字 (非常精簡)
2. 語氣：客觀、冷靜、事實陳述
3. ❌ 禁止預測未來價格
4. ❌ 禁止給予投資建議 (如買入、賣出、止損)
5. ✅ 重點解釋：這個訊號通常代表什麼？(例如：OI 上升代表波動可能放大)

【寫法模板（必用其一）】
- 「通常代表…，常見情況是…」
- 「多半是…在動，後面容易看到…」
- 「代表市場在…，波動通常會…」

【輸出限制補充】
- 最多 2 句
- 每句不超過 22 字


【快訊事件】
類型：${alert.type}
摘要：${alert.summary}
數據：${JSON.stringify(alert.metrics)}

${CONSISTENCY_CHECK}

【輸出】(直接輸出文字，不要有其他廢話)
`
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
        })

        return formatTaiwaneseText(completion.choices[0]?.message?.content?.trim() || '')
    } catch (e) {
        logger.error('Grok Alert Explainer Error:', e, { feature: 'ai' })
        return null // Fallback to static text
    }
}

export async function generateMarketSummary(
    marketData: any,
    recentAlerts: any[] = [],
    rssTitles: string = '' // New parameter for unified context
): Promise<MarketSummaryResult | null> {
    if (!openai) {
        logger.error('xAI API Key is missing', { feature: 'ai' })
        return null
    }

    const lockKey = 'lock:gemini:market_summary' // Keep old lock key for compatibility
    if (!await acquireLock(lockKey, 60)) {
        logger.warn('AI Busy: Market Summary generation locked', { feature: 'ai' })
        return null
    }

    try {
        const prompt = `
${VOICE_PACK}

你是專業的加密貨幣市場分析師。你的任務是綜合「新聞脈絡」與「技術數據」來解讀市場。

【嚴重警告：禁止提供交易建議】
❌ 絕對禁止使用：「操作策略」、「進場」、「止損」、「目標」、「買入」、「賣出」
✅ 必須使用：「市場結構」、「關注區」、「結構失效」、「潛在壓力」、「流動性分佈」

【語氣與內容規範】
1. **精準具體**：若輸入新聞沒有具體人名/項目，不可硬塞；改用「交易所 / ETF / 監管」等類別描述。
2. **完全改寫**：請將新聞內化後，用**台灣幣圈常用語**重寫，嚴禁直接翻譯或抄錄。
3. **因果整合**：整合「新聞消息」與「數據變化」的因果關係。

【輸入數據 1：技術面】
${JSON.stringify(marketData.signals || {}, null, 2)}
Alert Events (12H): ${recentAlerts.length > 0 ? JSON.stringify(recentAlerts, null, 2) : "無顯著異常"}
原始數據: ${JSON.stringify({ btc: marketData.btc, etf: marketData.etf, long_short: marketData.long_short }, null, 2)}

【輸入數據 2：消息面 (過去 24 小時新聞快訊 - 標題與重點)】
${rssTitles || '無新聞數據'}

【headline 模板（擇一）】
- 「BTC 震盪偏空，費率高但量縮」
- 「消息偏多但籌碼擁擠，先看回調」
- 「聯準會 + ETF 牽動節奏，結構未破」

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

【思考流程（不要輸出）】
Step 1：用台灣幣圈口吻寫一句話結論與一句話依據。
Step 1.5：扮演「反向交易者」進行批判，確認是否有誘多/誘空陷阱，稍微修正結論使其更穩健。
Step 2：把 Step 1 的內容改寫成指定 JSON 欄位。

${CONSISTENCY_CHECK}

【輸出】只輸出 JSON。

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

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return formatObjectStrings(JSON.parse(text))

    } catch (e) {
        logger.error('Grok Generation Error:', e, { feature: 'ai' })
        return null
    } finally {
        await releaseLock('lock:gemini:market_summary')
    }
}

export async function generateDerivativesSummary(data: any): Promise<string | null> {
    if (!openai) return null
    try {
        const prompt = `
${VOICE_PACK}

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

${CONSISTENCY_CHECK}

請直接輸出分析內容，不要標題。
`
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
        })
        return formatTaiwaneseText(completion.choices[0]?.message?.content?.trim() || '')
    } catch (e) {
        logger.error('Grok Derivatives Summary Error:', e, { feature: 'ai' })
        return null
    }
}

// Market Context Generation
export async function generateMarketContextBrief(
    newsItems: any[],
    indicators?: { fgi: any, fundingRate: any } // Cross-pollination
): Promise<MarketContext | null> {
    if (!openai) return null

    const lockKey = 'lock:gemini:market_context'
    if (!await acquireLock(lockKey, 60)) {
        logger.warn('AI Busy: Market Context generation locked', { feature: 'ai' })
        return null
    }

    try {
        const indicatorSnippet = indicators ? `
【關鍵數據環境 (Reality Check)】
- 恐懼貪婪指數: ${indicators.fgi || '未知'}/100
- BTC 資金費率: ${indicators.fundingRate ? (indicators.fundingRate * 100).toFixed(4) : '未知'}%
` : ''

        const prompt = `
${VOICE_PACK}

你是「加密台灣」資深編輯，負責每日幣圈快訊精選。
你的讀者是台灣的加密貨幣交易者，他們需要快速掌握市場動態。

【任務】從以下新聞中精選「盡量選滿 10 則」重要消息，按影響力排序。除非新聞極少，否則不要少於 5 則。
${indicatorSnippet}

【優先順序】
1. 爆倉/清算（直接影響價格）
2. 價格劇烈波動（BTC/ETH 漲跌 >2%）
3. 監管/央行動態（Fed、SEC、各國政策）
4. ETF/機構買賣（灰度、貝萊德、MicroStrategy）
5. 交易所異常（遭駭、暫停提領、破產傳聞）
6. 巨鯨動向（大額轉帳、鏈上異動）

【推薦閱讀規則】(必須包含)
- 從你的知識庫或歷史事件中，推薦 2 篇相關文章/指標。
- 格式：{ "title": "...", "path": "... (e.g. /reviews/2023/btc-slump or /indicators/fear-greed)", "reason": "..." }
- **強烈建議**：若指標顯示異常（如 FGI > 80 或費率過高），必須推薦對應指標頁面。

【說明撰寫】35-60 字
✅ **核心任務：數據驗證 (Reality Check)**
  - 利用輸入的【關鍵數據環境】(FGI / 費率) 來驗證新聞情緒。
  - **若一致**：簡述市場情緒 (如「利多頻傳且資金費率升溫，情緒樂觀」)。
  - **若矛盾 (最重要)**：直接點出背離 (如「新聞雖偏多，但費率異常偏高，顯示過熱風險」)。
✅ 禁止寫「劇本 A/B」或「如果...則...」。

【輸入新聞】
${JSON.stringify(newsItems.slice(0, 40).map(n => ({
            t: n.newsflash_title || n.title,
            c: (n.newsflash_content || n.content || '').slice(0, 150)
        })))}

${CONSISTENCY_CHECK}

【輸出格式】JSON，繁體中文
{
  "context": {
      "sentiment": "樂觀|保守|恐慌|中性",
      "summary": "35-60字總結。",
      "news": [
        {
            "title": "8-15字標題",
            "reason": "25-40字說明",
            "impact": "高|中|低",
            "bias": "偏多|偏空|中性",
            "impact_note": "10-20字提醒"
        }
      ],
      "recommended_readings": [
        { "title": "...", "path": "...", "reason": "..." }
      ]
  }
}`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return formatObjectStrings(JSON.parse(text).context || JSON.parse(text))

    } catch (e) {
        logger.error('Grok Market Context Brief Error:', e, { feature: 'ai' })
        return null
    } finally {
        await releaseLock('lock:gemini:market_context')
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
    if (!openai) return null

    const lockKey = 'lock:gemini:ai_decision'
    if (!await acquireLock(lockKey, 60)) {
        logger.warn('AI Busy: AI Decision generation locked', { feature: 'ai' })
        return null
    }

    try {
        const longLiq = marketData.longLiquidation || 0
        const shortLiq = marketData.shortLiquidation || 0
        const liqDiff = longLiq - shortLiq
        const liqDominant = liqDiff > 0 ? '多單' : liqDiff < 0 ? '空單' : '均衡'

        const prompt = `
${VOICE_PACK}

你是交易室的市場判讀 AI，給出「像下單前一秒」的結論，不是分析報告。
你是風控，不是喊單。用「風險動作」描述，不用「交易動作」描述。

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
    - 價漲 + OI減 = 空頭回補（健康）
    - 單邊爆倉明顯多 = 該方向燃料已消耗

【action 必須是以下其一（台灣用語版）】
- 追價風險高，先等等
- 反彈先減壓
- 回調再看（別急）
- 結構很亂，先觀望
- 順勢偏多（但別追）
- 順勢偏空（留意雙爆）

${CONSISTENCY_CHECK}

【輸出】JSON，繁體中文
    { "conclusion": "10-15字狀態", "bias": "偏多|偏空|震盪|中性", "risk_level": "低|中|中高|高", "action": "上述選項之一", "reasoning": "50-80字，提到具體數據", "tags": { "btc": "4字", "alt": "4字", "sentiment": "4字" } }
    `

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return formatObjectStrings(JSON.parse(text))

    } catch (e) {
        logger.error('Grok AI Decision Error:', e, { feature: 'ai' })
        return null
    } finally {
        await releaseLock('lock:gemini:ai_decision')
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

export interface IndicatorCard {
    icon: string        // 💰 / 👥 / 💥
    name: string        // 資金費率 / 多空比 / 爆倉
    status: string      // 歸零 / 50:50 / 0 變化
    note: string        // 解釋一句話
}

export interface DailyBroadcastPolishResult {
    oneLiner: string           // 市場一句話（最顯眼）
    indicatorCards: IndicatorCard[]  // 三個指標卡片
    suggestion: string         // 操作建議
    mindset?: string           // 心態提醒
}

export async function generateDailyBroadcastPolish(
    decision: StanceDecision
): Promise<DailyBroadcastPolishResult | null> {
    if (!openai) return null

    try {
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

        const prompt = `
${VOICE_PACK}

你是一個加密市場風控分析師，專為交易型 App 日報設計內容。

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
• oneLiner: 10-18 字，核心結論
• indicatorCards: 三個指標卡片
• suggestion: 10-18 字，像交易室白板的指令
• mindset: 15-25 字，心理提醒

${CONSISTENCY_CHECK}

輸出純 JSON，不要有其他文字。`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return formatObjectStrings(JSON.parse(text))
    } catch (e) {
        logger.error('[Daily Broadcast] Grok Polish Error:', e, { feature: 'ai' })
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
    if (!openai) return null

    try {
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
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return JSON.parse(text)
    } catch (e) {
        logger.error('Grok Fallback Error:', e, { feature: 'ai' })
        return null
    }
}

// ============================================
// Indicator Summary (Rigorous Market Analysis)
// ============================================

export interface IndicatorSummaryInput {
    fearGreedIndex: { value: number; zone: string }
    fundingRate: number          // e.g., 0.005 = 0.005%
    longShortRatio: number       // e.g., 1.02
    liquidation: {
        total: number            // USD
        long: number
        short: number
    }
    oiChange24h?: number         // % change
    etfNetFlow?: number          // USD millions
    // BTC Price Changes
    btcPrice?: {
        current: number          // USD
        change15m?: number       // %
        change1h?: number        // %
        change4h?: number        // %
        change12h?: number       // %
        change24h?: number       // %
    }
}

export interface IndicatorSummaryResult {
    summary: string
    recommended_readings?: Array<{
        title: string
        path: string
        reason?: string
    }>
}

export async function generateIndicatorSummary(
    data: IndicatorSummaryInput,
    upcomingEvent?: any // Cross-pollination from Calendar
): Promise<IndicatorSummaryResult | null> {
    if (!openai) return null

    try {
        // Format values for display
        const fgiZone = data.fearGreedIndex.zone
        const fundingPct = (data.fundingRate * 100).toFixed(4)
        const liqTotalM = (data.liquidation.total / 1_000_000).toFixed(1)
        const liqLongM = (data.liquidation.long / 1_000_000).toFixed(1)
        const liqShortM = (data.liquidation.short / 1_000_000).toFixed(1)

        // Format BTC price changes
        const formatChange = (val?: number) => val !== undefined
            ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%`
            : '-'

        const btcPriceSection = data.btcPrice ? `
【BTC 價格走勢】
- 現價: $${data.btcPrice.current.toLocaleString()}
- 15 分鐘: ${formatChange(data.btcPrice.change15m)}
- 1 小時: ${formatChange(data.btcPrice.change1h)}
- 4 小時: ${formatChange(data.btcPrice.change4h)}
- 12 小時: ${formatChange(data.btcPrice.change12h)}
- 24 小時: ${formatChange(data.btcPrice.change24h)}
` : ''

        // Calendar Context Injection
        const eventSection = upcomingEvent ? `
【即將到來的宏觀事件 (關鍵上下文)】
- 事件: ${upcomingEvent.def.name} (${upcomingEvent.def.key.toUpperCase()})
- 時間: ${upcomingEvent.daysUntil === 0 ? '今天' : upcomingEvent.daysUntil + '天後'}
- 歷史影響: 平均波動 ${upcomingEvent.stats?.avgRange || 0}%
` : ''

        const prompt = `
${VOICE_PACK}

你是「加密台灣」的技術分析師，根據鏈上指標與價格數據生成客觀市場解讀。

【重要限制 - 嚴格遵守】
❌ 禁止：任何投資建議、價格預測、買賣時機
✅ 必須：結合價格走勢與指標數據分析
✅ 必須：使用條件語句（「若...則...」「當...時...」）
✅ 必須：每個論點標明具體數據

${btcPriceSection}
【衍生品指標】
- 恐懼貪婪指數: ${data.fearGreedIndex.value}/100（${fgiZone}區間）
- 資金費率: ${fundingPct}%（正常範圍 ±0.01%）
- 散戶多空比: ${data.longShortRatio.toFixed(2)}（>1.2 偏多, <0.8 偏空, 1.0 均衡）
- 4H 爆倉: $${liqTotalM}M（多: $${liqLongM}M, 空: $${liqShortM}M）
${data.oiChange24h !== undefined ? `- OI 24H 變化: ${data.oiChange24h > 0 ? '+' : ''}${data.oiChange24h.toFixed(1)}%` : ''}
${data.etfNetFlow !== undefined ? `- ETF 淨流入: $${data.etfNetFlow.toFixed(0)}M` : ''}
${eventSection}

【動態劇本推演 (Scenario Analysis)】
利用【價格走勢】+【衍生品數據】+【宏觀事件】進行綜合推演：
- 劇本 A (順勢/延續)：若費率正常且價格突破，下一關卡在哪？
- 劇本 B (轉折/背離)：若費率過高或 FGI 背離，回調支撐在哪？

【推薦延伸閱讀】
- 根據當前「最異常」的數據推薦 2 個本站功能。
- 格式：{ "title": "...", "path": "...", "reason": "..." }
- 路徑庫：/calendar/cpi, /calendar/nfp, /calendar/fomc, /indicators/funding-rate, /indicators/liquidation

【輸出格式】JSON
{
    "summary": "請將「價格現況」、「指標狀態」、「劇本推演」融合成一段流暢的自然語言 (約 100-120 字)。\n❌ 禁止使用 【】、[] 或列點符號。\n✅ 像資深分析師在群組裡的語氣，一口氣講完重點。\n範例：「BTC 雖在 4H 級別震盪，但資金費率 (0.46%) 顯示多頭擁擠，且 FGI 處於極度恐慌背離，暗示短線動能不足。若無法帶量突破前高，需提防回調測底，建議關注 OI 是否隨價格下跌而退潮。」",
    "recommended_readings": [
        { "title": "...", "path": "...", "reason": "..." }
    ]
}

${CONSISTENCY_CHECK}

請輸出 JSON。`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        const json = JSON.parse(text)
        return {
            summary: formatTaiwaneseText(json.summary || json.text || ''),
            recommended_readings: json.recommended_readings || []
        }

    } catch (e) {
        logger.error('Grok Indicator Summary Error:', e, { feature: 'ai' })
        return null
    }
}

// ============================================
// Reviews Summary (Historical Matcher)
// ============================================

export interface ReviewsSummaryInput {
    events: any[]
    currentContext?: {
        btcPrice: number
        fgi: number
        fundingRate: number
    }
}

export async function generateReviewsSummary(input: ReviewsSummaryInput): Promise<string | null> {
    if (!openai) return null

    try {
        const currentStats = input.currentContext ? `
【當前市場狀態 (Reality)】
- BTC 價格: $${input.currentContext.btcPrice.toLocaleString()}
- 恐懼貪婪: ${input.currentContext.fgi}/100
- 資金費率: ${(input.currentContext.fundingRate * 100).toFixed(4)}%
` : ''

        const eventsContext = input.events.map(e => `
- 事件: ${e.title} (${e.year})
  - 類型: ${e.tags.join(', ')}
  - 狀態: ${e.marketStates.join(', ')}
  - 關鍵數據: MDD ${e.maxDrawdown}, 修復 ${e.recoveryDays}
`).join('\n')

        const prompt = `
${VOICE_PACK}

你是一個鑽研金融歷史的量化交易員。
請根據當前市場狀態，從歷史事件庫中尋找「最相似的歷史韻腳 (Rhyme)」。

【歷史事件庫】
${eventsContext}

${currentStats}

【分析任務】
1. **歷史對標**：當前環境最像哪一個歷史事件？（若無，則指出現在是獨特行情）
2. **差異分析**：雖然像，但有什麼決定性的不同？
3. **歷史啟示**：根據該歷史事件的後續走向，現在應該注意什麼風險？

長度限制：80-120 字。
格式：一段流暢的分析，包含「對標」、「差異」、「啟示」。
語氣：專業、警示、客觀。

${CONSISTENCY_CHECK}

請直接輸出分析內容。`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
        })

        return formatTaiwaneseText(completion.choices[0]?.message?.content?.trim() || '')
    } catch (e) {
        logger.error('Grok Reviews Summary Error:', e, { feature: 'ai' })
        return null
    }
}


// ============================================
// Calendar Summary
// ============================================

export interface CalendarSummaryInput {
    events: any[]
}

export interface CalendarSummaryResult {
    summary: string
    recommended_readings?: Array<{
        title: string
        path: string
        reason?: string
    }>
}

export async function generateCalendarSummary(input: CalendarSummaryInput): Promise<CalendarSummaryResult | null> {
    if (!openai) return null

    try {
        const nearestEvent = input.events[0]
        const nextEvents = input.events.slice(1, 3)

        const prompt = `
${VOICE_PACK}

你是宏觀經濟與幣圈連動的分析專家。
請分析「最近一個即將發生的事件」，並給出情境推演。

【最近關注焦點】
- 事件：${nearestEvent.title}
- 時間：${nearestEvent.date}
- 預期影響：${nearestEvent.impact}
- 歷史波動：${nearestEvent.volatility || '未知'}%

【輸出要求】
1. **現況鋪墊**：市場目前對此事件的預期是什麼？(20-30字)
2. **劇本推演 (Dynamic Scenario)**：
   - 劇本 A (風險)：若數據高於/低於預期，會發生什麼？(30-40字)
   - 劇本 B (機會)：反之會如何？
3. **推薦關注**：針對接下來的事件，推薦 2 個日曆頁面。
   - 候選：${nextEvents.map(e => `${e.title} (${e.date})`).join(', ')}

【限制】
❌ 禁止預測具體數字結果
✅ 著重於「波動率」與「結構風險/機會」

【輸出格式】JSON
{
    "summary": "【前瞻】... \n📉 劇本 A：...\n📈 劇本 B：...",
    "recommended_readings": [
        { "title": "...", "path": "/calendar/...", "reason": "..." }
    ]
}

${CONSISTENCY_CHECK}

請輸出 JSON。`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        const json = JSON.parse(text)
        return {
            summary: formatTaiwaneseText(json.summary),
            recommended_readings: json.recommended_readings
        }

    } catch (e) {
        logger.error('Grok Calendar Summary Error:', e, { feature: 'ai' })
        return null
    }
}


// ============================================
// Whale Summary (Hyperliquid)
// ============================================

export interface WhalePositionSummary {
    rank: number
    symbol: string
    side: 'LONG' | 'SHORT'
    valueUsd: number
    pnl: number
    leverage: number
}

export async function generateWhaleSummary(positions: WhalePositionSummary[]): Promise<string | null> {
    if (!openai) return null

    try {
        const prompt = `
${VOICE_PACK}

你是加密貨幣分析師。根據以下 Hyperliquid 前 20 名巨鯨持倉數據，用 1-2 句話總結他們的動態。

【數據】
${JSON.stringify(positions, null, 2)}

【要求】
1. 用繁體中文
2. 極度精簡（25字以內），用詞犀利，直接講重點。
3. 風格範例：「ETH 多空分歧明顯，BTC 持倉相對穩定，各路資金對沖激烈。」
4. 重點：多空爭奪、誰在重倉、市場傾向。
5. ❌ 【嚴重限制】嚴禁使用預測性語言（如：將上漲、即將反轉、看好、目標價）。只描述「當下行為」（加倉 / 對沖 / 減碼 / 觀望）。
6. 不要廢話，不要建議。

【輸出】
直接輸出摘要文字，不要有其他格式。

【強制要求排版】中英文、中文與數字、數字與單位之間都一定要加空格如："ABC 中文 123 中文"；°/% 不加。中文用全形標點，不重複；英文句子與書名用半形。數字用半形。專有名詞用官方大小寫，避免亂縮寫。
`
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
        })

        return formatTaiwaneseText(completion.choices[0]?.message?.content?.trim() || '')
    } catch (e) {
        logger.error('Grok Whale Summary Error:', e, { feature: 'ai' })
        return null
    }
}


