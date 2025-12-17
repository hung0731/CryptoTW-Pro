
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
    if (fgi >= 60) fgiColor = COLORS.up // Greed = Green (Crypto standard usually) or Red? Usually Green is "Good" price up. But Greed is risky.
    // In Crypto: Green = Up, Red = Down.
    // Fear (Low) = Blue/Gray? Greed (High) = Green.
    if (fgi >= 55) fgiColor = '#00B900' // Greed
    if (fgi <= 45) fgiColor = '#D00000' // Fear (Opportunity?) -> Actually Fear is usually Orange/Red in UI gauges.
    // Let's stick to: High = Green (Greed), Low = Red (Fear) to match "Price" direction mental model?
    // Actually, widespread convention: Fear = Orange/Red, Greed = Green. 
    // Coinglass: Fear (0) is Red, Greed (100) is Green.

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
    // Divergence: Whale > Retail = Smart Money Longing while Retail Shorting = BULLISH
    // Whale < Retail = Smart Money Shorting while Retail Longing = BEARISH
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
    // High funding = Orange (Warning), Negative = Green (Opportunity)

    const longLiq = data.liquidations?.long_liquidated || 0
    const shortLiq = data.liquidations?.short_liquidated || 0
    const liqDom = longLiq > shortLiq ? '多單受難' : shortLiq > longLiq ? '空單受難' : '和平'
    const liqColor = longLiq > shortLiq ? COLORS.down : shortLiq > longLiq ? COLORS.up : COLORS.neutral

    return {
        type: 'flex',
        altText: '🔥 即時市場數據儀表板',
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
                            { type: 'text', text: '🔥 即時市場儀表板', weight: 'bold', size: 'lg', color: COLORS.primary, flex: 1 },
                            { type: 'text', text: '加密台灣 Pro', size: 'xxs', color: COLORS.subText, align: "end", gravity: "center" }
                        ]
                    },
                    { type: 'text', text: `${timestamp} 更新`, size: 'xxs', color: '#CCCCCC' }
                ]
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    // Section 1: 恐懼與貪婪
                    {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            { type: 'text', text: '市場情緒 (FGI)', size: 'xs', color: COLORS.subText, weight: 'bold' },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                margin: 'sm',
                                contents: [
                                    { type: 'text', text: `${fgi}`, size: '4xl', weight: 'bold', color: fgiColor, flex: 0 },
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        paddingStart: 'lg',
                                        flex: 1,
                                        justifyContent: 'center',
                                        contents: [
                                            { type: 'text', text: fgiLabel, size: 'md', weight: 'bold', color: '#111111' },
                                            // ProgressBar
                                            {
                                                type: 'box',
                                                layout: 'vertical',
                                                backgroundColor: '#E0E0E0',
                                                height: '6px',
                                                cornerRadius: '3px',
                                                margin: 'sm',
                                                contents: [
                                                    {
                                                        type: 'box',
                                                        layout: 'vertical',
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
                    { type: 'separator', margin: 'lg', color: '#F0F0F0' },

                    // Section 2: 機構與主力
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'md',
                        contents: [
                            { type: 'text', text: '籌碼動向', size: 'xs', color: COLORS.subText, weight: 'bold' },
                            // Row 1: ETF & Coinbase
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    // ETF Flow
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        flex: 1,
                                        contents: [
                                            { type: 'text', text: 'ETF 資金流 (日)', size: 'xxs', color: '#888888' },
                                            { type: 'text', text: `${etfSign}${etfFlowDisplay}`, size: 'sm', weight: 'bold', color: etfColor }
                                        ]
                                    },
                                    // Coinbase Premium
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        flex: 1,
                                        contents: [
                                            { type: 'text', text: 'Coinbase 溢價', size: 'xxs', color: '#888888' },
                                            { type: 'text', text: `${cbSign}${cbPremium.toFixed(3)}%`, size: 'sm', weight: 'bold', color: cbColor }
                                        ]
                                    }
                                ]
                            },
                            // Row 2: Whale L/S
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        flex: 1,
                                        contents: [
                                            { type: 'text', text: '大戶多空比', size: 'xxs', color: '#888888' },
                                            { type: 'text', text: whaleLsr.toFixed(2), size: 'sm', weight: 'bold', color: '#111111' }
                                        ]
                                    },
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        flex: 1,
                                        contents: [
                                            { type: 'text', text: '主力意圖', size: 'xxs', color: '#888888' },
                                            { type: 'text', text: smartMoneySignal, size: 'sm', weight: 'bold', color: smartMoneyColor }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    { type: 'separator', margin: 'lg', color: '#F0F0F0' },

                    // Section 3: 市場熱度
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'md',
                        contents: [
                            { type: 'text', text: '市場熱度', size: 'xs', color: COLORS.subText, weight: 'bold' },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        flex: 1,
                                        contents: [
                                            { type: 'text', text: '資金費率', size: 'xxs', color: '#888888' },
                                            { type: 'text', text: `${fundingRate.toFixed(4)}%`, size: 'sm', weight: 'bold', color: fundingColor }
                                        ]
                                    },
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        flex: 1,
                                        contents: [
                                            { type: 'text', text: '爆倉主導', size: 'xxs', color: '#888888' },
                                            { type: 'text', text: liqDom, size: 'sm', weight: 'bold', color: liqColor }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        height: 'sm',
                        action: {
                            type: 'uri',
                            label: '追蹤加密台灣 IG',
                            uri: 'https://www.instagram.com/crypto.tw_'
                        },
                        color: COLORS.primary
                    }
                ]
            }
        }
    }
}

// Mini Analysis Card for Price Query Integration
export function createMiniAnalysisCard(data: any): FlexBubble {
    // 1. Sentiment (FGI)
    const fgi = data.sentiment?.fear_greed_index || 50
    let fgiStatus = '中性'
    let fgiColor = COLORS.neutral
    // Contrarian: Extreme Fear (<=25) -> Bullish (Buy), Extreme Greed (>=75) -> Bearish (Sell)
    if (fgi >= 75) { fgiStatus = '過熱 (偏空)'; fgiColor = COLORS.down; }
    else if (fgi >= 55) { fgiStatus = '貪婪 (警戒)'; fgiColor = '#FF9900'; } // Orange
    else if (fgi <= 25) { fgiStatus = '過冷 (偏多)'; fgiColor = COLORS.up; }
    else if (fgi <= 45) { fgiStatus = '恐懼 (關注)'; fgiColor = '#90EE90'; } // Light Green

    // 2. Funding Rate
    const fundingRate = (data.capital_flow?.funding_rate || 0) * 100
    let fundingStatus = '中性'
    let fundingColor = COLORS.neutral
    // High > 0.01% -> Bearish (Crowded), < 0 -> Bullish (Short Squeeze)
    if (fundingRate > 0.01) { fundingStatus = '多頭擁擠 (偏空)'; fundingColor = COLORS.down; }
    else if (fundingRate < 0) { fundingStatus = '空頭擁擠 (偏多)'; fundingColor = COLORS.up; }
    else { fundingStatus = '費率健康 (中性)'; fundingColor = COLORS.neutral; }

    // 3. Long/Short (Whale vs Retail)
    const whaleLsr = data.long_short?.whale_ratio || 1
    const retailLsr = data.long_short?.global_ratio || 1
    let lsStatus = '中性'
    let lsColor = COLORS.neutral
    // Whale > Retail -> Bullish
    if (whaleLsr > retailLsr * 1.05) { lsStatus = '大戶做多 (偏多)'; lsColor = COLORS.up; }
    else if (retailLsr > whaleLsr * 1.05) { lsStatus = '散戶做多 (偏空)'; lsColor = COLORS.down; }

    // Helper to create row
    const createRow = (label: string, value: string, status: string, color: string) => ({
        type: 'box' as const,
        layout: 'horizontal' as const,
        contents: [
            { type: 'text' as const, text: label, size: 'sm', color: '#555555', flex: 2 },
            { type: 'text' as const, text: value, size: 'sm', color: '#111111', align: 'end' as const, weight: 'bold' as const, flex: 2 },
            { type: 'text' as const, text: status, size: 'xs', color: color, align: 'end' as const, gravity: 'center' as const, flex: 3 }
        ],
        margin: 'md' as const
    })

    return {
        type: 'bubble',
        size: 'kilo',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                        { type: 'text', text: '綜合數據分析', weight: 'bold', size: 'md', color: COLORS.primary },
                        { type: 'text', text: 'CryptoTW Pro', size: 'xxs', color: '#cccccc', align: 'end', gravity: 'bottom' }
                    ]
                },
                { type: 'separator', margin: 'md', color: '#f0f0f0' },
                createRow('市場情緒', `${fgi}`, fgiStatus, fgiColor),
                createRow('資金費率', `${fundingRate.toFixed(4)}%`, fundingStatus, fundingColor),
                createRow('多空分佈', `${whaleLsr.toFixed(2)}`, lsStatus, lsColor),
                // Footer Hint
                {
                    type: 'text',
                    text: '此為即時鏈上與交易所數據',
                    size: 'xxs',
                    color: '#dddddd',
                    margin: 'lg',
                    align: 'center'
                }
            ]
        }
    }
}
