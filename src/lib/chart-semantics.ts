'use client'

/**
 * Chart Semantic Model System
 * 
 * 核心原則：一個指標一種語意模型
 * 
 * 每個新增指標必須：
 * 1. 定義值域類型（有界/無界/對稱）
 * 2. 定義語意類型（情緒/方向/強度/狀態）
 * 3. 定義零點位置（0 / 1 / 無）
 */

// ================================================
// 指標類型分類
// ================================================
export type IndicatorSemanticType =
    | 'emotion'     // 情緒型：有界 0–100（僅 FGI 適用）
    | 'ratio'       // 比率型：可正可負，以 0 或 1 為中軸
    | 'cumulative'  // 累積量型：流入/流出，正負無界
    | 'spike'       // 事件密度型：高度變異，非連續
    | 'absolute'    // 絕對量型：正值，持續變化

// ================================================
// Y 軸模型
// ================================================
export type YAxisModel =
    | { type: 'fixed'; domain: [number, number] }           // 固定範圍（僅 FGI）
    | { type: 'auto' }                                       // 自動縮放
    | { type: 'symmetric'; center: number }                  // 對稱軸（以 center 為中心）
    | { type: 'symmetric-auto'; center: number }             // 自動範圍的對稱軸

// ================================================
// 顏色語意類型
// ================================================
export type ColorSemanticType =
    | 'emotion'     // 情緒色：恐懼(紅) ↔ 貪婪(綠) — 僅限 FGI
    | 'direction'   // 方向色：流入/增加(綠) ↔ 流出/減少(紅)
    | 'crowding'    // 擁擠色：多頭擁擠(紅) ↔ 空頭擁擠(綠)
    | 'intensity'   // 強度色：單一漸變色階（橙→紅）
    | 'neutral'     // 中性色：單一色，無語意

// ================================================
// 區間背景配置
// ================================================
export interface ZoneConfig {
    enabled: boolean
    thresholds?: number[]
    labels?: string[]
    colors?: string[]
}

// ================================================
// 圖表語意模型完整定義
// ================================================
export interface ChartSemanticModel {
    id: string
    indicatorType: IndicatorSemanticType

    // Y 軸配置
    yAxis: YAxisModel

    // 區間背景
    zones: ZoneConfig

    // 顏色語意
    colorSemantic: {
        type: ColorSemanticType
        positiveLabel?: string  // 正值的語意標籤
        negativeLabel?: string  // 負值的語意標籤
        neutralLabel?: string   // 中性的語意標籤
    }

    // Tooltip 語意解釋函數
    getTooltipExplanation: (value: number) => string
}

// ================================================
// 語意模型庫
// ================================================
export const CHART_SEMANTIC_MODELS: Record<string, ChartSemanticModel> = {
    fgi: {
        id: 'fgi',
        indicatorType: 'emotion',
        yAxis: { type: 'fixed', domain: [0, 100] },
        zones: {
            enabled: true,
            thresholds: [20, 80],
            labels: ['極恐', '極貪'],
            colors: ['#ef4444', '#22c55e']
        },
        colorSemantic: {
            type: 'emotion',
            positiveLabel: '貪婪',
            negativeLabel: '恐懼',
            neutralLabel: '中性'
        },
        getTooltipExplanation: (value: number) => {
            if (value >= 80) return '極度貪婪：風險集中在多頭'
            if (value >= 55) return '貪婪：多頭情緒偏熱'
            if (value <= 20) return '極度恐懼：風險正在轉移'
            if (value <= 45) return '恐懼：市場情緒謹慎'
            return '中性：情緒相對均衡'
        }
    },

    fundingRate: {
        id: 'fundingRate',
        indicatorType: 'ratio',
        yAxis: { type: 'symmetric', center: 0 },
        zones: { enabled: false },
        colorSemantic: {
            type: 'crowding',
            positiveLabel: '多頭擁擠',
            negativeLabel: '空頭擁擠',
            neutralLabel: '正常'
        },
        getTooltipExplanation: (value: number) => {
            if (value > 0.1) return '多頭極度擁擠：不利追多'
            if (value > 0.05) return '多頭擁擠：謹慎追多'
            if (value < -0.05) return '空頭極度擁擠：不利追空'
            if (value < -0.02) return '空頭擁擠：謹慎追空'
            return '正常範圍'
        }
    },

    longShortRatio: {
        id: 'longShortRatio',
        indicatorType: 'ratio',
        yAxis: { type: 'symmetric', center: 1 },
        zones: { enabled: false },
        colorSemantic: {
            type: 'crowding',
            positiveLabel: '散戶偏多',
            negativeLabel: '散戶偏空',
            neutralLabel: '均衡'
        },
        getTooltipExplanation: (value: number) => {
            if (value > 1.5) return '散戶極端偏多：反向警示'
            if (value > 1.2) return '散戶偏多：留意反向風險'
            if (value < 0.67) return '散戶極端偏空：反向警示'
            if (value < 0.83) return '散戶偏空：留意反向風險'
            return '多空均衡'
        }
    },

    liquidation: {
        id: 'liquidation',
        indicatorType: 'spike',
        yAxis: { type: 'auto' },
        zones: { enabled: false },
        colorSemantic: {
            type: 'intensity',
            neutralLabel: '清算量'
        },
        getTooltipExplanation: (value: number) => {
            const inMillions = value / 1_000_000
            if (inMillions > 500) return '巨量清算：市場劇烈波動'
            if (inMillions > 100) return '大量清算：波動增加'
            if (inMillions > 50) return '一般清算'
            return '清算清淡'
        }
    },

    etfFlow: {
        id: 'etfFlow',
        indicatorType: 'cumulative',
        yAxis: { type: 'auto' },
        zones: { enabled: false },
        colorSemantic: {
            type: 'direction',
            positiveLabel: '資金流入',
            negativeLabel: '資金流出',
            neutralLabel: '持平'
        },
        getTooltipExplanation: (value: number) => {
            const inMillions = value / 1_000_000
            if (inMillions > 500) return '大量流入：機構積極買入'
            if (inMillions > 100) return '淨流入：機構需求'
            if (inMillions < -500) return '大量流出：機構賣出'
            if (inMillions < -100) return '淨流出：機構減持'
            return '資金持平'
        }
    },

    openInterest: {
        id: 'openInterest',
        indicatorType: 'absolute',
        yAxis: { type: 'symmetric-auto', center: 0 },
        zones: { enabled: false },
        colorSemantic: {
            type: 'direction',
            positiveLabel: '持倉增加',
            negativeLabel: '持倉減少',
            neutralLabel: '穩定'
        },
        getTooltipExplanation: (value: number) => {
            if (value > 10) return '持倉激增：槓桿快速上升'
            if (value > 5) return '持倉上升：槓桿活躍'
            if (value < -10) return '持倉驟降：去槓桿'
            if (value < -5) return '持倉下降：槓桿減少'
            return '持倉穩定'
        }
    },

    premium: {
        id: 'premium',
        indicatorType: 'ratio',
        yAxis: { type: 'symmetric', center: 0 },
        zones: { enabled: false },
        colorSemantic: {
            type: 'direction',
            positiveLabel: '美國需求',
            negativeLabel: '亞洲主導',
            neutralLabel: '區域均衡'
        },
        getTooltipExplanation: (value: number) => {
            if (value > 0.3) return '美國機構強力買入'
            if (value > 0.1) return '美國需求偏強'
            if (value < -0.3) return '機構賣壓或亞洲主導'
            if (value < -0.1) return '亞洲需求偏強'
            return '區域均衡'
        }
    },

    basis: {
        id: 'basis',
        indicatorType: 'ratio',
        yAxis: { type: 'symmetric', center: 0 },
        zones: { enabled: false },
        colorSemantic: {
            type: 'neutral',
            positiveLabel: '期貨溢價',
            negativeLabel: '期貨折價',
            neutralLabel: '平價'
        },
        getTooltipExplanation: (value: number) => {
            if (value > 5) return '高溢價：市場看漲情緒強'
            if (value > 1) return '正溢價：正常多頭結構'
            if (value < -1) return '折價：市場看跌或對沖需求'
            return '接近平價'
        }
    },

    stablecoin: {
        id: 'stablecoin',
        indicatorType: 'cumulative',
        yAxis: { type: 'auto' },
        zones: { enabled: false },
        colorSemantic: {
            type: 'neutral',
            neutralLabel: '穩定幣市值'
        },
        getTooltipExplanation: (value: number) => {
            // value is total market cap, explanation based on trend would need delta
            return '穩定幣市值代表場外「乾火藥」'
        }
    }
}

// ================================================
// 輔助函數
// ================================================

/**
 * 取得指標的語意模型
 */
export function getChartSemanticModel(indicatorId: string): ChartSemanticModel | undefined {
    return CHART_SEMANTIC_MODELS[indicatorId]
}

/**
 * 取得指標的 tooltip 語意解釋
 */
export function getIndicatorExplanation(indicatorId: string, value: number): string {
    const model = CHART_SEMANTIC_MODELS[indicatorId]
    if (!model) return ''
    return model.getTooltipExplanation(value)
}

/**
 * 驗證指標是否適合使用情緒語意（恐懼/貪婪）
 */
export function canUseEmotionSemantic(indicatorId: string): boolean {
    const model = CHART_SEMANTIC_MODELS[indicatorId]
    return model?.indicatorType === 'emotion'
}

/**
 * 驗證指標是否適合使用固定 0-100 軸
 */
export function canUseFixedAxis(indicatorId: string): boolean {
    const model = CHART_SEMANTIC_MODELS[indicatorId]
    return model?.yAxis.type === 'fixed'
}

/**
 * 取得語意顏色
 */
export function getSemanticColor(value: number, model: ChartSemanticModel): string {
    const { type } = model.colorSemantic
    if (type === 'emotion') {
        // FGI: High = Greed (Green), Low = Fear (Red)
        return value >= 50 ? '#22c55e' : '#ef4444'
    }
    if (type === 'crowding') {
        // Funding: Positive = Crowded (Red/Warning), Negative = Discount (Green/Opportunity)
        return value > 0 ? '#ef4444' : '#22c55e'
    }
    if (type === 'direction') {
        // Flow/Premium: Positive = Inflow/Premium (Green), Negative = Outflow/Discount (Red)
        return value > 0 ? '#22c55e' : '#ef4444'
    }
    if (type === 'intensity') {
        return '#f59e0b' // Orange
    }
    return '#808080'
}

/**
 * Map ReviewChart type to Semantic Model ID
 */
export function mapReviewTypeToSemanticId(type: string): string | null {
    const map: Record<string, string> = {
        'fgi': 'fgi',
        'funding': 'fundingRate',
        'longShort': 'longShortRatio',
        'liquidation': 'liquidation',
        'flow': 'etfFlow',
        'oi': 'openInterest',
        'premium': 'premium',
        'basis': 'basis',
        'stablecoin': 'stablecoin',
        // 'price' and 'supply' have no semantic model yet
    }
    return map[type] || null
}
