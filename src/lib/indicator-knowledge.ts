/**
 * 指標知識庫
 * 
 * 核心定位：「會提醒你風險的交易助理」
 * 設計原則：把複雜指標翻譯成「故事」
 * 
 * 時間軸定位：
 * 「不是『我們預測了什麼』，而是『市場是怎麼一步一步走到這裡的』」
 */

export type RiskLevel = 'low' | 'medium' | 'high'

// ============================================
// 雙層決策時間軸結構
// 
// 核心理念：
// 「不是只講市場發生什麼，要同時講當下該怎麼做」
// 
// 新手最在意的不是理解市場，
// 而是：「如果是我，那一刻我該怎麼辦？」
// ============================================

export type TimelineCardType =
    | 'anomaly'     // 異常出現 🔴
    | 'risk'        // 風險累積 ⚠️
    | 'event'       // 事件發生 💥
    | 'reversal'    // 訊號反轉 🟢
    | 'lesson'      // 風控總結 🧠

export interface TimelineCard {
    type: TimelineCardType
    time: string           // e.g., '08/01 中午'
    icon: string           // e.g., '🔴', '⚠️', '💥', '🟢', '🧠'

    // 上半部：市場狀態（灰字，客觀）
    marketState: string    // e.g., '槓桿使用快速升高，情緒開始偏熱'

    // 下半部：當下該做的事（白字，主角） 
    action: string         // e.g., '降低部位，不追價'

    // 可選：如果忽略會怎樣（小字）
    ifIgnored?: string     // e.g., '通常會在高波動中被迫出場'
}

export interface TimelineCase {
    id: string
    title: string
    cards: TimelineCard[]
}

// ============================================
// 原有結構（簡化版）
// ============================================

export interface IndicatorThresholds {
    normal: [number, number]
    elevated: number
    extreme: number
}

export interface IndicatorKnowledge {
    id: string
    term: string
    emoji: string
    definition: string
    interpretation: string
    thresholds: IndicatorThresholds
    timeline?: TimelineCase    // 時間軸案例（取代 examples）
    riskHints: {
        low: string
        medium: string
        high: string
    }
    getRiskLevel: (value: number) => RiskLevel
    getStatusLabel: (value: number) => string
}

// ============================================
// P0 指標知識庫
// ============================================

export const INDICATOR_KNOWLEDGE: Record<string, IndicatorKnowledge> = {
    fundingRate: {
        id: 'fundingRate',
        term: '資金費率',
        emoji: '💰',
        definition: '永續合約多空雙方定期互付的費用，反映市場擁擠程度。',
        interpretation: '費率 > 0 代表多頭付費給空頭（多頭擁擠）；< 0 代表空頭付費。極端時預示反轉風險。',
        thresholds: {
            normal: [-0.01, 0.03],
            elevated: 0.05,
            extreme: 0.1
        },
        timeline: {
            id: 'aug2024-crash',
            title: '2024 年 8 月崩盤事件',
            cards: [
                { type: 'anomaly', time: '08/02', icon: '🔴', marketState: '槓桿使用居高不下，市場情緒過熱', action: '降低部位，不追價', ifIgnored: '容易在高波動中被迫出場' },
                { type: 'risk', time: '08/04 午間', icon: '⚠️', marketState: '多頭倉位仍高，但價格已從 $61k 下滑', action: '立即減倉，避免被動', ifIgnored: '價格一旦跌破，倉位將被連累' },
                { type: 'event', time: '08/05 凌晨', icon: '💥', marketState: '價格從 $58k 跌至 $49k，多單連環爆倉', action: '保持場外觀望，等待明確訊號', ifIgnored: '此時追空風險極高' },
                { type: 'reversal', time: '08/05 中午', icon: '🟢', marketState: '去槓桿完成，市場情緒開始修復', action: '可小倉位參與反彈', ifIgnored: '錯過低點佈局機會' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：當費率持續偏高時，系統性風險正在累積', action: '應降低倉位而非追價' }
            ]
        },
        riskHints: {
            low: '風險可控',
            medium: '避免追價',
            high: '不利追多'
        },
        getRiskLevel: (value: number): RiskLevel => {
            if (value > 0.1 || value < -0.05) return 'high'
            if (value > 0.05 || value < -0.02) return 'medium'
            return 'low'
        },
        getStatusLabel: (value: number): string => {
            if (value > 0.1) return '過熱'
            if (value > 0.05) return '偏高'
            if (value < -0.05) return '極端轉負'
            if (value < -0.02) return '轉負'
            return '正常'
        }
    },

    longShortRatio: {
        id: 'longShortRatio',
        term: '多空比',
        emoji: '👥',
        definition: '散戶多空持倉比例，常作為反向指標。',
        interpretation: '散戶過度一致時（> 65% 或 < 35%）通常是反向信號。',
        thresholds: {
            normal: [40, 60],
            elevated: 65,
            extreme: 75
        },
        timeline: {
            id: 'jan2024-etf',
            title: '2024 年 1 月 ETF 上線事件',
            cards: [
                { type: 'anomaly', time: '01/10', icon: '🔴', marketState: '市場對 ETF 過度樂觀，散戶做多比極高', action: '不要追價，觀望為主', ifIgnored: '可能成為「買消息」的受害者' },
                { type: 'event', time: '01/11', icon: '📈', marketState: 'ETF 正式上線，BTC 衝高至 $49k', action: '不追高，觀察後續', ifIgnored: '追高者往往被套在最高點' },
                { type: 'risk', time: '01/12', icon: '⚠️', marketState: '價格反轉下跌，從 $46k 跌至 $42k', action: '已持倉者應設停損', ifIgnored: '不停損將面臨更大損失' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：當散戶倉位過度一致時，反向風險很高', action: '應保持觀望或小倉位' }
            ]
        },
        riskHints: {
            low: '均衡',
            medium: '較極端',
            high: '反向警示'
        },
        getRiskLevel: (value: number): RiskLevel => {
            if (value > 70 || value < 30) return 'high'
            if (value > 60 || value < 40) return 'medium'
            return 'low'
        },
        getStatusLabel: (value: number): string => {
            if (value > 70) return '散戶極度做多'
            if (value > 60) return '散戶偏多'
            if (value < 30) return '散戶極度做空'
            if (value < 40) return '散戶偏空'
            return '均衡'
        }
    },

    liquidation: {
        id: 'liquidation',
        term: '爆倉清算',
        emoji: '💥',
        definition: '槓桿倉位被強制平倉，反映市場波動程度。',
        interpretation: '大量爆倉 = 劇烈波動。多單爆倉多則下跌趨勢，空單爆倉多則上漲趨勢。',
        thresholds: {
            normal: [0, 50_000_000],
            elevated: 100_000_000,
            extreme: 500_000_000
        },
        timeline: {
            id: 'aug2024-liquidation',
            title: '2024 年 8 月爆倉事件',
            cards: [
                { type: 'risk', time: '08/04', icon: '⚠️', marketState: '市場過度做多，槓桿倉位高企', action: '降低槓桿，及時減倉', ifIgnored: '可能被連累爆倉' },
                { type: 'event', time: '08/05 凌晨', icon: '💥', marketState: '價格跌破關鍵位，多單連環清算', action: '場外觀望，不要接刀', ifIgnored: '可能接到更低的刀' },
                { type: 'anomaly', time: '08/05 早晨', icon: '🔴', marketState: '單日清算超 $6 億，創當年新高', action: '保持場外，等清算結束', ifIgnored: '市場可能還有下跌空間' },
                { type: 'reversal', time: '08/08', icon: '🟢', marketState: '去槓桿完成，價格回升至 $62k', action: '可開始小倉位佈局', ifIgnored: '錯過反彈機會' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：高槓桿環境 = 高系統性風險', action: '應降低倉位避免被連帶清算' }
            ]
        },
        riskHints: {
            low: '市場平靜',
            medium: '波動增加',
            high: '劇烈波動'
        },
        getRiskLevel: (value: number): RiskLevel => {
            if (value > 500_000_000) return 'high'
            if (value > 100_000_000) return 'medium'
            return 'low'
        },
        getStatusLabel: (value: number): string => {
            if (value > 500_000_000) return '大量清算'
            if (value > 100_000_000) return '清算增加'
            if (value > 50_000_000) return '一般'
            return '清淡'
        }
    },

    openInterest: {
        id: 'openInterest',
        term: '合約持倉量',
        emoji: '📊',
        definition: '市場未平倉合約總額，代表場上籌碼量。',
        interpretation: 'OI↑ + 價格↑ = 追價盤（可能過熱）；OI↓ + 價格↑ = 空頭回補（較健康）。',
        thresholds: {
            normal: [-3, 3],
            elevated: 5,
            extreme: 10
        },
        timeline: {
            id: 'mar2024-oi',
            title: '2024 年 3 月 OI 過熱事件',
            cards: [
                { type: 'anomaly', time: '03/14', icon: '🔴', marketState: 'BTC 創 $73k 新高，槓桿同步飆升', action: '不追價，觀望為主', ifIgnored: '高槓桿 + 高價格 = 高風險' },
                { type: 'risk', time: '03/31', icon: '⚠️', marketState: 'OI 維持高位，但價格動能減弱', action: '減倉或設停損', ifIgnored: '動能消失後回調風險升高' },
                { type: 'event', time: '04/13', icon: '💥', marketState: '價格從 $71k 跌至 $64k，回調啟動', action: '保持場外，等待明確支撐', ifIgnored: '可能在中段被滾出' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：當 OI 創新高但價格動能減弱時，風險正在累積', action: '應謹慎追價，控制倉位' }
            ]
        },
        riskHints: {
            low: '正常',
            medium: '槓桿活躍',
            high: '過度槓桿'
        },
        getRiskLevel: (changePercent: number): RiskLevel => {
            if (Math.abs(changePercent) > 10) return 'high'
            if (Math.abs(changePercent) > 5) return 'medium'
            return 'low'
        },
        getStatusLabel: (changePercent: number): string => {
            if (changePercent > 10) return '激增'
            if (changePercent > 5) return '上升'
            if (changePercent < -10) return '驟降'
            if (changePercent < -5) return '下降'
            return '穩定'
        }
    }
}

// ============================================
// 輔助函數
// ============================================

export function getRiskColor(level: RiskLevel): string {
    switch (level) {
        case 'high': return '#EF4444'
        case 'medium': return '#F59E0B'
        case 'low': return '#10B981'
    }
}

export function getRiskBgColor(level: RiskLevel): string {
    switch (level) {
        case 'high': return 'rgba(239, 68, 68, 0.15)'
        case 'medium': return 'rgba(245, 158, 11, 0.15)'
        case 'low': return 'rgba(16, 185, 129, 0.15)'
    }
}

export function getIndicatorKnowledge(id: string): IndicatorKnowledge | undefined {
    return INDICATOR_KNOWLEDGE[id]
}
