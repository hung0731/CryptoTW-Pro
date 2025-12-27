
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
    // V2 Data Fields
    market_structure?: { bias: string }
    long_short?: { ratio: number }
    funding_rates?: { average: number }
    volatility_raw?: { value: number }
}

export interface Conclusion {
    bias: '偏多' | '偏空' | '觀望'
    action: string
    emoji: string
    reasoning: string
    sentiment_score?: number
}

export interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary: string
    highlights: {
        title: string
        reason: string
        impact: '高' | '中' | '低'
        bias: '偏多' | '偏空' | '中性'
        impact_note: string
    }[]
    recommended_readings?: {
        title: string
        path: string
        reason?: string
    }[]
}
