/**
 * LINE Daily Broadcast Service
 * 
 * 架構：混合式
 * - 規則式：決定 stance（穩定、可解釋、可回溯）
 * - AI：潤色 reasons / suggestion / mindset（人味、脈絡）
 * 
 * ⚠️ AI 不能推翻 stance，只能解釋
 */

import { FlexMessage, FlexBubble, FlexBox, FlexText, FlexSeparator } from '@line/bot-sdk'

// ============================================
// Type Definitions
// ============================================

export type Stance = '偏多' | '偏多觀望' | '中性' | '偏空觀望' | '偏空'

export interface MarketMetrics {
    fundingRate: number          // e.g., 0.05 = 0.05%
    longShortRatio: number       // e.g., 65 = 65% long
    liquidationBias: 'long' | 'short' | 'neutral'  // Which side got liquidated more
    liquidationTotal: number     // Total liquidation in USD
    oiChange24h: number          // e.g., 3.5 = +3.5%
    btcPriceChange24h: number    // e.g., -2.5 = -2.5%
}

export interface StanceDecision {
    stance: Stance
    rawReasons: string[]  // Rule-based reasons (for AI to polish)
    metrics: MarketMetrics
}

export interface IndicatorCard {
    icon: string        // 💰 / 👥 / 💥
    name: string        // 資金費率 / 多空比 / 爆倉
    status: string      // 歸零 / 50:50 / 0 變化
    note: string        // 解釋一句話
}

export interface DailyBroadcastContent {
    judgment: {
        stance: Stance
        oneLiner: string      // 市場一句話（最顯眼）
        suggestion: string    // 操作建議
    }
    indicatorCards: IndicatorCard[]  // 三個指標卡片
    mindset?: string
    // BTC Price Change Reference
    btcPriceChange?: {
        h1: number
        h4: number
        h12: number
        h24: number
    }
}

// ============================================
// Step 1: Rule-Based Stance Engine
// ============================================

/**
 * 規則式 Stance 判斷
 * 
 * 優先順序：
 * 1. 極端情況（直接偏多/偏空）
 * 2. 混合信號（觀望）
 * 3. 無明顯信號（中性）
 */
export function decideStance(metrics: MarketMetrics): StanceDecision {
    const reasons: string[] = []
    let bullScore = 0
    let bearScore = 0

    // === 費率判斷 ===
    if (metrics.fundingRate > 0.1) {
        bearScore += 2
        reasons.push('費率過高，多頭擁擠')
    } else if (metrics.fundingRate > 0.05) {
        bearScore += 1
        reasons.push('費率偏高')
    } else if (metrics.fundingRate < -0.05) {
        bullScore += 2
        reasons.push('負費率，空頭需付費')
    } else if (metrics.fundingRate < 0) {
        bullScore += 1
        reasons.push('費率轉負')
    }

    // === 多空比判斷 ===
    if (metrics.longShortRatio > 70) {
        bearScore += 2
        reasons.push('散戶做多極度擁擠')
    } else if (metrics.longShortRatio > 60) {
        bearScore += 1
        reasons.push('散戶偏多')
    } else if (metrics.longShortRatio < 40) {
        bullScore += 2
        reasons.push('散戶偏空，反向指標')
    } else if (metrics.longShortRatio < 45) {
        bullScore += 1
        reasons.push('散戶轉空')
    }

    // === 爆倉判斷 ===
    if (metrics.liquidationBias === 'long' && metrics.liquidationTotal > 100_000_000) {
        bearScore += 2
        reasons.push('多單大量爆倉')
    } else if (metrics.liquidationBias === 'long') {
        bearScore += 1
        reasons.push('多單爆倉較多')
    } else if (metrics.liquidationBias === 'short' && metrics.liquidationTotal > 100_000_000) {
        bullScore += 2
        reasons.push('空單大量爆倉，軋空可能')
    } else if (metrics.liquidationBias === 'short') {
        bullScore += 1
        reasons.push('空單爆倉較多')
    }

    // === OI 變化判斷 ===
    if (metrics.oiChange24h > 5) {
        // OI 激增 + 價格漲 = 多頭進場
        if (metrics.btcPriceChange24h > 0) {
            bullScore += 1
            reasons.push('OI 上升 + 價格上漲')
        } else {
            // OI 激增 + 價格跌 = 空頭進場
            bearScore += 1
            reasons.push('OI 上升 + 價格下跌')
        }
    } else if (metrics.oiChange24h < -5) {
        reasons.push('OI 下降，資金撤離')
    }

    // === 計算最終 Stance ===
    const netScore = bullScore - bearScore

    let stance: Stance
    if (netScore >= 3) {
        stance = '偏多'
    } else if (netScore >= 1) {
        stance = '偏多觀望'
    } else if (netScore <= -3) {
        stance = '偏空'
    } else if (netScore <= -1) {
        stance = '偏空觀望'
    } else {
        stance = '中性'
    }

    // 如果沒有明顯理由，加入預設
    if (reasons.length === 0) {
        reasons.push('市場無明顯方向信號')
    }

    return { stance, rawReasons: reasons, metrics }
}

// ============================================
// Step 2: AI Polish (Gemini)
// ============================================

export interface PolishResult {
    oneLiner: string
    indicatorCards: IndicatorCard[]
    suggestion: string
    mindset?: string
}

export async function polishWithAI(
    decision: StanceDecision
): Promise<PolishResult> {
    // Dynamic import to avoid circular dependency
    const { generateDailyBroadcastPolish } = await import('./gemini')

    try {
        const result = await generateDailyBroadcastPolish(decision)
        if (result) {
            return result
        }
    } catch (e) {
        console.error('[Daily Broadcast] AI polish failed:', e)
    }

    // Fallback: Use raw reasons to construct indicator cards
    return {
        oneLiner: getOneLinerFallback(decision.stance),
        indicatorCards: getIndicatorCardsFallback(decision),
        suggestion: getSuggestionFallback(decision.stance),
        mindset: undefined
    }
}

function getOneLinerFallback(stance: Stance): string {
    switch (stance) {
        case '偏多': return '多頭動能回升，關注突破確認'
        case '偏多觀望': return '市場偏強但需等待確認信號'
        case '中性': return '市場缺乏共識，整體進入觀望期'
        case '偏空觀望': return '短線結構偏弱，風險略升'
        case '偏空': return '空頭壓力增加，留意下探風險'
    }
}

function getIndicatorCardsFallback(decision: StanceDecision): IndicatorCard[] {
    const m = decision.metrics
    return [
        {
            icon: '💰',
            name: '資金費率',
            status: Math.abs(m.fundingRate) < 0.01 ? '趨近零' : m.fundingRate > 0 ? '偏高' : '轉負',
            note: '多空成本趨近，槓桿意願低'
        },
        {
            icon: '👥',
            name: '多空比',
            status: `${Math.round(m.longShortRatio)} / ${Math.round(100 - m.longShortRatio)}`,
            note: '散戶情緒中性'
        },
        {
            icon: '💥',
            name: '爆倉 / OI',
            status: m.liquidationTotal > 100_000_000 ? `${(m.liquidationTotal / 1_000_000).toFixed(0)}M` : '極度清淡',
            note: '槓桿活動低迷'
        }
    ]
}

function getSuggestionFallback(stance: Stance): string {
    switch (stance) {
        case '偏多': return '順勢操作，留意過熱風險'
        case '偏多觀望': return '不追高，等回踩再觀察'
        case '中性': return '保持觀望，不追價、不重倉'
        case '偏空觀望': return '減倉觀望，不急著抄底'
        case '偏空': return '以保護資金為優先'
    }
}

// ============================================
// Step 3: Create Flex Message
// 新版交易型 UX 設計
// 閱讀順序：一句話 → 掃描條 → 指標卡 → 操作建議 → 心態提醒
// ============================================

export function createDailyBroadcastFlex(content: DailyBroadcastContent): FlexMessage {
    const formatChange = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%'

    // 生成判斷依據摘要（一行）
    const generateBasisSummary = (): string => {
        const cards = content.indicatorCards || []
        if (cards.length === 0) return '多空力量均衡'

        // 從卡片中提取關鍵狀態
        const statuses = cards.map(c => c.status).join('、')
        return `判斷依據：${statuses}`
    }

    // BTC 變化一行格式（無紅綠色）
    const btcChangeLine = content.btcPriceChange
        ? `BTC 變化｜1H ${formatChange(content.btcPriceChange.h1)}｜4H ${formatChange(content.btcPriceChange.h4)}｜12H ${formatChange(content.btcPriceChange.h12)}｜24H ${formatChange(content.btcPriceChange.h24)}`
        : ''

    return {
        type: 'flex',
        altText: `幣圈日報：${content.judgment.stance}`,
        contents: {
            type: 'bubble',
            size: 'kilo',
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                contents: [
                    // Layer 1: 唯一主角 - 一句市場判斷（最大最顯眼）
                    {
                        type: 'text',
                        text: content.judgment.oneLiner,
                        weight: 'bold',
                        size: 'lg',
                        color: '#111111',
                        wrap: true
                    },

                    // Layer 2: BTC 變化（一行灰字，無紅綠）
                    ...(btcChangeLine ? [{
                        type: 'text' as const,
                        text: btcChangeLine,
                        size: 'xxs' as const,
                        color: '#999999',
                        margin: 'lg' as const,
                        wrap: true
                    }] : []),

                    // Layer 3: 判斷依據摘要（一行）
                    {
                        type: 'text',
                        text: generateBasisSummary(),
                        size: 'xs',
                        color: '#666666',
                        margin: 'md'
                    },

                    // Layer 4: 一句操作建議
                    {
                        type: 'text',
                        text: `🎯 建議：${content.judgment.suggestion}`,
                        size: 'sm',
                        color: '#333333',
                        wrap: true,
                        margin: 'lg'
                    }
                ]
            },
            footer: {
                type: 'box',
                layout: 'horizontal',
                contents: [
                    {
                        type: 'button',
                        style: 'secondary', // Keep secondary style for broadcast to be less aggressive? Or primary? User asked for the button. Let's use primary to be consistent. Actually previous was secondary. Let's use primary as it's the only call to action.
                        height: 'sm',
                        action: {
                            type: 'uri',
                            label: '追蹤加密台灣 IG',
                            uri: 'https://www.instagram.com/crypto.tw_'
                        },
                        color: "#1F1AD9"
                    }
                ]
            }
        }
    }
}

function getStanceColor(stance: Stance): string {
    if (stance.includes('多')) return '#00B900'  // Green (same as up)
    if (stance.includes('空')) return '#D00000'  // Red (same as down)
    return '#888888'  // Neutral gray
}

// ============================================
// Main Entry Point
// ============================================

export async function generateDailyBroadcast(metrics: MarketMetrics): Promise<DailyBroadcastContent> {
    // Step 1: Rule-based stance decision
    const decision = decideStance(metrics)
    console.log(`[Daily Broadcast] Stance: ${decision.stance}`, decision.rawReasons)

    // Step 2: AI polish（生成 oneLiner, indicatorCards, suggestion, mindset）
    const polished = await polishWithAI(decision)

    // Step 3: Construct content
    return {
        judgment: {
            stance: decision.stance,
            oneLiner: polished.oneLiner,
            suggestion: polished.suggestion
        },
        indicatorCards: polished.indicatorCards,
        mindset: polished.mindset
    }
}
