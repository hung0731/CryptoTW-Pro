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
// (Based on CryptoTW Pro Flex 規範 - 參考 Currency Card)
// ============================================

export function createDailyBroadcastFlex(content: DailyBroadcastContent): FlexMessage {
    const stanceColor = getStanceColor(content.judgment.stance)
    const formatChange = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%'
    const getChangeColor = (n: number) => n >= 0 ? '#00B900' : '#D00000'

    return {
        type: 'flex',
        altText: `幣圈日報：${content.judgment.stance}`,
        contents: {
            type: 'bubble',
            size: 'kilo',
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            {
                                type: 'text',
                                text: '幣圈日報',
                                weight: 'bold',
                                size: 'lg',
                                color: '#1F1AD9',
                                flex: 1
                            },
                            {
                                type: 'text',
                                text: '加密台灣 Pro',
                                size: 'xxs',
                                color: '#888888',
                                align: 'end',
                                gravity: 'center'
                            }
                        ]
                    },
                    {
                        type: 'box',
                        layout: 'horizontal',
                        margin: 'sm',
                        contents: [
                            {
                                type: 'text',
                                text: content.judgment.stance,
                                weight: 'bold',
                                size: 'xl',
                                color: stanceColor
                            },
                            // BTC 24H in header
                            ...(content.btcPriceChange ? [{
                                type: 'text' as const,
                                text: `BTC ${formatChange(content.btcPriceChange.h24)}`,
                                size: 'sm' as const,
                                color: getChangeColor(content.btcPriceChange.h24),
                                weight: 'bold' as const,
                                align: 'end' as const,
                                gravity: 'center' as const
                            }] : [])
                        ]
                    }
                ],
                paddingBottom: '10px'
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    { type: 'separator', color: '#f0f0f0' },

                    // 判斷理由 (emoji already included from AI)
                    ...content.judgment.reasons.map(reason => ({
                        type: 'text' as const,
                        text: reason,  // AI already adds emoji prefix
                        size: 'sm' as const,
                        color: '#555555',
                        wrap: true,
                        margin: 'md' as const
                    })),

                    { type: 'separator', margin: 'md', color: '#f0f0f0' },

                    // 建議
                    {
                        type: 'box',
                        layout: 'horizontal',
                        margin: 'md',
                        contents: [
                            { type: 'text', text: '💡 建議', size: 'sm', color: '#888888', flex: 1 },
                            { type: 'text', text: content.judgment.suggestion, size: 'sm', color: '#111111', flex: 3, wrap: true, align: 'end' }
                        ]
                    },

                    // 心態提醒 (if exists)
                    ...(content.mindset ? [
                        { type: 'separator' as const, margin: 'md' as const, color: '#f0f0f0' },
                        {
                            type: 'box' as const,
                            layout: 'horizontal' as const,
                            margin: 'md' as const,
                            contents: [
                                { type: 'text' as const, text: '🧠 心態', size: 'sm' as const, color: '#888888', flex: 1 },
                                { type: 'text' as const, text: content.mindset, size: 'sm' as const, color: '#555555', wrap: true, flex: 3, align: 'end' as const }
                            ]
                        }
                    ] : []),

                    { type: 'separator', margin: 'md', color: '#f0f0f0' },

                    // BTC 價格變化表格
                    ...(content.btcPriceChange ? [{
                        type: 'box' as const,
                        layout: 'horizontal' as const,
                        margin: 'md' as const,
                        contents: [
                            { type: 'text' as const, text: '1H', size: 'xs' as const, color: '#888888', flex: 1, align: 'center' as const },
                            { type: 'text' as const, text: '4H', size: 'xs' as const, color: '#888888', flex: 1, align: 'center' as const },
                            { type: 'text' as const, text: '12H', size: 'xs' as const, color: '#888888', flex: 1, align: 'center' as const },
                            { type: 'text' as const, text: '24H', size: 'xs' as const, color: '#888888', flex: 1, align: 'center' as const }
                        ]
                    },
                    {
                        type: 'box' as const,
                        layout: 'horizontal' as const,
                        margin: 'xs' as const,
                        contents: [
                            { type: 'text' as const, text: formatChange(content.btcPriceChange.h1), size: 'sm' as const, color: getChangeColor(content.btcPriceChange.h1), weight: 'bold' as const, flex: 1, align: 'center' as const },
                            { type: 'text' as const, text: formatChange(content.btcPriceChange.h4), size: 'sm' as const, color: getChangeColor(content.btcPriceChange.h4), weight: 'bold' as const, flex: 1, align: 'center' as const },
                            { type: 'text' as const, text: formatChange(content.btcPriceChange.h12), size: 'sm' as const, color: getChangeColor(content.btcPriceChange.h12), weight: 'bold' as const, flex: 1, align: 'center' as const },
                            { type: 'text' as const, text: formatChange(content.btcPriceChange.h24), size: 'sm' as const, color: getChangeColor(content.btcPriceChange.h24), weight: 'bold' as const, flex: 1, align: 'center' as const }
                        ]
                    }] : [])
                ] as any
            },
            footer: {
                type: 'box',
                layout: 'horizontal',
                spacing: 'sm',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        height: 'sm',
                        action: {
                            type: 'uri',
                            label: '查看完整數據',
                            uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/prediction`
                        },
                        color: '#1F1AD9'
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

