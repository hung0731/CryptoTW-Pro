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
    },

    // ============================================
    // 新增指標（P1）
    // ============================================

    etfFlow: {
        id: 'etfFlow',
        term: 'ETF 資金流',
        emoji: '🏛️',
        definition: '比特幣現貨 ETF 的每日資金流入/流出，反映機構資金動向。',
        interpretation: '關鍵不是「今天流入多少」，而是「資金是持續流入，還是事件型湧入」。持續流入 = 機構佈局；事件型湧入 = 炒作風險。',
        thresholds: {
            normal: [-200_000_000, 200_000_000],
            elevated: 500_000_000,
            extreme: 1_000_000_000
        },
        timeline: {
            id: 'etf-2024',
            title: '2024 年 ETF 里程碑',
            cards: [
                { type: 'event', time: '01/11', icon: '📈', marketState: 'BTC ETF 正式上線，單日湧入', action: '觀望，這是事件型資金', ifIgnored: '典型「買消息，賣事實」' },
                { type: 'risk', time: '01/12', icon: '⚠️', marketState: '事件型資金退潮，價格反轉', action: '確認是否有持續流入', ifIgnored: '可能被套在高點' },
                { type: 'reversal', time: '02-03月', icon: '🟢', marketState: '資金開始持續流入，非事件型', action: '這才是機構佈局訊號', ifIgnored: '錯過真正的機構進場' },
                { type: 'anomaly', time: '11/06', icon: '🚀', marketState: '川普當選，再次事件型湧入', action: '事件後觀察是否延續', ifIgnored: '事件型也可能延續成趨勢' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：區分「事件型」vs「持續型」資金流', action: '持續流入才是真正的機構佈局' }
            ]
        },
        riskHints: {
            low: '資金正常',
            medium: '流動加速',
            high: '大額異動'
        },
        getRiskLevel: (value: number): RiskLevel => {
            if (Math.abs(value) > 1_000_000_000) return 'high'
            if (Math.abs(value) > 500_000_000) return 'medium'
            return 'low'
        },
        getStatusLabel: (value: number): string => {
            if (value > 500_000_000) return '大量流入'
            if (value > 100_000_000) return '淨流入'
            if (value < -500_000_000) return '大量流出'
            if (value < -100_000_000) return '淨流出'
            return '持平'
        }
    },

    fearGreed: {
        id: 'fearGreed',
        term: '恐懼貪婪指數',
        emoji: '😱',
        definition: '綜合多項指標計算的市場情緒指數，0-100 分。',
        interpretation: '極端情緒 = 風險正在轉移。不是抄底/逃頂工具，而是提醒你「風險已經集中在某一方」。',
        thresholds: {
            normal: [40, 60],
            elevated: 75,
            extreme: 90
        },
        timeline: {
            id: 'fear-greed-cycle',
            title: '恐懼貪婪週期案例',
            cards: [
                { type: 'reversal', time: '2022/06', icon: '😱', marketState: '指數跌至 6，極度恐懼', action: '風險正從空頭轉移到多頭', ifIgnored: '不代表立刻反彈' },
                { type: 'event', time: '2024/01', icon: '😐', marketState: '指數回升至 50，中性', action: '風險較均衡，可正常操作', ifIgnored: '這是相對安全的環境' },
                { type: 'anomaly', time: '2024/03', icon: '🤑', marketState: '指數飆至 90，極度貪婪', action: '風險正集中在多頭身上', ifIgnored: '多頭承擔大部分回調風險' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：極端情緒 = 風險轉移訊號', action: '問自己：現在「誰在承擔風險」？' }
            ]
        },
        riskHints: {
            low: '情緒中性',
            medium: '情緒偏熱',
            high: '情緒極端'
        },
        getRiskLevel: (value: number): RiskLevel => {
            if (value > 80 || value < 20) return 'high'
            if (value > 65 || value < 35) return 'medium'
            return 'low'
        },
        getStatusLabel: (value: number): string => {
            if (value >= 75) return '極度貪婪'
            if (value >= 55) return '貪婪'
            if (value <= 25) return '極度恐懼'
            if (value <= 45) return '恐懼'
            return '中性'
        }
    },

    stablecoinMarketCap: {
        id: 'stablecoinMarketCap',
        term: '穩定幣市值',
        emoji: '💵',
        definition: '穩定幣（USDT、USDC 等）總市值，代表場外觀望資金。',
        interpretation: '乾火藥增加 ≠ 立刻上漲，但代表「有得漲」。這是潛力指標，不是進場訊號。',
        thresholds: {
            normal: [-2, 2],
            elevated: 5,
            extreme: 10
        },
        timeline: {
            id: 'stablecoin-2022-2024',
            title: '穩定幣市值變化週期',
            cards: [
                { type: 'event', time: '2022/05', icon: '💥', marketState: 'UST 崩盤，穩定幣市值暴跌', action: '乾火藥減少，潛力下降', ifIgnored: '沒有資金 = 難以上漲' },
                { type: 'risk', time: '2022/11', icon: '⚠️', marketState: 'FTX 倒閉，穩定幣進一步流出', action: '持續觀察，等待止跌', ifIgnored: '不急著抄底' },
                { type: 'reversal', time: '2023/10', icon: '🟢', marketState: '穩定幣市值止跌回升', action: '乾火藥回來了，「有得漲」', ifIgnored: '這是潛力開始累積' },
                { type: 'anomaly', time: '2024/03', icon: '🚀', marketState: '穩定幣市值創新高', action: '子彈充足，趨勢有支撐', ifIgnored: '不代表立刻漲，但有底氣' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：乾火藥 = 「有得漲」，不是「馬上漲」', action: '用來判斷趨勢潛力，不是進場時機' }
            ]
        },
        riskHints: {
            low: '資金穩定',
            medium: '資金波動',
            high: '資金異動'
        },
        getRiskLevel: (changePercent: number): RiskLevel => {
            if (Math.abs(changePercent) > 10) return 'high'
            if (Math.abs(changePercent) > 5) return 'medium'
            return 'low'
        },
        getStatusLabel: (changePercent: number): string => {
            if (changePercent > 5) return '資金進場'
            if (changePercent > 2) return '微幅增加'
            if (changePercent < -5) return '資金撤離'
            if (changePercent < -2) return '微幅減少'
            return '穩定'
        }
    },

    coinbasePremium: {
        id: 'coinbasePremium',
        term: 'Coinbase 溢價',
        emoji: '🇺🇸',
        definition: 'Coinbase 與其他交易所的價差，反映美國機構買盤強度。',
        interpretation: '用來確認「美國機構是否跟進當前行情」。搭配 ETF 資金流使用效果更佳。',
        thresholds: {
            normal: [-0.1, 0.1],
            elevated: 0.3,
            extreme: 0.5
        },
        timeline: {
            id: 'coinbase-premium-cases',
            title: 'Coinbase 溢價解讀',
            cards: [
                { type: 'reversal', time: '2024/01', icon: '🇺🇸', marketState: 'ETF 上線前，溢價轉正', action: '搭配 ETF 流入確認機構態度', ifIgnored: '單獨看容易誤判' },
                { type: 'risk', time: '2024/03', icon: '⚠️', marketState: '高點附近，溢價收窄', action: '美國買盤減弱，需警惕', ifIgnored: '行情可能由亞洲接手' },
                { type: 'event', time: '2024/11', icon: '🚀', marketState: '川普當選，溢價與 ETF 同步飆升', action: '雙重確認，美國機構主導', ifIgnored: '這是強趨勢訊號' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：用來確認「美國機構是否跟進」', action: '搭配 ETF 資金流一起看' }
            ]
        },
        riskHints: {
            low: '溢價中性',
            medium: '溢價顯著',
            high: '溢價極端'
        },
        getRiskLevel: (value: number): RiskLevel => {
            if (Math.abs(value) > 0.5) return 'high'
            if (Math.abs(value) > 0.3) return 'medium'
            return 'low'
        },
        getStatusLabel: (value: number): string => {
            if (value > 0.3) return '機構強買'
            if (value > 0.1) return '美國需求'
            if (value < -0.3) return '機構賣壓'
            if (value < -0.1) return '亞洲主導'
            return '中性'
        }
    },

    bubbleIndex: {
        id: 'bubbleIndex',
        term: '週期風險指標',
        emoji: '🫧',
        definition: '基於價格、挖礦難度、交易量等計算的長線週期指標。',
        interpretation: '用來判斷「目前週期風險偏低或偏高」，不是預測頂底。',
        thresholds: {
            normal: [0, 1],
            elevated: 2,
            extreme: 4
        },
        timeline: {
            id: 'bubble-index-cycle',
            title: '週期風險判斷',
            cards: [
                { type: 'reversal', time: '2022/11', icon: '🟢', marketState: '指數 < 0.45，風險偏低', action: '長線定投風險較低', ifIgnored: '這是相對安全的佈局區' },
                { type: 'event', time: '2024/03', icon: '🟡', marketState: '指數升至 1.5，風險升高', action: '不追價，控制倉位', ifIgnored: '追高承擔更多風險' },
                { type: 'anomaly', time: '高點區', icon: '🔴', marketState: '若指數 > 4，風險偏高', action: '考慮減少曝險', ifIgnored: '高風險不代表馬上跌' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：判斷「風險偏低或偏高」', action: '用於長線配置，不是短線進出' }
            ]
        },
        riskHints: {
            low: '估值合理',
            medium: '估值偏高',
            high: '估值過熱'
        },
        getRiskLevel: (value: number): RiskLevel => {
            if (value > 4) return 'high'
            if (value > 1) return 'medium'
            return 'low'
        },
        getStatusLabel: (value: number): string => {
            if (value > 4) return '過熱'
            if (value > 1) return '謹慎'
            if (value < 0.45) return '低估'
            return '正常'
        }
    },

    takerBuySell: {
        id: 'takerBuySell',
        term: '主動買賣比',
        emoji: '🛒',
        definition: '主動買單 vs 主動賣單的比例，反映真實買賣意願。',
        interpretation: '微觀行為確認工具。適合在築底或情緒轉折時輔助判斷，不適合單獨使用。',
        thresholds: {
            normal: [0.9, 1.1],
            elevated: 1.2,
            extreme: 1.5
        },
        timeline: {
            id: 'taker-volume-cases',
            title: '主動買賣判讀',
            cards: [
                { type: 'reversal', time: '築底階段', icon: '🛒', marketState: '主動買單持續 > 賣單', action: '搭配其他指標確認築底', ifIgnored: '單獨看容易誤判' },
                { type: 'anomaly', time: '高點階段', icon: '🔴', marketState: '價格創新高但買盤減弱', action: '量價背離，提高警覺', ifIgnored: '可能是頂部訊號' },
                { type: 'lesson', time: '', icon: '🧠', marketState: '總結：用於「確認」而非「判斷」', action: '搭配其他指標使用' }
            ]
        },
        riskHints: {
            low: '買賣均衡',
            medium: '單向加速',
            high: '極端偏向'
        },
        getRiskLevel: (ratio: number): RiskLevel => {
            if (ratio > 1.5 || ratio < 0.7) return 'high'
            if (ratio > 1.2 || ratio < 0.8) return 'medium'
            return 'low'
        },
        getStatusLabel: (ratio: number): string => {
            if (ratio > 1.3) return '買方強勢'
            if (ratio > 1.1) return '買方偏強'
            if (ratio < 0.7) return '賣方強勢'
            if (ratio < 0.9) return '賣方偏強'
            return '均衡'
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
