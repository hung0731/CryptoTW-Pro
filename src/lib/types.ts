
export interface StatusItem {
    label: string
    code: string
    value: string
}

export interface MarketStatusData {
    regime: StatusItem
    leverage: StatusItem
    sentiment: StatusItem
    whale: StatusItem
    volatility: StatusItem
}

export interface Conclusion {
    bias: '偏多' | '偏空' | '觀望'
    action: string
    emoji: string
    reasoning: string
}

export interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary: string
    highlights: {
        title: string
        bias: '偏多' | '偏空' | '中性'
        impact_note: string
    }[]
}
