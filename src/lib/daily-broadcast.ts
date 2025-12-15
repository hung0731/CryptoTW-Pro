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
    const stanceColor = getStanceColor(content.judgment.stance)
    const formatChange = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%'
    const getChangeColor = (n: number) => n >= 0 ? '#00B900' : '#D00000'

    // 建構指標卡片 Flex 元素
    const indicatorCardElements: any[] = content.indicatorCards.flatMap((card, i) => [
        // 分隔線（第一個除外）
        ...(i > 0 ? [{ type: 'separator' as const, margin: 'md' as const, color: '#f0f0f0' }] : []),
        // 指標卡片
        {
            type: 'box' as const,
            layout: 'vertical' as const,
            margin: i > 0 ? 'md' as const : 'none' as const,
            contents: [
                // 第一行：icon + name + status
                {
                    type: 'box' as const,
                    layout: 'horizontal' as const,
                    contents: [
                        {
                            type: 'text' as const,
                            text: `${card.icon} ${card.name}`,
                            size: 'sm' as const,
                            color: '#555555',
                            flex: 2
                        },
                        {
                            type: 'text' as const,
                            text: card.status,
                            size: 'sm' as const,
                            color: '#111111',
                            weight: 'bold' as const,
                            align: 'end' as const,
                            flex: 2
                        }
                    ]
                },
                // 第二行：note（解釋）
                {
                    type: 'text' as const,
                    text: card.note,
                    size: 'xs' as const,
                    color: '#888888',
                    margin: 'xs' as const
                }
            ]
        }
    ])

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
                    // 頂部：📘 幣圈日報｜{stance} + BTC 24H
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            {
                                type: 'text',
                                text: `📘 幣圈日報｜${content.judgment.stance}`,
                                weight: 'bold',
                                size: 'md',
                                color: stanceColor,
                                flex: 2
                            },
                            // BTC 24H 變化
                            ...(content.btcPriceChange ? [{
                                type: 'text' as const,
                                text: `BTC 24H ${formatChange(content.btcPriceChange.h24)}`,
                                size: 'xs' as const,
                                color: getChangeColor(content.btcPriceChange.h24),
                                weight: 'bold' as const,
                                align: 'end' as const,
                                gravity: 'center' as const,
                                flex: 1
                            }] : [])
                        ]
                    },
                    // 市場一句話（最大最顯眼）
                    {
                        type: 'text',
                        text: content.judgment.oneLiner,
                        weight: 'bold',
                        size: 'lg',
                        color: '#111111',
                        wrap: true,
                        margin: 'md'
                    }
                ],
                paddingBottom: '10px'
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    // 時間掃描條（1H/4H/12H/24H）
                    ...(content.btcPriceChange ? [
                        {
                            type: 'box' as const,
                            layout: 'horizontal' as const,
                            contents: [
                                { type: 'text' as const, text: '1H', size: 'xxs' as const, color: '#888888', flex: 1, align: 'center' as const },
                                { type: 'text' as const, text: '4H', size: 'xxs' as const, color: '#888888', flex: 1, align: 'center' as const },
                                { type: 'text' as const, text: '12H', size: 'xxs' as const, color: '#888888', flex: 1, align: 'center' as const },
                                { type: 'text' as const, text: '24H', size: 'xxs' as const, color: '#888888', flex: 1, align: 'center' as const }
                            ]
                        },
                        {
                            type: 'box' as const,
                            layout: 'horizontal' as const,
                            margin: 'xs' as const,
                            contents: [
                                { type: 'text' as const, text: formatChange(content.btcPriceChange.h1), size: 'xs' as const, color: getChangeColor(content.btcPriceChange.h1), weight: 'bold' as const, flex: 1, align: 'center' as const },
                                { type: 'text' as const, text: formatChange(content.btcPriceChange.h4), size: 'xs' as const, color: getChangeColor(content.btcPriceChange.h4), weight: 'bold' as const, flex: 1, align: 'center' as const },
                                { type: 'text' as const, text: formatChange(content.btcPriceChange.h12), size: 'xs' as const, color: getChangeColor(content.btcPriceChange.h12), weight: 'bold' as const, flex: 1, align: 'center' as const },
                                { type: 'text' as const, text: formatChange(content.btcPriceChange.h24), size: 'xs' as const, color: getChangeColor(content.btcPriceChange.h24), weight: 'bold' as const, flex: 1, align: 'center' as const }
                            ]
                        },
                        { type: 'separator' as const, margin: 'md' as const, color: '#f0f0f0' }
                    ] : []),

                    // 三個指標卡片
                    ...indicatorCardElements,

                    { type: 'separator', margin: 'md', color: '#f0f0f0' },

                    // 🧭 操作建議（行動卡片）
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'md',
                        backgroundColor: '#F8F8F8',
                        cornerRadius: '6px',
                        paddingAll: '12px',
                        contents: [
                            {
                                type: 'text',
                                text: '🧭 操作建議',
                                size: 'xs',
                                color: '#888888'
                            },
                            {
                                type: 'text',
                                text: content.judgment.suggestion,
                                size: 'md',
                                color: '#111111',
                                weight: 'bold',
                                margin: 'xs'
                            }
                        ]
                    },

                    // 🧠 心態提醒（淡灰小字，底部）
                    ...(content.mindset ? [{
                        type: 'text' as const,
                        text: `🧠 ${content.mindset}`,
                        size: 'xxs' as const,
                        color: '#AAAAAA',
                        wrap: true,
                        margin: 'md' as const
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
