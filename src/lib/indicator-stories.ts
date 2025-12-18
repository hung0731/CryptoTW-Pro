/**
 * Indicator Story Page - Data Definitions
 * 
 * 每個指標敘事頁只回答三件事：
 * 1. 現在在什麼位置？
 * 2. 歷史上這個位置發生過什麼？
 * 3. 我可以去哪裡驗證？
 */

// ================================================
// INDICATOR SEMANTIC TYPE (核心：區分指標語意類型)
// ================================================
export type IndicatorSemanticType =
    | 'emotion'      // 情緒型：僅 FGI 適用恐懼/貪婪標籤
    | 'flow'         // 資金流型：流入/流出
    | 'crowding'     // 擁擠型：多頭/空頭擁擠
    | 'intensity'    // 強度型：清算量高/低
    | 'leverage'     // 槓桿型：OI 高/低
    | 'ratio'        // 比率型：多空比偏多/偏空
    | 'premium'      // 溢價型：溢價/折價
    | 'liquidity';   // 流動性型：充裕/匱乏

// ================================================
// ZONE TYPES (內部使用，不直接暴露給使用者)
// ================================================
export type ZoneKey =
    | 'fear'           // 0-25：低位區
    | 'lean_fear'      // 25-50：偏低區
    | 'lean_greed'     // 50-75：偏高區
    | 'greed';         // 75-100：高位區

// ================================================
// 各指標專屬語意標籤（核心修復）
// ================================================
export const INDICATOR_ZONE_LABELS: Record<string, Record<ZoneKey, string>> = {
    // 情緒型：僅 FGI 使用恐懼/貪婪
    'fear-greed': {
        fear: '恐懼區',
        lean_fear: '中性偏恐懼',
        lean_greed: '中性偏貪婪',
        greed: '高度貪婪區',
    },
    // 資金流型：流入/流出
    'etf-flow': {
        fear: '大量流出',
        lean_fear: '淨流出',
        lean_greed: '淨流入',
        greed: '大量流入',
    },
    // 擁擠型：多頭/空頭擁擠
    'funding-rate': {
        fear: '空頭擁擠',
        lean_fear: '偏向空頭',
        lean_greed: '偏向多頭',
        greed: '多頭擁擠',
    },
    // 強度型：清算強度
    'liquidation': {
        fear: '清算清淡',
        lean_fear: '清算正常',
        lean_greed: '清算增加',
        greed: '清算劇烈',
    },
    // 槓桿型：OI 水位
    'open-interest': {
        fear: '槓桿偏低',
        lean_fear: '槓桿正常',
        lean_greed: '槓桿偏高',
        greed: '槓桿過熱',
    },
    // 比率型：多空比
    'long-short-ratio': {
        fear: '極端偏空',
        lean_fear: '偏向空方',
        lean_greed: '偏向多方',
        greed: '極端偏多',
    },
    // 溢價型：基差
    'futures-basis': {
        fear: '期貨折價',
        lean_fear: '正常偏低',
        lean_greed: '正常偏高',
        greed: '溢價過熱',
    },
    // 溢價型：Coinbase Premium
    'coinbase-premium': {
        fear: '亞洲主導',
        lean_fear: '區域均衡偏亞',
        lean_greed: '區域均衡偏美',
        greed: '美國需求強',
    },
    // 流動性型：穩定幣
    'stablecoin-supply': {
        fear: '流動性匱乏',
        lean_fear: '流動性偏低',
        lean_greed: '流動性充裕',
        greed: '流動性歷史高位',
    },
};

// 舊版 ZONE_LABELS 保留向後兼容（僅用於 FGI）
export const ZONE_LABELS: Record<ZoneKey, string> = INDICATOR_ZONE_LABELS['fear-greed'];

// 區間顏色（通用）
export const ZONE_COLORS: Record<ZoneKey, { bg: string; text: string; border: string }> = {
    fear: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    lean_fear: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    lean_greed: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    greed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

// 根據指數值判斷所屬區間 (FGI 專用)
export function getFgiZone(value: number): ZoneKey {
    if (value <= 25) return 'fear';
    if (value <= 50) return 'lean_fear';
    if (value <= 75) return 'lean_greed';
    return 'greed';
}

// 根據 IndicatorStory 配置計算區間 (通用)
export function calculateStoryZone(value: number, story: IndicatorStory): ZoneKey {
    const zones = story.chart.zones;
    // Handle infinite ranges safely
    if (value <= zones.fear.max) return 'fear';
    if (value <= zones.leanFear.max) return 'lean_fear';
    if (value <= zones.leanGreed.max) return 'lean_greed';
    return 'greed';
}

// 根據指標 ID 取得正確的區間標籤
export function getZoneLabel(indicatorId: string, zone: ZoneKey): string {
    const labels = INDICATOR_ZONE_LABELS[indicatorId];
    if (labels) return labels[zone];
    // Fallback to generic (shouldn't happen)
    return ZONE_LABELS[zone];
}

// ================================================
// Y-AXIS MODEL (核心：決定圖表 Y 軸顯示方式)
// ================================================
export type YAxisModel =
    | { type: 'fixed'; min: number; max: number }        // 固定範圍 (僅 FGI: 0-100)
    | { type: 'auto' }                                    // 自動縮放 (ETF Flow, Liquidation, Stablecoin)
    | { type: 'symmetric'; center: number }               // 對稱軸 (Funding: 0, Long/Short: 1)

// ================================================
// INDICATOR STORY INTERFACE
// ================================================
export interface IndicatorStory {
    id: string;              // 'fear-greed', 'etf-flow' etc.
    slug: string;            // route param: /indicators/[slug]
    name: string;            // 顯示名稱

    // ① 位置判斷（拆成主句 + 次句）
    positionHeadline: string;        // 主句：「高度貪婪區（指數 82）」
    positionRationale?: string;      // 次句：「過去當指數超過 75 時，短期波動放大的機率明顯上升」
    currentValue?: number;           // 當前指數值
    zone: ZoneKey;                   // 統一區間標籤

    // ② 用途說明（限制 3 點，無 emoji）
    useCases: {
        type: 'observe' | 'risk' | 'timing';  // 觀察 / 風險 / 時機
        description: string;
    }[];

    // ③ 圖表設定
    chart: {
        unit?: string;                 // '', '%', 'B', etc.
        valueFormat?: 'number' | 'percent' | 'ratio';
        // Y 軸模型（核心修復）
        yAxisModel: YAxisModel;
        // Coinglass FGI 區間：0-25 / 25-50 / 50-75 / 75-100
        zones: {
            fear: { min: number; max: number };       // 0-25
            leanFear: { min: number; max: number };   // 25-50
            leanGreed: { min: number; max: number };  // 50-75
            greed: { min: number; max: number };      // 75-100
        };
        api: {
            endpoint: string;
            params?: Record<string, unknown>;
        };
    };

    // ④ 怎麼看這張圖（TradingView 教學提示，無 emoji）
    chartCallout: {
        points: string[];  // 3 條教學重點
    };

    // ⑤ 歷史案例（用 reviewId 連動 reviews-data.ts）
    historicalCases: {
        reviewId: string;              // 連結到 reviews-data.ts 的 id
        label: string;                 // 顯示標籤：'FTX 崩盤前'
        indicatorValue?: number;       // 當時指標值（可選）
        returns?: {                    // 7/30/90 天後的結果（可選）
            d7?: number;
            d30?: number;
            d90?: number;
        };
        takeaway: string;              // 一句話結論（復盤風格）
    }[];

    // ⑥ 行動指引 + 導流
    actionGuidelines: string[];      // 3-5 條
    relatedLinks: {
        label: string;
        href: string;
    }[];
}

// ================================================
// INDICATOR STORIES DATA
// ================================================
export const INDICATOR_STORIES: IndicatorStory[] = [
    {
        id: 'fear-greed',
        slug: 'fear-greed',
        name: '恐懼貪婪指數',

        // ① 位置判斷
        positionHeadline: '高度貪婪區（指數 82）',
        positionRationale: '過去當指數超過 75 時，市場短期出現較大波動的機率明顯上升。這不代表會立即下跌，但風險正在累積。',
        currentValue: 82,
        zone: 'greed',

        // ② 用途說明（無 emoji）
        useCases: [
            {
                type: 'observe',
                description: '判斷市場是否過度樂觀，風險是否被低估'
            },
            {
                type: 'risk',
                description: '識別槓桿是否過度擁擠，共識是否過度一致'
            },
            {
                type: 'timing',
                description: '觀察是否接近情緒轉折的臨界點'
            },
        ],

        // ③ 圖表設定（Coinglass API）
        chart: {
            unit: '',
            valueFormat: 'number',
            yAxisModel: { type: 'fixed', min: 0, max: 100 },  // FGI: 唯一固定 0-100
            zones: {
                fear: { min: 0, max: 25 },
                leanFear: { min: 25, max: 50 },
                leanGreed: { min: 50, max: 75 },
                greed: { min: 75, max: 100 },
            },
            api: {
                endpoint: '/api/coinglass/fear-greed',
                params: {},
            },
        },

        // ④ 怎麼看這張圖（無 emoji）
        chartCallout: {
            points: [
                '這個指標不是用來判斷進出場時機',
                '它的主要用途是觀察市場是否過度擁擠、情緒是否極端',
                '當指數接近 0 或 100 時，價格反而容易出現非預期的劇烈波動',
            ],
        },

        // ⑤ 歷史案例
        historicalCases: [
            {
                reviewId: 'review-ftx-2022',
                label: 'FTX 崩盤前',
                indicatorValue: 28,
                returns: { d7: -15, d30: -25, d90: +10 },
                takeaway: '恐懼區間反而成為長期買點，但短期需承受極端波動。',
            },
            {
                reviewId: 'review-etf-2024',
                label: 'ETF 通過前夕',
                indicatorValue: 76,
                returns: { d7: -8, d30: -20, d90: +40 },
                takeaway: '高度貪婪區配合利多落地，形成典型的「利多出盡」回調。',
            },
        ],

        // ⑥ 行動指引
        actionGuidelines: [
            '當指數超過 75 時，降低槓桿或放慢加倉節奏',
            '當指數低於 25 時，是觀察長期佈局機會的時機',
            '避免在情緒極端時做出衝動決策',
            '搭配資金費率、持倉量等指標進行交叉驗證',
        ],
        relatedLinks: [
            { label: '查看市場復盤資料庫', href: '/reviews' },
            { label: '衍生品風險總覽', href: '/prediction?tab=derivatives' },
            { label: '經濟事件日曆', href: '/calendar' },
        ],
    },
    {
        id: 'etf-flow',
        slug: 'etf-flow',
        name: 'ETF 資金流',

        positionHeadline: '連續 3 日淨流入',
        positionRationale: '累計淨流入達 $2.1B，機構買盤持續累積。',
        zone: 'lean_greed',

        useCases: [
            { type: 'observe', description: '追蹤機構資金的中長期配置動向' },
            { type: 'risk', description: '識別機構是否開始撤資' },
            { type: 'timing', description: '觀察淨流入與價格的背離信號' },
        ],

        chart: {
            unit: 'B',
            valueFormat: 'number',
            yAxisModel: { type: 'auto' },  // ETF Flow: 無界資金流
            zones: {
                fear: { min: -Infinity, max: -0.5 },
                leanFear: { min: -0.5, max: 0 },
                leanGreed: { min: 0, max: 0.5 },
                greed: { min: 0.5, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/etf-flow',
                params: {},
            },
        },

        chartCallout: {
            points: [
                '重點在觀察連續淨流入或流出的趨勢，而非單日數據',
                '價格下跌但淨流入持續增加，通常是結構性需求未減的信號',
                '大額淨流出配合價格下跌，需警惕機構撤資',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-etf-2024',
                label: 'ETF 上線首週',
                indicatorValue: -0.5,
                returns: { d7: -8, d30: -20, d90: +40 },
                takeaway: '淨流出來自 GBTC 贖回，但新 ETF 持續吸金，結構性需求未減。',
            },
        ],

        actionGuidelines: [
            '關注連續淨流入或流出的趨勢而非單日數據',
            '價格下跌但淨流入持續增加，是觀察左側佈局的時機',
            '大額淨流出配合價格下跌，需警惕機構撤資',
        ],
        relatedLinks: [
            { label: '復盤：ETF 上線事件', href: '/reviews/2024/etf' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
    // ================================================
    // S2: 資金費率 Funding Rate
    // ================================================
    {
        id: 'funding-rate',
        slug: 'funding-rate',
        name: '資金費率',

        positionHeadline: '正值偏高（0.015%）',
        positionRationale: '多頭擁擠度上升，正費率意味著做多成本增加，槓桿過熱時容易形成多殺多。',
        currentValue: 0.015,
        zone: 'lean_greed',

        useCases: [
            { type: 'observe', description: '判斷多空哪邊槓桿更擁擠' },
            { type: 'risk', description: '識別槓桿過熱的風險訊號' },
            { type: 'timing', description: '觀察極端費率後的反轉機會' },
        ],

        chart: {
            unit: '%',
            valueFormat: 'percent',
            yAxisModel: { type: 'symmetric', center: 0 },  // Funding: 以 0 為中心
            zones: {
                fear: { min: -Infinity, max: -0.01 },
                leanFear: { min: -0.01, max: 0 },
                leanGreed: { min: 0, max: 0.01 },
                greed: { min: 0.01, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/funding-rate-history',
                params: { symbol: 'BTC' },
            },
        },

        chartCallout: {
            points: [
                '正費率偏高時，做多成本上升，容易形成多殺多',
                '負費率偏低時，做空成本上升，容易形成空殺空',
                '極端費率通常是槓桿過熱的警示，容易出現劇烈反向波動',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-2021-05',
                label: '2021/05 牛市回調',
                indicatorValue: 0.03,
                returns: { d7: -30, d30: -50, d90: -40 },
                takeaway: '長期偏正費率，多頭過度擁擠，回調時形成連環爆倉。',
            },
            {
                reviewId: 'review-2024-03',
                label: '2024/03 新高回調',
                indicatorValue: 0.025,
                returns: { d7: -15, d30: -10, d90: +20 },
                takeaway: '新高附近槓桿升溫，費率偏高，回調時的清算鏈反應典型。',
            },
        ],

        actionGuidelines: [
            '當費率持續 > 0.01% 時，警惕多頭過度擁擠',
            '當費率持續 < -0.01% 時，警惕空頭過度擁擠',
            '極端費率時降低槓桿，避免被清算鏈波及',
            '搭配清算數據觀察槓桿去化程度',
        ],
        relatedLinks: [
            { label: '查看清算數據', href: '/indicators/liquidation' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
    // ================================================
    // S3: 清算 Liquidation
    // ================================================
    {
        id: 'liquidation',
        slug: 'liquidation',
        name: '清算（爆倉）',

        positionHeadline: '過去 24H 清算 $2.3B',
        positionRationale: '大規模清算通常代表槓桿去化事件，需觀察是自然回調還是事件驅動。',
        currentValue: 2.3,
        zone: 'greed',

        useCases: [
            { type: 'observe', description: '判斷下跌/上漲是否由清算驅動' },
            { type: 'risk', description: '識別槓桿去化事件的強度' },
            { type: 'timing', description: '清算高峰後常出現短期反彈' },
        ],

        chart: {
            unit: 'M',
            valueFormat: 'number',
            yAxisModel: { type: 'auto' },  // Liquidation: 事件密度型
            zones: {
                fear: { min: 0, max: 100 },
                leanFear: { min: 100, max: 300 },
                leanGreed: { min: 300, max: 500 },
                greed: { min: 500, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/liquidation-history',
                params: { symbol: 'BTC' },
            },
        },

        chartCallout: {
            points: [
                '清算量驟增代表槓桿被強制平倉，是事件驅動型走勢',
                '清算高峰後，價格容易出現短期技術性反彈',
                '持續高清算配合價格下跌，代表趨勢性槓桿去化',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-covid-2020',
                label: '2020/03 COVID',
                indicatorValue: 1500,
                returns: { d7: -20, d30: +30, d90: +100 },
                takeaway: '流動性危機型清算瀑布，恐慌後形成極佳長期買點。',
            },
            {
                reviewId: 'review-2021-05',
                label: '2021/05 槓桿崩盤',
                indicatorValue: 800,
                returns: { d7: -30, d30: -50, d90: -40 },
                takeaway: '清算主導的下跌結構，槓桿去化型崩盤。',
            },
        ],

        actionGuidelines: [
            '清算量 > $500M 時，警惕極端波動',
            '清算高峰後不要追空，容易出現技術性反彈',
            '搭配資金費率判斷是多還是空在被清算',
            '持續清算代表趨勢未結束，不要輕易抄底',
        ],
        relatedLinks: [
            { label: '查看資金費率', href: '/indicators/funding-rate' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
    // ================================================
    // S4: 未平倉 Open Interest
    // ================================================
    {
        id: 'open-interest',
        slug: 'open-interest',
        name: '未平倉合約量',

        positionHeadline: '全網 OI $45B',
        positionRationale: '高位 OI 配合價格走弱，常見槓桿高位接盤訊號。',
        currentValue: 45,
        zone: 'lean_greed',

        useCases: [
            { type: 'observe', description: '觀察槓桿總量是在堆積還是在退' },
            { type: 'risk', description: '高 OI + 價格走弱 = 風險累積' },
            { type: 'timing', description: 'OI 急速上升後常有清算風險' },
        ],

        chart: {
            unit: 'B',
            valueFormat: 'number',
            yAxisModel: { type: 'auto' },  // OI: 絕對量型
            zones: {
                fear: { min: 0, max: 20 },
                leanFear: { min: 20, max: 35 },
                leanGreed: { min: 35, max: 50 },
                greed: { min: 50, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/open-interest-history',
                params: { symbol: 'BTC' },
            },
        },

        chartCallout: {
            points: [
                'OI 上升 + 價格上升 = 健康趨勢（有現貨或槓桿跟進）',
                'OI 上升 + 價格走弱 = 危險訊號（槓桿堆積但無人願意接盤）',
                'OI 急速下降 = 槓桿去化中，通常配合劇烈波動',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-2021-11',
                label: '2021/11 高位接盤',
                indicatorValue: 28,
                returns: { d7: -10, d30: -25, d90: -50 },
                takeaway: '高位 OI + 價格走弱，典型槓桿高位接盤訊號。',
            },
            {
                reviewId: 'review-2022-06',
                label: '2022/06 去槓桿',
                indicatorValue: 12,
                returns: { d7: -15, d30: -20, d90: +30 },
                takeaway: 'OI 持續下滑，槓桿去化期配合趨勢崩解。',
            },
        ],

        actionGuidelines: [
            '高 OI + 價格走弱時，警惕槓桿堆積風險',
            'OI 急速上升後，避免追高',
            'OI 下降配合價格穩定，可能是健康調整',
            '搭配資金費率判斷槓桿方向',
        ],
        relatedLinks: [
            { label: '查看資金費率', href: '/indicators/funding-rate' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
    // ================================================
    // S5: 多空比 Long/Short Ratio
    // ================================================
    {
        id: 'long-short-ratio',
        slug: 'long-short-ratio',
        name: '多空比',

        positionHeadline: '多空比 1.2（偏多）',
        positionRationale: '多頭帳戶略多於空頭，情緒偏樂觀，但尚未達極端。',
        currentValue: 1.2,
        zone: 'lean_greed',

        useCases: [
            { type: 'observe', description: '判斷散戶/大戶情緒傾斜方向' },
            { type: 'risk', description: '極端偏多/偏空時容易反向' },
            { type: 'timing', description: '情緒反轉型結構的觀察指標' },
        ],

        chart: {
            unit: '',
            valueFormat: 'ratio',
            yAxisModel: { type: 'symmetric', center: 1 },  // Long/Short: 以 1 為中心
            zones: {
                fear: { min: 0, max: 0.8 },
                leanFear: { min: 0.8, max: 1 },
                leanGreed: { min: 1, max: 1.2 },
                greed: { min: 1.2, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/long-short-history',
                params: { symbol: 'BTC' },
            },
        },

        chartCallout: {
            points: [
                '多空比 > 1.5 代表極端偏多，容易多殺多',
                '多空比 < 0.7 代表極端偏空，容易空殺空',
                '情緒極端時，價格容易反向走，是典型的「散戶指標」',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-2021-05',
                label: '2021/05 多殺多',
                indicatorValue: 1.8,
                returns: { d7: -30, d30: -50, d90: -40 },
                takeaway: '長時間偏多，下跌時形成多殺多連環爆倉。',
            },
            {
                reviewId: 'review-2023-03',
                label: '2023/03 極端偏空反彈',
                indicatorValue: 0.6,
                returns: { d7: +20, d30: +40, d90: +80 },
                takeaway: '極端偏空後的反彈，情緒反轉型結構。',
            },
        ],

        actionGuidelines: [
            '極端偏多時不要追高，警惕多殺多',
            '極端偏空時可觀察反彈機會',
            '搭配資金費率交叉驗證',
            '不要單獨依賴多空比做決策',
        ],
        relatedLinks: [
            { label: '查看資金費率', href: '/indicators/funding-rate' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
    // ================================================
    // A-Tier: 機構視角 Indicators
    // ================================================
    {
        id: 'futures-basis',
        slug: 'futures-basis',
        name: '期貨基差 (年化)',

        positionHeadline: '年化偏高 (12%)',
        positionRationale: '期貨價格顯著高於現貨，顯示市場多頭情緒強烈，機構願意支付高額溢價。',
        currentValue: 12,
        zone: 'lean_greed',

        useCases: [
            { type: 'observe', description: '衡量整個市場的多空情緒傾向' },
            { type: 'risk', description: '基差過高 (>20%) 往往是過熱訊號' },
            { type: 'timing', description: '熊市中基差轉正通常是趨勢反轉信號' },
        ],

        chart: {
            unit: '%',
            valueFormat: 'percent',
            yAxisModel: { type: 'symmetric', center: 0 },  // Basis: 以 0 為中心
            zones: {
                fear: { min: -Infinity, max: 0 },
                leanFear: { min: 0, max: 5 },
                leanGreed: { min: 5, max: 15 },
                greed: { min: 15, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/futures-basis',
                params: { symbol: 'BTC' },
            },
        },

        chartCallout: {
            points: [
                '正常牛市基差應維持在 5-15% 區間',
                '負基差 (Backwardation) 通常只發生在極度恐慌的熊市底部',
                '基差飆升但價格滯漲，是頂部警訊',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-2021-11',
                label: '2021/11 頂部',
                indicatorValue: 25,
                returns: { d7: -10, d30: -20, d90: -40 },
                takeaway: '年化基差過熱，市場過度樂觀。',
            },
        ],

        actionGuidelines: [
            '基差 > 20% 時，避免過度槓桿做多',
            '基差轉負時，可考慮定投現貨',
            '觀察季交割前後的基差收斂情況',
        ],
        relatedLinks: [
            { label: '查看資金費率', href: '/indicators/funding-rate' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
    {
        id: 'coinbase-premium',
        slug: 'coinbase-premium',
        name: 'Coinbase 溢價',

        positionHeadline: '正溢價 (+0.1%)',
        positionRationale: 'Coinbase 價格高於 Binance，顯示美國機構買盤強勁，通常是健康上漲的基礎。',
        currentValue: 0.1,
        zone: 'lean_greed',

        useCases: [
            { type: 'observe', description: '判斷美國機構資金的流向' },
            { type: 'risk', description: '價格上漲但溢價轉負，顯示買盤主要來自散戶或亞洲' },
            { type: 'timing', description: '溢價大幅轉正往往對應階段性底部' },
        ],

        chart: {
            unit: '%',
            valueFormat: 'percent',
            yAxisModel: { type: 'symmetric', center: 0 },  // Premium: 以 0 為中心
            zones: {
                fear: { min: -Infinity, max: -0.1 },
                leanFear: { min: -0.1, max: 0 },
                leanGreed: { min: 0, max: 0.1 },
                greed: { min: 0.1, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/coinbase-premium',
                params: { interval: '1d' },
            },
        },

        chartCallout: {
            points: [
                '正溢價 = 美國機構買入 = 趨勢強勁',
                '負溢價 = 美國機構賣出 = 趨勢疲軟',
                'ETF 通過後，此指標與價格的相關性顯著提升',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-etf-2024',
                label: '2024 ETF 上線',
                indicatorValue: 0.5,
                returns: { d7: -5, d30: +10, d90: +50 },
                takeaway: '機構資金主導行情，正溢價持續支撐價格。',
            },
        ],

        actionGuidelines: [
            '當價格突破但溢價未跟隨，小心假突破',
            '持續正溢價是大級別行情的必要條件',
            '關注美股開盤時段的溢價變化',
        ],
        relatedLinks: [
            { label: '查看 ETF 流量', href: '/indicators/etf-flow' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
    {
        id: 'stablecoin-supply',
        slug: 'stablecoin-supply',
        name: '穩定幣供應量',

        positionHeadline: '歷史新高 ($160B)',
        positionRationale: '穩定幣總市值持續增長，代表場外資金源源不斷流入加密市場，為牛市提供充足彈藥。',
        currentValue: 160,
        zone: 'greed',

        useCases: [
            { type: 'observe', description: '衡量整個加密市場的流動性水位' },
            { type: 'risk', description: '供應量開始減少是熊市或深跌的前兆' },
            { type: 'timing', description: '供應量斜率變陡，通常對應行情加速' },
        ],

        chart: {
            unit: 'B',
            valueFormat: 'number',
            yAxisModel: { type: 'auto' },  // Stablecoin: 累積量型
            zones: {
                fear: { min: -Infinity, max: 100 },
                leanFear: { min: 100, max: 130 },
                leanGreed: { min: 130, max: 150 },
                greed: { min: 150, max: Infinity },
            },
            api: {
                endpoint: '/api/coinglass/stablecoin-marketcap',
                params: {},
            },
        },

        chartCallout: {
            points: [
                '重點在於趨勢：持續增長 = 牛市基礎穩固',
                '流動性是推動行情的燃料',
                '若價格上漲但穩定幣流出，行情難以持久',
            ],
        },

        historicalCases: [
            {
                reviewId: 'review-2022-06',
                label: '2022 熊市',
                indicatorValue: 180,
                returns: { d7: -10, d30: -20, d90: -50 },
                takeaway: '穩定幣市值見頂回落，預示著流動性退潮與漫長熊市。',
            },
        ],

        actionGuidelines: [
            '只要穩定幣市值維持上升趨勢，保持多頭思維',
            '出現顯著流出（單週 >$1B）時警惕風險',
            '關注 USDT 與 USDC 的份額變化',
        ],
        relatedLinks: [
            { label: '查看比特幣價格', href: '/prediction?tab=price' },
            { label: '市場復盤資料庫', href: '/reviews' },
        ],
    },
];

// ================================================
// HELPER FUNCTIONS
// ================================================
export function getIndicatorStory(slug: string): IndicatorStory | undefined {
    return INDICATOR_STORIES.find(s => s.slug === slug);
}

export function getIndicatorStoryById(id: string): IndicatorStory | undefined {
    return INDICATOR_STORIES.find(s => s.id === id);
}

