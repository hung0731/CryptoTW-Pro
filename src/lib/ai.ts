
import OpenAI from 'openai'
import { formatTaiwaneseText, formatObjectStrings } from './format-utils'
import { acquireLock, releaseLock } from './cache'
import { CACHE_KEYS } from '@/lib/cache-keys'
import { logger } from '@/lib/logger'
import { MarketContext } from '@/lib/types'

// ==========================================
// Google Gemini Configuration (via OpenAI SDK)
// ==========================================
const apiKey = process.env.GEMINI_API_KEY
const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
}) : null

export const MODEL_NAME = 'gemini-2.5-flash-lite-preview-09-2025'

const VOICE_PACK = `
【角色設定】
你是一位「加密貨幣首席分析師」，擁有深厚的總體經濟與鏈上數據背景。
你的分析風格：
- **專業深刻**：不只陳述現象，更洞察背後的「資金邏輯」與「博弈結構」。
- **客觀冷靜**：不使用誇張、聳動或情緒化的字眼（如：騙砲、韭菜）。
- **數據為本**：所有的判斷都基於費率、持倉量 (OI)、流動性 (Liquidity) 與鏈上行為。
- **精煉準確**：文字簡潔有力，直指核心，不說廢話。

【用語規範】
- ✅ 關鍵字：流動性掠奪、結構破壞、均值回歸、風險溢價、多空博弈、籌碼分佈。
- ❌ 禁用：投資建議、價格預測、情緒化用語 (韭菜/莊家殺盤)、中國用語 (缺口/承壓)。
- ✅ 格式：繁體中文，數據精確 (如 $900M)，標點符號標準。
`

const CONSISTENCY_CHECK = `
【一致性檢查】
輸出前檢核：
1. 是否過於情緒化？ -> 改為客觀描述。
2. 是否太過淺層？ -> 補充背後的機制（如：因為空頭回補導致...）。
3. 語氣是否像專業分析師？ -> 確保專業度。
`

/**
 * Clean AI response by removing markdown code blocks
 * Handles cases like: ```json { ... } ```
 */
function cleanJsonResponse(text: string): string {
    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    let cleaned = text.trim()
    // Match ```json or ``` at the start
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '')
    }
    // Match ``` at the end
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/\n?```$/, '')
    }
    return cleaned.trim()
}

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

【任務】
你是一個智能快訊解讀助手。
請將以下「市場快訊事件」轉化為專業且易懂的「機制解讀」。

【核心目標】
解釋「為什麼這件事重要？」以及「它代表什麼市場訊號？」。
不要只翻譯摘要，要挖掘背後的隱含意義。

【限制】
1. **精煉**：限制 40-60 字。
2. **深度**：解釋訊號背後的邏輯 (例如：鉅額轉入交易所 -> 可能增加潛在賣壓)。
3. ❌ **禁止預測**：不說「將會大跌」。

【寫法範例】
- 「這顯示機構資金正在避險，短期流動性可能緊縮...」
- 「OI 異常激增意味著波動率即將放大，市場正在蓄力...」

【快訊事件】
- 類型：${alert.type}
- 摘要：${alert.summary}
- 數據：${JSON.stringify(alert.metrics)}

${CONSISTENCY_CHECK}

【輸出】直接輸出內文，不要有標題。
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

    const lockKey = CACHE_KEYS.LOCK_MARKET_SUMMARY // Keep old lock key for compatibility
    if (!await acquireLock(lockKey, 60)) {
        logger.warn('AI Busy: Market Summary generation locked', { feature: 'ai' })
        return null
    }

    try {
        const prompt = `
${VOICE_PACK}

【任務】
你是 CryptoTW 的首席量化分析師。請綜合「新聞脈絡」與「數據結構」進行深度市場解讀。

【分析框架】
1. **結構分析**：當前價格處於什麼階段？(吸籌/分發/趨勢/震盪)。
2. **因果關聯**：新聞事件如何影響了市場情緒或籌碼分佈？(例如：監管消息導致做市商撤單，流動性變差)。
3. **風險評估**：當前最大的潛在風險或機會在哪裡？

【輸入數據】
[技術訊號] ${JSON.stringify(marketData.signals || {}, null, 2)}
[原始數據] BTC: $${marketData.btc?.price || 0}, 資金費率: ${marketData.btc?.fundingRate || 0}%, 多空比: ${marketData.longShort?.ratio || 0}
[異常事件] ${recentAlerts.length > 0 ? JSON.stringify(recentAlerts.slice(0, 3), null, 2) : "無"}
[鏈上新聞] ${rssTitles || '無顯著新聞'}

【輸出格式】(Strict JSON)

**sentiment_score**: 0-100 (綜合評分：新聞 40% + 動能 30% + 籌碼 30%)
**sentiment**: "偏多" | "偏空" | "震盪" | "中性"
**headline**: 20 字以內標題，精準概括「主導敘事」與「市場狀態」。(如：ETF 流入趨緩，BTC 縮量測試關鍵支撐)
**analysis**: 100-150 字深度分析。
   - **邏輯流**：(1) 點出主導市場的核心因素 (新聞/數據) -> (2) 分析該因素引發的市場行為 (如：導致多頭停損) -> (3) 總結當前結構狀態。
   - **要求**：言之有物，避免空泛形容詞。
**whale_summary**: 巨鯨/主力動向一句話總結 (如：Smart Money 正在高位減倉)。
**market_structure**: (結構判斷)
   - bias: 使用 signals.market_feeling
   - focus_zone: 當前多空爭奪最激烈的價格區
   - invalidation_zone: 趨勢改變的關鍵失效點
   - resistance_zone: 上方流動性密集的壓力區
**risk_note**: 針對當前結構的 specific 風險提示 (非通用警語)。
**market_context**: (敘事背景)
   - summary: 當前市場最關注的宏觀/賽道焦點。
   - highlights: [{ theme: "主題", impact: "傳遞機制與影響" }]

${CONSISTENCY_CHECK}

【輸出】只輸出 JSON。
`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return formatObjectStrings(JSON.parse(cleanJsonResponse(text)))

    } catch (e) {
        logger.error('Grok Generation Error:', e, { feature: 'ai' })
        return null
    } finally {
        await releaseLock(CACHE_KEYS.LOCK_MARKET_SUMMARY)
    }
}

export async function generateDerivativesSummary(data: any): Promise<string | null> {
    if (!openai) return null
    try {
        const prompt = `
${VOICE_PACK}

【任務】
你是衍生品交易臺的資深策略師。
請根據「合約數據」的異常變化，解讀市場的微觀結構 (Microstructure)。

【分析邏輯】
1. **擁擠度 (Crowding)**：多空哪一邊過度擁擠？(費率 + OI 判斷)。
2. **燃料 (Fuel)**：哪一邊有大量清算流動性？
3. **分歧 (Divergence)**：散戶與大戶是否對做？

【輸入數據】
1. 資金費率: ${JSON.stringify(data.fundingRates?.extremePositive?.[0] || {}, null, 2)}
2. 爆倉: 多 $${data.liquidations?.summary?.longLiquidatedFormatted || '0'} / 空 $${data.liquidations?.summary?.shortLiquidatedFormatted || '0'}
3. 多空比: ${data.longShort?.global?.longShortRatio || '未知'}

【輸出要求】
1. **長度**：60-90 字。
2. **語氣**：極度專業、冷靜。
3. **內容**：不要只描述數據，要講出數據背後的「博弈狀態」。
   - 例如：「費率轉負但價格未跌，顯示現貨買盤強勁，空頭陷入陷阱...」

${CONSISTENCY_CHECK}

【輸出】直接輸出內文，不要標題。
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

    const lockKey = CACHE_KEYS.LOCK_MARKET_CONTEXT
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

【任務】
你是 CryptoTW 的執行編輯。請從混雜的資訊中，為讀者提煉出「高價值的市場情報」。

【篩選標準 - 只選雜訊中的信號 (Signal over Noise)】
請從以下新聞中**精選 10 則**最具市場影響力的重點新聞。
1. **結構性影響**：能改變市場趨勢的事件 (監管/大型機構/技術升級)。
2. **流動性事件**：大規模的解鎖、轉帳、或清算。
3. **異常波動**：無明顯原因的暴漲暴跌。

【內容撰寫要求】
- **Summary**: 80-120 字。將今日看似獨立的新聞串連成一個完整的敘事 (Narrative)。告訴讀者「今天市場的主題是什麼」。
- **Highlight**: 標題要點出「影響」，而不只是「事件」。

【數據環境】
${indicatorSnippet}

【輸入新聞】
${JSON.stringify(newsItems.slice(0, 50).map(n => ({
            t: n.newsflash_title || n.title,
            c: (n.newsflash_content || n.content || '').slice(0, 150)
        })))}

${CONSISTENCY_CHECK}

【輸出格式】JSON
{
  "context": {
      "sentiment": "偏多|偏空|震盪|中性",
      "summary": "深度總結",
      "highlights": [
        {
            "title": "精煉標題 (15-20字)",
            "reason": "事件解讀與後續影響 (這是重點)",
            "impact": "高|中|低",
            "bias": "偏多|偏空|中性",
            "impact_note": "操作層面的簡短啟示"
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
        const cleaned = cleanJsonResponse(text)
        return formatObjectStrings(JSON.parse(cleaned).context || JSON.parse(cleaned))

    } catch (e) {
        logger.error('Grok Market Context Brief Error:', e, { feature: 'ai' })
        return null
    } finally {
        await releaseLock(CACHE_KEYS.LOCK_MARKET_CONTEXT)
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

    const lockKey = CACHE_KEYS.LOCK_AI_DECISION
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

【任務】
你是機構交易室的風控系統 (Risk Control System)。
請根據即時的市場參數，計算當前的「風險/回報 (R:R)」狀態。

【判斷核心】
不是預測漲跌，而是評估「現在進場的勝率與賠率」。
- **擁擠與反轉**：當所有人都站在同一邊時，反轉風險最高。
- **流動性結構**：價格是否正在接近流動性密集的區域？

【輸入數據】
1. 費率: ${(marketData.fundingRate * 100).toFixed(4)}%
2. 散戶比: ${marketData.longShortRatio.toFixed(2)}
3. 頂級交易員: ${marketData.topTraderRatio?.toFixed(2) || 'N/A'}
4. 4H 爆倉: $${(marketData.totalLiquidation / 1000000).toFixed(1)} M (${liqDominant} 強勢)
5. OI 變化: ${marketData.oiChange ? (marketData.oiChange > 0 ? '+' : '') + marketData.oiChange.toFixed(1) + '%' : 'N/A'}
6. 情緒: ${marketData.sentimentScore}
7. 巨鯨: ${marketData.whaleStatus}
8. 概況: ${newsHighlights.slice(0, 2).join(' / ')}

【Action 定義 (擇一)】
- "風險溢價不足 (觀望)"：潛在回報不足以彌補風險。
- "右側確認中 (等待)"：趨勢未明，等待關鍵位突破。
- "左側博弈機會 (嘗試)"：盈虧比極佳，可嘗試逆勢。
- "順勢結構完整 (持有)"：各項指標共振，趨勢延續。
- "過熱警示 (減倉)"：極度擁擠，隨時可能去槓桿。
- "籌碼清洗 (清洗)"：正在清除不堅定籌碼。

${CONSISTENCY_CHECK}

【輸出格式】JSON
{
  "conclusion": "12-15 字精準狀態定義 (如：多頭結構完整 但短線過熱)",
  "bias": "偏多|偏空|震盪|中性",
  "risk_level": "低|中|中高|高",
  "action": "上述 Action 選項之一",
  "reasoning": "60-90 字，邏輯嚴密的推演。指出哪個數據支持了這個判斷。",
  "tags": { "btc": "4字狀態", "alt": "4字狀態", "sentiment": "4字狀態" }
}
`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return formatObjectStrings(JSON.parse(cleanJsonResponse(text)))

    } catch (e) {
        logger.error('Grok AI Decision Error:', e, { feature: 'ai' })
        return null
    } finally {
        await releaseLock(CACHE_KEYS.LOCK_AI_DECISION)
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

【任務】
你是 Daily Briefing 的主筆。
請將本日的市場數據轉化為一份「專業、精煉、具啟發性」的日報摘要。

【數據輸入】
今日定調：${decision.stance}
費率：${decision.metrics.fundingRate.toFixed(4)}%
多空比：${decision.metrics.longShortRatio.toFixed(0)}%
OI 變動：${decision.metrics.oiChange24h.toFixed(1)}%

【輸出格式】JSON
{
  "oneLiner": "15-20 字，精闢的市場總結 (如：多空膠著等待方向，資金轉向防禦性板塊)",
  "indicatorCards": [
    { "icon": "💰", "name": "資金費率", "status": "${fundingDisplay}", "note": "簡潔的機制解讀 (12字內)" },
    { "icon": "👥", "name": "多空比", "status": "${lsDisplay}", "note": "散戶vs大戶心態 (12字內)" },
    { "icon": "💥", "name": "爆倉 / OI", "status": "${liqOiDisplay}", "note": "流動性狀態 (12字內)" }
  ],
  "suggestion": "策略性建議 (15字內，如：減少槓桿，關注現貨支撐)",
  "mindset": "投資心理提醒 (如：耐心是最好的策略)"
}

${CONSISTENCY_CHECK}

【輸出】只輸出 JSON。`

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        })

        const text = completion.choices[0]?.message?.content || '{}'
        return formatObjectStrings(JSON.parse(cleanJsonResponse(text)))
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
        return JSON.parse(cleanJsonResponse(text))
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

【任務】
你是一位專注於「技術面與鏈上結合」的指標分析師。
請解讀以下儀表板數據，找出市場的「異常點 (Anomaly)」與「共振點 (Confluence)」。

【分析方法】
1. **交叉驗證**：價格漲但 FGI 跌？-> 背離警告。費率高但 OI 跌？-> 軋空結束。
2. **情境模擬**：如果價格跌回 X，結構會如何改變？
3. **數據說話**：所有論點都必須緊扣面板上的數字。

${btcPriceSection}
[ 面板數據 ]
- FGI: ${data.fearGreedIndex.value} (${fgiZone})
- Funding: ${fundingPct}%
- L/S Ratio: ${data.longShortRatio.toFixed(2)}
- 4H Liq: $${liqTotalM}M
${data.oiChange24h ? `- OI Δ: ${data.oiChange24h.toFixed(1)}%` : ''}

【輸出格式】JSON
{
    "summary": "100-130 字。將數據點串聯成一個有邏輯的分析故事。用詞專業，避免流水帳。重點放在「接下來該關注什麼指標的變化」。",
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
        const json = JSON.parse(cleanJsonResponse(text))
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

【任務】
你是總體經濟策略師。
針對即將發生的「關鍵事件」，分析市場的預期心理 (Expectation) 與潛在劇本。

【關注事件】
- 事件：${nearestEvent.title}
- 時間：${nearestEvent.date}
- 預期影響：${nearestEvent.impact}
- 歷史波動：${nearestEvent.volatility || 'N/A'}%

【分析架構】(100-120 字)
1. **市場定價 (Pricing in)**：市場是否已經提前反應了這個利好/利空？
2. **波動預期**：歷史數據顯示該事件通常帶來多大的震幅？
3. **關鍵看點**：數據公佈後的關鍵支撐/壓力位在哪？

【輸出格式】JSON
{
    "summary": "專業、流暢的分析段落。",
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
        const json = JSON.parse(cleanJsonResponse(text))
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

【任務】
你是「聰明錢 (Smart Money) 追蹤者」。
請解讀鏈上大戶的真實意圖：是單純的方向押注？還是基差套利？或是避險對沖？

【持倉數據】
${JSON.stringify(positions, null, 2)}

【輸出要求】
- **極簡**：25 字以內。
- **洞察**：分辨「投機」與「對沖」。
- **風格**：「大戶多單對沖減少，顯示對後市轉為樂觀。」

${CONSISTENCY_CHECK}

【輸出】直接輸出摘要文字。
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


