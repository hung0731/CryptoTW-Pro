
export type MarketEventImportance = 'S' | 'A' | 'B';
export type MarketState = '極恐' | '過熱' | '修復' | '崩跌' | '觀望';
export type MetricType = 'fearGreed' | 'etfFlow' | 'oi' | 'funding' | 'price' | 'stablecoin';

export interface TimelineItem {
    date: string; // YYYY-MM-DD
    title: string;
    description: string; // "發生了什麼"
    marketImpact: string; // "市場行為改變了什麼"
    riskState: string; // "這代表的風險狀態"
}

export interface MarketEvent {
    id: string; // unique
    slug: string;
    title: string;
    year: number;

    // 0. Meta (Internal)
    importance: MarketEventImportance;
    featuredRank?: number;
    tags: string[];
    marketStates: MarketState[];
    relatedMetrics: MetricType[];
    readingMinutes: number;
    isProOnly: boolean;
    publishedAt: string;
    updatedAt: string;
    eventStartAt: string;
    eventEndAt: string;

    // 1. One Sentence Summary
    summary: string; // "當...發生時，市場真正改變的是...，而不是..."

    // 2. Context
    context: {
        what: string; // 事件是什麼
        narrative: string; // 當時主流敘事
        realImpact: string; // 真正影響市場的是什麼
    };

    // 3. Market State Snapshot (Descriptive)
    initialState: {
        price: string; // 形容狀態 (e.g., 高位震盪)
        fearGreed: string; // 形容狀態 (e.g., 極度貪婪 - 偏高)
        // Dynamic Key Metrics (Optional)
        etfFlow?: string;
        oi?: string;
        funding?: string;
        liquidation?: string;
        stablecoin?: string;
    };

    // 4. Timeline
    timeline: TimelineItem[];

    // 5. Charts
    chartImages?: {
        url: string;
        caption: string; // "這張圖顯示...，代表..."
    }[];

    // 6. Key Takeaways
    takeaways: string[]; // 3-5 points
}

export const REVIEWS_DATA: MarketEvent[] = [
    {
        id: 'review-etf-2024',
        slug: 'bitcoin-etf-launch-2024',
        title: '2024 比特幣 ETF 上線：買消息賣事實的經典教案',
        year: 2024,
        importance: 'S',
        featuredRank: 1,
        tags: ['ETF', '機構進場', '買消息賣事實'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['etfFlow', 'price', 'funding'],
        readingMinutes: 6,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2024-01-01',
        eventEndAt: '2024-01-25',

        summary: '當比特幣現貨 ETF 上線時，市場真正改變的是「機構資金的進場通道」，而不是價格短期的單邊上漲。',

        context: {
            what: '美國 SEC 歷史性批准 11 檔比特幣現貨 ETF，宣告比特幣正式進入傳統金融市場。',
            narrative: '市場普遍認為 ETF 通過將帶來數百億美元的即時買盤，幣價將立刻噴發。',
            realImpact: '長期結構確實改變，但短期市場早已提前定價（Priced-in），反而形成了巨大的獲利了結賣壓。'
        },

        initialState: {
            price: '高位橫盤，動能減弱',
            fearGreed: '極度貪婪 (76) - 情緒過熱',
            funding: '正費率偏高，多頭過於擁擠',
            etfFlow: 'GBTC 解鎖預期強烈'
        },

        timeline: [
            {
                date: '2024-01-10',
                title: 'SEC 正式批准',
                description: 'SEC 宣佈批准所有現貨 ETF 申請，社群情緒達到最高點。',
                marketImpact: '利多落地，但價格並未如預期暴漲，反而出現上下插針。',
                riskState: '預期兌現，追高風險極大'
            },
            {
                date: '2024-01-11',
                title: '交易首日與灰度拋壓',
                description: 'ETF 開始交易，GBTC 高額管理費導致用戶大量贖回（拋售）。',
                marketImpact: '淨流出大於淨流入，市場開始意識到「拋壓大於買盤」。',
                riskState: '賣壓確認，趨勢反轉'
            },
            {
                date: '2024-01-23',
                title: '恐慌修復與觸底',
                description: '比特幣回調至 $38,500，灰度拋壓開始減緩，其他 ETF 流入趨於穩定。',
                marketImpact: '短期投機籌碼清洗完畢，長期資金開始緩步建倉。',
                riskState: '風險釋放，底部浮現'
            }
        ],

        takeaways: [
            '利多落地 ≠ 價格上漲，往往是短期頂部訊號（Sell the news）。',
            '當全市場都在期待同一件事時，風險通常大於機會。',
            '機構資金的影響是長期的「流量（Flow）」，而非單日的「存量（Stock）」。',
            '這類狀態再出現時，應關注「預期是否過度飽和」而非消息本身。'
        ]
    },
    {
        id: 'review-ftx-2022',
        slug: 'ftx-collapse-2022',
        title: '2022 FTX 倒閉：信任崩塌與槓桿總清算',
        year: 2022,
        importance: 'S',
        featuredRank: 2,
        tags: ['交易所倒閉', '信任危機', '流動性'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'stablecoin', 'fearGreed'],
        readingMinutes: 8,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2022-11-02',
        eventEndAt: '2022-11-15',

        summary: '當 FTX 倒閉時，市場不是單純的資產跌價，而是流動性與信任基礎的直接消失。',

        context: {
            what: '全球第二大交易所 FTX 因挪用用戶資產與 FTT 價格崩盤而宣告破產。',
            narrative: '初期市場以為只是「謠言」或「FUD」，認為 SBF 大到不能倒。',
            realImpact: '揭露了中心化機構的不透明槓桿，引發了全行業的信用緊縮 (Credit Crunch)。'
        },

        initialState: {
            price: '熊市底部震盪，波動率極低',
            fearGreed: '恐懼 (30) - 市場脆弱',
            stablecoin: '流動性持續收縮',
            funding: '中性偏低，無明顯方向'
        },

        timeline: [
            {
                date: '2022-11-02',
                title: '資產負債表洩露',
                description: 'CoinDesk 揭露 Alameda 資產主要由流動性極差的 FTT 構成。',
                marketImpact: '市場開始質疑 FTX 的償付能力，聰明錢開始撤出。',
                riskState: '潛在償付危機'
            },
            {
                date: '2022-11-06',
                title: '幣安清倉與擠兌',
                description: 'CZ 宣佈清倉 FTT，引發散戶恐慌性提幣。',
                marketImpact: '流動性快速枯竭，FTT 價格與 FTX 儲備形成死亡螺旋。',
                riskState: '流動性危機爆發'
            },
            {
                date: '2022-11-08',
                title: '暫停提幣',
                description: 'FTX 停止處理提幣請求，幣安放棄收購。',
                marketImpact: '信任完全崩塌，恐慌蔓延至整個加密貨幣市場，BTC 跌破前低。',
                riskState: '系統性崩潰（無底洞）'
            }
        ],

        takeaways: [
            'Not your keys, not your coins 是永恆的真理。',
            '當交易所平台幣成為主要資產儲備時，死亡螺旋幾乎是必然。',
            '流動性危機發生時，相關資產（如 Solana）會被無差別拋售以換取現金。',
            '低波動率不代表低風險，有時是暴風雨前的寧靜。'
        ]
    },
    {
        id: 'review-luna-2022',
        slug: 'luna-ust-collapse-2022',
        title: '2022 LUNA/UST 死亡螺旋：算法穩定幣的殞落',
        year: 2022,
        importance: 'S',
        featuredRank: 3,
        tags: ['穩定幣', '死亡螺旋', '系統性風險'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'stablecoin', 'fearGreed'],
        readingMinutes: 7,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2022-05-07',
        eventEndAt: '2022-05-13',

        summary: '當 LUNA/UST 崩潰時，市場真正學到的是「沒有儲備支撐的演算法穩定幣」本質上就是龐氏結構。',

        context: {
            what: '市值 400 億美元的公鏈生態系在三天內價格歸零。',
            narrative: '當時市場迷信 Do Kwon 的狂妄與 Anchor Protocol 的 20% 無風險收益。',
            realImpact: '摧毀了市場對「去中心化穩定幣」的信心，並引發了後續 3AC 等機構的連鎖清算。'
        },

        initialState: {
            price: 'BTC $35,000 關鍵支撐位',
            fearGreed: '恐懼 (28) - 信心不足',
            stablecoin: 'UST 市值虛高，背離真實需求',
            funding: '多頭仍抱有幻想'
        },

        timeline: [
            {
                date: '2022-05-07',
                title: 'UST 輕微脫鉤',
                description: '巨鯨在 Curve 池拋售 UST，導致價格微幅低於 $1。',
                marketImpact: '套利機器人開始運作，LFG 基金會消耗儲備護盤。',
                riskState: '錨定機制受壓'
            },
            {
                date: '2022-05-09',
                title: '信心崩潰與死亡螺旋',
                description: 'UST 跌破 0.95，觸發恐慌性拋售，LUNA 機制無限增發。',
                marketImpact: 'LUNA 供應量指數級暴增，價格直線跳水。',
                riskState: '機制失效，歸零確認'
            },
            {
                date: '2022-05-12',
                title: '系統性歸零',
                description: 'LUNA 跌破 $0.01，交易所陸續下架。',
                marketImpact: '生態系內的資金全數蒸發，連帶影響持有 LUNA 的大型機構 (3AC)。',
                riskState: '資產價值毀滅'
            }
        ],

        takeaways: [
            '高收益 (APY > 15%) 若無真實可持續的收入來源，就是龐氏騙局。',
            '穩定幣的價值建立在「信心」與「流動性」，而非演算法。',
            '當一個資產進入「死亡螺旋」機制時，不要試圖抄底。',
            '系統性風險會傳染：LUNA 倒閉是後來 Celsius 和 FTX 倒閉的導火線。'
        ]
    },
    {
        id: 'review-covid-2020',
        slug: 'covid-crash-2020',
        title: '2020 COVID 312 黑天鵝：流動性的極致考驗',
        year: 2020,
        importance: 'S',
        featuredRank: 4,
        tags: ['黑天鵝', '流動性危機', '連鎖爆倉'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'oi', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2020-03-12',
        eventEndAt: '2020-03-13',

        summary: '當 312 黑天鵝發生時，市場真正面對的是「現金為王」的全面變現需求，所有資產相關性趨近於 1。',

        context: {
            what: '受 COVID-19 疫情爆發影響，全球金融市場恐慌性崩盤，比特幣單日跌幅超過 50%。',
            narrative: '初期認為比特幣是「數位黃金」可以避險。',
            realImpact: '證明在極端流動性危機下，比特幣首先被視為風險資產拋售以換取美元現金。'
        },

        initialState: {
            price: '$7,900 弱勢震盪',
            fearGreed: '恐懼 (40) -> 極度恐懼',
            oi: '歷史高位，槓桿過重',
            funding: '正費率，市場仍偏多'
        },

        timeline: [
            {
                date: '2020-03-12',
                title: '全球股市熔斷',
                description: '美股開盤即熔斷，投資者恐慌拋售所有可變現資產。',
                marketImpact: '加密貨幣市場跟隨美股暴跌，避險屬性失效。',
                riskState: '相關性驟升，現金為王'
            },
            {
                date: '2020-03-12 (晚間)',
                title: 'BitMEX 連鎖爆倉',
                description: '價格跌破關鍵支撐，BitMEX 發生連鎖清算，多單踩踏。',
                marketImpact: '買盤完全消失，價格在幾小時內腰斬至 $3,800。',
                riskState: '流動性枯竭'
            },
            {
                date: '2020-03-13',
                title: 'V 型反轉',
                description: '市場極度絕望後，長期買盤開始介入，波動率極大。',
                marketImpact: '槓桿清洗完畢，開啟了後續長達一年的牛市。',
                riskState: '絕望中見底'
            }
        ],

        takeaways: [
            '在極端流動性危機中，比特幣暫時不具備避險功能。',
            '合約市場的連鎖爆倉會將價格打壓至遠低於合理價值的水平。',
            '最大的財富轉移往往發生在眾人最絕望的時候（312 底部）。',
            '觀察「連鎖爆倉」是否停止，是判斷底部的關鍵信號。'
        ]
    }
];

// Helper functions for content retrieval
export const getFeaturedReviews = () => {
    return REVIEWS_DATA.filter(r => r.featuredRank !== undefined).sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));
};

export const getReviewBySlug = (slug: string) => {
    return REVIEWS_DATA.find(r => r.slug === slug);
};

export const getReviewsByTag = (tag: string) => {
    return REVIEWS_DATA.filter(r => r.tags.includes(tag));
};

export const getRelatedReviews = (currentState: MarketState) => {
    return REVIEWS_DATA.filter(r => r.marketStates.includes(currentState)).slice(0, 3);
};
