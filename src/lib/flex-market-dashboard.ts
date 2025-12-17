
import { FlexMessage, FlexBubble, FlexBox, FlexComponent } from '@line/bot-sdk'

// Helper for color logic
const COLORS = {
    up: '#00B900',      // Green
    down: '#D00000',    // Red
    neutral: '#888888', // Gray
    text: '#111111',
    subText: '#888888',
    primary: '#1F1AD9', // Brand Blue
    bg: '#F9F9F9'
}

export function createMarketDashboardFlex(data: any): FlexMessage {
    const timestamp = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })

    // 1. Sentiment Processing
    const fgi = data.sentiment?.fear_greed_index || 50
    const fgiLabel = data.sentiment?.fear_greed_label || '中性'
    let fgiColor = COLORS.neutral
    if (fgi >= 60) fgiColor = COLORS.up
    if (fgi >= 55) fgiColor = '#00B900' // Greed
    if (fgi <= 45) fgiColor = '#D00000' // Fear

    // 2. Institutional / Smart Money
    const etfFlow = data.etf?.daily_flow_usd || 0
    const etfFlowDisplay = etfFlow >= 1e6 ? `${(etfFlow / 1e6).toFixed(1)}M` : `${(etfFlow / 1e3).toFixed(0)}K`
    const etfColor = etfFlow > 0 ? COLORS.up : etfFlow < 0 ? COLORS.down : COLORS.neutral
    const etfSign = etfFlow > 0 ? '+' : ''

    const cbPremium = data.coinbase_premium?.premium_percent || 0
    const cbColor = cbPremium > 0 ? COLORS.up : cbPremium < 0 ? COLORS.down : COLORS.neutral
    const cbSign = cbPremium > 0 ? '+' : ''

    const whaleLsr = data.long_short?.whale_ratio || 0
    const retailLsr = data.long_short?.global_ratio || 0
    let smartMoneySignal = '中性'
    let smartMoneyColor = COLORS.neutral
    if (whaleLsr > retailLsr * 1.1) {
        smartMoneySignal = '大戶看多'
        smartMoneyColor = COLORS.up
    } else if (retailLsr > whaleLsr * 1.1) {
        smartMoneySignal = '大戶看空'
        smartMoneyColor = COLORS.down
    }

    // 3. Market Heat
    const fundingRate = (data.capital_flow?.funding_rate || 0) * 100 // %
    const fundingColor = fundingRate > 0.01 ? '#FF9900' : fundingRate < 0 ? '#00B900' : COLORS.neutral

    const longLiq = data.liquidations?.long_liquidated || 0
    const shortLiq = data.liquidations?.short_liquidated || 0
    const liqDom = longLiq > shortLiq ? '多單受難' : shortLiq > longLiq ? '空單受難' : '和平'
    const liqColor = longLiq > shortLiq ? COLORS.down : shortLiq > longLiq ? COLORS.up : COLORS.neutral

    return {
        type: 'flex' as const,
        altText: '🔥 即時市場數據儀表板',
        contents: {
            type: 'bubble' as const,
            size: 'kilo' as const,
            header: {
                type: 'box' as const,
                layout: 'vertical' as const,
                contents: [
                    {
                        type: 'box' as const,
                        layout: 'horizontal' as const,
                        contents: [
                            { type: 'text' as const, text: '🔥 即時市場儀表板', weight: 'bold' as const, size: 'lg' as const, color: COLORS.primary, flex: 1 },
                            { type: 'text' as const, text: '加密台灣 Pro', size: 'xxs' as const, color: COLORS.subText, align: 'end' as const, gravity: 'center' as const }
                        ]
                    },
                    { type: 'text' as const, text: `${timestamp} 更新`, size: 'xxs' as const, color: '#CCCCCC' }
                ]
            },
            body: {
                type: 'box' as const,
                layout: 'vertical' as const,
                contents: [
                    // Section 1: 恐懼與貪婪
                    {
                        type: 'box' as const,
                        layout: 'vertical' as const,
                        contents: [
                            { type: 'text' as const, text: '市場情緒(FGI)', size: 'xs' as const, color: COLORS.subText, weight: 'bold' as const },
                            {
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                margin: 'sm' as const,
                                contents: [
                                    { type: 'text' as const, text: `${fgi}`, size: '4xl' as const, weight: 'bold' as const, color: fgiColor, flex: 0 },
                                    {
                                        type: 'box' as const,
                                        layout: 'vertical' as const,
                                        paddingStart: 'lg' as const,
                                        flex: 1,
                                        justifyContent: 'center' as const,
                                        contents: [
                                            { type: 'text' as const, text: fgiLabel, size: 'md' as const, weight: 'bold' as const, color: '#111111' },
                                            // ProgressBar
                                            {
                                                type: 'box' as const,
                                                layout: 'vertical' as const,
                                                backgroundColor: '#E0E0E0',
                                                height: '6px',
                                                cornerRadius: '3px',
                                                margin: 'sm' as const,
                                                contents: [
                                                    {
                                                        type: 'box' as const,
                                                        layout: 'vertical' as const,
                                                        width: `${Math.min(fgi, 100)}%`,
                                                        height: '6px',
                                                        backgroundColor: fgiColor,
                                                        cornerRadius: '3px',
                                                        contents: []
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    { type: 'separator' as const, margin: 'lg' as const, color: '#F0F0F0' },

                    // Section 2: 機構與主力
                    {
                        type: 'box' as const,
                        layout: 'vertical' as const,
                        margin: 'lg' as const,
                        spacing: 'md' as const,
                        contents: [
                            { type: 'text' as const, text: '籌碼動向', size: 'xs' as const, color: COLORS.subText, weight: 'bold' as const },
                            // Row 1: ETF & Coinbase
                            {
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                contents: [
                                    // ETF Flow
                                    {
                                        type: 'box' as const,
                                        layout: 'vertical' as const,
                                        flex: 1,
                                        contents: [
                                            { type: 'text' as const, text: 'ETF 資金流(日)', size: 'xxs' as const, color: '#888888' },
                                            { type: 'text' as const, text: `${etfSign}${etfFlowDisplay}`, size: 'sm' as const, weight: 'bold' as const, color: etfColor }
                                        ]
                                    },
                                    // Coinbase Premium
                                    {
                                        type: 'box' as const,
                                        layout: 'vertical' as const,
                                        flex: 1,
                                        contents: [
                                            { type: 'text' as const, text: 'Coinbase 溢價', size: 'xxs' as const, color: '#888888' },
                                            { type: 'text' as const, text: `${cbSign}${cbPremium.toFixed(3)}%`, size: 'sm' as const, weight: 'bold' as const, color: cbColor }
                                        ]
                                    }
                                ]
                            },
                            // Row 2: Whale L/S
                            {
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                contents: [
                                    {
                                        type: 'box' as const,
                                        layout: 'vertical' as const,
                                        flex: 1,
                                        contents: [
                                            { type: 'text' as const, text: '大戶多空比', size: 'xxs' as const, color: '#888888' },
                                            { type: 'text' as const, text: whaleLsr.toFixed(2), size: 'sm' as const, weight: 'bold' as const, color: '#111111' }
                                        ]
                                    },
                                    {
                                        type: 'box' as const,
                                        layout: 'vertical' as const,
                                        flex: 1,
                                        contents: [
                                            { type: 'text' as const, text: '主力意圖', size: 'xxs' as const, color: '#888888' },
                                            { type: 'text' as const, text: smartMoneySignal, size: 'sm' as const, weight: 'bold' as const, color: smartMoneyColor }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    { type: 'separator' as const, margin: 'lg' as const, color: '#F0F0F0' },

                    // Section 3: 市場熱度
                    {
                        type: 'box' as const,
                        layout: 'vertical' as const,
                        margin: 'lg' as const,
                        spacing: 'md' as const,
                        contents: [
                            { type: 'text' as const, text: '市場熱度', size: 'xs' as const, color: COLORS.subText, weight: 'bold' as const },
                            {
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                contents: [
                                    {
                                        type: 'box' as const,
                                        layout: 'vertical' as const,
                                        flex: 1,
                                        contents: [
                                            { type: 'text' as const, text: '資金費率', size: 'xxs' as const, color: '#888888' },
                                            { type: 'text' as const, text: `${fundingRate.toFixed(4)}%`, size: 'sm' as const, weight: 'bold' as const, color: fundingColor }
                                        ]
                                    },
                                    {
                                        type: 'box' as const,
                                        layout: 'vertical' as const,
                                        flex: 1,
                                        contents: [
                                            { type: 'text' as const, text: '爆倉主導', size: 'xxs' as const, color: '#888888' },
                                            { type: 'text' as const, text: liqDom, size: 'sm' as const, weight: 'bold' as const, color: liqColor }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            footer: {
                type: 'box' as const,
                layout: 'vertical' as const,
                contents: [
                    {
                        type: 'button' as const,
                        style: 'primary' as const,
                        height: 'sm' as const,
                        action: {
                            type: 'uri' as const,
                            label: '追蹤 加密台灣 IG 🏃',
                            uri: 'https://www.instagram.com/crypto.tw_'
                        },
                        color: COLORS.primary
                    }
                ]
            }
        }
    }
}

// Mini Analysis Card - 3 Column Layout
export function createMiniAnalysisCard(data: any): FlexBubble {
    // 1. Sentiment (FGI)
    const fgi = data.sentiment?.fear_greed_index || 50
    let fgiStatus = '中性'
    let fgiColor = COLORS.neutral
    // Contrarian: Extreme Fear (<=25) -> Bullish (Buy), Extreme Greed (>=75) -> Bearish (Sell)
    if (fgi >= 75) { fgiStatus = '偏貪婪'; fgiColor = COLORS.up; } // User requested Green for "Bullish/Positive" context here? "偏多方用綠色"
    // Wait, typically Greed = Market Top Risk = Bearish Signal? 
    // BUT User said: "偏多方用綠色 篇空方用紅色". 
    // Usually "Greed" means price is going UP (Green). "Fear" means price is going DOWN (Red).
    // Let's follow standard Price Color: High FGI = Green, Low FGI = Red?
    // Or Follow Signal Color: High FGI = Danger (Red), Low FGI = Opportunity (Green)?
    // User Example: "75 | 偏貪婪". If they want 75 to be Green, I'll allow Green.
    // Let's assume Green = Bullish *Trend* / Positive *Value*.
    // User explicit request: "偏多方用綠色 篇空方用紅色" (Green for Bullish-side, Red for Bearish-side).

    // In strict trading terms:
    // Greed (75) -> Market is Bulish -> Green?
    // Fear (25) -> Market is Bearish -> Red?
    if (fgi >= 55) { fgiStatus = '偏貪婪'; fgiColor = COLORS.up; } // Green
    else if (fgi <= 45) { fgiStatus = '偏恐懼'; fgiColor = COLORS.down; } // Red
    else { fgiStatus = '中性'; fgiColor = COLORS.neutral; }

    // 2. Funding Rate
    const fundingRate = (data.capital_flow?.funding_rate || 0) * 100
    let fundingStatus = '費率健康'
    let fundingColor = COLORS.neutral
    // High > 0.01% -> Longs paying Shorts -> Crowded Longs
    // User logic: "多頭擁擠"
    if (fundingRate > 0.01) { fundingStatus = '多頭擁擠'; fundingColor = COLORS.down; } // Red (Risk)
    else if (fundingRate < 0) { fundingStatus = '空頭擁擠'; fundingColor = COLORS.up; } // Green (Signal)
    else { fundingStatus = '中性'; fundingColor = COLORS.neutral; }

    // 3. Long/Short (Whale vs Retail)
    const whaleLsr = data.long_short?.whale_ratio || 1
    const retailLsr = data.long_short?.global_ratio || 1
    let lsStatus = '中性'
    let lsColor = COLORS.neutral
    // Whale > Retail -> Smart Money Long -> Bullish
    if (whaleLsr > retailLsr * 1.05) { lsStatus = '大戶做多'; lsColor = COLORS.up; }
    else if (retailLsr > whaleLsr * 1.05) { lsStatus = '散戶做多'; lsColor = COLORS.down; }

    // Column Creator
    const createColumn = (label: string, value: string, status: string, color: string) => ({
        type: 'box' as const,
        layout: 'vertical' as const,
        flex: 1,
        alignItems: 'center' as const,
        contents: [
            { type: 'text' as const, text: label, size: 'xs' as const, color: '#111111' }, // Black Label
            { type: 'text' as const, text: value, size: 'xl' as const, weight: 'bold' as const, color: color, margin: 'sm' as const }, // Value
            { type: 'text' as const, text: status, size: 'xxs' as const, color: '#888888', margin: 'xs' as const } // Small Status
        ]
    })

    return {
        type: 'bubble' as const,
        size: 'kilo' as const,
        body: {
            type: 'box' as const,
            layout: 'vertical' as const,
            contents: [
                {
                    type: 'box' as const,
                    layout: 'horizontal' as const,
                    contents: [
                        createColumn('市場情緒', `${fgi}`, fgiStatus, fgiColor),
                        // Separator line between columns? Flex doesn't support vertical separator easily in box contents list without extra boxes.
                        // Can use border or just spacing. Spacing is fine.
                        createColumn('資金費率', `${fundingRate.toFixed(3)}%`, fundingStatus, fundingColor),
                        createColumn('多空分佈', `${whaleLsr.toFixed(2)}`, lsStatus, lsColor)
                    ]
                },
                // Footer Hint
                {
                    type: 'text' as const,
                    text: '此為即時鏈上與交易所數據',
                    size: 'xxs' as const,
                    color: '#dddddd',
                    margin: 'lg' as const,
                    align: 'center' as const
                }
            ]
        }
        // Footer is handled by Price Card merge usually, but we keep structure valid.
    }
}

