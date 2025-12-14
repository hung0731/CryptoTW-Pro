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

export interface DailyBroadcastContent {
    judgment: {
        stance: Stance
        reasons: string[]
        suggestion: string
    }
    mindset?: string
    marketFactor?: string
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

export async function polishWithAI(
    decision: StanceDecision
): Promise<{ reasons: string[], suggestion: string, mindset?: string }> {
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

    // Fallback: Use raw reasons if AI fails
    return {
        reasons: decision.rawReasons,
        suggestion: getSuggestionFallback(decision.stance),
        mindset: undefined
    }
}

function getSuggestionFallback(stance: Stance): string {
    switch (stance) {
        case '偏多': return '順勢操作，但留意過熱風險'
        case '偏多觀望': return '不追高，等回踩再觀察'
        case '中性': return '觀望為主，等待明確信號'
        case '偏空觀望': return '減倉觀望，不急著抄底'
        case '偏空': return '以保護資金為優先'
    }
}

// ============================================
// Step 3: Create Flex Message
// ============================================

export function createDailyBroadcastFlex(content: DailyBroadcastContent): FlexMessage {
    const bodyContents: (FlexBox | FlexText | FlexSeparator)[] = []

    // Header: 今日市場判斷
    bodyContents.push({
        type: 'box',
        layout: 'horizontal',
        contents: [
            {
                type: 'text',
                text: '📊 今日市場判斷',
                weight: 'bold',
                size: 'sm',
                color: '#ffffff'
            },
            {
                type: 'text',
                text: content.judgment.stance,
                weight: 'bold',
                size: 'sm',
                color: getStanceColor(content.judgment.stance),
                align: 'end'
            }
        ]
    })

    // Reasons
    bodyContents.push({
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        spacing: 'xs',
        contents: content.judgment.reasons.map(reason => ({
            type: 'text',
            text: `• ${reason}`,
            size: 'xs',
            color: '#b0b0b0',
            wrap: true
        })) as FlexText[]
    })

    // Suggestion
    bodyContents.push({
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        contents: [
            {
                type: 'text',
                text: '建議：',
                size: 'xs',
                color: '#888888',
                weight: 'bold'
            },
            {
                type: 'text',
                text: content.judgment.suggestion,
                size: 'xs',
                color: '#ffffff',
                wrap: true,
                margin: 'xs'
            }
        ]
    })

    // Optional: 心態提醒
    if (content.mindset) {
        bodyContents.push({
            type: 'separator',
            margin: 'lg',
            color: '#333333'
        })
        bodyContents.push({
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: [
                {
                    type: 'text',
                    text: '🧠 心態提醒',
                    size: 'xs',
                    color: '#888888',
                    weight: 'bold'
                },
                {
                    type: 'text',
                    text: content.mindset,
                    size: 'xs',
                    color: '#b0b0b0',
                    wrap: true,
                    margin: 'sm'
                }
            ]
        })
    }

    // Optional: 市場變因
    if (content.marketFactor) {
        bodyContents.push({
            type: 'separator',
            margin: 'lg',
            color: '#333333'
        })
        bodyContents.push({
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: [
                {
                    type: 'text',
                    text: '⚠ 市場變因',
                    size: 'xs',
                    color: '#FF9900',
                    weight: 'bold'
                },
                {
                    type: 'text',
                    text: content.marketFactor,
                    size: 'xs',
                    color: '#b0b0b0',
                    wrap: true,
                    margin: 'sm'
                }
            ]
        })
    }

    // Footer: Branding
    bodyContents.push({
        type: 'separator',
        margin: 'lg',
        color: '#333333'
    })

    // BTC Price Change Reference
    if (content.btcPriceChange) {
        const pc = content.btcPriceChange
        const formatChange = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%'
        bodyContents.push({
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: [
                {
                    type: 'text',
                    text: '⏱ BTC 價格變化（參考）',
                    size: 'xxs',
                    color: '#666666',
                    margin: 'none'
                },
                {
                    type: 'text',
                    text: `1H：${formatChange(pc.h1)}   4H：${formatChange(pc.h4)}`,
                    size: 'xxs',
                    color: '#888888',
                    margin: 'xs'
                },
                {
                    type: 'text',
                    text: `12H：${formatChange(pc.h12)}  24H：${formatChange(pc.h24)}`,
                    size: 'xxs',
                    color: '#888888',
                    margin: 'xs'
                }
            ]
        })
        bodyContents.push({
            type: 'separator',
            margin: 'md',
            color: '#333333'
        })
    }

    bodyContents.push({
        type: 'text',
        text: '— CryptoTW Pro',
        size: 'xxs',
        color: '#555555',
        align: 'end',
        margin: 'md'
    })

    const bubble: FlexBubble = {
        type: 'bubble',
        size: 'mega',
        styles: {
            body: {
                backgroundColor: '#1a1a1a'
            }
        },
        body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: 'lg',
            contents: bodyContents as any
        }
    }

    return {
        type: 'flex',
        altText: `📊 今日市場判斷：${content.judgment.stance}`,
        contents: bubble
    }
}

function getStanceColor(stance: Stance): string {
    if (stance.includes('多')) return '#00C853'  // Green
    if (stance.includes('空')) return '#FF5252'  // Red
    return '#888888'  // Neutral gray
}

// ============================================
// Main Entry Point
// ============================================

export async function generateDailyBroadcast(metrics: MarketMetrics): Promise<DailyBroadcastContent> {
    // Step 1: Rule-based stance decision
    const decision = decideStance(metrics)
    console.log(`[Daily Broadcast] Stance: ${decision.stance}`, decision.rawReasons)

    // Step 2: AI polish
    const polished = await polishWithAI(decision)

    // Step 3: Construct content
    return {
        judgment: {
            stance: decision.stance,
            reasons: polished.reasons,
            suggestion: polished.suggestion
        },
        mindset: polished.mindset,
        marketFactor: undefined  // Will be added when significant events detected
    }
}

