
const { Wallet, GraduationCap, BarChart2, Calendar, LineChart, Shield, Trophy } = require('lucide-react');
// Mock icons as strings
const mockIcons = { Wallet: 'Wallet', GraduationCap: 'GraduationCap', BarChart2: 'BarChart2', Calendar: 'Calendar', LineChart: 'LineChart', Shield: 'Shield', Trophy: 'Trophy' };


export type MarketEventImportance = 'S' | 'A' | 'B';
export type MarketState = '極恐' | '過熱' | '修復' | '崩跌' | '觀望' | '極度恐懼' | '去槓桿' | '橫盤';
export type MetricType = 'fearGreed' | 'etfFlow' | 'oi' | 'funding' | 'price' | 'stablecoin' | 'liquidation' | 'longShort' | 'basis' | 'premium';

export type TimelineRiskLevel = 'high' | 'medium' | 'low' | 'extreme';

export interface TimelineItem {
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
    marketImpact: string;
    riskState: string;
    riskLevel: TimelineRiskLevel; // New V2
}

export interface ChartDef {
    url: string;
    caption: string;
    interpretation?: { // New V2
        whatItMeans: string;
        whatToWatch: string;
        citation?: {
            label: string;
            href: string;
        };
    };
}

// New V3: Historical Context (Time Capsule)
export interface HistoricalContext {
    // 1. 市場週期定位 (Macro Cycle)
    marketPhase: 'bull_early' | 'bull_run' | 'bull_peak' | 'bear_decline' | 'bear_capitulation' | 'accumulation' | 'chop';

    // 2. 主流敘事 (Dominant Narrative)
    primaryNarrative: string;
    secondaryNarratives?: string[];

    // 3. 央行態度 (Fed Stance)
    fedStance: 'hawkish_peak' | 'hawkish' | 'neutral' | 'dovish' | 'dovish_cutting';
    interestRateCtxt: string; // e.g. "Rates at 5.25%, market expects pause"

    // 4. 市場情緒 (Sentiment & Positioning)
    sentiment: {
        score: number; // 0-100 (FGI)
        description: string; // e.g. "Extreme Fear after Luna crash"
        positioning: 'over-leveraged_long' | 'over-leveraged_short' | 'clean' | 'fearful_hedged';
    };

    // 5. 關鍵技術位 (Key Technical Levels)
    technicalContext: {
        keySupport: number;
        keyResistance: number;
        significantLevelLabel: string; // e.g. "20k Psychological Defense"
    };

    // 6. 轉向與預期 (Pivot & Expectation)
    expectation: {
        consensus: string; // "Market priced in 25bps hike"
        surpriseType: 'none' | 'positive_shock' | 'negative_shock';
        reality: string; // "Hiked 50bps unexpectedly"
    };
}

// New V3: Training Metadata (Difficulty & Type)
export interface TrainingMetadata {
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
    tags: ('volatility' | 'liquidity' | 'narrative' | 'reversal' | 'breakout')[];
    recommendedFor: string; // e.g., "適合練習插針接多"
    historicalSimilarity?: string[]; // IDs
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
    behaviorTags?: string[]; // [NEW] Symptom-based search tags
    marketStates: MarketState[];
    relatedMetrics: MetricType[];
    readingMinutes: number;
    isProOnly: boolean;
    publishedAt: string;
    updatedAt: string;
    eventStartAt: string;
    eventEndAt: string;

    // Reaction-based D0 Alignment (V3)
    reactionStartAt: string;  // Market reaction start point (D0)
    reactionType: 'trust_collapse' | 'liquidity_crisis' | 'priced_in' | 'external_shock';

    // Usage Guide (New V2)
    usageGuide: string[];

    // 1. One Sentence Summary
    summary: string;

    // 2. Context (Legacy)
    context: {
        what: string;
        narrative: string;
        realImpact: string;
    };

    // [NEW] Structrued Historical Context (V3)
    historicalContext?: HistoricalContext;

    // [NEW] Training Metadata (V3)
    trainingMeta?: TrainingMetadata;

    // 3. Market State Snapshot
    initialState: {
        price: string;
        fearGreed: string;
        etfFlow?: string;
        oi?: string;
        funding?: string;
        liquidation?: string;
        stablecoin?: string;
    };

    // 4. Misconceptions (New Module)
    misconceptions: {
        myth: string;
        fact: string;
    }[];

    // 5. Timeline
    timeline: TimelineItem[];

    // Chart Configuration
    chartConfig?: {
        symbol: string;
        daysBuffer?: number;
    };

    // 6. Charts (Structured)
    charts: {
        main?: ChartDef;      // 價格 x 事件區間 (The "Evidence")
        flow?: ChartDef;      // 資金流 (The "Soul")
        sentiment?: ChartDef; // 情緒
        oi?: ChartDef;        // 持倉量
        stablecoin?: ChartDef;// 穩定幣
        funding?: ChartDef;   // 資金費率
        liquidation?: ChartDef; // 清算量
        longShort?: ChartDef;   // 多空比
        basis?: ChartDef;       // 期貨基差
        premium?: ChartDef;     // Coinbase 溢價
        etfFlow?: ChartDef;     // ETF 淨流量 (New)
    };

    // 7. Analysis Modules (New)
    historicalComparison: {
        event: string;
        similarity: string;
    };

    // 8. Trading Perspective (V4 - New Redesign)
    type: 'leverage_cleanse' | 'policy_regulation' | 'market_structure' | 'exchange_event' | 'macro_shock' | 'tech_event' | 'supply_shock' | 'geopolitics';
    impactSummary: string; // "它對交易有什麼用"
    impactedTokens: string[];
    sparklineData?: number[];

    // Level 1: Arsenal Metrics
    maxDrawdown?: string; // e.g. "-50%"
    recoveryDays?: string; // e.g. "36 Days"

    actionableChecklist: {
        label: string;
        desc: string;
        type: 'check' | 'alert' | 'insight'; // Added 'insight'
        citation?: {
            label: string;
            href: string;
        };
    }[];
    focusWindow?: [number, number];

    // 相關指標連結（知識網）
    relatedIndicators?: Array<{
        slug: string;           // funding-rate, liquidation, etc.
        why: string;            // 描述句：「這次像擁擠交易，主要看資金費率的極端化。」
        anchor?: string;        // 指標頁要跳到的章節（預留）
    }>;
}

const REVIEWS_DATA = [
    {
        id: 'review-etf-2024',
        slug: 'etf',
        title: '2024 比特幣 ETF 上線：預期兌現後的結構性調整',
        year: 2024,
        importance: 'S',
        featuredRank: 1,
        tags: ['ETF', '機構資金', '利多出盡', '買預期賣事實'],
        behaviorTags: ['利多出盡', '買預期賣事實', '機構進場'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['etfFlow', 'price', 'funding'],
        readingMinutes: 8,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2024-01-01',
        eventEndAt: '2024-01-25',
        reactionStartAt: '2024-01-10',  // ETF approval day - priced in before
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'policy_regulation',
        impactedTokens: ['BTC'],
        maxDrawdown: '-20%',
        recoveryDays: '15 Days',
        sparklineData: [42000, 44000, 46000, 48000, 49000, 46000, 44000, 42000, 40000, 39000, 38500, 39000, 40000, 41000, 42000, 43000, 45000, 48000, 50000, 52000],
        impactSummary: 'ETF 通過當日成為短期頂部，BTC 回調 20% 後才開啟主升段。',

        usageGuide: [
            '當重大利好消息落地，價格卻不漲反跌時',
            '當市場過度擁擠導致資金費率異常偏高時',
            '當機構資金流向與價格走勢出現背離時',
            '當 Coinbase Premium 出現持續性正溢價時'
        ],

        summary: '當比特幣現貨 ETF 獲准上市時，市場真正改變的是「機構資金的長期配置通道」，而不是短期的價格投機波動。',

        context: {
            what: '美國證券交易委員會 (SEC) 批准 11 檔比特幣現貨 ETF，標誌著加密資產正式納入傳統金融監管框架。',
            narrative: '當時市場主流敘事普遍預期，合規渠道開啟將帶來數百億美元的即時買盤，推動價格立即大幅上漲。',
            realImpact: '此事件確認了資產類別的合法性，但市場明顯忽略了利多落地後的獲利了結賣壓 (GBTC)，以及機構建倉的漸進性質。'
        },

        historicalContext: {
            marketPhase: 'bull_early',
            primaryNarrative: 'Spot ETF Anticipation (現貨 ETF 預期)',
            secondaryNarratives: ['GBTC Unlocking (GBTC 解鎖拋壓)', 'Pre-Halving Rally (減半前行情)'],
            fedStance: 'neutral',
            interestRateCtxt: 'Rates at 5.25-5.50%, Market expects cuts in 2024',
            sentiment: {
                score: 76,
                description: 'Extreme Greed - Anticipation Peak',
                positioning: 'over-leveraged_long'
            },
            technicalContext: {
                keySupport: 40000,
                keyResistance: 48000,
                significantLevelLabel: '$48k YTD High Resistance'
            },
            expectation: {
                consensus: 'Super Bullish - God candle incoming',
                surpriseType: 'negative_shock',
                reality: 'Sell the news (-20% drop)'
            }
        },

        trainingMeta: {
            difficulty: 'medium',
            tags: ['narrative', 'reversal'],
            recommendedFor: '練習「買預期賣事實 (Sell the news)」的最佳案例。'
        },

        initialState: {
            price: '價格處於預期兌現的高位區間，動能開始鈍化',
            fearGreed: '極度貪婪 (76) - 市場情緒處於高溫區',
            funding: '資金費率正向偏高，衍生品槓桿過度擁擠',
            etfFlow: '市場高度關注灰度 (GBTC) 的潛在解鎖拋壓'
        },

        misconceptions: [
            {
                myth: 'ETF 通過當日價格理應暴漲',
                fact: '資金流向數據顯示，即便淨流入為正，早期的獲利了結賣壓與衍生品去槓桿效應，共同主導了短期價格修正。'
            },
            {
                myth: '價格回調意味著 ETF 產品失敗',
                fact: '機構資金的進入是「流量 (Flow)」概念而非「存量」，價格回調期間，貝萊德等主流 ETF 仍持續保持淨流入，顯示結構性需求未減。'
            }
        ],

        timeline: [
            {
                date: '2024-01-10',
                title: 'SEC 正式批准',
                description: '監管不確定性消除，但市場並未出現預期中的單邊上漲，顯示價格已提前反應該預期 (Priced-in)。',
                marketImpact: '利多落地但漲幅受限，部分投機資金開始尋求出場。',
                riskState: '預期兌現，波動風險上升',
                riskLevel: 'medium'
            },
            {
                date: '2024-01-11',
                title: '交易與贖回潮啟動',
                description: 'ETF 開始交易，GBTC 出現顯著折價收斂與贖回潮，市場焦點從「買入」轉向「消化賣壓」。',
                marketImpact: '淨流出大於淨流入，市場開始修正過度樂觀的短期預期。',
                riskState: '賣壓確認，趨勢反轉',
                riskLevel: 'high'
            },
            {
                date: '2024-01-23',
                title: '供需重新平衡',
                description: '隨著灰度賣壓逐漸被其他 ETF 買盤吸收，價格在 $38,500 附近獲得支撐，波動率開始收斂。',
                marketImpact: '短期投機籌碼清洗完畢，市場回歸長期資金主導的緩步上行。',
                riskState: '籌碼沉澱，底部浮現',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：價格在批准前已提前兩個月上漲，批准當下形成「利多出盡」的高點，隨後展開為期兩週的 20% 回調。',
                interpretation: {
                    whatItMeans: '價格提前兩個月反應預期，正式批准成為「利多出盡」的賣點。',
                    whatToWatch: '當價格已大幅領先消息面時，好消息落地往往是短期高點。'
                }
            },
            flow: {
                url: '',
                caption: '圖表解讀：即便價格下跌（上圖），ETF 淨流入（下圖綠柱）依然持續累積，顯示結構性需求未減。',
                interpretation: {
                    whatItMeans: '價格下跌但淨流入持續增加，代表賣壓來自存量（GBTC），買盤來自增量。',
                    whatToWatch: '價格下跌但資金淨流入不減反增，通常是左側佈局的最佳信號。'
                }
            },
            oi: {
                url: '',
                caption: '圖表解讀：回調過程中，合約持倉量 (OI) 顯著下降，代表過度擁擠的槓桿多單被清洗出場。',
                interpretation: {
                    whatItMeans: 'OI 的快速下降伴隨價格下跌，是典型的多頭去槓桿過程。',
                    whatToWatch: '當 OI 還在高位但價格滯漲時，需警惕即將到來的多殺多。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：FGI 從極度貪婪回落，修正過熱情緒。'
            },
            premium: {
                url: '',
                caption: '圖表解讀：Coinbase 正溢價持續，顯示美股時段買盤強勁。',
                interpretation: {
                    whatItMeans: '溢價是機構資金流入的直接證據。',
                    whatToWatch: '溢價是否轉負，代表機構買盤衰竭。'
                }
            }
        },

        historicalComparison: {
            event: '2021 Coinbase 直接上市 (IPO)',
            similarity: '兩者皆為幣圈歷史性的合規里程碑，且都在上市當天見到短期價格頂部，隨後市場經歷了數週的估值修正與情緒冷卻。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '新高警示',
                desc: '創新高時若費率 > 0.02%，考慮減倉。',
                citation: {
                    label: '參考資金費率指標',
                    href: '/indicators/funding-rate'
                }
            },
            {
                type: 'check',
                label: '確認資金流向本質',
                desc: '下跌時需區分是「資金撤退」還是「情緒釋放」，若 ETF 淨流入持續為正，則結構未破壞。'
            },
            {
                type: 'check',
                label: '過熱情緒監測',
                desc: '當重大事件前 F&G 指標長期維持 >75，需警惕市場對利多的過度定價。'
            },
            {
                type: 'alert',
                label: '區分價格與價值',
                desc: '價格反映的是短期供需與情緒，資金流向反映的才是長期的實質需求。'
            }
        ],

        // 知識網連結
        relatedIndicators: [
            {
                slug: 'funding-rate',
                why: '這次像擁擠交易清洗，主要看資金費率在利多落地時的極端化程度。'
            },
            {
                slug: 'etf-flow',
                why: '這次的結構轉變，主要看 ETF 淨流入是否持續，判斷機構需求是否真實。'
            }
        ]
    },
    {
        id: 'review-ftx-2022',
        slug: 'ftx',
        title: '2022 FTX 倒閉：中心化信任機制的崩潰',
        year: 2022,
        importance: 'S',
        featuredRank: 2,
        tags: ['系統性風險', '信任危機', '流動性', '連鎖爆倉'],
        behaviorTags: ['連鎖爆倉', '流動性枯竭', '信任崩潰', '死亡螺旋'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'stablecoin', 'fearGreed'],
        readingMinutes: 8,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2022-11-02',
        eventEndAt: '2022-11-15',
        reactionStartAt: '2022-11-06',  // Binance announces FTT sell-off
        reactionType: 'trust_collapse',

        // Trading Perspective
        type: 'exchange_event',
        impactedTokens: ['FTT', 'SOL', 'BTC'],
        maxDrawdown: '-25%', // BTC specific
        recoveryDays: '60 Days',
        sparklineData: [21000, 21200, 20800, 20500, 19000, 18000, 17500, 17000, 16500, 16000, 15500, 15800, 16000, 16200, 16500, 16800, 17000, 16800, 16600, 16400],
        impactSummary: '信任崩潰引發連鎖去槓桿，BTC 跌破前低，唯有現貨流動性可信。',

        usageGuide: [
            '當交易所傳出資產負債表疑慮時',
            '當市場出現大型機構流動性枯竭傳言時',
            '當公鏈代幣與其生態系專案出現異常連動下跌時'
        ],

        summary: '當 FTX 宣佈破產時，市場真正面對的不是單純的資產跌價，而是中心化信任機制的全面崩潰與流動性真空。',

        context: {
            what: '全球流動性第二大的加密貨幣交易所 FTX 因資產挪用與流動性枯竭宣告破產。',
            narrative: '事件初期，市場普遍認為 FTX 具備「大到不能倒」的系統重要性，並將流動性問題視為短期謠言。',
            realImpact: '該事件揭露了不透明的內部槓桿操作，引發了全產業的信用緊縮 (Credit Crunch) 與償付能力危機。'
        },

        historicalContext: {
            marketPhase: 'bear_capitulation',
            primaryNarrative: 'Exchange Solvency Crisis (交易所償付危機)',
            secondaryNarratives: ['Alameda Depegging', 'Regulatory Crackdown'],
            fedStance: 'hawkish_peak',
            interestRateCtxt: 'Aggressive Hiking Cycle continuing',
            sentiment: {
                score: 20,
                description: 'Extreme Fear - Trust Collapse',
                positioning: 'fearful_hedged'
            },
            technicalContext: {
                keySupport: 18000,
                keyResistance: 21500,
                significantLevelLabel: '$18k Cycle Low Defense'
            },
            expectation: {
                consensus: 'Bearish but expecting consolidation',
                surpriseType: 'negative_shock',
                reality: 'Complete insolvency & Fraud revealed'
            }
        },

        trainingMeta: {
            difficulty: 'hard',
            tags: ['volatility', 'breakout', 'narrative'],
            recommendedFor: '練習在「黑天鵝」事件中識別流動性斷裂的信號。'
        },

        initialState: {
            price: '市場處於長期熊市的低波動區間，看似平穩',
            fearGreed: '恐懼 (30) - 投資人信心尚未建立',
            stablecoin: '鏈上數據顯示穩定幣流動性持續收縮',
            funding: '資金費率中性偏低，無明顯方向性押注'
        },

        misconceptions: [
            {
                myth: '大到不能倒 (Too Big To Fail)',
                fact: '在缺乏央行最後貸款人角色的加密市場，任何挪用用戶資產的機構，無論規模多大，都可能面臨瞬間的流動性枯竭。'
            },
            {
                myth: '流動性問題不影響比特幣核心價值',
                fact: '當流動性危機爆發，機構為換取現金 (Cash) 應對贖回，往往會無差別拋售包括比特幣在內的所有流動資產。'
            }
        ],

        timeline: [
            {
                date: '2022-11-02',
                title: '資產負債表疑慮',
                description: '媒體揭露 Alameda Research 資產高度依賴流動性差的 FTT 代幣，市場開始質疑其償付能力。',
                marketImpact: '敏感資金開始從 FTX 撤出，但市場整體反應尚未擴大。',
                riskState: '償付風險浮現',
                riskLevel: 'medium'
            },
            {
                date: '2022-11-06',
                title: '公開清倉引發擠兌',
                description: '幣安 (Binance) 宣佈清倉 FTT 持倉，引發用戶恐慌性提幣，導致交易所流動性迅速耗盡。',
                marketImpact: 'FTT 價格與 FTX 儲備形成死亡螺旋，市場信心開始崩潰。',
                riskState: '流動性斷裂',
                riskLevel: 'high'
            },
            {
                date: '2022-11-08',
                title: '暫停提幣與系統性崩潰',
                description: 'FTX 停止處理提幣請求，隨後宣佈破產重組，比特幣跌破波段前低。',
                marketImpact: '信任完全崩塌，系統性風險蔓延至借貸平台與做市商。',
                riskState: '信用緊縮擴散',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'FTT',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：FTT 價格在數日內從 $22 垂直崩跌至 $1，這種走勢反映的不是估值修正，而是市場對其價值基礎的「信心真空」。',
                interpretation: {
                    whatItMeans: '垂直崩跌與價格幾近歸零，代表其價值基礎（信任）已完全瓦解。',
                    whatToWatch: '當平台幣作為核心資產開始出現流動性危機時，應假設其價值可能歸零。'
                }
            },
            oi: {
                url: '',
                caption: '圖表解讀：相關資產（如 Solana）同步暴跌，顯示流動性危機正透過機構資產負債表向外傳導。',
                interpretation: {
                    whatItMeans: '關鍵資產崩盤通常伴隨關聯生態系（Solana）的無差別拋售。',
                    whatToWatch: '在系統性危機中，與源頭高度關聯的優質資產也會遭遇錯殺（這可能是機會）。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：事件爆發當週 FGI 暴跌至 20 (極度恐慌)，市場信心降至冰點。',
                interpretation: {
                    whatItMeans: '恐慌指數觸底通常伴隨價格的階段性底部。',
                    whatToWatch: '在極度恐慌區間，往往是不錯的逆向佈局機會。'
                }
            }
        },

        historicalComparison: {
            event: '2014 Mt.Gox 倒閉',
            similarity: '兩者皆為當時佔據主導地位的交易所，且崩潰原因均涉及資產管理不善與不透明運作，皆導致了市場需要漫長的時間重建信任基礎。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '落實資產隔離',
                desc: '中心化交易所僅具備交易媒合功能，不應被視為無風險的資產存放處。Not your keys, not your coins.'
            },
            {
                type: 'check',
                label: '檢視平台資產構成',
                desc: '若交易所資產負債表高度依賴自身發行的代幣，其抗風險能力將在市場下跌時顯著轉弱。'
            },
            {
                type: 'check',
                label: '流動性警訊',
                desc: '當大型機構開始異常轉移資金或提幣延遲發生時，應優先考量保全本金，而非賭注反彈。'
            }
        ],
        focusWindow: [-10, 14],

        // 知識網連結
        relatedIndicators: [
            {
                slug: 'fear-greed',
                why: '這次像信任崩潰，主要看恐懼指數是否觸及極端區，判斷市場是否過度恐慌。'
            },
            {
                slug: 'stablecoin-supply',
                why: '這次涉及流動性危機，主要看穩定幣供應量是否縮減，判斷資金是否撤離。'
            }
        ]
    },
    {
        id: 'review-luna-2022',
        slug: 'luna',
        title: '2022 LUNA/UST 崩潰：算法穩定幣的機制失效',
        year: 2022,
        importance: 'S',
        featuredRank: 3,
        tags: ['算法穩定幣', '機制風險', '死亡螺旋', '脫鉤'],
        behaviorTags: ['脫鉤', '死亡螺旋', '無限制印鈔', '歸零'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'stablecoin', 'fearGreed'],
        readingMinutes: 7,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2022-05-07',
        eventEndAt: '2022-05-13',
        reactionStartAt: '2022-05-09',  // UST breaks 0.95, death spiral begins
        reactionType: 'trust_collapse',

        // Trading Perspective
        type: 'leverage_cleanse',
        impactedTokens: ['LUNA', 'UST'],
        maxDrawdown: '-50%',
        recoveryDays: '90 Days',
        sparklineData: [38000, 39000, 37000, 35000, 33000, 30000, 28000, 26000, 28000, 30000, 29000, 28000, 27000, 25000, 24000, 22000, 20000, 19000, 18000, 17500],
        impactSummary: '算法脫鉤引發 400 億美元資產歸零，恐慌擴散導致全市場修正 50%。',

        usageGuide: [
            '當算法穩定幣出現微幅脫鉤時',
            '當高收益類定存產品 (Anchor) 資金外逃時',
            '當治理代幣與穩定幣價格出現反向死亡螺旋時'
        ],

        summary: '當算法穩定幣 UST 脫鉤時，市場學到的是：缺乏足額儲備支撐的金融工具，在本質上無法抵抗系統性的信心崩潰。',

        context: {
            what: '曾為市值前十大資產的 Terra 生態系，因算法穩定幣 UST 脫鉤導致雙代幣機制崩潰，資產價值在數日內歸零。',
            narrative: '當時市場盛行「算穩新範式」敘事，並高度依賴 Anchor Protocol 提供的 20% 固定收益率。',
            realImpact: '事件證明了非超額抵押機制的脆弱性，並引發了後續三箭資本 (3AC) 等機構的連鎖清算。'
        },

        initialState: {
            price: 'BTC 位於 $35,000 關鍵支撐位，市場結構轉弱',
            fearGreed: '恐懼 (28) - 避險情緒濃厚',
            stablecoin: 'UST 市值持續背離真實交易需求',
            funding: '多頭仍對抄底抱有不切實際的期待'
        },

        misconceptions: [
            {
                myth: '20% APY 可以長期持續',
                fact: '若收益率遠高於市場平均且缺乏透明的利潤來源，該模型通常依賴後金補前金，本質上具備龐氏特徵。'
            },
            {
                myth: '演算法會自動修復掛鉤',
                fact: '算法機制在極端市場恐慌下往往失效，一旦進入死亡螺旋，數學模型無法抵抗人性拋售。'
            }
        ],

        timeline: [
            {
                date: '2022-05-07',
                title: '掛鉤鬆動',
                description: '巨額資金在 Curve 池拋售 UST，導致價格微幅低於 $1，市場開始測試機制韌性。',
                marketImpact: '套利機器人啟動，LFG 基金會開始動用比特幣儲備護盤。',
                riskState: '錨定機制受壓',
                riskLevel: 'medium'
            },
            {
                date: '2022-05-09',
                title: '信心潰散與死亡螺旋',
                description: 'UST 跌破 0.95，觸發恐慌性拋售，LUNA 機制無限增發試圖吸收賣壓。',
                marketImpact: 'LUNA 供應量呈指數級暴增，價格直線崩跌，機制完全失控。',
                riskState: '機制失效確',
                riskLevel: 'high'
            },
            {
                date: '2022-05-12',
                title: '價值歸零',
                description: 'LUNA 跌破 $0.01，主要交易所陸續暫停交易。',
                marketImpact: '生態系資金全數蒸發，持有 LUNA 的大型投資機構面臨破產清算。',
                riskState: '資產價值毀滅',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'LUNA',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：UST 價格脫鉤後一路向南，反映了市場對算法機制信心的徹底喪失。',
                interpretation: {
                    whatItMeans: '脫鉤一旦突破心理防線 ($0.95)，信心崩潰將呈現非線性的加速。',
                    whatToWatch: '對於錨定資產，微幅脫鉤 ($0.98) 往往是最後的逃生窗口。'
                }
            },
            flow: {
                url: '',
                caption: '圖表解讀：LUNA 的供應量 (Supply) 呈垂直指數級增長，這是機制為了挽救 UST 而無限制印鈔的結果，最終導致惡性通膨與歸零。',
                interpretation: {
                    whatItMeans: '指數級的供應量增發是「死亡螺旋」最直接的鏈上證據。',
                    whatToWatch: '當代幣供應量開始異常激增時，即使價格看似便宜也不應抄底。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：LUNA 崩盤引發全市場恐慌，FGI 連續多日維持在 10 附近的歷史低位。',
                interpretation: {
                    whatItMeans: '算法穩定幣崩潰導致的恐慌具有極強的傳染性。',
                    whatToWatch: '當 FGI 長期滯留於極度恐慌區，代表市場正在進行深度的去槓桿。'
                }
            }
        },

        historicalComparison: {
            event: '2008 雷曼兄弟倒閉',
            similarity: '兩者皆涉及高槓桿、結構複雜的金融產品崩潰，且投資人皆因「市場規模極大」而忽視了底層資產品質的脆弱性。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '檢視收益來源',
                desc: '面對超額收益產品，應優先質疑其利潤來源的可持續性。If you don\'t know where the yield comes from, you are the yield.'
            },
            {
                type: 'check',
                label: '理解穩定幣儲備',
                desc: '持有穩定幣前，應檢視其背後支撐資產是法幣現金還是波動性資產。'
            },
            {
                type: 'alert',
                label: '迴避機制性崩潰',
                desc: '當資產陷入機制性死亡螺旋時，技術分析失效，不應嘗試抄底。'
            }
        ],

        // 知識網連結
        relatedIndicators: [
            {
                slug: 'stablecoin-supply',
                why: '這次像機制崩潰，主要看算法穩定幣脫鉤對整體穩定幣生態的連鎖影響。'
            },
            {
                slug: 'fear-greed',
                why: '這次恐慌蔓延極快，主要看恐懼指數是否長期滯留於極端區。'
            }
        ]
    },
    {
        id: 'review-covid-2020',
        slug: 'covid',
        title: '2020 COVID 312 黑天鵝：流動性危機的極致考驗',
        year: 2020,
        importance: 'S',
        featuredRank: 4,
        tags: ['黑天鵝', '流動性危機', '連鎖爆倉', 'V型反轉'],
        behaviorTags: ['V型反轉', '插針', '無差別拋售', '流动性枯竭'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'oi', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2020-03-12',
        eventEndAt: '2020-03-13',
        reactionStartAt: '2020-03-09',  // Pre-crash selloff begins
        reactionType: 'liquidity_crisis',

        // Trading Perspective
        type: 'macro_shock',
        impactedTokens: ['BTC', 'ETH'],
        maxDrawdown: '-50%',
        recoveryDays: '45 Days',
        impactSummary: '流動性枯竭導致各類資產無差別拋售，BTC 單日腰斬 50% 後 V 轉。',

        usageGuide: [
            '當全球宏觀市場出現熔斷級恐慌時',
            '當比特幣與美股呈現高度正相關時',
            '當流動性危機導致所有資產無差別拋售時'
        ],

        summary: '當全市場面臨流動性枯竭時，比特幣的避險屬性暫時失效，轉而表現為與風險資產高度正相關的變現需求。',

        context: {
            what: '受 COVID-19 疫情引發的全球金融恐慌影響，各類資產遭無差別拋售，比特幣單日跌幅逾 50%。',
            narrative: '事件前，傳統敘事將比特幣視為數位黃金，認為其具備對抗傳統市場波動的避險屬性。',
            realImpact: '極端行情證明，在流動性危機當下，「現金為王」是唯一邏輯，加密資產成為獲取美元流動性的提款機。'
        },

        initialState: {
            price: '$7,900 區間弱勢震盪',
            fearGreed: '恐懼 (40) 轉向極度恐懼 - 信心快速流失',
            funding: '正費率突然轉負，多頭措手不及',
            etfFlow: undefined // N/A
        },

        misconceptions: [
            {
                myth: '比特幣是避險資產，股災理應上漲',
                fact: '在流動性危機初期，投資人恐慌性拋售所有可變現資產以換取美元，此時資產相關性趨近於 1。'
            },
            {
                myth: '價格腰斬反映了基本面惡化',
                fact: '當日的價格崩跌很大程度上是由合約市場連鎖爆倉引發的強制平倉 (Liquidation Cascade)，導致短期的流動性真空，而非基本面質變。'
            }
        ],

        timeline: [
            {
                date: '2020-03-12',
                title: '全球市場熔斷',
                description: '美股開盤即觸發熔斷機制，投資者恐慌情緒蔓延，拋售潮湧現。',
                marketImpact: '加密貨幣市場跟隨傳統金融市場暴跌，避險敘事暫時失效。',
                riskState: '相關性驟升，現金為王',
                riskLevel: 'high'
            },
            {
                date: '2020-03-12 (晚間)',
                title: '連鎖爆倉與流動性失靈',
                description: '價格跌破關鍵技術支撐，BitMEX 等交易所發生大規模連鎖清算，買盤掛單消失。',
                marketImpact: '價格在數小時內腰斬至 $3,800，市場陷入極度恐慌。',
                riskState: '流動性枯竭',
                riskLevel: 'high'
            },
            {
                date: '2020-03-13',
                title: 'V 型反轉與籌碼換手',
                description: '市場在極度絕望後，長期買盤開始介入承接，波動率維持極高水位。',
                marketImpact: '槓桿籌碼被徹底清洗，市場完成了從投機者到長期持有者的籌碼轉移。',
                riskState: '恐慌落底，長期買點',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：單日 50% 的跌幅歷史罕見，長下影線顯示了極端恐慌後的即時買盤介入，形成了典型的 V 型反轉結構。',
                interpretation: {
                    whatItMeans: '極長下影線 + 歷史天量，代表賣壓雖然巨大但已被買盤全數承接。',
                    whatToWatch: 'V 型反轉的即時性確認了市場的有效流動性與長期信心。'
                }
            },
            oi: {
                url: '',
                caption: '圖表解讀：持倉量 (OI) 瞬間蒸發，這是一次徹底的「去槓桿化」過程，市場重新回歸現貨主導的健康狀態。',
                interpretation: {
                    whatItMeans: '持倉量的大幅重置通常意味著市場底部，因為強制賣壓已耗盡。',
                    whatToWatch: '當 OI 降至歷史低點且費率為負時，通常是反轉的前兆。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：3/12 暴跌當日 FGI 觸及個位數，反映了市場無差別拋售的恐慌心理。',
                interpretation: {
                    whatItMeans: '極端恐慌往往是流動性危機的特徵。',
                    whatToWatch: '恐慌指數的快速反彈通常預示著流動性危機的解除。'
                }
            },
            liquidation: {
                url: '',
                caption: '圖表解讀：3/12 單日清算量巨大，甚至導致交易所引擎過載。',
                interpretation: {
                    whatItMeans: '流動性危機下的強制平倉是無差別的。',
                    whatToWatch: '爆倉量是否衰竭。'
                }
            }
        },

        historicalComparison: {
            event: '2008 金融海嘯',
            similarity: '兩者都經歷了流動性枯竭與無差別拋售潮，且隨後都迎來了央行大規模貨幣寬鬆政策 (QE) 導致的資產價格結構性上漲。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '辨識流動性危機',
                desc: '當系統性風險發生時，持有現金等待恐慌情緒釋放是最佳策略。'
            },
            {
                type: 'check',
                label: '觀察爆倉數據',
                desc: '歷史級別的單日爆倉量往往意味著短期底部的接近。'
            },
            {
                type: 'check',
                label: '逆向思維',
                desc: '非基本面因素導致的流動性崩盤，是十年一遇的戰略性買點。'
            }
        ],

        // 知識網連結
        relatedIndicators: [
            {
                slug: 'liquidation',
                why: '這次像流動性恐慌，主要看爆倉量是否達到歷史極端，判斷槓桿清洗程度。'
            },
            {
                slug: 'open-interest',
                why: '這次槓桿瞬間蒸發，主要看 OI 是否急速歸零，判斷市場是否完成去槓桿。'
            }
        ]
    },
    {
        id: 'review-mtgox-2014',
        slug: 'mtgox',
        title: '2014 Mt.Gox 倒閉：第一次大規模交易所信用毀滅',
        year: 2014,
        importance: 'S',
        featuredRank: 5,
        tags: ['交易所風險', '資產遺失', '信任崩潰', '無法提幣'],
        behaviorTags: ['無法提幣', '交易所倒閉', '信任危機'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 6,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2014-02-07',
        eventEndAt: '2014-02-28',
        reactionStartAt: '2014-02-07',  // Withdrawal halt = immediate reaction
        reactionType: 'trust_collapse',

        // Trading Perspective
        type: 'exchange_event',
        impactedTokens: ['BTC'],
        maxDrawdown: '-80%',
        recoveryDays: '700 Days',
        impactSummary: '最大交易所倒閉導致由比特幣主導的市場進入兩年熊市。',

        usageGuide: [
            '當交易所提幣延遲或出現異常時',
            '當市場傳出交易所資產遺失傳言時',
            '當單一交易所佔據過高市場份額時'
        ],

        summary: '當佔據 70% 市場份額的交易所遺失 85 萬枚比特幣時，市場學到的是：不是你的私鑰，就不是你的幣。',

        context: {
            what: '曾處理全球 70% 比特幣交易的 Mt.Gox 因遺失 85 萬枚 BTC 宣佈破產。',
            narrative: '2013 年底比特幣首次突破 $1,000，市場普遍相信交易所是「安全的託管者」。',
            realImpact: '事件揭露了中心化託管的致命風險，確立了「Not your keys, not your coins」這一原則。'
        },

        initialState: {
            price: '$850 區間，市場處於牛市頂部回調階段',
            fearGreed: '高度恐慌 - 提幣困難引發信心危機'
        },

        misconceptions: [
            {
                myth: '大型交易所不會倒閉',
                fact: '市場份額無法保證運營安全，缺乏審計與儲備證明的機構本質上是黑箱。'
            },
            {
                myth: '資產會被追討回來',
                fact: '加密資產一旦轉移，追回極度困難。Mt.Gox 債權人歷經 10 年才開始獲得部分補償。'
            }
        ],

        timeline: [
            {
                date: '2014-02-07',
                title: '提幣暫停',
                description: 'Mt.Gox 以「技術問題」為由暫停比特幣提幣，用戶開始恐慌。',
                marketImpact: '市場開始質疑交易所償付能力，價格開始下跌。',
                riskState: '信任動搖',
                riskLevel: 'medium'
            },
            {
                date: '2014-02-24',
                title: '網站關閉',
                description: 'Mt.Gox 網站突然無法訪問，內部文件流出顯示 74 萬枚 BTC 遺失。',
                marketImpact: '市場陷入恐慌，價格快速下跌 25%。',
                riskState: '信任崩潰',
                riskLevel: 'high'
            },
            {
                date: '2014-02-28',
                title: '正式申請破產',
                description: 'Mt.Gox 在日本提交破產保護申請，承認資產不足以償還用戶。',
                marketImpact: '市場進入長期熊市，信任重建需時數年。',
                riskState: '產業信用危機',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '價格在事件期間從 $850 跌至 $400 區間，隨後進入長達兩年的熊市。',
                interpretation: {
                    whatItMeans: '交易所信任崩潰不僅影響短期價格，更會改變整個市場的風險偏好。',
                    whatToWatch: '當主流交易所出現提幣延遲時，應優先考慮資產安全而非價格波動。'
                }
            }
        },

        historicalComparison: {
            event: '2022 FTX 倒閉',
            similarity: '兩者都是當時市場份額最大的交易所，且崩潰原因均涉及資產管理不當，導致用戶資金損失。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '分散交易所風險',
                desc: '不要將大量資產長期存放在單一交易所。'
            },
            {
                type: 'check',
                label: '使用自託管錢包',
                desc: '大額資產應存放在自己控制私鑰的冷錢包中。'
            },
            {
                type: 'check',
                label: '檢視儲備證明',
                desc: '選擇有公開審計與儲備證明的交易所。'
            }
        ]
    },
    {
        id: 'review-dao-2016',
        slug: 'dao',
        title: '2016 The DAO 事件：以太坊硬分叉與「不可竄改」的重新定義',
        year: 2016,
        importance: 'S',
        featuredRank: 6,
        tags: ['智能合約', '治理分歧', '硬分叉', '代碼即法律'],
        marketStates: ['崩跌', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 7,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2016-06-17',
        eventEndAt: '2016-07-20',
        reactionStartAt: '2016-06-17',  // Hack announcement = immediate reaction
        reactionType: 'external_shock',

        // Trading Perspective
        type: 'tech_event',
        impactedTokens: ['ETH', 'ETC'],
        maxDrawdown: '-30%',
        recoveryDays: '40 Days',
        impactSummary: '智能合約漏洞導致以太坊硬分叉，確立了回滾機制的可能性。',

        usageGuide: [
            '當新型智能合約協議出現安全漏洞時',
            '當社群面臨是否介入逆轉交易的辯論時',
            '當鏈上治理出現重大分歧時'
        ],

        summary: '當 The DAO 被駭客盜取 360 萬枚 ETH 時，以太坊社群選擇硬分叉逆轉交易，這重新定義了「不可竄改」的邊界。',

        context: {
            what: '史上最大的群眾募資專案 The DAO 因智能合約漏洞被盜取約 5,000 萬美元的以太幣。',
            narrative: '市場當時相信智能合約是「程式碼即法律」，無需人為干預。',
            realImpact: '事件導致以太坊硬分叉，分裂為 ETH 與 ETC，開創了社群可投票逆轉交易的先例。'
        },

        initialState: {
            price: 'ETH 約 $20，剛完成大型群募',
            fearGreed: '極度恐慌 - 專案資金被盜'
        },

        misconceptions: [
            {
                myth: '程式碼即法律，不應人為干預',
                fact: '當漏洞造成系統性傷害時，社群可透過治理機制選擇介入。但這也開啟了「誰有權決定」的永恆辯論。'
            },
            {
                myth: '硬分叉後以太坊會失去公信力',
                fact: '以太坊選擇逆轉並持續發展，最終成為 DeFi 與 NFT 的核心基礎設施。歷史證明實用性勝過純粹主義。'
            }
        ],

        timeline: [
            {
                date: '2016-06-17',
                title: '漏洞遭利用',
                description: '攻擊者利用遞歸調用漏洞，在數小時內從 The DAO 提取約 360 萬枚 ETH。',
                marketImpact: 'ETH 價格暴跌 30%，市場信心受創。',
                riskState: '安全事件',
                riskLevel: 'high'
            },
            {
                date: '2016-07-15',
                title: '社群投票硬分叉',
                description: '以太坊社群投票決定進行硬分叉，將被盜資金歸還原持有者。',
                marketImpact: '市場分裂為支持與反對陣營，不確定性升高。',
                riskState: '治理分歧',
                riskLevel: 'medium'
            },
            {
                date: '2016-07-20',
                title: '硬分叉執行',
                description: '以太坊成功硬分叉，被盜 ETH 歸還。反對分叉者繼續維護舊鏈，形成 ETC。',
                marketImpact: '資金追回後市場逐步恢復信心，ETH 長期持續發展。',
                riskState: '危機解除',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'ETH',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: 'ETH 價格在被駭後暴跌，但在硬分叉確認後逐步回穩。',
                interpretation: {
                    whatItMeans: '社群治理能力是區塊鏈價值的一部分，危機處理得當可恢復信心。',
                    whatToWatch: '當新協議出現安全事件時，觀察社群的回應速度與共識凝聚能力。'
                }
            }
        },

        historicalComparison: {
            event: '2017 Parity 錢包漏洞',
            similarity: '兩者都是智能合約漏洞導致的資金損失，但 Parity 事件未獲得硬分叉救濟，顯示社群對介入的態度會隨情境改變。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '檢視合約審計',
                desc: '參與新協議前，確認其已通過多家安全機構審計。'
            },
            {
                type: 'check',
                label: '評估治理機制',
                desc: '了解協議的治理結構，危機時誰有權做決定。'
            },
            {
                type: 'check',
                label: '分散協議風險',
                desc: '不要將所有資產集中在單一協議中。'
            }
        ]
    },
    {
        id: 'review-ico-2017',
        slug: 'ico',
        title: '2017 ICO 狂潮：散戶風險教育的起點',
        year: 2017,
        importance: 'A',
        tags: ['ICO', '散戶狂熱', '泡沫破裂', '價值回歸'],
        marketStates: ['過熱', '崩跌'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2017-06-01',
        eventEndAt: '2018-01-15',
        reactionStartAt: '2017-12-17',  // Peak day, reversal begins
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['ETH', 'BTC'],
        maxDrawdown: '-90%',
        recoveryDays: '1000+ Days',
        impactSummary: 'ICO 狂熱導致 ETH 需求激增，泡沫破裂後 90% 專案歸零。',

        usageGuide: [
            '當新幣發行速度遠超市場資金承接能力時',
            '當「萬物皆可代幣化」成為主流敘事時'
        ],

        summary: '當任何專案都能透過 ICO 募集數百萬美元時，市場過熱的訊號已非常明確。',

        context: {
            what: '2017 年 ICO 狂潮見證了超過 50 億美元透過代幣發行募集，多數專案最終歸零。',
            narrative: '白皮書即正義，任何聽起來有區塊鏈概念的專案都能輕易募資。',
            realImpact: '這次泡沫教育了一整代散戶投資者，也催生了監管對證券型代幣的關注。'
        },

        initialState: {
            price: 'ETH 從年初 $8 飆升至 $1,400',
            fearGreed: '極度貪婪 - 散戶蜂擁進場'
        },

        misconceptions: [
            {
                myth: '白皮書代表真實的商業計畫',
                fact: '多數 ICO 專案僅有概念，缺乏可執行的產品或團隊，最終 80% 以上歸零。'
            },
            {
                myth: '早期參與必定獲利',
                fact: '熊市來臨時，絕大多數代幣跌幅超過 90%，早期投資者若未及時出場同樣虧損慘重。'
            }
        ],

        timeline: [
            {
                date: '2017-06-01',
                title: 'ICO 加速',
                description: '大量專案透過以太坊發行代幣，募資金額屢創新高。',
                marketImpact: 'ETH 需求激增，價格飆升。',
                riskState: '泡沫形成',
                riskLevel: 'medium'
            },
            {
                date: '2017-12-17',
                title: 'BTC 觸頂 $20K',
                description: '比特幣創下歷史新高，散戶恐慌性 FOMO 進場。',
                marketImpact: '市場情緒達到極端貪婪，反轉風險極高。',
                riskState: '極度過熱',
                riskLevel: 'high'
            },
            {
                date: '2018-01-15',
                title: '熊市開始',
                description: '市場開始長達一年的持續下跌，多數 ICO 代幣歸零。',
                marketImpact: '總市值蒸發超過 80%，產業進入寒冬。',
                riskState: '泡沫破裂',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'ETH',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: 'ETH 從 $8 漲至 $1,400 後崩跌至 $80，完成完整泡沫週期。',
                interpretation: {
                    whatItMeans: '當散戶開始相信「不可能虧錢」時，往往是頂部訊號。',
                    whatToWatch: '監測新幣發行速度與散戶進場指標。'
                }
            }
        },

        historicalComparison: {
            event: '2000 年網際網路泡沫',
            similarity: '兩者都是新技術引發的過度投機，最終只有少數優質專案存活。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '審視專案基本面',
                desc: '白皮書不等於產品，評估團隊背景與實際進展。'
            },
            {
                type: 'check',
                label: '控制部位大小',
                desc: '高風險資產僅配置可承受損失的比例。'
            }
        ]
    },
    {
        id: 'review-china-ban-2021',
        slug: 'china-ban',
        title: '2021 中國全面禁令：算力遷徙與供給端重塑',
        year: 2021,
        importance: 'A',
        tags: ['監管政策', '算力遷徙', '供給衝擊', '去中心化驗證'],
        marketStates: ['崩跌', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2021-05-21',
        eventEndAt: '2021-07-20',
        reactionStartAt: '2021-05-19', // Initial price drop on May 19th, before official ban
        reactionType: 'external_shock',

        // Trading Perspective
        type: 'policy_regulation',
        impactedTokens: ['BTC'],
        maxDrawdown: '-50%',
        recoveryDays: '150 Days',
        impactSummary: '算力暴跌 50% 後迅速遷徙，展現了比特幣網絡的極強韌性。',

        usageGuide: [
            '當主要產區出現監管打擊礦業消息時',
            '當全網算力出現大幅下降時'
        ],

        summary: '當中國禁止加密挖礦時，全網算力暴跌 50%，但比特幣網絡在數月內完成算力遷徙與自我修復。',

        context: {
            what: '中國政府全面禁止加密貨幣挖礦與交易，導致全網算力暴跌並引發價格下跌。',
            narrative: '市場恐慌認為礦業禁令將削弱比特幣基礎設施。',
            realImpact: '算力向北美與中亞遷徙，最終使網絡更加去中心化，長期利多。'
        },

        initialState: {
            price: 'BTC 從 $64,000 高點回落至 $30,000 區間',
            fearGreed: '恐懼 (25) - 監管不確定性籠罩'
        },

        misconceptions: [
            {
                myth: '中國禁令會摧毀比特幣網絡',
                fact: '比特幣協議透過難度調整機制自動適應算力變化，網絡從未中斷運行。'
            },
            {
                myth: '算力下降意味著安全性永久降低',
                fact: '算力在 6 個月內恢復至禁令前水平，且分佈更加去中心化。'
            }
        ],

        timeline: [
            {
                date: '2021-05-21',
                title: '政策風向轉變',
                description: '國務院金融委聲明打擊比特幣挖礦與交易，市場開始恐慌。',
                marketImpact: '價格單日下跌超過 10%，礦工開始尋求出路。',
                riskState: '政策風險升溫',
                riskLevel: 'high'
            },
            {
                date: '2021-06-20',
                title: '算力暴跌',
                description: '全網算力從高峰下跌超過 50%，難度調整幅度創歷史紀錄。',
                marketImpact: '短期網絡確認時間延長，但協議自動調適。',
                riskState: '供給端衝擊',
                riskLevel: 'medium'
            },
            {
                date: '2021-07-20',
                title: '算力遷徙完成',
                description: '北美礦場開始上線，算力開始回升，網絡恢復正常。',
                marketImpact: '市場信心恢復，價格開始反彈。',
                riskState: '危機解除',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: 'BTC 價格從 $64,000 跌至 $29,000 後反彈，禁令成為長期利多。',
                interpretation: {
                    whatItMeans: '比特幣網絡的抗審查性在極端壓力測試下得到驗證。',
                    whatToWatch: '監管衝擊往往是短期恐慌，長期應觀察網絡基本面恢復情況。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：禁令與算力清退導致市場情緒從貪婪迅速轉向恐慌，FGI 驟降。',
                interpretation: {
                    whatItMeans: '政策性利空對市場情緒的打擊通常是劇烈但短暫的。',
                    whatToWatch: '情緒修復通常滯後於價格反彈。'
                }
            }
        },

        historicalComparison: {
            event: '2017 年中國 ICO 禁令',
            similarity: '兩次禁令都造成短期恐慌與價格下跌，但長期均未阻止加密市場發展。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '區分短期恐慌與長期影響',
                desc: '監管消息發佈後，觀察網絡基本面是否受損，而非只看價格。'
            },
            {
                type: 'alert',
                label: '理解比特幣抗審查性',
                desc: '單一國家禁令無法終結去中心化網絡。'
            }
        ]
    },
    {
        id: 'review-merge-2022',
        slug: 'the-merge',
        title: '2022 以太坊 The Merge：共識機制轉換的歷史時刻',
        year: 2022,
        importance: 'A',
        tags: ['以太坊', 'PoS', '利多出盡', '買預期賣事實'],
        marketStates: ['觀望', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2022-09-06',
        eventEndAt: '2022-09-15',
        reactionStartAt: '2022-09-15',  // Merge day - priced in before
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'tech_event',
        impactedTokens: ['ETH'],
        maxDrawdown: '-20%',
        recoveryDays: '120 Days',
        impactSummary: 'PoS 升級成功但呈現利多出盡，價格未漲反跌。',

        usageGuide: [
            '當區塊鏈進行重大技術升級時',
            '當「買消息賣事實」模式可能適用時'
        ],

        summary: '當以太坊成功從 PoW 轉換至 PoS 時，它完成了加密史上最大規模的在線升級，但價格並未如預期大漲。',

        context: {
            what: '以太坊完成從工作量證明 (PoW) 到權益證明 (PoS) 的轉換，減少約 99.95% 能源消耗。',
            narrative: '市場預期技術升級將推動 ETH 價格大漲。',
            realImpact: 'Merge 成功執行驗證了以太坊核心開發能力，但價格受宏觀熊市壓制，呈現利多出盡。'
        },

        initialState: {
            price: 'ETH 約 $1,600，處於熊市反彈階段',
            fearGreed: '中性 (45) - 觀望氣氛濃厚'
        },

        misconceptions: [
            {
                myth: 'Merge 會讓 ETH 價格立即暴漲',
                fact: '技術升級的價值需要時間體現，且市場已提前定價。Merge 後價格反而下跌 20%。'
            },
            {
                myth: 'PoS 轉換會導致網絡不穩定',
                fact: '轉換過程完美執行，無任何交易中斷或資產損失。'
            }
        ],

        timeline: [
            {
                date: '2022-09-06',
                title: 'Bellatrix 升級',
                description: '信標鏈完成升級，為 Merge 做最後準備。',
                marketImpact: '市場預期升溫，ETH 價格小幅上漲。',
                riskState: '升級前夕',
                riskLevel: 'medium'
            },
            {
                date: '2022-09-15',
                title: 'Merge 完成',
                description: '以太坊成功轉換至 PoS，區塊生產切換至驗證者節點。',
                marketImpact: '技術成功但價格下跌，典型利多出盡。',
                riskState: '預期兌現',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'ETH',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: 'ETH 在 Merge 前反彈至 $1,700，完成後反而下跌至 $1,200。',
                interpretation: {
                    whatItMeans: '技術升級的成功不等於價格上漲，市場已提前定價。',
                    whatToWatch: '重大事件前的價格走勢往往已反映預期。'
                }
            }
        },

        historicalComparison: {
            event: '比特幣減半事件',
            similarity: '兩者都是預先已知的供給端變化，市場往往提前定價，事件發生時呈現利多出盡。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '區分技術價值與價格表現',
                desc: '長期基本面改善不等於短期價格上漲。'
            },
            {
                type: 'alert',
                label: '警惕利多出盡',
                desc: '當市場對已知事件過度期待時，事件發生可能是賣點。'
            }
        ]
    },
    // ===== Bitcoin Halving Events =====
    {
        id: 'review-halving-2012',
        slug: 'halving',
        title: '2012 第一次減半：稀缺性程式碼的首次驗證',
        year: 2012,
        importance: 'A',
        tags: ['減半', '供給衝擊', '稀缺性', '早期紅利'],
        marketStates: ['修復', '過熱'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2012-11-01',
        eventEndAt: '2012-12-31',
        reactionStartAt: '2012-11-28',  // Block 210,000
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['BTC'],
        maxDrawdown: '-30%',
        recoveryDays: '60 Days',
        impactSummary: '首次減半驗證了稀缺性模型，開啟了比特幣的首個大週期。',

        usageGuide: [
            '當市場質疑比特幣的長期價值時',
            '當減半敘事開始升溫，需要回顧歷史驗證時'
        ],

        summary: '當區塊獎勵首次從 50 BTC 減半至 25 BTC 時，比特幣用程式碼證明了：稀缺性可以被寫入貨幣基因。',

        context: {
            what: '比特幣網絡在區塊高度 210,000 完成首次減半，區塊獎勵從 50 BTC 降至 25 BTC。',
            narrative: '市場尚未形成「減半週期」概念，多數參與者是技術愛好者而非投資者。',
            realImpact: '這次減半驗證了比特幣的核心設計——通膨率可被程式碼永久控制，無需人為干預。'
        },

        initialState: {
            price: '約 $12，處於 2011 年泡沫後的緩慢復甦期',
            fearGreed: '中性偏恐懼 - 市場規模極小，參與者有限'
        },

        misconceptions: [
            {
                myth: '減半會立即推高價格',
                fact: '第一次減半後價格在數月內才開始明顯上漲，從 $12 漲至隔年的 $1,000+，市場需要時間消化供給變化。'
            },
            {
                myth: '市場太小，減半沒有意義',
                fact: '正因為市場小，第一次減半為後續所有週期建立了「供給衝擊 → 價格發現」的敘事模板。'
            }
        ],

        timeline: [
            {
                date: '2012-11-28',
                title: '區塊 210,000 - 首次減半',
                description: '比特幣網絡完成歷史性的首次減半，區塊獎勵從 50 BTC 降至 25 BTC。',
                marketImpact: '短期價格平穩，市場尚未意識到供給衝擊的深遠影響。',
                riskState: '歷史時刻',
                riskLevel: 'low'
            },
            {
                date: '2013-01-15',
                title: '價格開始突破',
                description: '比特幣突破 $15 並持續上漲，開始進入第一個真正的牛市週期。',
                marketImpact: '新一代投資者開始關注，交易量逐步攀升。',
                riskState: '週期啟動',
                riskLevel: 'medium'
            },
            {
                date: '2013-04-10',
                title: '首次大規模價格發現',
                description: '價格飆升至 $260 後迅速回落，完成減半後首次劇烈波動。',
                marketImpact: '全球媒體首次大規模報導比特幣，FOMO 與恐慌並存。',
                riskState: '市場過熱',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：減半當日價格約 $12，隨後數月緩步上漲，開啟了比特幣第一個完整的牛市週期。',
                interpretation: {
                    whatItMeans: '首次減半確立了「供給減少 → 稀缺性增加 → 價格上漲」的市場敘事，成為後續週期的藍圖。',
                    whatToWatch: '減半效應通常需要 3-6 個月才會充分反映在價格上。'
                }
            }
        },

        historicalComparison: {
            event: '黃金供給衝擊（南非罷工）',
            similarity: '兩者皆涉及供給端的結構性減少，但比特幣的減半是可預測且寫入程式碼的，而黃金供給衝擊是偶發事件。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '理解減半本質',
                desc: '減半是供給端事件，通常需要時間傳導至價格。'
            },
            {
                type: 'check',
                label: '長期視角',
                desc: '減半後 12-18 個月通常是價格表現最強的時期。'
            },
            {
                type: 'alert',
                label: '避免短視',
                desc: '不要因為減半當日價格未立即上漲就否定減半效應。'
            }
        ]
    },
    {
        id: 'review-halving-2016',
        slug: 'halving',
        title: '2016 第二次減半：減半週期敘事的確立',
        year: 2016,
        importance: 'A',
        tags: ['減半', '週期', '機構關注', '利多出盡'],
        marketStates: ['觀望', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2016-06-01',
        eventEndAt: '2016-08-15',
        reactionStartAt: '2016-07-09',  // Block 420,000
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['BTC'],
        maxDrawdown: '-28%',
        recoveryDays: '180 Days',
        impactSummary: '減半週期理論成形，市場開始學會等待供應衝擊。',

        usageGuide: [
            '當市場開始討論「四年週期」時',
            '當需要驗證減半是否具有可重複性時'
        ],

        summary: '當區塊獎勵從 25 BTC 再次減半至 12.5 BTC 時，市場首次有意識地「等待減半」，週期理論開始成形。',

        context: {
            what: '比特幣網絡在區塊高度 420,000 完成第二次減半，區塊獎勵從 25 BTC 降至 12.5 BTC。',
            narrative: '市場已經歷過一次減半週期，開始形成「減半 → 牛市」的預期心理。',
            realImpact: '此次減半確立了「四年週期」敘事，成為後續所有市場分析的重要框架。'
        },

        initialState: {
            price: '約 $650，處於 2014 年熊市底部後的復甦期',
            fearGreed: '中性 (45) - 市場觀望情緒濃厚'
        },

        misconceptions: [
            {
                myth: '減半日是最佳買點',
                fact: '價格往往在減半前已上漲反映預期，減半日通常是「利多出盡」的風險點。'
            },
            {
                myth: '減半效果可精確預測',
                fact: '雖然存在週期模式，但每次減半的市場環境、參與者結構都不同，不宜機械套用。'
            }
        ],

        timeline: [
            {
                date: '2016-06-18',
                title: '減半前回調',
                description: '由於中國交易所槓桿清洗，價格從 $780 回調至 $550。',
                marketImpact: '短期投機者被清洗，市場在減半前完成一次健康整理。',
                riskState: '槓桿清洗',
                riskLevel: 'medium'
            },
            {
                date: '2016-07-09',
                title: '區塊 420,000 - 第二次減半',
                description: '區塊獎勵從 25 BTC 降至 12.5 BTC，全球礦工收入減半。',
                marketImpact: '媒體報導增加，價格在減半後小幅回落（利多出盡）。',
                riskState: '預期兌現',
                riskLevel: 'low'
            },
            {
                date: '2017-01-01',
                title: '牛市確認',
                description: '價格突破 $1,000，正式進入 2017 大牛市週期。',
                marketImpact: '減半效應在 6 個月後開始充分釋放，市場進入主升浪。',
                riskState: '週期啟動',
                riskLevel: 'medium'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：減半當日價格約 $650，短期呈現利多出盡，但 6 個月後價格突破 $1,000 開啟 2017 大牛市。',
                interpretation: {
                    whatItMeans: '第二次減半確認了減半週期的可重複性，「四年週期」敘事開始主導市場預期。',
                    whatToWatch: '減半後 3-6 個月是觀察供給衝擊效應是否兌現的關鍵窗口。'
                }
            }
        },

        historicalComparison: {
            event: '2012 第一次減半',
            similarity: '兩次減半都呈現「利多出盡」的短期反應，但長期都開啟了新的牛市週期。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '建立週期意識',
                desc: '減半是約每四年一次的可預期事件，應提前佈局而非追高。'
            },
            {
                type: 'alert',
                label: '警惕短期波動',
                desc: '減半前後的價格波動往往劇烈，不宜過度槓桿。'
            },
            {
                type: 'check',
                label: '耐心持有',
                desc: '減半效應需要時間發酵，持有週期應以年為單位。'
            }
        ]
    },
    {
        id: 'review-halving-2020',
        slug: 'halving',
        title: '2020 第三次減半：機構時代的開端',
        year: 2020,
        importance: 'A',
        featuredRank: 7,
        tags: ['減半', '機構入場', '供給衝擊', '數位黃金'],
        marketStates: ['修復', '過熱'],
        relatedMetrics: ['price', 'oi', 'fearGreed'],
        readingMinutes: 6,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2020-04-01',
        eventEndAt: '2020-06-15',
        reactionStartAt: '2020-05-11',  // Block 630,000
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['BTC'],
        maxDrawdown: '-20%',
        recoveryDays: '150 Days',
        impactSummary: '機構資金首次大規模參與減半，推動價格突破 2017 高點。',

        usageGuide: [
            '當機構資金開始佈局加密資產時',
            '當供給衝擊理論需要數據驗證時'
        ],

        summary: '當區塊獎勵從 12.5 BTC 減半至 6.25 BTC 時，機構投資者首次大規模參與減半敘事，開啟了比特幣機構化時代。',

        context: {
            what: '比特幣網絡在區塊高度 630,000 完成第三次減半，區塊獎勵從 12.5 BTC 降至 6.25 BTC。',
            narrative: '市場在 COVID 崩盤後快速復甦，機構開始將比特幣視為「數位黃金」與通膨對沖工具。',
            realImpact: 'MicroStrategy、Tesla 等上市公司開始配置比特幣，推動了史上最大規模的機構入場潮。'
        },

        initialState: {
            price: '約 $8,600，距離 312 崩盤底部已反彈超過 100%',
            fearGreed: '恐懼轉中性 (42) - 市場仍處謹慎觀望',
            oi: '合約持倉量穩步回升，顯示槓桿資金重新入場'
        },

        misconceptions: [
            {
                myth: '減半效應已被市場完全定價',
                fact: '雖然市場預期減半，但機構買盤的規模與持續性超出預期，價格最終漲至 $69,000。'
            },
            {
                myth: 'COVID 崩盤會延遲減半效應',
                fact: '恰恰相反，央行大規模 QE 強化了比特幣的抗通膨敘事，加速了機構入場。'
            }
        ],

        timeline: [
            {
                date: '2020-03-12',
                title: 'COVID 崩盤',
                description: '全球流動性危機導致比特幣單日腰斬，但也清洗了過度槓桿。',
                marketImpact: '市場在減半前完成了徹底的去槓桿化，為後續上漲創造了健康的籌碼結構。',
                riskState: '極端恐慌',
                riskLevel: 'high'
            },
            {
                date: '2020-05-11',
                title: '區塊 630,000 - 第三次減半',
                description: '區塊獎勵從 12.5 BTC 降至 6.25 BTC，日產出減少約 900 BTC。',
                marketImpact: '減半當日價格平穩，市場已充分預期，後續開始緩步上漲。',
                riskState: '預期兌現',
                riskLevel: 'low'
            },
            {
                date: '2020-12-16',
                title: '突破歷史新高',
                description: '比特幣突破 2017 年高點 $20,000，正式確認新一輪牛市週期。',
                marketImpact: '機構 FOMO 加速，MicroStrategy 帶頭的企業買入潮全面展開。',
                riskState: '週期主升浪',
                riskLevel: 'medium'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：減半前市場已從 312 崩盤中復甦，減半後 7 個月突破歷史新高，開啟機構牛市。',
                interpretation: {
                    whatItMeans: '這次減半證明了即使在極端恐慌後，供給衝擊效應依然有效。',
                    whatToWatch: '觀察機構資金流向（Grayscale、ETF 申請進度）作為領先指標。'
                }
            },
            oi: {
                url: '',
                caption: '圖表解讀：持倉量在減半後穩步攀升，顯示市場信心恢復且槓桿結構健康。',
                interpretation: {
                    whatItMeans: '持倉量隨價格同步上升，代表市場是由現貨需求而非過度槓桿推動。',
                    whatToWatch: '當 OI 增速遠超價格漲幅時，需警惕槓桿過熱。'
                }
            }
        },

        historicalComparison: {
            event: '2016 第二次減半',
            similarity: '兩次減半都在減半後 6-7 個月突破上一輪歷史高點，確認了減半週期的可重複性。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '追蹤機構資金',
                desc: '機構配置動態（13F 持倉報告、ETF 流量）是這個週期的核心變量。'
            },
            {
                type: 'check',
                label: '供給衝擊量化',
                desc: '減半後每日供給減少約 900 BTC，年化約 33 萬 BTC 減產。'
            },
            {
                type: 'alert',
                label: '宏觀環境',
                desc: '央行政策（QE/QT）會放大或抑制減半效應，需同步關注。'
            }
        ]
    },
    {
        id: 'review-halving-2024',
        slug: 'halving',
        title: '2024 第四次減半：ETF 時代的首次供給衝擊',
        year: 2024,
        importance: 'S',
        featuredRank: 8,
        tags: ['減半', 'ETF', '供給衝擊', '結構性改變'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['price', 'oi', 'etfFlow', 'funding'],
        readingMinutes: 7,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2024-03-15',
        eventEndAt: '2024-05-31',
        reactionStartAt: '2024-04-20',  // Block 840,000
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['BTC'],
        maxDrawdown: '-18%',
        recoveryDays: 'Pending',
        impactSummary: 'ETF 需求提前透支減半紅利，打破了減半後才創新高的慣例。',

        usageGuide: [
            '當 ETF 資金流與減半效應交互作用時',
            '當需要分析「需求結構性改變」對減半效應的影響時',
            '當市場在歷史高點附近完成減半時'
        ],

        summary: '當區塊獎勵從 6.25 BTC 減半至 3.125 BTC 時，這是比特幣首次在現貨 ETF 時代完成減半，供給衝擊遇上了史上最強的結構性需求。',

        context: {
            what: '比特幣網絡在區塊高度 840,000 完成第四次減半，區塊獎勵從 6.25 BTC 降至 3.125 BTC。',
            narrative: '市場在 ETF 通過後創下歷史新高，減半前價格已突破 $73,000，「減半前新高」打破歷史慣例。',
            realImpact: '這次減半是供給與需求雙重結構性改變的交匯點——供給減半，需求因 ETF 通道而永久性增加。'
        },

        initialState: {
            price: '約 $64,000，距離歷史高點 $73,000 回調約 12%',
            fearGreed: '貪婪 (65) - 市場情緒偏熱但未極端',
            funding: '資金費率正向偏高，衍生品市場偏多',
            etfFlow: 'ETF 淨流入在減半前趨緩，部分獲利了結'
        },

        misconceptions: [
            {
                myth: '減半前已創新高，減半效應已失效',
                fact: '歷史上減半效應主要體現在 12-18 個月的中長期，減半前的新高反映的是 ETF 需求，兩者可疊加。'
            },
            {
                myth: 'ETF 買盤會取代減半效應',
                fact: '兩者是互補關係，ETF 提供需求，減半減少供給，供需雙重利多是前所未有的組合。'
            },
            {
                myth: '礦工營收減半會導致大量拋售',
                fact: '歷史數據顯示，礦工在減半後傾向於惜售而非拋售，因為預期價格將上漲彌補收入減少。'
            }
        ],

        timeline: [
            {
                date: '2024-03-14',
                title: '減半前歷史新高',
                description: '比特幣在減半前創下 $73,000 歷史新高，打破「減半後才創新高」的歷史慣例。',
                marketImpact: 'ETF 需求主導的新高，市場開始辯論減半效應是否已被提前消化。',
                riskState: '預期過熱',
                riskLevel: 'medium'
            },
            {
                date: '2024-04-20',
                title: '區塊 840,000 - 第四次減半',
                description: '區塊獎勵從 6.25 BTC 降至 3.125 BTC，日產出減少至約 450 BTC。',
                marketImpact: '減半當日價格約 $64,000，呈現輕微回調後穩定，市場反應平淡。',
                riskState: '利多出盡',
                riskLevel: 'low'
            },
            {
                date: '2024-05-15',
                title: '減半後整理',
                description: '價格在 $60,000-$70,000 區間震盪整理，市場等待下一個催化劑。',
                marketImpact: 'ETF 流入速度放緩，減半效應尚需時間發酵。',
                riskState: '供需平衡',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：這是史上首次在歷史高點附近完成減半，短期呈現利多出盡，中長期效應待驗證。',
                interpretation: {
                    whatItMeans: '減半前已創新高打破歷史慣例，顯示 ETF 需求力道可能超越傳統減半邏輯。',
                    whatToWatch: '觀察減半後 6-12 個月的價格表現，驗證供需雙重利多的疊加效應。'
                }
            },
            flow: {
                url: '',
                caption: '圖表解讀：ETF 每日淨流入約數億美元，而減半後日產出僅約 450 BTC（約 $30M），結構性供不應求。',
                interpretation: {
                    whatItMeans: 'ETF 需求 > 新增供給，只要 ETF 流入持續，價格底部將持續抬高。',
                    whatToWatch: '若 ETF 連續多日淨流出，需重新評估供需平衡點。'
                }
            },
            oi: {
                url: '',
                caption: '圖表解讀：持倉量在減半期間維持高位，顯示市場對中長期走勢仍有信心。',
                interpretation: {
                    whatItMeans: '持倉量未隨價格回調而大幅下降，代表多頭並未離場。',
                    whatToWatch: '若 OI 與價格同時下跌，可能預示趨勢反轉。'
                }
            }
        },

        historicalComparison: {
            event: '2024 年 1 月比特幣 ETF 通過',
            similarity: '兩者都是「利多出盡」的典型案例，但長期來看都是結構性利多，短期賣壓不改長期趨勢。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '量化供需缺口',
                desc: '日產出 450 BTC vs ETF 日均淨流入（需即時追蹤），計算供需比。'
            },
            {
                type: 'check',
                label: '追蹤礦工行為',
                desc: '觀察礦工地址餘額變化，確認是否惜售。'
            },
            {
                type: 'alert',
                label: '週期疊加效應',
                desc: '這是首次「ETF + 減半」的雙重供需改變，歷史參照價值有限，需持續觀察。'
            },
            {
                type: 'check',
                label: '耐心等待',
                desc: '減半效應通常在 12-18 個月後充分釋放，避免短線噪音干擾判斷。'
            }
        ],
        focusWindow: [-14, 30]
    },
    // ===== 2020 Events =====
    {
        id: 'review-defi-summer-2020',
        slug: 'defi-summer',
        title: '2020 DeFi Summer：流動性挖礦與鏈上金融的爆發',
        year: 2020,
        importance: 'A',
        tags: ['DeFi', '流動性挖礦', 'TVL', '泡沫狂熱'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 6,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2020-06-15',
        eventEndAt: '2020-09-30',
        reactionStartAt: '2020-06-15',  // Compound COMP token launch
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['ETH', 'UNI', 'COMP'],
        maxDrawdown: '-30%',
        recoveryDays: '90 Days',
        impactSummary: '流動性挖礦開啟了 DeFi 熱潮，TVL 暴增重新定義了 ETH 的價值。',

        usageGuide: [
            '當新型收益協議出現極高 APY 時',
            '當「挖礦」成為市場熱門敘事時',
            '當 TVL 快速膨脹時'
        ],

        summary: '當 Compound 推出 COMP 代幣開啟流動性挖礦狂潮時，DeFi 從概念變成了可量化的金融基礎設施，也同時揭開了「高收益 = 高風險」的序幕。',

        context: {
            what: 'Compound 於 2020 年 6 月推出治理代幣 COMP 並開啟流動性挖礦，引發 DeFi 協議爆發式增長，TVL 從 10 億美元飆升至 100 億美元。',
            narrative: '市場開始相信「DeFi 將取代傳統金融」，高 APY 成為吸引資金的主要手段。',
            realImpact: 'DeFi Summer 確立了鏈上金融的可行性，但也暴露了智能合約風險與不可持續的代幣經濟模型。'
        },

        initialState: {
            price: 'ETH 約 $230，處於 COVID 崩盤後的復甦期',
            fearGreed: '中性轉貪婪 - 新敘事吸引資金進場'
        },

        misconceptions: [
            {
                myth: '高 APY 可以持續',
                fact: '極高收益率通常來自代幣通膨補貼，當補貼減少或代幣價格下跌，APY 會迅速歸零。'
            },
            {
                myth: 'DeFi 無風險',
                fact: '智能合約漏洞、無常損失、預言機攻擊等風險在這一時期頻繁發生，多個協議遭駭。'
            }
        ],

        timeline: [
            {
                date: '2020-06-15',
                title: 'COMP 代幣啟動',
                description: 'Compound 開始分發 COMP 治理代幣，開創「流動性挖礦」模式。',
                marketImpact: '資金開始湧入 DeFi 協議，TVL 快速攀升。',
                riskState: '敘事啟動',
                riskLevel: 'medium'
            },
            {
                date: '2020-08-28',
                title: 'Sushiswap 分叉 Uniswap',
                description: '「吸血鬼攻擊」成為熱門策略，DeFi 競爭白熱化。',
                marketImpact: '協議之間的競爭推高收益率，也增加了系統性風險。',
                riskState: '競爭過熱',
                riskLevel: 'high'
            },
            {
                date: '2020-09-17',
                title: 'Uniswap 發幣 UNI',
                description: 'Uniswap 空投 UNI 代幣，回饋早期用戶。',
                marketImpact: 'DeFi 熱潮達到高峰，隨後開始冷卻。',
                riskState: '泡沫頂點',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'ETH',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：ETH 從 $230 漲至 $480，DeFi 敘事成為這段期間的主要推動力。',
                interpretation: {
                    whatItMeans: 'DeFi Summer 證明了鏈上金融的市場需求，但也顯示了敘事驅動的價格波動風險。',
                    whatToWatch: '當 TVL 增速遠超實際使用量時，需警惕泡沫風險。'
                }
            }
        },

        historicalComparison: {
            event: '2017 ICO 狂潮',
            similarity: '兩者都是新敘事驅動的資金狂熱，最終只有少數優質協議存活。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '審視收益來源',
                desc: '高 APY 通常來自代幣通膨，需評估代幣經濟模型的可持續性。'
            },
            {
                type: 'check',
                label: '理解智能合約風險',
                desc: '參與 DeFi 前，確認協議是否經過審計。'
            },
            {
                type: 'check',
                label: '分散協議風險',
                desc: '不要將所有資金放在單一協議中。'
            }
        ]
    },
    // ===== 2021 Events =====
    {
        id: 'review-tesla-btc-2021',
        slug: 'tesla',
        title: '2021 Tesla 購買比特幣：企業資產配置敘事的高峰',
        year: 2021,
        importance: 'A',
        tags: ['機構入場', '名人效應', '馬斯克', '情緒波動'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2021-02-01',
        eventEndAt: '2021-02-28',
        reactionStartAt: '2021-02-08',  // Tesla 8-K filing public
        reactionType: 'external_shock',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['BTC'],
        maxDrawdown: '-25%',
        recoveryDays: '90 Days',
        impactSummary: '企業資產配置敘事達到頂峰，但名人效應也帶來了巨大的雙向波動。',

        usageGuide: [
            '當上市公司宣佈配置比特幣時',
            '當名人效應推動市場情緒時'
        ],

        summary: '當 Tesla 宣佈購買 15 億美元比特幣時，企業資產配置敘事達到頂峰，但也埋下了名人影響力過度主導市場的隱憂。',

        context: {
            what: 'Tesla 在 SEC 文件中揭露購買 15 億美元比特幣，並計劃接受 BTC 支付。',
            narrative: '市場相信 Tesla 只是開始，更多企業將跟進配置比特幣。',
            realImpact: '雖然少數企業跟進，但 Tesla 後來因環保爭議暫停接受 BTC 支付，顯示企業決策的不確定性。'
        },

        initialState: {
            price: 'BTC 約 $38,000，處於持續上漲趨勢中',
            fearGreed: '極度貪婪 (80+) - 市場情緒過熱'
        },

        misconceptions: [
            {
                myth: '企業配置會持續加速',
                fact: '多數企業對加密資產配置仍持保守態度，Tesla 是例外而非趨勢。'
            },
            {
                myth: '名人背書等於無風險',
                fact: 'Elon Musk 後來的推文多次造成市場劇烈波動，顯示名人影響力的雙面性。'
            }
        ],

        timeline: [
            {
                date: '2021-02-08',
                title: 'Tesla 8-K 揭露',
                description: 'Tesla 向 SEC 提交文件，揭露購買 15 億美元比特幣。',
                marketImpact: 'BTC 單日上漲超過 15%，創下 $44,000 新高。',
                riskState: '利多衝擊',
                riskLevel: 'medium'
            },
            {
                date: '2021-03-24',
                title: 'Tesla 接受 BTC 支付',
                description: 'Elon Musk 宣佈 Tesla 開始接受比特幣購車。',
                marketImpact: '市場情緒進一步升溫，BTC 逼近 $60,000。',
                riskState: '預期強化',
                riskLevel: 'medium'
            },
            {
                date: '2021-05-12',
                title: 'Tesla 暫停 BTC 支付',
                description: 'Musk 宣佈因環保考量暫停接受 BTC 支付。',
                marketImpact: 'BTC 單日暴跌 10%，名人風險首次被正視。',
                riskState: '敘事反轉',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：Tesla 公告當日 BTC 跳空高開，隨後持續上漲至 $58,000，但 5 月環保爭議引發大幅回調。',
                interpretation: {
                    whatItMeans: '企業配置是重要的需求端訊號，但單一企業的決策變化也會帶來相應風險。',
                    whatToWatch: '關注企業季報中的加密資產持倉變化與管理層態度。'
                }
            }
        },

        historicalComparison: {
            event: 'MicroStrategy 購買比特幣',
            similarity: '兩者都開創了企業配置比特幣的先例，但 MicroStrategy 的態度更為堅定持久。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '警惕名人效應',
                desc: '名人推文造成的價格波動往往是短期噪音，不宜追高殺低。'
            },
            {
                type: 'check',
                label: '追蹤企業持倉',
                desc: '關注上市公司 10-K/10-Q 文件中的加密資產持倉披露。'
            }
        ]
    },
    {
        id: 'review-coinbase-ipo-2021',
        slug: 'coinbase',
        title: '2021 Coinbase 直接上市：加密產業納入主流金融',
        year: 2021,
        importance: 'A',
        tags: ['IPO', '合規', '利多出盡', '頂部訊號'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2021-04-01',
        eventEndAt: '2021-04-30',
        reactionStartAt: '2021-04-14',  // Direct listing day
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactedTokens: ['BTC', 'COIN'],
        maxDrawdown: '-50%',
        recoveryDays: '200 Days',
        impactSummary: '上市日即頂部，合規里程碑往往是利多出盡的信號。',

        usageGuide: [
            '當加密企業申請 IPO 時',
            '當市場對合規里程碑反應過熱時'
        ],

        summary: '當 Coinbase 以 850 億美元估值直接上市時，加密產業正式被納入美股主流敘事，但也呈現了典型的「利多出盡」結構。',

        context: {
            what: 'Coinbase 選擇直接上市而非傳統 IPO，開盤價 $381，估值達 850 億美元。',
            narrative: '市場將此視為加密產業的「成人禮」，預期更多投資者將透過股票市場間接參與加密資產。',
            realImpact: '上市當日成為短期高點，隨後股價持續下跌，顯示市場已提前定價。'
        },

        initialState: {
            price: 'BTC 約 $64,000，處於週期高點',
            fearGreed: '極度貪婪 (78) - 市場情緒過熱'
        },

        misconceptions: [
            {
                myth: '上市代表價格會繼續漲',
                fact: '重大事件往往是「利多出盡」的轉折點，Coinbase 上市日正好是 BTC 的短期高點。'
            },
            {
                myth: 'Coinbase 股價與 BTC 正相關',
                fact: '短期內高度相關，但 Coinbase 還受到監管、競爭、用戶增長等因素影響。'
            }
        ],

        timeline: [
            {
                date: '2021-04-14',
                title: 'Coinbase 直接上市',
                description: 'COIN 在 NASDAQ 開始交易，開盤價 $381，盤中最高 $429。',
                marketImpact: 'BTC 當日創下 $64,800 歷史新高，隨後開始回調。',
                riskState: '利多出盡',
                riskLevel: 'high'
            },
            {
                date: '2021-04-18',
                title: '週末閃崩',
                description: 'BTC 週末跌破 $52,000，顯示市場過度槓桿。',
                marketImpact: '超過 80 億美元合約被清算，市場開始去槓桿。',
                riskState: '槓桿清洗',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：Coinbase 上市當日 BTC 創下 $64,800 高點，隨後開始長達兩個月的回調。',
                interpretation: {
                    whatItMeans: '重大合規里程碑往往已被市場提前定價，事件發生日通常是高點。',
                    whatToWatch: '觀察衍生品持倉量與資金費率，識別過熱風險。'
                }
            }
        },

        historicalComparison: {
            event: '2024 比特幣 ETF 通過',
            similarity: '兩者都是合規里程碑，且都呈現「利多出盡」的短期價格結構。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '識別利多出盡',
                desc: '當市場對已知事件過度期待時，事件發生往往是賣點。'
            },
            {
                type: 'check',
                label: '監測槓桿水平',
                desc: '資金費率持續正向偏高時，需警惕回調風險。'
            }
        ]
    },
    {
        id: 'review-el-salvador-2021',
        slug: 'el-salvador',
        title: '2021 薩爾瓦多：比特幣成為法定貨幣',
        year: 2021,
        importance: 'A',
        tags: ['國家採用', '法規', '利多出盡', '預期落地'],
        marketStates: ['觀望', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2021-09-01',
        eventEndAt: '2021-09-15',
        reactionStartAt: '2021-09-07',  // Law takes effect
        reactionType: 'external_shock',

        // Trading Perspective
        type: 'policy_regulation',
        impactedTokens: ['BTC'],
        maxDrawdown: '-18%',
        recoveryDays: '30 Days',
        impactSummary: '國家級採用雷聲大雨點小，執行日的閃崩提醒了現實與敘事的落差。',

        usageGuide: [
            '當國家層級的比特幣政策出台時',
            '當評估國家採用對市場的實際影響時'
        ],

        summary: '當薩爾瓦多成為全球首個將比特幣列為法定貨幣的國家時，它創造了歷史，但也揭示了國家級採用的複雜性與短期對價格的有限影響。',

        context: {
            what: '薩爾瓦多《比特幣法》於 9 月 7 日生效，所有企業必須接受 BTC 支付（有能力時）。',
            narrative: '市場期待這是多米諾骨牌的第一張，更多國家將跟進採用。',
            realImpact: '生效當日 BTC 閃崩 18%，顯示市場反應複雜。至今僅有少數小國跟進。'
        },

        initialState: {
            price: 'BTC 約 $52,000，處於 5 月崩盤後的反彈階段',
            fearGreed: '貪婪 (70) - 市場情緒偏熱'
        },

        misconceptions: [
            {
                myth: '國家採用會立即推高價格',
                fact: '薩爾瓦多採用當日 BTC 閃崩 18%，顯示市場對執行細節與風險的重新評估。'
            },
            {
                myth: '更多國家會快速跟進',
                fact: '至今跟進的僅有中非共和國等少數小國，主權國將 BTC 納入法幣的門檻極高。'
            }
        ],

        timeline: [
            {
                date: '2021-06-09',
                title: '法案通過',
                description: '薩爾瓦多國會以絕對多數通過《比特幣法》。',
                marketImpact: '市場短暫興奮，BTC 當日小幅上漲。',
                riskState: '敘事啟動',
                riskLevel: 'low'
            },
            {
                date: '2021-09-07',
                title: '法律生效',
                description: '《比特幣法》正式生效，政府推出 Chivo 錢包並發放 $30 等值 BTC。',
                marketImpact: 'BTC 當日閃崩 18% 至 $43,000，市場反應與預期相反。',
                riskState: '預期落空',
                riskLevel: 'high'
            },
            {
                date: '2021-09-20',
                title: '價格回穩',
                description: '市場消化閃崩後回穩，BTC 重回 $45,000 上方。',
                marketImpact: '國家採用敘事被重新評估，長期影響有限。',
                riskState: '情緒平復',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：法律生效當日閃崩 18%，是典型的「預期與現實落差」案例。',
                interpretation: {
                    whatItMeans: '國家採用是長期利多，但短期執行困難與市場過熱可能帶來反向波動。',
                    whatToWatch: '觀察採用國的實際 BTC 交易量與民眾接受度。'
                }
            }
        },

        historicalComparison: {
            event: 'Coinbase 直接上市',
            similarity: '兩者都是「利多出盡」的案例，重大事件落地當日反而成為短期高點或引發回調。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '區分敘事與現實',
                desc: '國家採用是長期敘事，短期價格反應往往與預期相反。'
            },
            {
                type: 'check',
                label: '評估執行細節',
                desc: '法律通過不等於成功執行，需觀察實際採用情況。'
            }
        ]
    },
    // ===== 2022 Events =====
    {
        id: 'review-celsius-2022',
        slug: 'celsius',
        title: '2022 Celsius 破產：CeFi 借貸平台的擠兌模板',
        year: 2022,
        importance: 'A',
        tags: ['CeFi', '擠兌', '借貸危機', '流動性枯竭'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2022-06-01',
        eventEndAt: '2022-07-15',
        reactionStartAt: '2022-06-12',  // Withdrawals paused
        reactionType: 'trust_collapse',

        // Trading Perspective
        type: 'leverage_cleanse',
        impactedTokens: ['CEL', 'ETH'],
        maxDrawdown: '-40%',
        recoveryDays: '800+ Days',
        impactSummary: 'CeFi 借貸平台挪用資產導致擠兌，揭開了機構去槓桿的序幕。',

        usageGuide: [
            '當 CeFi 平台傳出流動性問題時',
            '當借貸平台提供異常高收益時'
        ],

        summary: '當 Celsius 宣佈暫停提款時，它成為 LUNA 崩盤後信用緊縮連鎖反應的第一個大型受害者，也為 CeFi 借貸危機提供了標準案例。',

        context: {
            what: 'Celsius 擁有超過 100 億美元 AUM 的加密借貸平台，因流動性枯竭暫停提款，隨後申請破產。',
            narrative: '用戶相信 Celsius 的「銀行級安全」與穩定高收益承諾。',
            realImpact: '暴露了 CeFi 借貸平台的不透明運營、過度槓桿與資產錯配風險。'
        },

        initialState: {
            price: 'BTC 約 $28,000，熊市情緒籠罩',
            fearGreed: '極度恐懼 (12) - 市場信心崩潰'
        },

        misconceptions: [
            {
                myth: 'CeFi 比 DeFi 更安全',
                fact: 'CeFi 的不透明性使其更難評估真實風險，Celsius 的資產錯配直到破產才被揭露。'
            },
            {
                myth: '高收益有保障',
                fact: 'Celsius 承諾的高利率來自高風險策略（如 stETH 質押），市場下跌時流動性枯竭。'
            }
        ],

        timeline: [
            {
                date: '2022-06-12',
                title: '暫停提款',
                description: 'Celsius 宣佈暫停所有提款、轉帳與兌換功能，理由是「極端市場條件」。',
                marketImpact: 'BTC 跌破 $24,000，市場恐慌加劇。',
                riskState: '流動性斷裂',
                riskLevel: 'high'
            },
            {
                date: '2022-06-18',
                title: 'stETH 折價擴大',
                description: 'Celsius 持有大量 stETH，其對 ETH 的折價擴大至 6%，無法快速變現。',
                marketImpact: 'ETH 跌破 $1,000，連鎖清算加速。',
                riskState: '資產錯配暴露',
                riskLevel: 'high'
            },
            {
                date: '2022-07-13',
                title: '申請破產',
                description: 'Celsius 正式申請 Chapter 11 破產保護。',
                marketImpact: '市場已大致消化利空，價格築底。',
                riskState: '信用事件確認',
                riskLevel: 'medium'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：Celsius 暫停提款期間 BTC 從 $28,000 跌至 $18,000，信用緊縮全面爆發。',
                interpretation: {
                    whatItMeans: 'CeFi 借貸平台的流動性危機會傳導至整體市場。',
                    whatToWatch: '當 stETH 等流動性質押代幣出現異常折價時，需警惕連鎖清算。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：Celsius 暫停提幣引發新一輪恐慌，FGI 再度跌入極度恐慌區間。',
                interpretation: {
                    whatItMeans: '機構破產引發的恐慌會延長熊市的築底時間。',
                    whatToWatch: '恐慌指數的反覆築底是熊市中後期的特徵。'
                }
            }
        },

        historicalComparison: {
            event: 'Mt.Gox 倒閉',
            similarity: '兩者都是用戶將資產託管給中心化機構後遭遇流動性危機，再次驗證「Not your keys, not your coins」。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '質疑高收益來源',
                desc: 'CeFi 的高利率通常伴隨高風險策略，需了解收益如何產生。'
            },
            {
                type: 'check',
                label: '分散託管風險',
                desc: '不要將大量資產長期存放在單一 CeFi 平台。'
            },
            {
                type: 'check',
                label: '關注流動性指標',
                desc: '觀察平台相關資產（如 stETH）的折溢價變化。'
            }
        ]
    },
    {
        id: 'review-3ac-2022',
        slug: '3ac',
        title: '2022 三箭資本 (3AC) 清算：高槓桿基金的爆倉連鎖',
        year: 2022,
        importance: 'A',
        tags: ['對沖基金', '高槓桿', '連鎖清算', '機構爆倉'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2022-06-15',
        eventEndAt: '2022-07-01',
        reactionStartAt: '2022-06-15',  // Rumors of insolvency start
        reactionType: 'trust_collapse',

        // Trading Perspective
        type: 'leverage_cleanse',
        impactedTokens: ['BTC', 'ETH'],
        maxDrawdown: '-35%',
        recoveryDays: '600+ Days',
        impactSummary: '百億基金爆倉引發連鎖清算，多個借貸平台因此破產。',

        usageGuide: [
            '當聽聞大型基金面臨流動性問題時',
            '當市場出現連鎖清算跡象時'
        ],

        summary: '當曾管理超過 100 億美元的三箭資本因 LUNA 崩盤與過度槓桿而爆倉時，它引發了波及 BlockFi、Voyager 等多個機構的連鎖清算。',

        context: {
            what: '三箭資本 (3AC) 是亞洲最大的加密對沖基金之一，因 LUNA 持倉與高槓桿策略在熊市中資不抵債。',
            narrative: '市場曾認為 3AC 是「聰明錢」，其持倉被視為市場風向標。',
            realImpact: 'Su Zhu 和 Kyle Davies 的過度自信與槓桿最終導致整個產業的信用緊縮，多家借貸機構因 3AC 違約而破產。'
        },

        initialState: {
            price: 'BTC 約 $22,000，處於 LUNA 崩盤後的延續下跌中',
            fearGreed: '極度恐懼 (10) - 市場陷入恐慌'
        },

        misconceptions: [
            {
                myth: '大型基金不會爆倉',
                fact: '規模大不等於風險低，3AC 的高槓桿策略在極端行情下完全暴露。'
            },
            {
                myth: '機構違約只影響機構',
                fact: '3AC 的違約引發借貸平台 BlockFi、Voyager、Genesis 的連鎖危機，最終影響散戶。'
            }
        ],

        timeline: [
            {
                date: '2022-06-15',
                title: '資不抵債傳言',
                description: '市場開始傳出 3AC 無法滿足追加保證金要求的消息。',
                marketImpact: '恐慌情緒蔓延，BTC 跌破 $22,000。',
                riskState: '信用風險升溫',
                riskLevel: 'high'
            },
            {
                date: '2022-06-27',
                title: '法院下令清算',
                description: '英屬維爾京群島法院下令清算 3AC。',
                marketImpact: '利空落地，市場開始評估連鎖影響範圍。',
                riskState: '清算確認',
                riskLevel: 'high'
            },
            {
                date: '2022-07-05',
                title: 'Voyager 申請破產',
                description: 'Voyager Digital 因 3AC 違約申請破產，連鎖效應開始。',
                marketImpact: '市場意識到 3AC 違約的影響遠超預期。',
                riskState: '連鎖傳導',
                riskLevel: 'high'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：3AC 清算期間 BTC 在 $19,000-$22,000 區間劇烈波動，市場情緒極度恐懼。',
                interpretation: {
                    whatItMeans: '大型機構的槓桿爆倉會引發連鎖反應，影響範圍往往超出預期。',
                    whatToWatch: '觀察借貸平台是否出現異常提款限制或利率變化。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：3AC 的倒閉揭露了機構間的連環槓桿，市場情緒在恐慌中持續低迷。',
                interpretation: {
                    whatItMeans: '去槓桿過程中的情緒修復極為緩慢。',
                    whatToWatch: '在連環爆雷期間，恐慌指數失去對短期價格的指導意義，轉為反映長期信心匱乏。'
                }
            }
        },

        historicalComparison: {
            event: 'LTCM 1998 年危機',
            similarity: '兩者都是高槓桿對沖基金因過度自信而崩潰，都引發了產業範圍的信用緊縮。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '辨識系統性風險',
                desc: '當機構違約消息出現時，優先評估連鎖影響範圍。'
            },
            {
                type: 'check',
                label: '追蹤交易對手風險',
                desc: '了解自己使用的平台是否與問題機構有借貸關係。'
            },
            {
                type: 'check',
                label: '保持流動性',
                desc: '熊市持有現金或穩定幣，等待連鎖清算結束。'
            }
        ]
    },
    // ===== 2023 Events =====
    {
        id: 'review-sec-coinbase-2023',
        slug: 'sec-coinbase',
        title: '2023 SEC 起訴 Coinbase：監管清算之戰',
        year: 2023,
        importance: 'A',
        tags: ['監管', 'SEC', '合規', '壓力測試'],
        marketStates: ['觀望', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2023-06-01',
        eventEndAt: '2023-06-15',
        reactionStartAt: '2023-06-06',  // SEC files lawsuit
        reactionType: 'external_shock',

        // Trading Perspective
        type: 'policy_regulation',
        impactedTokens: ['BTC', 'COIN'],
        maxDrawdown: '-5%',
        recoveryDays: '7 Days',
        impactSummary: 'SEC 對合規龍頭的起訴標誌著監管執法時代的全面來臨。',

        usageGuide: [
            '當 SEC 對加密企業提起訴訟時',
            '當美國監管態度出現重大轉變時'
        ],

        summary: '當 SEC 起訴 Coinbase 經營未註冊證券交易所時，美國監管對加密產業的態度從「灰色地帶」正式轉向「執法優先」。',

        context: {
            what: 'SEC 指控 Coinbase 經營未註冊的證券交易所、經紀商與清算機構，涉及多個代幣。',
            narrative: '市場長期認為 Coinbase 作為上市公司與最合規的交易所，應該是監管的「安全區」。',
            realImpact: '此案將決定美國對加密資產證券性的判定標準，影響整個產業的合規策略。'
        },

        initialState: {
            price: 'BTC 約 $26,000，處於熊市築底階段',
            fearGreed: '恐懼 (35) - 市場對監管不確定性感到擔憂'
        },

        misconceptions: [
            {
                myth: 'Coinbase 會因上市公司身份而免責',
                fact: 'SEC 明確表示，上市並不代表業務合規，IPO 審查與證券法執行是不同程序。'
            },
            {
                myth: '訴訟會立即導致 Coinbase 關閉',
                fact: '法律程序耗時數年，Coinbase 可持續運營同時積極抗辯。'
            }
        ],

        timeline: [
            {
                date: '2023-06-06',
                title: 'SEC 正式起訴',
                description: 'SEC 提交訴狀，指控 Coinbase 違反證券法。',
                marketImpact: 'COIN 股價下跌 12%，BTC 短暫回調 5%。',
                riskState: '監管壓力升溫',
                riskLevel: 'medium'
            },
            {
                date: '2023-06-07',
                title: 'Coinbase CEO 回應',
                description: 'Brian Armstrong 發推表示將積極抗辯，強調公司一直尋求監管明確性。',
                marketImpact: '市場情緒稍微平復，開始評估長期影響。',
                riskState: '對峙確認',
                riskLevel: 'medium'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：SEC 起訴消息對 BTC 價格影響有限，市場更關注 Coinbase 個股與合規風險。',
                interpretation: {
                    whatItMeans: '單一交易所的監管訴訟不會摧毀整個市場，但會影響美國市場的長期發展。',
                    whatToWatch: '追蹤案件進展與法院對「什麼是證券」的判定。'
                }
            }
        },

        historicalComparison: {
            event: 'Ripple vs SEC 案件',
            similarity: '兩案都涉及 SEC 對加密資產證券性的判定，法院裁決將成為重要先例。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '追蹤案件進展',
                desc: '法院裁決將直接影響美國加密監管框架。'
            },
            {
                type: 'alert',
                label: '評估代幣風險',
                desc: 'SEC 起訴書中列出的代幣可能面臨更大的監管壓力。'
            }
        ]
    },
    {
        id: 'review-ripple-2023',
        slug: 'xrp-ruling',
        title: '2023 Ripple 案裁決：代幣證券性的切分判定',
        year: 2023,
        importance: 'A',
        tags: ['監管', 'SEC', 'XRP', '軋空'],
        marketStates: ['修復', '過熱'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2023-07-01',
        eventEndAt: '2023-07-20',
        reactionStartAt: '2023-07-13',  // Judge Torres ruling
        reactionType: 'external_shock',

        // Trading Perspective
        type: 'policy_regulation',
        impactedTokens: ['XRP'],
        maxDrawdown: '-15%',
        recoveryDays: '60 Days',
        impactSummary: '法院對證券性的切分裁決引發山寨幣暴漲，但法律戰仍未終結。',

        usageGuide: [
            '當法院對代幣證券性做出裁決時',
            '當需要理解「銷售場景」對證券判定的影響時'
        ],

        summary: '當法官裁定 XRP 在二級市場銷售不構成證券時，為「代幣本身 vs 代幣銷售方式」的區分提供了重要法律先例。',

        context: {
            what: '紐約南區法院 Torres 法官裁定：Ripple 向機構投資者銷售 XRP 構成證券發行，但在交易所的二級市場銷售不構成證券。',
            narrative: '市場將此視為 SEC「監管過度」敘事的挫敗。',
            realImpact: '裁決提供了「銷售場景區分」的法律框架，但案件仍在上訴中，最終結果未定。'
        },

        initialState: {
            price: 'XRP 約 $0.47，因案件不確定性長期受壓',
            fearGreed: '中性 (50) - 市場等待裁決'
        },

        misconceptions: [
            {
                myth: 'XRP 被判定為「不是證券」',
                fact: '裁決是區分銷售場景，機構銷售仍被判定違反證券法，只有二級市場交易不構成證券發行。'
            },
            {
                myth: '此案為所有代幣定性',
                fact: '法院裁決僅適用於 XRP 案件事實，其他代幣需個案判定。'
            }
        ],

        timeline: [
            {
                date: '2023-07-13',
                title: 'Torres 法官裁決',
                description: '法官對機構銷售與二級市場銷售做出區分判定。',
                marketImpact: 'XRP 當日暴漲 70%，市場將其視為產業勝利。',
                riskState: '利多衝擊',
                riskLevel: 'medium'
            },
            {
                date: '2023-07-14',
                title: '山寨幣跟漲',
                description: '被 SEC 點名的代幣（SOL、ADA、MATIC）跟隨上漲。',
                marketImpact: '市場暫時解讀為監管壓力緩解。',
                riskState: '敘事擴散',
                riskLevel: 'medium'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：BTC 在 Ripple 裁決日小幅上漲，主要受益者是 XRP 與被 SEC 起訴的代幣。',
                interpretation: {
                    whatItMeans: '監管裁決會影響特定代幣的風險評估，但對 BTC 影響有限。',
                    whatToWatch: '關注 SEC 是否上訴以及其他案件的法院裁決。'
                }
            }
        },

        historicalComparison: {
            event: 'SEC vs Howey (1946)',
            similarity: '兩案都涉及「什麼是證券」的定義，Ripple 案為數位資產時代提供了新的判定框架。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '理解裁決範圍',
                desc: '裁決區分銷售場景，不代表所有代幣都「不是證券」。'
            },
            {
                type: 'alert',
                label: '追蹤上訴進展',
                desc: 'SEC 可能上訴，最終結果需等待上級法院確認。'
            }
        ]
    },
    {
        id: 'review-binance-cz-2023',
        slug: 'cz',
        title: '2023 Binance/CZ 認罪和解：全球最大交易所的合規大考',
        year: 2023,
        importance: 'S',
        featuredRank: 9,
        tags: ['交易所', '合規', '利空出盡', '和解'],
        marketStates: ['觀望', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 6,
        isProOnly: false,
        publishedAt: '2025-12-16',
        updatedAt: '2025-12-16',
        eventStartAt: '2023-11-15',
        eventEndAt: '2023-11-30',
        reactionStartAt: '2023-11-21',  // DOJ settlement announced
        reactionType: 'external_shock',

        // Trading Perspective
        type: 'exchange_event',
        impactedTokens: ['BNB'],
        maxDrawdown: '-4%',
        recoveryDays: '3 Days',
        impactSummary: '以歷史性罰款換取持續運營，最大交易所的合規轉型消除了重大尾部風險。',

        usageGuide: [
            '當全球性交易所面臨多國監管壓力時',
            '當評估交易所合規風險對市場的影響時'
        ],

        summary: '當 Binance 同意支付 43 億美元和解金且 CZ 辭去 CEO 並認罪時，全球最大交易所完成了代價慘痛但必要的合規轉型。',

        context: {
            what: '美國司法部 (DOJ) 與財政部就反洗錢與制裁違規與 Binance 達成 43 億美元和解，CZ 認罪並辭職。',
            narrative: '市場一度擔心這是「FTX 2.0」——監管壓力將導致交易所崩潰。',
            realImpact: 'Binance 選擇和解而非對抗，保全了運營，但支付了歷史性的罰款並接受長期監管。'
        },

        initialState: {
            price: 'BTC 約 $37,000，處於年度反彈後的高位整理',
            fearGreed: '貪婪 (65) - 市場情緒偏熱'
        },

        misconceptions: [
            {
                myth: 'Binance 會像 FTX 一樣倒閉',
                fact: 'FTX 是挪用用戶資產的詐欺，Binance 是合規問題。兩者本質不同，Binance 選擇認罪和解保全運營。'
            },
            {
                myth: 'CZ 下台會導致 Binance 崩潰',
                fact: 'Binance 作為全球最大交易所，運營團隊成熟，CEO 更替不影響日常運營。'
            }
        ],

        timeline: [
            {
                date: '2023-11-21',
                title: 'DOJ 和解公告',
                description: 'Binance 同意支付 43 億美元和解金，CZ 辭去 CEO 並認罪。',
                marketImpact: 'BTC 短暫下跌 3%，市場迅速消化利空。',
                riskState: '利空落地',
                riskLevel: 'medium'
            },
            {
                date: '2023-11-22',
                title: '市場恢復',
                description: '市場認定 Binance 將持續運營，恐慌情緒消退。',
                marketImpact: 'BTC 回升至 $37,000 上方，確認利空出盡。',
                riskState: '信心修復',
                riskLevel: 'low'
            },
            {
                date: '2023-11-30',
                title: 'Richard Teng 接任 CEO',
                description: '前區域合規官 Richard Teng 接任 CEO，強調合規優先。',
                marketImpact: '市場對 Binance 新領導層反應正面。',
                riskState: '轉型開始',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：和解消息僅造成 3% 短暫回調，市場迅速將其解讀為「利空出盡」。',
                interpretation: {
                    whatItMeans: '已知的合規問題落地和解，通常是利空出盡而非危機開始。',
                    whatToWatch: '觀察 Binance 後續儲備證明 (PoR) 與用戶流量變化。'
                }
            }
        },

        historicalComparison: {
            event: 'FTX 破產',
            similarity: '兩者都是大型交易所危機，但性質不同：FTX 是詐欺，Binance 是合規。市場反應也截然不同。'
        },

        actionableChecklist: [
            {
                type: 'check',
                label: '區分合規問題與詐欺',
                desc: '合規問題可透過罰款和解解決，詐欺則導致崩潰。'
            },
            {
                type: 'check',
                label: '追蹤儲備證明',
                desc: '關注 Binance PoR 報告，確認資產充足。'
            },
            {
                type: 'alert',
                label: '分散交易所風險',
                desc: '即使是最大交易所也可能面臨監管風險，不宜過度集中。'
            }
        ]
    },
    {
        id: 'yen-carry-trade-crash-2024',
        slug: 'yen-carry',
        title: '2024 日圓套利崩盤：黑色星期一',
        year: 2024,
        type: 'macro_shock',
        impactSummary: '日銀升息引發全球去槓桿，比特幣暴跌 25%',
        importance: 'S',
        featuredRank: 1,
        tags: ['宏觀衝擊', '黑天鵝', 'V型反轉', '流動性危機'],
        marketStates: ['崩跌', '極恐', '修復'],
        relatedMetrics: ['price', 'fearGreed', 'oi'],
        readingMinutes: 8,
        isProOnly: false,
        publishedAt: '2024-08-10T00:00:00Z',
        updatedAt: '2024-08-10T00:00:00Z',
        eventStartAt: '2024-07-31T00:00:00Z',
        eventEndAt: '2024-08-10T00:00:00Z',
        reactionStartAt: '2024-08-05T00:00:00Z',
        reactionType: 'external_shock',
        impactedTokens: ['BTC', 'ETH', 'SOL'],
        maxDrawdown: '-25%',
        recoveryDays: '7 Days',
        usageGuide: [
            '當宏觀利率發生劇烈變化時參考',
            '理解「套利交易解除 (Carry Trade Unwind)」的威力',
            '學習如何應對 V 型反轉的極端行情'
        ],
        summary: '日本央行意外升息，導致長期藉由低利日圓進行的套利交易瞬間解除 (Unwind)。全球股市與加密貨幣同步閃崩，比特幣單日重挫 25% 跌破 $50,000，隨後在日銀副總裁安撫下 V 型反轉。',
        context: {
            what: '日圓套利交易 (Yen Carry Trade) 解除',
            narrative: '美國經濟衰退擔憂 (Sahm Rule) 疊加日銀鷹派升息，導致全球借日圓買資產的資金被迫清算償債。',
            realImpact: '標普 500 單日大跌 3%，日經指數暴跌 12% (超越 1987 黑色星期一)。比特幣因流動性最好，成為首要提款機。'
        },
        initialState: {
            price: '$58,000 -> $49,000',
            fearGreed: '17 (極度恐慌)',
            oi: '-25% (解槓桿)',
            funding: '負費率 (極度看空)'
        },
        misconceptions: [
            {
                myth: '加密貨幣本身出問題了',
                fact: '這是宏觀流動性危機，所有風險資產 (股票、黃金、Crypto) 都在跌，與 Crypto 基本面無關。'
            },
            {
                myth: '牛市結束了',
                fact: '流動性衝擊造成的急跌通常是槓桿清洗，而非週期結束。V 轉證明了買盤強勁。'
            }
        ],
        timeline: [
            {
                date: '2024-07-31',
                title: '日本央行升息',
                description: '日銀意外將利率從 0.1% 上調至 0.25%，日圓開始走強，套利成本上升。',
                marketImpact: '市場開始動盪，聰明錢開始去槓桿。',
                riskState: '變盤前夕',
                riskLevel: 'medium'
            },
            {
                date: '2024-08-02',
                title: '非農數據疲軟',
                description: '美國失業率觸發薩姆規則 (Sahm Rule)，引發衰退恐慌。',
                marketImpact: '美股大跌，恐慌情緒蔓延。',
                riskState: '恐慌升溫',
                riskLevel: 'high'
            },
            {
                date: '2024-08-05',
                title: '黑色星期一',
                description: '亞洲開盤日股熔斷，全球資產遭無差別拋售。BTC 觸及 $49,000。',
                marketImpact: '全網爆倉 10 億美元，流動性枯竭。',
                riskState: '崩盤',
                riskLevel: 'high'
            },
            {
                date: '2024-08-06',
                title: '日銀投降',
                description: '日銀副總裁內田真一表示「市場不穩定時不會升息」。',
                marketImpact: '日圓回落，風險資產報復性反彈，BTC 重回 $56,000。',
                riskState: 'V型反彈',
                riskLevel: 'medium'
            }
        ],
        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：典型的 V 型反轉，黑色星期一 (Aug 5) 創下極端低點後迅速回升。',
                interpretation: {
                    whatItMeans: '流動性驅動的崩盤通常創造黃金坑 (Golden Pit)。',
                    whatToWatch: '日圓匯率 (USD/JPY) 若再度急升，風險資產將承壓。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：恐懼貪婪指數單日驟降至 17 (極度恐慌)，為 2024 年最低點之一。',
                interpretation: {
                    whatItMeans: '極度恐慌往往是反向指標。',
                    whatToWatch: '當指數在 24 小時內從極恐反彈，確認底部。'
                }
            },
            oi: {
                url: '',
                caption: '圖表解讀：未平倉合約 (OI) 單日蒸發 25%，槓桿被徹底清洗。',
                interpretation: {
                    whatItMeans: 'OI 的急劇下降代表市場槓桿出清，車變輕了。',
                    whatToWatch: 'OI 是否隨價格緩步回升（健康），還是快速堆積（危險）。'
                }
            },
            // Macro chart specific request
            stablecoin: {
                url: '',
                caption: '圖表解讀：日本央行升息 (0.1% -> 0.25%) 與美日利差縮小，引發套利平倉海嘯。',
                interpretation: {
                    whatItMeans: '全球資金成本上升，借便宜日圓買比特幣的邏輯逆轉。',
                    whatToWatch: 'USD/JPY 匯率 140 關卡保衛戰。'
                }
            }
        },
        historicalComparison: {
            event: '2020 312 崩盤',
            similarity: '都是宏觀流動性衝擊導致的無差別拋售，隨後都迎來了強勁的 V 型反轉與新高。'
        },
        actionableChecklist: [
            {
                type: 'alert',
                label: '關注宏觀數據',
                desc: '日圓匯率與美聯儲利率政策是 2024 的核心變數。'
            },
            {
                type: 'check',
                label: '急跌時勇於接刀',
                desc: '若是因外部流動性導致的急跌，且基本面未變，通常是極佳買點。'
            }
        ]
    },
    {
        id: 'german-govt-selloff-2024',
        slug: 'german-selloff',
        title: '2024 德國政府拋售：國家級賣壓',
        year: 2024,
        type: 'supply_shock',
        impactSummary: '德國政府拋售 5 萬枚 BTC，市場承受 30 億美元賣壓',
        importance: 'A',
        tags: ['供給衝擊', '政府拋售', '鏈上監控'],
        marketStates: ['觀望', '修復'],
        relatedMetrics: ['etfFlow', 'price'],
        readingMinutes: 5,
        isProOnly: false,
        publishedAt: '2024-07-15T00:00:00Z',
        updatedAt: '2024-07-15T00:00:00Z',
        eventStartAt: '2024-06-19T00:00:00Z',
        eventEndAt: '2024-07-12T00:00:00Z',
        reactionStartAt: '2024-07-08T00:00:00Z',
        reactionType: 'trust_collapse',
        impactedTokens: ['BTC'],
        maxDrawdown: '-16%',
        recoveryDays: '3 Days',
        usageGuide: [
            '學習如何分析鏈上大額轉移',
            '理解供應衝擊 (Supply Shock) 的短期影響'
        ],
        summary: '德國薩克森邦政府在三週內將查扣的 50,000 枚比特幣（約 30 億美元）全數拋售至交易所，引發市場恐慌，比特幣一度跌至 $53,000，但隨後因賣壓解除而迅速反彈。',
        context: {
            what: '德國政府充公資產拍賣',
            narrative: 'Movie2k 盜版網站案查扣的 5 萬枚 BTC，政府選擇直接市價拋售換現，而非長期持有。',
            realImpact: '市場不僅要承接 MT.GOX 賠付預期，又增加了 30 億美元的實盤賣壓。'
        },
        initialState: {
            price: '$65,000 -> $53,000',
            fearGreed: '26 (恐慌)',
            etfFlow: '淨流出 (情緒受影響)'
        },
        misconceptions: [
            {
                myth: '德國政府看空比特幣',
                fact: '這只是司法程序的標準資產處置流程，並非國家戰略性的看空操作 (雖然被嘲笑賣飛)。'
            }
        ],
        timeline: [
            {
                date: '2024-06-19',
                title: '開始小額轉移',
                description: '鏈上偵測到德國政府錢包開始向交易所轉入 BTC。',
                marketImpact: '市場開始猜測拋售計畫。',
                riskState: '疑慮',
                riskLevel: 'low'
            },
            {
                date: '2024-07-08',
                title: '賣壓高峰',
                description: '每日數千枚 BTC 轉入交易所，價格承受最大壓力觸及 $53,500。',
                marketImpact: '散戶恐慌殺跌。',
                riskState: '恐慌',
                riskLevel: 'medium'
            },
            {
                date: '2024-07-12',
                title: '清倉完畢',
                description: '德國政府錢包餘額歸零。',
                marketImpact: '賣壓正式解除，價格當日反彈至 $58,000。',
                riskState: '利空出盡',
                riskLevel: 'low'
            }
        ],
        chartConfig: {
            symbol: 'BTC',
            daysBuffer: 90
        },
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：價格下跌與德國政府轉幣至交易所的時間點完全吻合 (On-chain Logic)。',
                interpretation: {
                    whatItMeans: '一旦政府錢包歸零，剛性賣壓解除，價格失去下跌動力。',
                    whatToWatch: 'Arkham 標記的政府實體錢包餘額變化。'
                }
            },
            flow: {
                url: '',
                caption: '圖表解讀：ETF 資金在恐慌期間呈現淨流出，但在賣壓結束後迅速轉為淨流入。',
                interpretation: {
                    whatItMeans: '機構資金也會受到情緒影響而暫時觀望。',
                    whatToWatch: 'ETF 淨流入是否連續 3 日轉正。'
                }
            }
        },
        historicalComparison: {
            event: 'Mt. Gox 賠付',
            similarity: '都是非基本面的供應衝擊。但德國是主動市價砸盤，Mt. Gox 是分發給債權人（不一定賣），德國的影響更直接但更短暫。'
        },
        actionableChecklist: [
            {
                type: 'check',
                label: '監控鏈上數據',
                desc: '使用 Arkham 等工具追蹤大戶錢包流向，能提前預知賣壓。'
            },
            {
                type: 'alert',
                label: '不要過度反應',
                desc: '一次性的供應衝擊 (One-off Supply Shock) 通常是買入機會。'
            }
        ]
    },
    {
        id: 'iran-israel-flash-crash-2024',
        slug: 'iran-conflict',
        title: '2024 伊朗攻擊以色列：地緣政治閃崩',
        year: 2024,
        type: 'geopolitics',
        impactSummary: '地緣衝突引發週末流動性閃崩',
        importance: 'B',
        tags: ['地緣政治', '閃崩', '恐慌拋售'],
        marketStates: ['崩跌', '修復'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 4,
        isProOnly: false,
        publishedAt: '2024-04-15T00:00:00Z',
        updatedAt: '2024-04-15T00:00:00Z',
        eventStartAt: '2024-04-13T00:00:00Z',
        eventEndAt: '2024-04-15T00:00:00Z',
        reactionStartAt: '2024-04-13T00:00:00Z',
        reactionType: 'external_shock',
        impactedTokens: ['BTC'],
        maxDrawdown: '-15%',
        recoveryDays: '2 Days',
        sparklineData: [
            70000, 69000, 68000, 67000, 66000, // Pre-crash
            62000, 60800, // Crash (Wick)
            63000, 64000, 65000, 66000 // Recovery
        ],
        usageGuide: [
            '觀察週末流動性不足時的極端波動',
            '理解比特幣在戰爭初期的「風險資產」屬性'
        ],
        summary: '伊朗向以色列發射無人機與導彈，報復使館被炸。消息在週末流動性稀薄時傳出，比特幣作為唯一 24/7 交易的資產遭恐慌拋售，瞬間暴跌 8%，反而黃金代幣 (PAXG) 對比特幣溢價大漲。',
        context: {
            what: '中東地緣衝突升級',
            narrative: 'WW3 擔憂重燃。',
            realImpact: '實際上衝突並未進一步擴大，市場反應過度。'
        },
        initialState: {
            price: '$67,000 -> $60,800',
            fearGreed: '72 -> 55',
            stablecoin: 'PAXG 溢價 20%'
        },
        misconceptions: [
            {
                myth: '比特幣是避險資產',
                fact: '在流動性危機初期，比特幣通常被視為風險資產先被拋售換現，之後才可能展現避險屬性。'
            }
        ],
        timeline: [
            {
                date: '2024-04-13',
                title: '無人機攻擊消息傳出',
                description: '週六深夜傳出伊朗發射無人機。',
                marketImpact: 'BTC 30 分鐘內暴跌 $5,000 點。',
                riskState: '崩盤',
                riskLevel: 'high'
            },
            {
                date: '2024-04-14',
                title: '防禦成功',
                description: '以色列攔截絕大多數導彈，美國呼籲克制。',
                marketImpact: '恐慌消退，價格企穩。',
                riskState: '修復',
                riskLevel: 'medium'
            }
        ],
        charts: {
            main: {
                url: '',
                caption: '圖表解讀：週末流動性不足 (Low Liquidity) 時，地緣政治消息引發的下殺往往有長下影線。',
                interpretation: {
                    whatItMeans: '週末的恐慌拋售通常是反應過度，週一開盤機構回歸後常有修復。',
                    whatToWatch: '衝突是否真的升級（如石油禁運），否則僅為且戰且走。'
                }
            }
        },
        historicalComparison: {
            event: '2022 俄烏戰爭爆發',
            similarity: '開戰瞬間比特幣都先跌，隨後因避險需求或利空出盡而上漲。'
        },
        actionableChecklist: [
            {
                type: 'alert',
                label: '週末操作需謹慎',
                desc: '週末做市商休假，深度差，容易發生閃崩。'
            }
        ]
    },
    // ================================================
    // 2021/05 槓桿崩盤 - 多殺多
    // ================================================
    {
        id: 'review-2021-05',
        slug: '2021-may-crash',
        title: '2021/05 519 崩盤：槓桿多頭的終極清洗',
        year: 2021,
        importance: 'S',
        featuredRank: 2,
        tags: ['流動性危機', '多殺多', '監管重拳', '負費率'],
        behaviorTags: ['連鎖爆倉', '流動性枯竭', '恐慌拋售', 'V型反轉'],
        marketStates: ['極度恐懼', '去槓桿', '崩跌'],
        relatedMetrics: ['funding', 'oi', 'liquidation', 'fearGreed'],
        readingMinutes: 10,
        isProOnly: false,
        publishedAt: '2025-12-25',
        updatedAt: '2025-12-25',
        eventStartAt: '2021-05-10', // Musk tweet
        eventEndAt: '2021-07-20',   // Bottom formation
        reactionStartAt: '2021-05-19', // The Crash Day
        reactionType: 'liquidity_crisis',

        // Trading Perspective
        type: 'leverage_cleanse',
        impactSummary: '長期正費率 + 擁擠 OI，典型的「多殺多」流動性螺旋，BTC 單日腰斬。',
        impactedTokens: ['BTC', 'ETH', 'DOGE', 'SHIB', 'MATIC'], // Altcoins were heavy
        maxDrawdown: '-54%', // 64k -> 29k
        recoveryDays: '184 Days', // Until Nov ATH
        sparklineData: [
            57000, 58000, 56000, 55000, 54000, 49000, 48000, 46000, 43000, // Pre-crash
            37000, 30000, // The Crash (Wick)
            35000, 38000, 36000, 34000, 35000, 33000, 32000, 31000, 29000, // Bottoming
            32000, 34000, 38000, 40000, 42000 // Recovery
        ],

        usageGuide: [
            '當全網 OI 處於歷史高位且 Funding Rate 持續 > 0.03% 時，市場極度脆弱。',
            '消息面（如 Musk 推文）只是導火索，真正的跌幅來自「連鎖爆倉」的流動性真空。',
            '在流動性危機 (Liquidity Crisis) 中，價格會跌穿所有技術支撐，直到合約持倉被徹底清洗。'
        ],

        summary: '2021 年 5 月 19 日，加密貨幣市場經歷了歷史上最慘烈的單日崩盤之一。在長達數月的 Funding Rate 正費率與迷因幣 (Doge/Shib) 狂熱後，Elon Musk 的推文與中國監管禁令成為壓垮駱駝的稻草，引發了高達百億美元的連鎖爆倉。這不僅是一次價格修正，更是一次經典的「槓桿大清洗 (The Great Deleveraging)」，教導了市場關於流動性缺口的殘酷一課。',

        context: {
            what: 'Elon Musk 宣布 Tesla 暫停比特幣支付，隨後中國三大協會發布加密貨幣禁令。',
            narrative: '當時市場普遍沉浸在「機構進場」的牛市敘事中，認為 $50,000 是堅不可摧的鐵底。零售投資人瘋狂追逐 Doge 等 Altcoins，忽視了比特幣在高位盤整時的量能萎縮與籌碼派發跡象。市場對於「利空」完全鈍化，處於典型的「安全錯覺 (Illusion of Safety)」階段。',
            realImpact: '實際上，市場結構早已搖搖欲墜。高額的 Funding Rate 意味著多頭每天需支付巨額成本來維持倉位。當價格跌破關鍵的 $45,000 支撐位時，引發了第一波停損，隨後在 $40,000 與 $30,000 觸發了大規模的強平單，導致買盤簿 (Orderbook) 瞬間被擊穿，價格在數小時內腰斬。'
        },

        initialState: {
            price: '$58,000 (高位盤整)',
            fearGreed: '70+ (Greed)',
            funding: '持續 > 0.05% (極度過熱)',
            oi: '$12B+ (當時的歷史高位)',
            liquidation: '平日僅 $200M',
            stablecoin: '流入趨緩'
        },

        misconceptions: [
            {
                myth: '是因為中國禁令才跌這麼多',
                fact: '禁令只是催化劑。高達 50% 的跌幅來自於「槓桿連鎖爆倉」，市場結構本身的脆弱性（高 OI、擁擠交易）才是主因。'
            },
            {
                myth: '跌到 $30,000 就能馬上 V 轉創新高',
                fact: '流動性重創後的修復期極長。519 後市場經歷了長達兩個月的「底部磨底 (Bottoming)」，直到 7 月底才真正確認反轉。'
            }
        ],

        timeline: [
            {
                date: '2021 Feb-Apr',
                title: 'T-Phase ❶: 醞釀期 (Build-up)',
                description: 'BTC 在 60k 附近量縮盤整，但 Altcoins 狂飛。',
                marketImpact: 'OI 持續攀升，主力開始在高位派發籌碼 (Distribution)。',
                riskState: '結構脆弱',
                riskLevel: 'medium'
            },
            {
                date: '2021-05-08',
                title: 'T-Phase ❷: 預期泡沫 (Pre-FOMO)',
                description: 'Doge 上 SNL 節目，零售情緒達到頂峰。',
                marketImpact: 'Funding Rate 飆升，市場誤以為「牛市永不回頭」。',
                riskState: '極度貪婪',
                riskLevel: 'high'
            },
            {
                date: '2021-05-12',
                title: 'T-Phase ❸: 引爆點 (Trigger)',
                description: '!!! Elon Musk: Tesla Suspends BTC !!!',
                marketImpact: '一小時內重挫 10%，多頭信心出現第一道裂痕。',
                riskState: '警報響起',
                riskLevel: 'high'
            },
            {
                date: '2021-05-19',
                title: 'T-Phase ❹: 恐慌清算 (Flush)',
                description: '中國禁令傳出，BTC 跌破 40k 引發連環爆倉。',
                marketImpact: '單日爆倉 $88億，價格插針至 $30,000 (Crash Point)。',
                riskState: '流動性危機',
                riskLevel: 'extreme'
            },
            {
                date: '2021 May-Jul',
                title: 'T-Phase ❺: 底部構築 (Bottoming)',
                description: '多次下探 29k，市場情緒極度低迷。',
                marketImpact: 'Funding 為負，空頭過度擁擠，籌碼從弱手轉移至強手。',
                riskState: '絕望磨底',
                riskLevel: 'medium'
            },
            {
                date: '2021-07-25',
                title: 'T-Phase ❻: 修復期 (Recovery)',
                description: '空頭擠壓 (Short Squeeze) 突破 40k。',
                marketImpact: '確認底部結構完成，進入下半場牛市 (New Regime)。',
                riskState: '趨勢反轉',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTCUSDT',
            daysBuffer: 90 // Unified Long Window [-90, +180] context
        },

        charts: {
            main: {
                url: '/images/reviews/519-main.png',
                caption: 'BTC 價格日線圖：從高位派發到 519 閃崩插針的完整結構。',
                interpretation: {
                    whatItMeans: '圖中標示了紅色的 D0 事件點，以及下影線的 $30,000 Liquidity Flush 點位。',
                    whatToWatch: '注意 60k 附近的多次頂背離，以及 519 當日的歷史天量。'
                }
            },
            funding: {
                url: '/images/reviews/519-funding.png',
                caption: '資金費率 (Funding Rate) 變化圖。',
                interpretation: {
                    whatItMeans: '崩盤前費率長期 > 0.05% (紅色高危區)，崩盤後迅速轉為負值 (綠色機會區)。',
                    whatToWatch: '當費率從「極正」轉為「極負」，通常是短期底部的最強訊號。'
                }
            },
            liquidation: {
                url: '/images/reviews/519-liquidation.png',
                caption: '全網爆倉量 (Total Liquidations)。',
                interpretation: {
                    whatItMeans: '519 當日爆倉柱狀圖創下歷史新高 ($8.8B)，代表槓桿徹底清洗。',
                    whatToWatch: '這種極端柱狀圖通常標誌著「Max Pain」已過。'
                }
            },
            oi: {
                url: '/images/reviews/519-oi.png',
                caption: '合約持倉量 (Open Interest)。',
                interpretation: {
                    whatItMeans: 'OI 在 24 小時內腰斬 (-50%)，這是典型的「去槓桿」特徵。',
                    whatToWatch: 'OI 暴跌但價格不再創新低，是底部背離的訊號。'
                }
            },
            sentiment: {
                url: '/images/reviews/519-fgi.png',
                caption: '恐懼貪婪指數 (Fear & Greed)。',
                interpretation: {
                    whatItMeans: '指數從 70+ 直接跳水至 10，市場情緒瞬間結凍。',
                    whatToWatch: '在 10 附近滯留超過 30 天，通常是長線買點。'
                }
            }
        },

        historicalComparison: {
            event: '2020/03 COVID (312)',
            similarity: '兩者本質都是「流動性危機」。價格下跌觸發爆倉，爆倉進一步推低價格 (螺旋下跌)。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '費率過熱警報',
                desc: '當 Funding Rate > 0.03% 持續一週以上，應主動降低槓桿，無論新聞面多好。',
                citation: { label: 'Funding Heatmap', href: '/indicators/funding-rate' }
            },
            {
                type: 'check',
                label: '流動性缺口確認',
                desc: '看到價格插針 (Wick) 且伴隨歷史天量時，不要急著殺跌，那通常是流動性釋放的終點。'
            },
            {
                type: 'insight',
                label: '消息面與結構',
                desc: '記住：壞消息 (新聞) 只是點燃炸藥 (高槓桿結構) 的火柴。結構比消息更重要。'
            }
        ]
    },
    // ================================================
    // 2024/03 新高回調
    // ================================================
    {
        id: 'review-2024-03',
        slug: '2024-ath-pullback',
        title: '2024/03 73k 回調：ETF 買盤 vs 槓桿過熱',
        year: 2024,
        importance: 'A',
        featuredRank: 4,
        tags: ['歷史新高', '槓桿清洗', 'ETF', '結構性回調'],
        behaviorTags: ['高位盤整', '量價背離', '假突破', '多頭陷阱'],
        marketStates: ['過熱', '修復', '橫盤'],
        relatedMetrics: ['etfFlow', 'funding', 'oi', 'price'],
        readingMinutes: 6,
        isProOnly: false,
        publishedAt: '2025-12-25',
        updatedAt: '2025-12-25',
        eventStartAt: '2024-03-01', // Runup
        eventEndAt: '2024-05-15',   // Consolidation end
        reactionStartAt: '2024-03-14', // ATH Day
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactSummary: 'ETF 強勁買盤推動新高，但高達 0.08% 的年化資金費率顯示過熱，需透過深幅回調清洗合約槓桿。',
        impactedTokens: ['BTC', 'ETH', 'SOL', 'MEME'],
        maxDrawdown: '-23%', // 73.7k -> 56.5k
        recoveryDays: '67 Days', // Until May breakout attempt
        sparklineData: [
            61000, 64000, 68000, 71000, 72000, 73700, // Pre-ATH
            68000, 64000, 62000, 60800, // First Leg Down
            65000, 67000, 64000, 60000, 56500, // Second Leg (Bottom)
            58000, 61000, 63000, 65000 // Recovery
        ],

        usageGuide: [
            '當價格創歷史新高 (ATH) 但 ETF 淨流入開始減緩時。',
            '當 Funding Rate 超過 0.05% 且 OI 創歷史新高時，回調機率 > 80%。',
            '牛市中的回調通常是「分批買入」的機會，而非熊市的開始 (Buy the Dip)。'
        ],

        summary: '2024 年 3 月，比特幣展現了前所未有的強勢，在減半前即創下 $73,777 的歷史新高。這背後是貝萊德 (IBIT) 等 ETF 的驚人買盤推動。然而，合約市場的貪婪程度也隨之飆升，Funding Rate 一度達到年化 100%。市場不得不經歷一場長達兩個月的「時間換空間」修正，透過 -23% 的回調來清洗過度槓桿化的多頭，重新建立健康的籌碼結構。',

        context: {
            what: '比特幣史上首次在減半前突破歷史前高 (ATH)。',
            narrative: '「這次不一樣 (This time is different)」。市場認為 ETF 的持續買盤將帶來永不回頭的超級週期。',
            realImpact: '雖然 ETF 提供了底層支撐，但合約市場的過度槓桿 (Leverage) 仍需物理釋放。這次回調證明了即使有機構買盤，市場規律（去槓桿）依然有效。'
        },

        initialState: {
            price: '$73,777 (New ATH)',
            fearGreed: '88 (極度貪婪)',
            funding: '0.08% (極度過熱)',
            oi: '$36B (歷史新高)',
            etfFlow: '單日流入 $1B (峰值)',
            stablecoin: '流入趨緩'
        },

        misconceptions: [
            {
                myth: 'ETF 買盤會吃掉所有賣單，不會再有大跌',
                fact: '合約市場規模遠大於現貨 ETF。當多頭清算發生時，機械式的市價拋售 (Market Sell) 能夠輕易擊穿 ETF 的掛單牆。'
            },
            {
                myth: '減半前下跌代表牛市結束',
                fact: '歷史上每次減半前後都會有「減半回調 (Halving Pullback)」，這是健康的籌碼換手，為了減半後的供應衝擊做準備。'
            }
        ],

        timeline: [
            {
                date: '2024 Feb-Mar',
                title: 'T-Phase ❶: 醞釀期 (Build-up)',
                description: 'ETF 買盤瘋狂湧入，BTC 從 42k 直衝 70k。',
                marketImpact: '空頭被全數軋空，市場進入單邊上漲模式。',
                riskState: '極度貪婪',
                riskLevel: 'medium'
            },
            {
                date: '2024-03-12',
                title: 'T-Phase ❷: 預期泡沫 (Pre-FOMO)',
                description: 'Funding Rate 飆升至 0.08%，零售大舉進場。',
                marketImpact: 'Coinbase 出現當機，顯示散戶情緒過熱。',
                riskState: '過熱警戒',
                riskLevel: 'high'
            },
            {
                date: '2024-03-14',
                title: 'T-Phase ❸: 引爆點 (Trigger)',
                description: 'PPI 數據高於預期 + 日本升息傳言。',
                marketImpact: '觸及 73.7k 後無力上攻，美股開盤後 ETF 流入不如預期。',
                riskState: '動能減弱',
                riskLevel: 'high'
            },
            {
                date: '2024-03-19',
                title: 'T-Phase ❹: 恐慌清算 (Flush)',
                description: 'BTC 跌破 65k 關鍵支撐。',
                marketImpact: '單日爆倉 $6億，價格下探 $60,800 (Crash Point)。',
                riskState: '去槓桿',
                riskLevel: 'extreme'
            },
            {
                date: '2024-04-30',
                title: 'T-Phase ❺: 二次探底 (Bottoming)',
                description: '香港 ETF 上線利多出盡，價格再次下殺至 56.5k。',
                marketImpact: '徹底清洗了 60k 上方的最後一批多頭槓桿。',
                riskState: '絕望磨底',
                riskLevel: 'medium'
            },
            {
                date: '2024-05-15',
                title: 'T-Phase ❻: 結構修復 (Recovery)',
                description: 'CPI 數據優於預期，價格重回 66k。',
                marketImpact: 'ETF 重新恢復淨流入，確認調整結束。',
                riskState: '趨勢重啟',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTCUSDT',
            daysBuffer: 90 // Quarterly view
        },

        charts: {
            main: {
                url: '/images/reviews/2024-ath-main.png',
                caption: 'BTC 日線圖：新高後的 ABC 修正波結構。',
                interpretation: {
                    whatItMeans: '明顯的 73k 假突破，隨後進入兩個月的旗型整理 (Bull Flag)。',
                    whatToWatch: '56k 的Wick Low 是這次回調的絕對底部 (Max Pain)。'
                }
            },
            etfFlow: {
                url: '/images/reviews/2024-ath-etf.png',
                caption: '比特幣現貨 ETF 淨流量。',
                interpretation: {
                    whatItMeans: '在回調期間，ETF 流入顯著停滯甚至轉為流出 (GBTC 拋壓主導)。',
                    whatToWatch: '當 IBIT 與 FBTC 重新出現 >$100M 的單日流入時。'
                }
            },
            funding: {
                url: '/images/reviews/2024-ath-funding.png',
                caption: '資金費率冷卻過程。',
                interpretation: {
                    whatItMeans: '費率從由紅 (0.05%+) 轉綠 (0.01%)，代表槓桿泡沫已消除。',
                    whatToWatch: '費率長期維持中性是慢牛的基礎。'
                }
            },
            oi: {
                url: '/images/reviews/2024-ath-oi.png',
                caption: '合約持倉量變化。',
                interpretation: {
                    whatItMeans: 'OI 在 73k 時創歷史新高，隨後在 56k 回落至健康水位。',
                    whatToWatch: 'OI 是否隨價格緩步回升（健康），而非急劇飆升（投機）。'
                }
            }
        },

        historicalComparison: {
            event: '2020/11 突破 20k 前的震盪',
            similarity: '都是在突破歷史新高前後的劇烈洗盤，為了甩轎不堅定的籌碼。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '費率過高不追多',
                desc: '當 Funding Rate 年化超過 50% 時，市場回調風險極高，此時適合套保而非做多。',
                citation: { label: 'Funding Rates', href: '/indicators/funding-rate' }
            },
            {
                type: 'check',
                label: 'ETF 流量監控',
                desc: '關注美股開盤後 1 小時的 ETF 流量數據，這是當前市場及時的風向球。'
            },
            {
                type: 'insight',
                label: '牛市急跌',
                desc: '牛市中的急跌 (Flash Dump) 且伴隨 V 轉，通常是加倉機會，不要被波動甩下車。'
            }
        ]
    },
    // ================================================
    // 2021/11 高位接盤
    // ================================================
    {
        id: 'review-2021-11',
        slug: '2021-nov-top',
        title: '2021/11 69k 雙頂：牛市終局的頂背離',
        year: 2021,
        importance: 'S',
        featuredRank: 3,
        tags: ['頂部結構', '假突破', '量價背離', '牛市陷阱'],
        behaviorTags: ['高位出貨', '流動性誘捕', '趨勢反轉', '陰跌'],
        marketStates: ['過熱', '觀望', '崩跌'],
        relatedMetrics: ['oi', 'price', 'fearGreed', 'funding', 'etfFlow'],
        readingMinutes: 8,
        isProOnly: false,
        publishedAt: '2025-12-25',
        updatedAt: '2025-12-25',
        eventStartAt: '2021-10-20', // ETF Launch / ATH 1
        eventEndAt: '2022-01-05',   // Fed pivot confirmation
        reactionStartAt: '2021-11-10', // 69k Day
        reactionType: 'priced_in',

        // Trading Perspective
        type: 'market_structure',
        impactSummary: '典型的「量價背離」與「高位分布 (Distribution)」，OI 創新高但價格推不動，是大戶離場的鐵證。',
        impactedTokens: ['BTC', 'ETH', 'SOL', 'AVAX', 'LUNA'],
        maxDrawdown: '-77%', // 69k -> 15k (Full Bear Cycle)
        recoveryDays: '846 Days', // Until 2024 ATH
        sparklineData: [
            61000, 63000, 66000, 60000, 58000, 61000, 62000, 64000, 67000, 68000, // Pre-FOMO runup
            69000, 68500, 64000, 63000, 60000, 58000, 56000, 57000, 54000, 53000, // The Top Drop
            50000, 48000, 46000, 42000, 46000, 50000, 47000, 45000 // Bear Market start
        ],

        usageGuide: [
            '當價格創歷史新高 (ATH) 但成交量顯著萎縮時 (量價背離)。',
            '當 Funding Rate 為正，但現貨溢價 (Coinbase Premium) 持續為負（這代表散戶在買，機構在賣）。',
            '當「利多消息 (ETF/Upgrade)」落地，價格卻不漲反跌 (Sell the News)。'
        ],

        summary: '2021 年 11 月 10 日，比特幣觸及 $69,000 的歷史頂峰，但這並非新一輪上漲的開始，而是漫長熊市的起點。相比於 519 的急促崩盤，69k 是一場精密的「誘多出貨 (Distribution)」。儘管期貨 OI 創下新高，但鏈上數據顯示長期持有者 (LTH) 早在 64k 雙頂時就已開始大量拋售。這是一個關於「瘋狂與貪婪」的教訓——當所有人都喊著年底 10 萬時，往往就是派對結束的時刻。',

        context: {
            what: '美國首檔比特幣期貨 ETF (BITO) 上線與 Taproot 升級落地，市場情緒亢奮。',
            narrative: '「超級週期 (Supercycle)」理論盛行，大眾確信比特幣將在聖誕節前突破 $100,000，認為主要機構正在搶籌。',
            realImpact: '這是一場經典的「流動性誘捕」。ETF 通過成為了機構（Smart Money）能夠合法、大量做空的工具。價格雖然突破前高，但卻是縮量的「假突破 (Fakeout)」，主力利用散戶的 FOMO 情緒在高位完成了籌碼換手。'
        },

        initialState: {
            price: '$69,000 (ATH)',
            fearGreed: '84 (極度貪婪)',
            funding: '0.01% - 0.03% (雖正但未極端，顯示猶豫)',
            oi: '$23B+ (歷史新高 - 典型的頂部特徵)',
            stablecoin: '開始淨流出',
            liquidation: '低波動'
        },

        misconceptions: [
            {
                myth: '通膨高漲，比特幣是對抗通膨的最佳工具，所以只會漲',
                fact: '當聯準會 (Fed) 轉向緊縮時，所有風險資產都會被拋售。市場選擇性忽視了宏觀流動性收緊的早期訊號。'
            },
            {
                myth: 'OI 創新高代表主力強烈看漲',
                fact: '錯誤。在高位的巨量 OI 往往代表「多空分歧巨大」且「潛在賣壓沈重」。如果價格推不動，這些高位 OI 就會變成未來的燃料。'
            }
        ],

        timeline: [
            {
                date: '2021 Oct',
                title: 'T-Phase ❶: 醞釀期 (Build-up)',
                description: 'BITO ETF 通過，BTC 衝上 66k。',
                marketImpact: '看似強勢，但鏈上 LTH 淨部位開始下降 (出貨)。',
                riskState: '結構轉弱',
                riskLevel: 'medium'
            },
            {
                date: '2021-11-08',
                title: 'T-Phase ❷: 預期泡沫 (Pre-FOMO)',
                description: 'Taproot 升級前夕，Funding Rate 溫和上升。',
                marketImpact: '散戶押注升級後會有一波大漲，無視量能背離。',
                riskState: '極度貪婪',
                riskLevel: 'high'
            },
            {
                date: '2021-11-10',
                title: 'T-Phase ❸: 引爆點 (Trigger)',
                description: 'CPI 數據爆表 + Taproot 落地。',
                marketImpact: '價格觸及 69k 後迅速回落 (Sell the Fact)。',
                riskState: '頂部確認',
                riskLevel: 'extreme'
            },
            {
                date: '2021-12-04',
                title: 'T-Phase ❹: 恐慌清算 (Flush)',
                description: 'Omicron 變種病毒恐慌，引發週末深夜大閃崩。',
                marketImpact: 'BTC 從 52k 瞬間殺至 42k，頂部結構正式確立 (Structure Break)。',
                riskState: '趨勢反轉',
                riskLevel: 'extreme'
            },
            {
                date: '2022 Jan-Mar',
                title: 'T-Phase ❺: 底部構築失敗 (Fed Pivot)',
                description: 'Fed 宣布將開始升息與縮表。',
                marketImpact: '任何反彈都被視為逃命波 (Lower Highs)。',
                riskState: '陰跌',
                riskLevel: 'high'
            },
            {
                date: '2022 Throughout',
                title: 'T-Phase ❻: 熊市確認 (Bear Regime)',
                description: '進入長達一年的去槓桿週期。',
                marketImpact: '流動性枯竭，直到 FTX 事件才見終章。',
                riskState: '熊市',
                riskLevel: 'low'
            }
        ],

        chartConfig: {
            symbol: 'BTCUSDT',
            daysBuffer: 90
        },

        charts: {
            main: {
                url: '/images/reviews/69k-main.png',
                caption: 'BTC 週線圖：教科書級別的「雙頂 (Double Top)」與量價背離。',
                interpretation: {
                    whatItMeans: '4 月與 11 月形成的雙頂結構，右肩雖創新高但成交量顯著低於左肩。',
                    whatToWatch: '週線級別的 RSI 頂背離是長線離場的最強訊號。'
                }
            },
            oi: {
                url: '/images/reviews/69k-oi.png',
                caption: '合約持倉量 (Open Interest) 頂背離。',
                interpretation: {
                    whatItMeans: '價格在 11 月創新高，但 OI 相比 4 月其實並未顯著突破 (或突破後無量)。',
                    whatToWatch: '高 OI + 價格停滯 = 派發 (Distribution)。'
                }
            },
            funding: {
                url: '/images/reviews/69k-funding.png',
                caption: '資金費率與基差。',
                interpretation: {
                    whatItMeans: '不同於 519 的極端費率，69k 時費率相對溫和，顯示這不是散戶的瘋狂，而是機構的冷靜出貨。',
                    whatToWatch: 'Coinbase Premium Index (CPI) 在衝頂時轉負。'
                }
            },
            flow: {
                url: '/images/reviews/69k-flow.png',
                caption: '交易所凈流量 (Exchange Net Flow)。',
                interpretation: {
                    whatItMeans: '長期持有者 (LTH) 在 60k 上方持續將幣轉入交易所。',
                    whatToWatch: '當 LTH 轉入量創 30 日新高，通常是週期頂部。'
                }
            },
            sentiment: {
                url: '/images/reviews/69k-fgi.png',
                caption: '恐懼貪婪指數滯留高位。',
                interpretation: {
                    whatItMeans: '市場在「極度貪婪」區域停留過久，這通常是反轉的前兆。',
                    whatToWatch: '當指數無法再創新高並開始回落時。'
                }
            }
        },

        historicalComparison: {
            event: '2017/12 20k Top',
            similarity: '兩者都是期貨產品 (CME Futures / BITO ETF) 上線當日見頂。利多出盡的典型範例。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '量價背離警示',
                desc: '當價格創新高，但成交量(Volume)與 RSI 皆未創新高時，這是最強烈的賣出訊號。',
                citation: { label: 'RSI Divergence', href: '/indicators/rsi' }
            },
            {
                type: 'check',
                label: 'Sell the News 確認',
                desc: '重大歷史性利多（如 ETF 上線）落地時，若價格無法在 24H 內續強，應立即獲利了結。'
            },
            {
                type: 'insight',
                label: '機構出貨特徵',
                desc: '機構出貨通常是「陰跌」而非「暴跌」。不要期待每次頂部都有像 519 那樣的明顯信號，69k 這種溫水煮青蛙更致命。'
            }
        ]
    },
    // ================================================
    // 2022/06 去槓桿
    // ================================================
    {
        id: 'review-2022-06',
        slug: '2022-june-deleverage',
        title: '2022/06 去槓桿：3AC/Celsius 連環暴雷',
        year: 2022,
        type: 'leverage_cleanse',
        impactSummary: 'OI 持續下滑的槓桿去化期',
        importance: 'B',
        tags: ['去槓桿', '連鎖清算', '信心崩潰'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['oi', 'price', 'stablecoin'],
        readingMinutes: 4,
        isProOnly: false,
        publishedAt: '2025-12-17',
        updatedAt: '2025-12-17',
        eventStartAt: '2022-06-12',
        eventEndAt: '2022-06-18',
        reactionStartAt: '2022-06-12',
        reactionType: 'trust_collapse',
        impactedTokens: ['BTC', 'ETH', 'stETH'],
        maxDrawdown: '-40%',
        recoveryDays: '200 Days',
        usageGuide: [
            '當 OI 持續下滑配合價格下跌時',
            '當流動性危機蔓延時',
            '當穩定幣市值開始趨勢性下降時'
        ],
        summary: 'Celsius 暫停提款 + 3AC 爆倉，引發市場信任危機，BTC 跌破 $20,000 心理關卡。',
        context: {
            what: '多個 CeFi 機構連環暴雷，信任危機蔓延。',
            narrative: '熊市會很快結束。',
            realImpact: 'OI 持續下滑代表槓桿在被強制去化，趨勢短期不會反轉。'
        },
        initialState: {
            price: '$28,000 → $17,500',
            fearGreed: '25（恐懼）→ 6（極度恐懼）',
            oi: '持續下滑'
        },
        misconceptions: [
            {
                myth: 'OI 下降代表空頭被清算，利多',
                fact: '熊市中 OI 下降通常代表多頭在被清算，是趨勢延續訊號。'
            }
        ],
        timeline: [
            {
                date: '2022-06-12',
                title: 'Celsius 暫停提款',
                description: '引發市場恐慌。',
                marketImpact: 'BTC 跌破 $25,000。',
                riskState: '信任危機',
                riskLevel: 'high'
            },
            {
                date: '2022-06-18',
                title: 'BTC 跌破 $20,000',
                description: '3AC 傳出爆倉消息。',
                marketImpact: '歷史性心理關卡失守。',
                riskState: '恐慌頂點',
                riskLevel: 'high'
            }
        ],
        charts: {
            main: { url: '', caption: 'OI 持續下滑 = 槓桿去化未結束' },
            oi: {
                url: '',
                caption: '圖表解讀：OI 呈現階梯式下降，每一波下跌都伴隨大規模平倉。',
                interpretation: {
                    whatItMeans: '去槓桿過程往往緩慢且痛苦。',
                    whatToWatch: 'OI 何時止跌回穩，才是真正的底部。'
                }
            },
            stablecoin: {
                url: '',
                caption: '圖表解讀：穩定幣市值見頂回落，流動性開始抽離。',
                interpretation: {
                    whatItMeans: '流動性縮減是熊市持續的根本原因。',
                    whatToWatch: '市值何時止跌回升，才是牛市起點。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：FGI 在個位數極度恐慌區徘徊長達數週。'
            },

        },
        historicalComparison: {
            event: '2020/03 COVID',
            similarity: '都是流動性危機型的去槓桿過程。'
        },
        actionableChecklist: [
            { type: 'alert', label: '去槓桿警示', desc: 'OI 持續下滑時不要抄底。' }
        ]
    },
    // ================================================
    // 2023/03 極端偏空反彈
    // ================================================
    {
        id: 'review-2023-03',
        slug: '2023-march-squeeze',
        title: '2023/03 極端偏空反彈：銀行危機意外利多',
        year: 2023,
        type: 'leverage_cleanse',
        impactSummary: '極端偏空後的情緒反轉型反彈',
        importance: 'B',
        tags: ['銀行危機', '軋空', '避險屬性'],
        marketStates: ['修復', '觀望'],
        relatedMetrics: ['funding', 'fearGreed', 'price'],
        readingMinutes: 3,
        isProOnly: false,
        publishedAt: '2025-12-17',
        updatedAt: '2025-12-17',
        eventStartAt: '2023-03-10',
        eventEndAt: '2023-03-20',
        reactionStartAt: '2023-03-10',
        reactionType: 'external_shock',
        impactedTokens: ['BTC'],
        maxDrawdown: '-20%',
        recoveryDays: '14 Days',
        usageGuide: [
            '當多空比極端偏空時（< 0.7）',
            '當傳統金融出現危機時'
        ],
        summary: '矽谷銀行倒閉引發銀行危機，反而推動 BTC 作為「替代金融」敘事上漲 40%。',
        context: {
            what: '美國銀行危機爆發，SVB 倒閉。',
            narrative: 'BTC 會跟著銀行股崩盤。',
            realImpact: '極端偏空被軋，BTC 從 $20,000 飆升至 $28,000。'
        },
        initialState: {
            price: '$20,000 → $28,000',
            fearGreed: '30 → 65',
            funding: '負費率轉正'
        },
        misconceptions: [
            {
                myth: '銀行危機對加密貨幣是利空',
                fact: '傳統金融信任危機反而強化了去中心化敘事。'
            }
        ],
        timeline: [
            {
                date: '2023-03-10',
                title: 'SVB 倒閉',
                description: 'USDC 一度脫鉤。',
                marketImpact: 'BTC 短暫下跌後開始反彈。',
                riskState: '恐慌',
                riskLevel: 'high'
            },
            {
                date: '2023-03-15',
                title: '空頭被軋',
                description: '費率轉正，空頭開始回補。',
                marketImpact: 'BTC 突破 $25,000。',
                riskState: '反轉',
                riskLevel: 'low'
            }
        ],
        charts: {
            main: { url: '', caption: '極端偏空 + 外部衝擊 = 軋空反彈' },
            oi: {
                url: '',
                caption: '圖表解讀：OI 在上漲初期並未顯著增加，這是典型的空頭回補（軋空）特徵。',
                interpretation: {
                    whatItMeans: '上漲動力來自於空頭買回，而非新多頭進場。',
                    whatToWatch: '當 OI 開始重新增加時，反彈變為趨勢。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：FGI 快速反彈，確認了恐慌的底。'
            },
            longShort: {
                url: '',
                caption: '圖表解讀：反彈初期多空比極低 (<0.7)，顯示市場極度看空，隨後被迫回補。',
                interpretation: {
                    whatItMeans: '低多空比 + 價格上漲 = 軋空強勢特徵。',
                    whatToWatch: '空頭回補後的趨勢延續性。'
                }
            }
        },
        historicalComparison: {
            event: '2020/03 COVID 反彈',
            similarity: '都是恐慌後的 V 型反轉。'
        },
        actionableChecklist: [
            { type: 'alert', label: '極端偏空', desc: '多空比 < 0.7 時觀察反彈機會。' }
        ]
    }
];

export const getFeaturedReviews = () => {
    return REVIEWS_DATA.filter(r => r.featuredRank !== undefined).sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));
};

export const getReviewBySlug = (slug: string) => {
    return REVIEWS_DATA.find(r => r.slug === slug);
};

export const getReview = (slug: string, year?: string | number) => {
    if (year) {
        return REVIEWS_DATA.find(r => r.slug === slug && r.year === Number(year));
    }
    return REVIEWS_DATA.find(r => r.slug === slug);
};

export const getReviewsByYear = (year: number) => {
    return REVIEWS_DATA.filter(r => r.year === year).sort((a, b) => new Date(a.reactionStartAt).getTime() - new Date(b.reactionStartAt).getTime());
};

export const getReviewsByTag = (tag: string) => {
    return REVIEWS_DATA.filter(r => r.tags.includes(tag));
};

export const getRelatedReviews = (currentState: MarketState) => {
    return REVIEWS_DATA.filter(r => r.marketStates.includes(currentState)).slice(0, 3);
};

import { LucideIcon, Wallet, GraduationCap, BarChart2, Calendar, LineChart, Shield, Trophy } from 'lucide-react'

// ==========================================
// Types
// ==========================================

export type QuizOption = {
    id: string
    text: string
    isCorrect: boolean
}

export type QuizQuestion = {
    id: string
    type: 'basic' | 'image' | 'scenario' | 'calculation'
    question: string
    image?: string // Path to image if needed
    options: QuizOption[]
    explanation: {
        text: string
        cta?: {
            label: string
            href: string
            type: 'internal' | 'external'
        }
    }
}

export type Quiz = {
    id: string
    title: string
    description: string
    questions: QuizQuestion[]
    rewardBadge?: string
}


export type ContentBlock =
    | { type: 'text', content: string }
    | { type: 'callout', title?: string, content: string, icon?: string, variant: 'info' | 'warning' | 'tip' }
    | { type: 'image', src: string, caption?: string }
    | { type: 'key-point', title: string, points: string[] }

export type LearnChapter = {
    id: string
    title: string
    blocks: ContentBlock[] // Changed from content: string to blocks
    practice: string
    cta: {
        label: string
        href: string
        type: 'internal' | 'external'
    }
    quiz: Quiz
}

export type LearnLevel = {
    id: string
    level: number
    title: string
    description: string
    icon: LucideIcon
    chapters: LearnChapter[]
}

// ==========================================
// Data: Level 0 - 6
// ==========================================

const LEARN_LEVELS = [
    {
        id: 'level-0',
        level: 0,
        title: '新手村：Web3 第一步',
        description: '別急著賺錢，先學會怎麼不虧錢。搞懂錢包、詐騙與基本觀念。',
        icon: "Wallet",
        chapters: [
            {
                id: 'l0-c1',
                title: '錢包 101：熱錢包 vs 冷錢包',
                blocks: [
                    {
                        type: 'text',
                        content: `### 進入 Web3 的第一張門票
想要擁有比特幣或以太幣，你可以選擇放在交易所代管，也可以放在屬於自己的數位錢包。請記住一個核心觀念：錢包並不是像存錢筒一樣把幣存在裡面，它真正儲存的是你的私鑰，也就是動用資產的唯一權限。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '熱錢包 (Hot Wallet)',
                        content: `只要是連著網路的錢包軟體，都統稱為熱錢包。它的優勢在於方便快速，可以隨時隨地進行交易或連接去中心化應用程式 (DApp)。
常見的例子包括 Metamask (小狐狸)、Trust Wallet 以及 OKX Web3 Wallet。雖然好用，但因為長期連網，如果你的設備中了木馬病毒，資產就有被駭客轉走的風險。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '冷錢包 (Cold Wallet)',
                        content: `冷錢包通常是一個類似 USB 的實體硬體裝置。它的核心晶片永遠不會接觸網路，因此駭客無法透過網路攻擊竊取你的私鑰。
常見品牌有 Ledger、Trezor 和 OneKey。這就像是你數位資產的保險箱，雖然操作上需要按實體按鈕比較麻煩，且需要購買成本，但對於長期儲存大額資產來說，這是最安全的選擇。`
                    },
                    {
                        type: 'text',
                        content: `簡單的配置建議：將日常操作的小額資金放在熱錢包，方便靈活使用；而將不想動用的大額身家鎖在冷錢包中，確保資產安全無虞。`
                    },
                    {
                        type: 'key-point',
                        title: '新手建議 🌱',
                        points: [
                            '如果是幾萬塊以內的小錢，使用熱錢包或放在大型交易所即可，重點是學習操作體驗。',
                            '如果是關乎身家的大錢，強烈建議購買硬體冷錢包，物理隔絕網路駭客。',
                            '下載錢包 App 時務必檢查是否為官方正版，絕對不要點擊搜尋引擎最上方的廣告連結，那很高機率是釣魚程式。'
                        ]
                    }
                ],
                practice: '是時候建立你的數位身分了。請去官方商店下載 OKX Web3 錢包或 Metamask，並按照步驟創建一個新的錢包地址。',
                cta: {
                    label: '下載 OKX Web3 錢包',
                    href: 'https://www.okx.com/web3',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c1',
                    title: '錢包種類隨堂考',
                    description: '選擇適合你的儲存方式',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '小明剛買了 10 顆比特幣準備放到退休 (HODL)，他應該存在哪裡最安全？',
                            options: [
                                { id: 'a', text: '熱錢包 (Metamask)', isCorrect: false },
                                { id: 'b', text: '冷錢包 (硬體錢包)', isCorrect: true },
                                { id: 'c', text: '放在交易所不領出來', isCorrect: false }
                            ],
                            explanation: {
                                text: '對於長期持有且金額龐大的資產，冷錢包 (Cold Wallet) 提供物理級別的網路隔離，是目前公認最安全的儲存方式。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c2',
                title: '資安核心：私鑰與助記詞',
                blocks: [
                    {
                        type: 'text',
                        content: `### 掌握最高權限
在區塊鏈的世界裡，沒有銀行客服可以幫你重設密碼。你需要認識兩個最重要的概念：
*   私鑰 (Private Key)：這就像是你銀行的印鑑章。任何擁有私鑰的人，都可以直接轉走錢包裡的所有資產。私鑰通常是一長串複雜的亂碼。
*   助記詞 (Seed Phrase)：為了讓你方便抄寫和備份，系統會將私鑰轉換成 12 或 24 個簡單的英文單字。`
                    },
                    {
                        type: 'text',
                        content: `請銘記在心：助記詞等於你的私鑰，也等於你的錢。誰擁有了這組助記詞，誰就是這個錢包真正的主人。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '死亡筆記本規則 💀',
                        content: `1. 絕對不要截圖：手機相簿通常會自動同步到雲端，駭客會用 AI 掃描雲端照片中的助記詞。
2. 絕對不要透過通訊軟體傳送：LINE、Messenger 或 Email 都有可能被監控或攔截。
3. 唯一的備份方式：用手寫。拿一張紙抄下來，檢查確認無誤後，鎖在抽屜或保險箱裡。`
                    }
                ],
                practice: '現在拿出紙筆，找出你剛剛創建錢包時的助記詞 (或在設定中查看)，重新檢查一次你是否抄寫正確。別忘了，這張紙比你的信用卡更重要。',
                cta: {
                    label: '了解更多資安知識',
                    href: 'https://www.okx.com/learn/security',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c2',
                    title: '助記詞安全測驗',
                    description: '這題錯了真的會破產',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '你在使用某個去中心化與 application (DApp) 時，網頁彈出視窗要求你輸入「助記詞」來連線，你該？',
                            options: [
                                { id: 'a', text: '輸入，因為是連線需求', isCorrect: false },
                                { id: 'b', text: '馬上關閉網頁，這是釣魚網站', isCorrect: true },
                                { id: 'c', text: '輸入一半看看', isCorrect: false }
                            ],
                            explanation: {
                                text: '正規的 DApp (如 Uniswap, OpenSea) 只會要求你「連接錢包 (Connect Wallet)」，絕對不會要求你輸入助記詞。只要看到網頁要你填助記詞，百分之百是詐騙。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c3',
                title: 'CEX vs DEX：交易所大戰',
                blocks: [
                    {
                        type: 'text',
                        content: `### 中心化與去中心化的抉擇
剛進入幣圈，你會接觸到兩種截然不同的交易場所：

中心化交易所 (CEX)
像 Binance、OKX 或台灣的 MAX。這就像傳統銀行，你需要註冊帳號、驗證身分 (KYC)。優點是有客服支援，操作介面親民，且可以用台幣出入金。缺點是如果交易所倒閉 (如 FTX 事件)，你的資產可能會拿不回來。

去中心化交易所 (DEX)
像 Uniswap、Curve。這就像自動販賣機，沒有客服、不需要註冊，僅憑錢包連線即可交易。優點是完全匿名且資產由自己掌控，缺點是操作門檻較高，若自己操作失誤 (如轉錯鏈) 無人能救。`
                    },
                    {
                        type: 'key-point',
                        title: '最佳組合建議 ✅',
                        points: [
                            '新手使用 CEX (如 OKX) 進行台幣與 USDT 的兌換，操作最便捷。',
                            '進階後可以用 DEX 去探索那些還沒上大交易所的潛力幣種。',
                            '獲利豐厚時，記得將資產轉回自己的冷錢包妥善保存。'
                        ]
                    }
                ],
                practice: '打開你的交易所 App (CEX) 看看它的介面，再用錢包瀏覽器打開 Uniswap (DEX) 連接錢包，感受兩者操作邏輯的巨大差異。',
                cta: {
                    label: '註冊 OKX (CEX 首選)',
                    href: 'https://www.okx.com/join/CTWPRO',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c3',
                    title: '交易所選擇題',
                    description: '搞懂你的交易場所',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '如果我忘記了登入密碼，哪一種交易所可以找客服幫我重設？',
                            options: [
                                { id: 'a', text: 'CEX (中心化交易所)', isCorrect: true },
                                { id: 'b', text: 'DEX (去中心化交易所)', isCorrect: false },
                            ],
                            explanation: {
                                text: 'CEX 就像銀行，有中心化的客服團隊可以協助你重設密碼。DEX 則是完全去中心化的代碼，你是自己銀行的行長，一旦弄丟私鑰，沒有任何人能幫你找回。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c4',
                title: '穩定幣：幣圈的美元與台幣',
                blocks: [
                    {
                        type: 'text',
                        content: `### 為什麼我們需要穩定幣？
比特幣的價格波動劇烈，今天能買一個漢堡，明天可能只能買包薯條。為了讓加密貨幣能作為價值儲存與交易的媒介，穩定幣 (Stablecoin) 應運而生。
它們的價值通常錨定法定貨幣 (主要是美金)，維持 1 穩定幣約等於 1 美金的匯率。`
                    },
                    {
                        type: 'text',
                        content: `目前市場上的三大主流：
1. USDT (Tether)：歷史最悠久，市值最大，流通性最好。就像幣圈的現金，幾乎所有交易對都支援它。
2. USDC (Circle)：由美國合規公司發行，強調資產儲備透明，深受 DeFi 協議與法人機構信賴。
3. DAI (MakerDAO)：透過加密資產超額抵押生成的去中心化穩定幣。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '避險港灣 ⚓️',
                        content: '當比特幣或以太幣暴跌時，投資人通常會將資產賣成穩定幣 (USDT) 暫時避險，這稱為「空倉」。這讓你在保有資金購買力的同時，等待下一次的進場機會。'
                    }
                ],
                practice: '查看目前的 USDT/TWD 匯率。你會發現它通常比銀行的美金匯率稍微貴一點點，這中間的價差我們稱為「U 溢價」。',
                cta: {
                    label: '購買 USDT',
                    href: 'https://www.okx.com/buy-crypto',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c4',
                    title: '穩定幣認知',
                    description: '你的資金避風港',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '為什麼 USDT 被稱為穩定幣？',
                            options: [
                                { id: 'a', text: '因為它的價格永遠不會變', isCorrect: false },
                                { id: 'b', text: '因為它錨定美元，價值維持在 1 USD 左右', isCorrect: true },
                                { id: 'c', text: '因為它是政府發行的', isCorrect: false }
                            ],
                            explanation: {
                                text: '穩定幣的設計目標是維持與法幣 (如美元) 1:1 的掛鉤，讓投資人在波動劇烈的加密市場中，也能有價值穩定的資產進行停泊或計價。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c5',
                title: '鏈與 Gas：為什麼轉帳會不見？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 這裡不是銀行轉帳
區塊鏈的世界由許多不同的「鏈」組成，你可以把它們想像成不同的平行宇宙。
以太坊 (Ethereum) 是一個宇宙，Solana 是另一個宇宙，波場 (Tron) 又是另一個。你不能直接把以太坊上的資產轉到 Solana 上，就像你不能拿新台幣直接在日本投幣搭公車一樣。`
                    },
                    {
                        type: 'text',
                        content: `常見的傳輸網路：
*   ERC20 (Ethereum)：最為通用但手續費 (Gas Fee) 最貴，尖峰時刻轉帳一次可能要幾十美金。
*   TRC20 (Tron)：手續費低廉，轉帳 USDT 通常只需 1 美金左右，是許多人常用的轉帳網路。
*   Solana：以速度快、費用極低著稱。
*   L2 (如 Arbitrum, Optimism)：為了幫以太坊擴容而生，繼承了安全性但費用便宜很多。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '轉帳鐵律',
                        content: '在進行提幣或轉帳時，務必確認接收方使用什麼鏈 (網路)，發送方就要選擇完全相同的鏈。如果選錯網路 (例如從 ERC20 轉到 TRC20 地址)，你的資產將會直接消失在區塊鏈的深淵中，無法找回。'
                    }
                ],
                practice: '開啟 OKX 的提幣頁面，選擇 USDT，觀察一下下拉選單中有多少種網路 (鏈) 可以選擇？比較看看它們顯示的手續費差異有多大。',
                cta: {
                    label: '去 OKX 體驗提幣介面',
                    href: 'https://www.okx.com/balance/withdrawal',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c5',
                    title: '轉帳生存題',
                    description: '這題沒過別想轉帳',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '朋友給了你一個 TRC20 的地址要你轉 USDT 給他，結果你在提幣時選了 ERC20 網路轉出。請問會發生什麼事？',
                            options: [
                                { id: 'a', text: '系統會自動幫你換鏈', isCorrect: false },
                                { id: 'b', text: '轉帳失敗，錢退回給你', isCorrect: false },
                                { id: 'c', text: '幣會消失 (卡在鏈上)，通常找不回來', isCorrect: true }
                            ],
                            explanation: {
                                text: '區塊鏈是互不相通的平行世界。選錯網路就像寄信寫錯地址且寄到了火星，你的資產會永久遺失。這是新手最常犯也最昂貴的錯誤。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l0-c6',
                title: '詐騙百科：別當肥羊',
                blocks: [
                    {
                        type: 'text',
                        content: `### 貪婪是詐騙的溫床
在這個去中心化的世界裡，沒有法規會第一時間保護你。騙子並不可怕，可怕的是你想「不勞而獲」的心態。
常見的三大詐騙手法：

1. 殺豬盤 (Pig Butchering)
通常從交友軟體開始，透過噓寒問暖建立感情，接著帶你投資加密貨幣。一開始會讓你小賺提領，等你卸下心防投入大筆資金後，平台就會關閉，人也會憑空消失。

2. 釣魚連結 (Phishing)
偽裝成官方 Email 通知你錢包異常，或是購買 Google 關鍵字廣告置頂假的交易所網站。一旦你點擊連結並授權錢包，你的資產就會被瞬間轉空。

3. 假空投 (Fake Airdrop)
你的錢包突然多了一種不知名的代幣，價值顯示好幾萬美金。當你貪心地想去網站把這些幣賣掉時，授權的過程會導致你的主資產 (ETH/USDT) 被盜走。`
                    },
                    {
                        type: 'key-point',
                        title: '防詐口訣',
                        points: [
                            '來路不明的連結絕對不點。',
                            '主動私訊教你賺錢的百分之百是詐騙。',
                            '保證獲利的投資方案一定是騙局。',
                            '天上掉下來的禮物 (空投)，往往是致命的陷阱。'
                        ]
                    }
                ],
                practice: '開啟你通訊軟體的陌生訊息過濾功能。並且時刻提醒自己：在幣圈，任何主動對你過分熱心的人，通常都是想從你身上拿到錢。',
                cta: {
                    label: '閱讀 OKX 防詐指南',
                    href: 'https://www.okx.com/learn/security',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l0-c6',
                    title: '防詐意識檢測',
                    description: '最後一道防線',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '網路上認識的「分析師」說他有內線消息，叫你把錢轉到一個特定的 App 操作，還秀出他賺幾百萬的截圖。這是？',
                            options: [
                                { id: 'a', text: '殺豬盤詐騙', isCorrect: true },
                                { id: 'b', text: '千載難逢的機會', isCorrect: false },
                                { id: 'c', text: '普通的投資建議', isCorrect: false }
                            ],
                            explanation: {
                                text: '這就是典型的殺豬盤腳本。正規的投資會在全球知名的交易所 (如 Binance, OKX) 進行，絕對不會要求你下載來路不明的 App 或匯款給個人帳戶。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-1',
        level: 1,
        title: '工具篇：交易所完全手冊',
        description: '工欲善其事，必先利其器。學會現貨、合約與網格交易。',
        icon: "GraduationCap",
        chapters: [
            {
                id: 'l1-c1',
                title: 'KYC 與出入金：把台幣變 USDT',
                blocks: [
                    {
                        type: 'text',
                        content: `### 為什麼交易所都要身分證？(KYC)
這就是所謂的 KYC (Know Your Customer)。雖然麻煩，但這是為了防止洗錢，同時也是保護你的一層保障。如果交易所不幸發生意外或倒閉，有完成實名認證的用戶才有機會透過法律途徑申訴求償。

### 入金的三條主要路徑
1. 信用卡買幣
最快，但手續費最貴 (通常 3%~5%)。除非急用，否則不推薦。

2. C2C (P2P) 交易
這是目前最主流的方式。在 OKX 等大平台上，你直接轉帳台幣給賣家，平台會鎖住對方的幣做擔保。優點是免手續費且匯率通常最好。

3. 台灣合規交易所 (如 MAX/BitoPro)
這是最保守安全的做法。你先把台幣轉帳到台灣合規的交易所帳戶，買成 USDT，再提幣轉到國際交易所。雖然步驟多了一層，但資產來源最乾淨確實。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: 'C2C 交易禁忌',
                        content: '在轉帳給賣家時，備註欄位請保持空白或只寫「一般轉帳」。絕對不要寫「比特幣」、「Crypto」、「購買 USDT」等字眼，否則銀行風控系統一旦偵測到，很高機率會直接凍結你的銀行帳戶。'
                    }
                ],
                practice: '去 OKX 的 C2C (P2P) 交易區逛逛，看看現在 1 USDT 賣多少台幣？觀察不同商家的成單量與評價，找找看有沒有「神盾商家」。',
                cta: {
                    label: '去 OKX C2C 買幣',
                    href: 'https://www.okx.com/p2p-markets/twd/buy-usdt',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c1',
                    title: '出入金安全檢測',
                    description: '防止被銀行鎖卡',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '在進行 C2C (P2P) 轉帳給賣家時，備註欄該寫什麼？',
                            options: [
                                { id: 'a', text: '購買 USDT', isCorrect: false },
                                { id: 'b', text: '比特幣投資', isCorrect: false },
                                { id: 'c', text: '什麼都不要寫，或寫真實姓名', isCorrect: true }
                            ],
                            explanation: {
                                text: '為了避免觸發銀行風控導致帳戶被凍結，絕對不要在備註提及任何加密貨幣相關字眼。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c2',
                title: '現貨 vs 合約：買蘋果 vs 賭價格',
                blocks: [
                    {
                        type: 'text',
                        content: `### 到底什麼是合約 (Futures)？
很多新手分不清楚這兩者的區別，用一個簡單的例子你就懂了：

現貨 (Spot)
你花 30 元買了一顆蘋果。這顆蘋果是你的，你可以把它帶回家、放冰箱、或是送給朋友。
*   如果蘋果漲到 50 元，你賺 20 元。
*   如果蘋果跌到 10 元，你虧 20 元，但蘋果還在。只要你不賣，就只是帳面虧損。

合約 (Futures)
你沒有買蘋果，你只是跟莊家「對賭」蘋果明天的價格。
*   你猜明天會漲，這叫「做多 (Long)」。
*   你猜明天會跌，這叫「做空 (Short)」。
*   因為你沒有真正擁有蘋果，所以如果看錯方向虧損超過了你的本金，你的單子就會被「強制平倉 (爆倉)」，本金歸零。`
                    },
                    {
                        type: 'key-point',
                        title: '新手建議',
                        points: [
                            '新手請從「現貨」開始。現貨最大的優點是不會歸零，只要幣還在，就有漲回來的希望。',
                            '合約雖然可以賺快錢 (利用槓桿)，但也是讓 90% 新手破產的元兇。',
                            '絕對不要用「身家」去玩合約。'
                        ]
                    }
                ],
                practice: '在交易所介面中切換「現貨 (Spot)」和「合約 (Perpetual)」的頁面，觀察兩者下單介面有什麼不同？(合約多了槓桿倍數的調整)',
                cta: {
                    label: '去 OKX 模擬盤練習',
                    href: 'https://www.okx.com/trade-market/demo',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c2',
                    title: '交易本質測驗',
                    description: '搞懂再下單',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '小明花 1000 U 買了比特幣。過了一個月比特幣腰斬跌了 50%，小明現在帳戶顯示剩下 500 U。請問如果他堅持不賣出，他的比特幣數量會變少嗎？',
                            options: [
                                { id: 'a', text: '會，被扣掉了一半', isCorrect: false },
                                { id: 'b', text: '不會，數量不變，只是價值變低了 (浮虧)', isCorrect: true },
                            ],
                            explanation: {
                                text: '這就是現貨 (Spot) 的特性。你擁有的是資產的所有權，只要不賣出，幣的數量永遠不會變，虧損只是暫時的帳面數字。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c3',
                title: '限價單 vs 市價單：別當盤子',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你想馬上成交，還是想省手續費？
下單時，你會看到兩種主要的委託方式：

市價單 (Market Order)
*   **意思**：「我不管現在多少錢，我現在馬上就要買到！」
*   **優點**：速度最快，保證成交。
*   **缺點**：成交價格通常比較差 (滑價)，而且手續費最貴 (因為你是消耗流動性的 Taker)。

限價單 (Limit Order)
*   **意思**：「我只想在 60,000 的價格買，太貴我不要。」
*   **優點**：可以買在指定的心儀價格，而且手續費比較便宜 (因為你是提供流動性的 Maker)。
*   **缺點**：如果市場沒跌到你的價格，你可能永遠買不到 (踏空)。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '掛單技巧',
                        content: '養成習慣多用限價單 (Limit Order)。如果你不是在十萬火急的暴漲暴跌時刻，掛單等待不只能幫你買在更好的價位，長期下來還能省下非常可觀的手續費。'
                    }
                ],
                practice: '試著掛一張「比現在價格低 5%」的限價買單。你會在「當前委託」中看到它正在排隊等待成交。',
                cta: {
                    label: '去 OKX 下單體驗',
                    href: 'https://www.okx.com/trade-spot/btc-usdt',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c3',
                    title: '下單邏輯測驗',
                    description: '精明交易者的選擇',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣正在極速暴跌，你想趕快把手上的幣賣掉，這時候你應該用哪種單？',
                            options: [
                                { id: 'a', text: '限價單 (Limit)，慢慢排隊', isCorrect: false },
                                { id: 'b', text: '市價單 (Market)，立刻成交落袋為安', isCorrect: true },
                            ],
                            explanation: {
                                text: '在逃命或搶購的極端行情下，速度比價格重要。使用市價單可以確保你立即成交，避免因排隊而錯失出場時機導致虧損擴大。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c4',
                title: '槓桿與合約：雙面刃',
                blocks: [
                    {
                        type: 'text',
                        content: `### 別讓貪婪殺死你
槓桿 (Leverage) 就是借錢投資。開 10 倍槓桿，意味著你出 1 塊錢，交易所借你 9 塊錢。
*   **好處**：賺錢時，獲利放大 10 倍。
*   **壞處**：賠錢時，虧損也放大 10 倍。

### 什麼是爆倉 (Liquidation)？
如果你開 10 倍槓桿做多，只要價格下跌 10%，你的本金就會賠光。這時候交易所會強制賣掉你的倉位還錢，你的錢就歸零了。
這就是為什麼很多人玩合約玩到傾家蕩產。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '新手禁區 🚧',
                        content: '新手開槓桿**絕對不要超過 3 倍**。高槓桿 (20倍、50倍) 基本上跟去澳門賭場沒有分別，長期下來的期望值是負的。'
                    }
                ],
                practice: '不要真金白銀去試。使用交易所的「模擬盤」開一個 100 倍槓桿的單子，只要稍微波動一下，看看你的獲利/虧損跳動得有多快。感受那種心跳。',
                cta: {
                    label: '開啟模擬交易',
                    href: 'https://www.okx.com/trade-market/demo',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c4',
                    title: '風險計算題',
                    description: '算算看你會不會爆倉',
                    questions: [
                        {
                            id: 'q1',
                            type: 'calculation',
                            question: '如果你開了 50 倍槓桿做多比特幣。請問比特幣只要下跌多少百分比，你的本金就會歸零 (爆倉)？',
                            options: [
                                { id: 'a', text: '50%', isCorrect: false },
                                { id: 'b', text: '2%', isCorrect: true },
                                { id: 'c', text: '10%', isCorrect: false }
                            ],
                            explanation: {
                                text: '公式：100% / 槓桿倍數 = 可承受跌幅。100% / 50 = 2%。只要反向波動 2%，你的倉位就會瞬間蒸發。這就是高槓桿的恐怖之處。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c5',
                title: '網格交易：震盪行情的收租機器',
                blocks: [
                    {
                        type: 'text',
                        content: `### 睡覺也能幫你買賣
幣圈 80% 的時間都在盤整震盪。這時候最適合用的工具就是**網格交易 (Grid Trading)**。

原理很簡單：
只要設定一個價格區間 (例如 5萬 ~ 7萬)，機器人會自動幫你在**跌的時候分批買進**，**漲的時候分批賣出**。
你就變成了市場的「造市商」，不斷賺取微小的價差利潤。`
                    },
                    {
                        type: 'key-point',
                        title: '適用場景',
                        points: [
                            '市場沒有明顯方向（橫盤）時最好用。',
                            '如果市場出現單邊暴漲或暴跌，網格不管是賺還是賠，效率都會比直接持有現貨差。',
                            '把它當作是一種「收租」的工具，積少成多。'
                        ]
                    }
                ],
                practice: '找一個走勢很黏、上上下下的幣 (例如波動不大的主流幣)，去開一個小額的「現貨網格」單試跑三天，觀察它是如何幫你低買高賣的。',
                cta: {
                    label: '設定網格機器人',
                    href: 'https://www.okx.com/trade-strategy/spot-grid',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c5',
                    title: '機器人邏輯',
                    description: '理解自動化交易',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '網格交易機器人最怕遇到什麼樣的行情？',
                            options: [
                                { id: 'a', text: '上下震盪的盤整行情', isCorrect: false },
                                { id: 'b', text: '單邊暴漲或暴跌的趨勢行情', isCorrect: true },
                            ],
                            explanation: {
                                text: '網格靠震盪賺價差。如果遇到單邊暴漲，你會因為太早賣光而少賺；遇到單邊暴跌，你會接滿手刀子而被套牢。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l1-c6',
                title: '止盈與止損：交易的安全帶',
                blocks: [
                    {
                        type: 'text',
                        content: `### 會買的是徒弟，會賣的才是師父
很多人賠大錢，不是因為看錯方向，而是因為**不願意認錯**。

*   **止損 (Stop Loss)**：當虧損達到一定程度 (例如 -10%)，系統自動幫你砍單出場。這是你的保命符，防止小傷變重傷。
*   **止盈 (Take Profit)**：當獲利達到目標，自動賣出鎖定利潤。防止「獲利回吐」，原本賺的變沒賺。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '心態調整',
                        content: '被止損是很正常的。專業交易員的勝率可能只有 40%，但他們透過嚴格的止損和讓獲利奔跑 (盈虧比)，最終依然能賺大錢。不要害怕止損，要害怕的是「不止損」。'
                    }
                ],
                practice: '下一次開單時，強迫自己一定要同時設定好「止損價」和「止盈價」。這不僅是保護資金，更是為了讓你晚上能睡得著覺。',
                cta: {
                    label: '學習如何設止損',
                    href: 'https://www.okx.com/learn/trading-strategy',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l1-c6',
                    title: '風控觀念',
                    description: '活下來的關鍵',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '你開了一張單，結果行情不如預期，虧損已經到了你設定的止損位。這時候你心裡覺得「應該快反彈了」。你該怎麼做？',
                            options: [
                                { id: 'a', text: '取消止損，再凹一下單', isCorrect: false },
                                { id: 'b', text: '遵守紀律，觸發止損離場', isCorrect: true },
                            ],
                            explanation: {
                                text: '交易最忌諱的就是「凹單」。大部分的爆倉都是從「再凹一下」開始的。嚴格執行止損是活在這個市場的唯一法則。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-2',
        level: 2,
        title: '數據篇：像巨鯨一樣思考',
        description: '不要只看價格。學會看情緒、資金流與清算地圖。',
        icon: "BarChart2",
        chapters: [
            {
                id: 'l2-c1',
                title: '恐慌貪婪指數 (FGI)：別人恐慌我貪婪？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 市場是情緒化的
巴菲特說：「在別人恐慌時貪婪，在別人貪婪時恐慌。」
但在幣圈，你要有數據佐證。

**FGI (Fear & Greed Index)** 分數 0 ~ 100：
*   **0 ~ 20 (極度恐慌)**：大家都在割肉逃跑，通常是**買點**。
*   **80 ~ 100 (極度貪婪)**：連你阿嬤都在問怎麼買幣，通常是**賣點**。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '怎麼用？',
                        content: '不要看到恐慌就無腦買 (可能還會更恐慌)。要搭配其他指標（如支撐位）一起看。'
                    }
                ],
                practice: '現在就去指標頁，看看今天的 FGI 是多少？市場現在處於什麼情緒？',
                cta: {
                    label: '查看即時 FGI 指數',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l2-c1',
                    title: 'FGI 實戰判讀',
                    description: '訓練逆向思考的能力',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '如果不考慮其他因素，當 FGI 來到 90 (極度貪婪) 時，較合理的策略是？',
                            options: [
                                { id: 'a', text: 'All in 追高，還會更漲', isCorrect: false },
                                { id: 'b', text: '分批止盈，落袋為安', isCorrect: true },
                                { id: 'c', text: '開高倍槓桿做多', isCorrect: false }
                            ],
                            explanation: {
                                text: '極度貪婪意味著市場過熱，隨時可能有回調風險。適度止盈是較安全的做法。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c2',
                title: '資金費率 (Funding Rate)：多空誰在付錢？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 這是合約市場的溫度計 🌡️
為了讓合約價格跟現貨價格不要差太多，交易所設計了「資金費率」機制。

*   **費率是正的 (+)**：做多的人太多，**多頭要付錢給空頭**。代表市場情緒**看漲**。
*   **費率是負的 (-)**：做空的人太多，**空頭要付錢給多頭**。代表市場情緒**看跌**。`
                    },
                    {
                        type: 'key-point',
                        title: '高階心法',
                        points: [
                            '如果費率**極度正** (例如年化 > 50%)，且價格漲不動了 -> **小心多頭踩踏，可能要崩盤**。',
                            '如果費率**極度負** (所有人都在做空)，且價格跌不下去了 -> **可能出現軋空 (Short Squeeze) 暴漲**。'
                        ]
                    }
                ],
                practice: '打開指標頁，檢查現在 BTC 的資金費率是正還是負？熱度如何？',
                cta: {
                    label: '查看資金費率熱圖',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l2-c2',
                    title: '資金費率判讀',
                    description: '看穿市場潛在的反轉信號',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '當比特幣價格在下跌，但資金費率卻呈現「極度負值」（大家都在做空），這時候要小心什麼？',
                            options: [
                                { id: 'a', text: '繼續暴跌', isCorrect: false },
                                { id: 'b', text: '軋空 (Short Squeeze) 反彈', isCorrect: true },
                                { id: 'c', text: '沒什麼特別的', isCorrect: false }
                            ],
                            explanation: {
                                text: '當過多人都做空，且空頭需要支付高額費率給多頭時，一旦價格稍微反彈，空頭被迫平倉買回，就會引發連鎖反應導致價格暴漲 (軋空)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c3',
                title: '多空比 (Long/Short Ratio)：散戶在哪？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 散戶反著做，別墅靠大海
大部分散戶都是虧錢的。所以我們只要**跟散戶反著做**，勝率通常很高。

**多空比 (L/S Ratio)**：這是一個反指標。
*   **多空比 > 1** (很多散戶在做多)：你需要**小心回調** (主力可能會來殺多頭)。
*   **多空比 < 1** (很多散戶在做空)：你需要**留意反彈** (主力可能會來殺空頭)。

**大戶多空比** 則是相反，要跟著大戶走。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '菁英觀點',
                        content: '通常我們看「多空人數比」。如果 70% 的人數都在做多，通常不是好事。'
                    }
                ],
                practice: '去 CoinGlass 或其他數據網站，查看 BTC 目前的多空人數比。是以散戶做多為主還是做空為主？',
                cta: {
                    label: '查看更多數據來源',
                    href: 'https://www.coinglass.com/LongShortRatio',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l2-c3',
                    title: '反指標測試',
                    description: '你站在哪一邊？',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當市場「多空人數比」高達 3.0 (代表極多散戶做多) 時，這通常被視為？',
                            options: [
                                { id: 'a', text: '看漲訊號', isCorrect: false },
                                { id: 'b', text: '看跌 (反指標) 訊號', isCorrect: true }
                            ],
                            explanation: {
                                text: '散戶通常是情緒化的追高。當過多散戶做多，市場車太重，主力往往會選擇向下洗盤。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c4',
                title: '清算地圖：莊家的獵殺清單',
                blocks: [
                    {
                        type: 'text',
                        content: `### 哪裡有流動性？
莊家 (主力) 資金量大，他們需要「對手盤」來成交。
哪裡有對手盤？**爆倉的地方**。

**清算地圖 (Liquidation Heatmap)** 顯示了哪裡堆積了大量的爆倉單。
*   如果上方 62,000 有 10 億美金的空單會爆倉 -> 價格很容易被吸過去。
*   價格就像磁鐵，會往流動性高 (爆倉密集) 的地方移動。`
                    },
                    {
                        type: 'key-point',
                        title: '操作策略',
                        points: [
                            '不要把止損設在**大眾止損位** (整數關卡)。',
                            '當價格去插針「清算區」後迅速反彈，通常是不錯的進場點 (假突破/假跌破)。'
                        ]
                    }
                ],
                practice: '搜尋 BTC Liquidation Heatmap，看看目前上方和下方的痛點在哪裡？',
                cta: {
                    label: '查看 Coinglass 清算圖',
                    href: 'https://www.coinglass.com/pro/futures/liquidation_heatmap',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l2-c4',
                    title: '獵殺心理學',
                    description: '避開被狩獵',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '價格為什麼經常會去「插針」觸碰清算密集區？',
                            options: [
                                { id: 'a', text: '純屬巧合', isCorrect: false },
                                { id: 'b', text: '主力為了獲取流動性 (Liquidity)', isCorrect: true },
                                { id: 'c', text: '因為系統故障', isCorrect: false }
                            ],
                            explanation: {
                                text: '在大額清算發生時，會有大量的市價單成交，這為大戶提供了完美的進場或出場流動性。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c5',
                title: '未平倉合約 (OI)：燃料有多少？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 派對還會繼續嗎？
**Open Interest (OI)** 代表目前場上有多少合約單還沒平倉。

*   **OI 上升 + 價格上漲**：新資金進場做多 -> **趨勢延續 (強勢)**。
*   **OI 下降 + 價格上漲**：空頭認賠回補 -> **動能減弱**。
*   **OI 暴跌**：大規模爆倉 (去槓桿) -> **行情反轉或震盪**。`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '公式',
                        content: 'OI 越高 = 波動越大 (滿車都是火藥)。\nOI 越低 = 市場越冷靜。'
                    }
                ],
                practice: '觀察 BTC 的 OI 變化。通常在暴跌前夕，OI 都會處於歷史高位 (過度槓桿)。',
                cta: {
                    label: '查看 OI 數據',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l2-c5',
                    title: '動能分析',
                    description: '判斷趨勢強弱',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣價格創出新高，但此時 OI (持倉量) 卻在大幅下降。這暗示什麼？',
                            options: [
                                { id: 'a', text: '新資金瘋狂湧入', isCorrect: false },
                                { id: 'b', text: '趨勢可能快結束了 (空頭回補而非主動買盤)', isCorrect: true }
                            ],
                            explanation: {
                                text: '價漲量縮 (OI 縮)，通常代表上漲是由於空頭認賠平倉 (Short Covering) 造成的，而非新的多頭資金推動，趨勢往往難以持久。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l2-c6',
                title: '成交量與市值佔比 (Dominance)',
                blocks: [
                    {
                        type: 'text',
                        content: `### 錢流去哪了？
幣圈的資金流動通常有規律 (Altcoin Season)：
1.  **比特幣獨強**：Bitcoin Dominance (BTC.D) 上升，山寨幣吸血下跌。
2.  **以太坊補漲**：BTC 橫盤，ETH 開始漲。
3.  **山寨季 (Alt Season)**：BTC.D 下降，資金溢出到小幣，群魔亂舞。
4.  **崩盤**：資金撤回 USDT。`
                    },
                    {
                        type: 'key-point',
                        title: '信號',
                        points: [
                            '**BTC.D > 50%**：持有比特幣最安全。',
                            '**BTC.D 開始高位回落**：可能是山寨季的訊號。'
                        ]
                    }
                ],
                practice: '去 TradingView 搜尋 `BTC.D`。現在的趨勢是向上還是向下？這決定了你該買大餅還是買山寨。',
                cta: {
                    label: '去 TradingView 看圖',
                    href: 'https://www.tradingview.com/chart/?symbol=CRYPTOCAP%3ABTC.D',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l2-c6',
                    title: '資金輪動測驗',
                    description: '掌握節奏',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當比特幣市佔率 (BTC.D) 正在飆升吸血時，這時候亂買山寨幣 (Altcoins) 通常會？',
                            options: [
                                { id: 'a', text: '跟著比特幣一起漲', isCorrect: false },
                                { id: 'b', text: '對比特幣匯率下跌 (跑輸大盤)', isCorrect: true }
                            ],
                            explanation: {
                                text: '資金是有限的。當資金集中流向比特幣時，山寨幣通常會因為流動性被抽走而表現疲軟。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-3',
        level: 3,
        title: '宏觀篇：跟著聯準會衝浪',
        description: '幣圈不是孤島。學會看 CPI、非農、FOMC 這些大浪。',
        icon: "Calendar",
        chapters: [
            {
                id: 'l3-c1',
                title: '聯準會 (Fed)：全球金融的總司令',
                blocks: [
                    {
                        type: 'text',
                        content: `### 為什麼鮑爾 (Powell) 講話大家都在抖？
聯準會 (Fed) 是美國的央行，也是世界的央行。
它手上有兩個最強武器：**印鈔機** 和 **利率**。

*   **升息 (Rate Hike)**：把錢收回來。市場資金變少，風險資產 (股票、比特幣) 容易**下跌**。
*   **降息 (Rate Cut)**：把錢放出來。市場資金變多，風險資產容易**上漲**。`
                    },
                    {
                        type: 'key-point',
                        title: 'FOMC 會議',
                        points: [
                            '一年開 8 次會，決定要升息還是降息。',
                            '**點陣圖 (Dot Plot)**：預測未來的利率走勢。',
                            '不要跟聯準會作對 (Don\'t fight the Fed)。'
                        ]
                    }
                ],
                practice: '去財經日曆查看下一次 FOMC 會議的時間。通常在台灣時間週四凌晨 2:00。',
                cta: {
                    label: '查看財經日曆',
                    href: '/calendar',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c1',
                    title: '央行政策測驗',
                    description: '搞懂大趨勢',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當聯準會宣布「升息」時，理論上這對加密貨幣市場是？',
                            options: [
                                { id: 'a', text: '利多 (Bullish)', isCorrect: false },
                                { id: 'b', text: '利空 (Bearish)', isCorrect: true },
                            ],
                            explanation: {
                                text: '升息意味著資金成本變高，熱錢會回流銀行或美債，離開風險資產 (如比特幣)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c2',
                title: 'CPI 與通膨：錢變薄了嗎？',
                blocks: [
                    {
                        type: 'text',
                        content: `### CPI (消費者物價指數)
簡單說就是物價。東西變貴了 = 通膨。

*   **CPI 高於預期** 🔥：通膨嚴重 -> 聯準會 (Fed) 就要升息來壓制 -> 錢變貴了，熱錢撤出風險資產 -> **幣圈通常利空 (跌)**。
*   **CPI 低於預期** 🧊：通膨降溫 -> Fed 可能降息 -> 市場資金變多 -> **幣圈通常利多 (漲)**。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '交易策略',
                        content: '數據公布的那一瞬間，市場波動會非常劇烈（上下插針）。新手建議：**數據公布前後 15 分鐘，空手觀望**。不要去賭博。'
                    }
                ],
                practice: '去日曆 (Calendar) 看看下一次 CPI 公布是什麼時候？設定一個鬧鐘提醒自己。',
                cta: {
                    label: '查看財經日曆',
                    href: '/calendar',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c2',
                    title: '宏觀數據反應',
                    description: '理解經濟數據如何影響幣價',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '如果今晚公布的 CPI 大幅「高於」預期 (通膨比預期嚴重)，市場第一反應通常是？',
                            options: [
                                { id: 'a', text: '噴出大漲', isCorrect: false },
                                { id: 'b', text: '跳水下跌', isCorrect: true },
                                { id: 'c', text: '完全不動', isCorrect: false }
                            ],
                            explanation: {
                                text: '通膨高於預期 -> Fed 恐鷹派升息 -> 不利於風險資產 -> 下跌機率高。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c3',
                title: '非農就業 (NFP)：經濟好壞的風向球',
                blocks: [
                    {
                        type: 'text',
                        content: `### 美國人有沒有工作？
每個月第一個週五公布的 **非農就業數據 (Non-Farm Payrolls)**。

*   **就業強勁 (數據高)**：經濟太好 -> 通膨可能降不下來 -> Fed 不敢降息 -> **利空**。
*   **就業疲軟 (數據低)**：經濟衰退風險 -> Fed 可能要降息救市 -> **短多長空** (短期利好降息，長期擔心衰退)。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '壞消息就是好消息',
                        content: '在升息循環末端，市場往往期待「經濟變差」，因為這樣 Fed 才會降息。所以有時候看到就業數據爛，股市幣市反而大漲。'
                    }
                ],
                practice: '觀察本週五是否有 NFP 數據？注意晚間 20:30 (或 21:30) 的行情波動。',
                cta: {
                    label: '查看財經日曆',
                    href: '/calendar',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c3',
                    title: '非農邏輯題',
                    description: '市場邏輯很反直覺',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '在通膨嚴重時期，如果非農就業數據「超乎預期的好」(大家都有工作)，市場通常會如何解讀？',
                            options: [
                                { id: 'a', text: '經濟太好，不用擔心衰退，股市大漲', isCorrect: false },
                                { id: 'b', text: '經濟太熱，Fed 可能會繼續升息，利空', isCorrect: true }
                            ],
                            explanation: {
                                text: '在抗通膨階段，經濟過熱 (就業太好) 會讓 Fed 更有底氣繼續升息，這對投資市場是壓力。這就是所謂的「好消息就是壞消息」(Good news is bad news)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c4',
                title: '關聯性：美股與美元指數',
                blocks: [
                    {
                        type: 'text',
                        content: `### 幣圈不是孤島
比特幣現在跟美股 (特別是納斯達克) 的連動性越來越高。

*   **S&P 500 / Nasdaq**：**正相關**。美股漲，比特幣容易漲；美股崩，比特幣通常跟著崩。
*   **DXY (美元指數)**：**負相關**。美元太強 (DXY 漲)，代表資金流回美元，比特幣容易跌。美元弱 (DXY 跌)，比特幣容易漲。`
                    },
                    {
                        type: 'key-point',
                        title: '簡單判斷',
                        points: [
                            '美股開盤 (21:30) 後，比特幣波動會變大。',
                            '如果 DXY 突破 105，各國貨幣和資產都會承壓。'
                        ]
                    }
                ],
                practice: '去 TradingView 把 BTC 和 DXY 的K線圖疊在一起看，你會發現它們常常走反向。',
                cta: {
                    label: '查看 DXY 圖表',
                    href: 'https://www.tradingview.com/chart/?symbol=TVC%3ADXY',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l3-c4',
                    title: '連動性測驗',
                    description: '眼觀四面',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '通常情況下，比特幣與美元指數 (DXY) 的關係是？',
                            options: [
                                { id: 'a', text: '正相關 (一起漲)', isCorrect: false },
                                { id: 'b', text: '負相關 (翹翹板)', isCorrect: true },
                            ],
                            explanation: {
                                text: '美元強勢代表資金回流法幣，資產價格通常會下跌。美元弱勢代表資金外溢，資產價格(如黃金、比特幣)容易上漲。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c5',
                title: '週期：比特幣減半效應',
                blocks: [
                    {
                        type: 'text',
                        content: `### 四年一次的煙火
比特幣程式碼寫死了規則：每 21 萬個區塊 (約 4 年)，挖礦獎勵**減半**。
這意味著**供給減少**。如果需求不變，價格就會上漲。

*   **2012**：第一次減半 -> 2013 牛市
*   **2016**：第二次減半 -> 2017 牛市
*   **2020**：第三次減半 -> 2021 牛市
*   **2024**：第四次減半 -> ?`
                    },
                    {
                        type: 'callout',
                        variant: 'info',
                        title: '刻舟求劍',
                        content: '雖然歷史不一定重演，但減半週期是目前幣圈最強的共識 (Self-fulfilling Prophecy)。'
                    }
                ],
                practice: '去我們的「減半倒數」頁面，看看距離下次減半還剩多久？或者上一輪減半後多久破新高？',
                cta: {
                    label: '查看減半倒數',
                    href: '/halving',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l3-c5',
                    title: '減半邏輯',
                    description: '供給與需求',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '比特幣減半 (Halving) 主要影響經濟模型中的哪一端？',
                            options: [
                                { id: 'a', text: '需求端 (買氣)', isCorrect: false },
                                { id: 'b', text: '供給端 (產量)', isCorrect: true },
                            ],
                            explanation: {
                                text: '減半直接減少了礦工每天能挖出的比特幣數量 (新增供給減半)。依照供需法則，供給減少有利於價格上漲。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l3-c6',
                title: '流動性週期：M2 貨幣供給',
                blocks: [
                    {
                        type: 'text',
                        content: `### 水漲船高
比特幣本質上是**流動性的海綿**。
當全球央行都在「放水」(增加 M2 貨幣供給) 時，多出來的錢會流向高風險資產。

*   **Global M2 YOY 上升**：全球都在印錢 -> **比特幣大牛市**。
*   **Global M2 YOY 下降**：全球都在收水 -> **比特幣熊市**。

這比任何技術分析都更準確地預測了過去的大週期。`
                    },
                    {
                        type: 'key-point',
                        title: '觀察重點',
                        points: [
                            '關注中美兩大國的貨幣政策。',
                            '當你可以借到便宜的錢時，資產就會漲。'
                        ]
                    }
                ],
                practice: '搜尋 "Global Liquidity Index" 或 "M2 chart"，對照比特幣的月線圖，你會發現驚人的相似度。',
                cta: {
                    label: '深入研究宏觀流動性',
                    href: 'https://tw.tradingview.com/chart',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l3-c6',
                    title: '大局觀測驗',
                    description: '站在巨人的肩膀上',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '如果全球主要央行都開始啟動 QE (量化寬鬆) 印鈔票，這對比特幣的長期趨勢是？',
                            options: [
                                { id: 'a', text: '極度重大利多', isCorrect: true },
                                { id: 'b', text: '沒影響', isCorrect: false },
                                { id: 'c', text: '利空，因為錢變不值錢', isCorrect: false }
                            ],
                            explanation: {
                                text: '法幣變不值錢 (通膨) 正是比特幣 (抗通膨資產) 最強的催化劑。全球流動性氾濫是推動加密貨幣牛市的最根本動力。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-4',
        level: 4,
        title: '策略篇：建立你的交易系統',
        description: '不要憑感覺。學習 DCA、回測與歷史類比。',
        icon: "LineChart",
        chapters: [
            {
                id: 'l4-c1',
                title: 'DCA 平均成本法：懶人投資術',
                blocks: [
                    {
                        type: 'text',
                        content: `### 猜底是神做的事，不是人做的
你永遠買不到最低點。
**DCA (Dollar-Cost Averaging)** 就是「定期定額」。
不管價格多少，每週固定買 100 U。

*   **跌的時候**：同樣的錢可以買到**更多顆**幣。
*   **漲的時候**：你的資產價值增加。

長期下來，你的持倉成本會被平均攤低。這是最適合大多數人的策略，尤其是對比特幣這種長期看漲的資產。`
                    }
                ],
                practice: '計算一下，如果你每個月薪水撥出 10% 做 DCA，一年後你會擁有多少比特幣？',
                cta: {
                    label: '去 OKX 設定定期定額',
                    href: 'https://www.okx.com/buy-crypto',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l4-c1',
                    title: 'DCA 觀念驗證',
                    description: '為什麼說時間是你的朋友',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: 'DCA 策略的主要優勢是什麼？',
                            options: [
                                { id: 'a', text: '可以買在最低點', isCorrect: false },
                                { id: 'b', text: '可以一夜致富', isCorrect: false },
                                { id: 'c', text: '克服人性弱點，平均分攤成本', isCorrect: true }
                            ],
                            explanation: {
                                text: 'DCA 讓你不需要盯盤、不需要猜測市場時機，透過紀律來克服追高殺低的人性弱點。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c2',
                title: '市場結構：看懂趨勢的 N 字型',
                blocks: [
                    {
                        type: 'text',
                        content: `### 趨勢是有慣性的 (Trends)
市場不會直上直下，而是像爬樓梯。

*   **多頭 (Uptrend)**：高點越來越高 (HH)，低點也越來越高 (HL)。
    *   策略：拉回找買點 (Buy the Dip)。
*   **空頭 (Downtrend)**：低點越來越低 (LL)，高點也越來越低 (LH)。
    *   策略：反彈找賣點 (Sell the Rally)。

只要結構沒破壞 (例如多頭跌破前低)，趨勢就還在。不要隨便猜頂猜底。`
                    },
                    {
                        type: 'key-point',
                        title: '口訣',
                        points: [
                            '順勢而為 (Trend is your friend)。',
                            '不要在多頭趨勢裡做空，不要在空頭趨勢裡抄底。'
                        ]
                    }
                ],
                practice: '隨便打開一張比特幣日線圖，試著標記出最近的一個「更高的高點 (HH)」和「更高的低點 (HL)」。',
                cta: {
                    label: '去 TradingView 畫圖',
                    href: 'https://tw.tradingview.com/chart',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l4-c2',
                    title: '趨勢判斷力',
                    description: '別逆向行駛',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣價格在下跌後開始反彈，但反彈的高點「沒有超過」前一個高點，隨後又繼續下跌。這代表？',
                            options: [
                                { id: 'a', text: '趨勢反轉向上', isCorrect: false },
                                { id: 'b', text: '空頭結構 (Lower High) 確認，趨勢向下', isCorrect: true },
                            ],
                            explanation: {
                                text: '這是典型的空頭結構特徵：Lower High (LH) 和 Lower Low (LL)。多頭無力創新高，空頭主導市場。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c3',
                title: '指標應用：RSI 與背離',
                blocks: [
                    {
                        type: 'text',
                        content: `### 不要過度依賴指標
指標是落後的，價格才是即時的。
但有一個信號勝率很高：**背離 (Divergence)**。

*   **頂背離 (看跌)**：價格創新高，但 RSI 指標沒創新高 (力量跟不上)。 -> **準備下跌**。
*   **底背離 (看漲)**：價格創新低，但 RSI 指標沒創新低 (跌不動了)。 -> **準備反彈**。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: 'RSI 超買超賣',
                        content: 'RSI > 70 叫超買，但牛市時可以一直超買 (鈍化)。所以不要看到 > 70 就做空，會被嘎死。'
                    }
                ],
                practice: '去查看我們開發的「背離篩選器」，看看現在有哪些幣出現了頂背離或底背離信號？',
                cta: {
                    label: '查看背離信號',
                    href: '/indicators/divergence',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l4-c3',
                    title: '技術分析測驗',
                    description: '找出潛在反轉點',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '價格一直在創新高，但是 RSI 指標的高點卻一次比一次低。這叫做什麼？',
                            options: [
                                { id: 'a', text: '頂背離 (Bearish Divergence)，暗示可能下跌', isCorrect: true },
                                { id: 'b', text: '底背離 (Bullish Divergence)，暗示可能上漲', isCorrect: false },
                                { id: 'c', text: '常態分佈', isCorrect: false }
                            ],
                            explanation: {
                                text: '價格上漲但動能減弱 (RSI 下降)，代表買盤力道衰竭，是常見的趨勢反轉訊號。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c4',
                title: '支撐與壓力：供需的戰場',
                blocks: [
                    {
                        type: 'text',
                        content: `### 哪裡有人想買？哪裡有人想賣？
K線圖上的每一個轉折點，都代表有人在那裡大規模買進或賣出。

*   **支撐位 (Support)**：地板。價格跌到這裡會有買盤撐住。
*   **壓力位 (Resistance)**：天花板。價格漲到這裡會有賣壓打下來。

**支撐與壓力互換**：如果天花板被突破了，下次跌回來，天花板就會變成地板 (支撐)。`
                    },
                    {
                        type: 'key-point',
                        title: '交易策略',
                        points: [
                            '**回到支撐做多** (配合止損)。',
                            '**遇到壓力止盈** (不要去賭突破)。',
                            '如果壓力區被「大陽線」突破，等它回踩測試不破時，是最好的買點。'
                        ]
                    }
                ],
                practice: '試著在圖表上畫出比特幣目前的「壓力位」在哪裡？如果突破了，下一個目標價多少？',
                cta: {
                    label: '去 OKX 圖表畫線',
                    href: 'https://www.okx.com/trade-spot/btc-usdt',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l4-c4',
                    title: '關鍵價位判斷',
                    description: '尋找最佳進場點',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '當一個強力的「壓力位」(天花板) 被價格有效突破後，這個價位通常會轉變為？',
                            options: [
                                { id: 'a', text: '沒什麼意義', isCorrect: false },
                                { id: 'b', text: '支撐位 (地板)', isCorrect: true },
                            ],
                            explanation: {
                                text: '突破後，原本的賣家停損出場或轉為看多，未上車的買家會在回調時進場，因此壓力會轉為支撐 (Support Resistance Flip)。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c5',
                title: '風險管理：怎麼輸都不怕',
                blocks: [
                    {
                        type: 'text',
                        content: `### 這是賭博與投資的唯一區別
你不需要預測未來，你只需要管好風險。

1.  **止損 (Stop Loss)**：進場前就要決定「如果我看錯，我願意賠多少」。這筆錢是你的入場費，不是意外。
2.  **倉位管理 (Position Sizing)**：不要 All in。
    *   **2% 法則**：任何一筆交易，虧損不應該超過總資金的 2%。
    *   即使你連輸 10 次，你還剩下 80% 的本金，還有機會翻身。如果是 All in，輸一次就畢業了。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '絕對紀律',
                        content: '到了止損位，無條件砍單。最常見的悲劇就是：「再凹一下就會回來了...」，結果從虧 5% 變成虧 80%。'
                    }
                ],
                practice: '計算題：你有 1000 U 本金。你想買入比特幣，止損設在 5%。請問為了遵守「單筆虧損不超過總資金 2%」的規則，你最多能買多少 U 的比特幣？ (答案：400 U)',
                cta: {
                    label: '使用凱利公式計算機',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l4-c5',
                    title: '風控數學題',
                    description: '活下來才能致富',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '你的總資金有 10,000 U。你計畫做一筆交易，止損距離現價 10%。如果你想控制這筆交易最多只賠掉總資金的 1% (100 U)，你的倉位大小 (Position Size) 應該是多少？',
                            options: [
                                { id: 'a', text: '10,000 U (All in)', isCorrect: false },
                                { id: 'b', text: '1,000 U', isCorrect: true },
                                { id: 'c', text: '100 U', isCorrect: false }
                            ],
                            explanation: {
                                text: '倉位 x 10% (止損幅度) = 100 U (風險金額)。所以倉位 = 100 / 0.1 = 1,000 U。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l4-c6',
                title: '交易日誌：進步的唯一捷徑',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你為什麼要開這單？
如果你說不出來，那你就是在賭博。
每一筆交易都要記錄：
1.  **進場理由**：RSI 背離？支撐反彈？
2.  **止損止盈**：設在哪？
3.  **檢討**：這筆賺了還是賠了？為什麼？有沒有遵守紀律？

只要你每天**複盤 (Review)** 自己的交易，半年後你會發現自己跟神一樣強。`
                    },
                    {
                        type: 'key-point',
                        title: '工具',
                        points: [
                            'Excel / Notion 是好朋友。',
                            '誠實面對自己的錯誤 (凹單、Fomo、手賤)，不要騙自己。'
                        ]
                    }
                ],
                practice: '從今天開始，建立一個簡單的 Notion 頁面，記錄你的接下來 5 筆模擬交易。',
                cta: {
                    label: '下載交易日誌範本',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l4-c6',
                    title: '自我修煉',
                    description: '通往職業之路',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '為什麼即使是虧損的交易，也具有極高的價值？',
                            options: [
                                { id: 'a', text: '虧錢能訓練抗壓性', isCorrect: false },
                                { id: 'b', text: '因為它暴露了你的系統漏洞或心理弱點，檢討後能避免下次再犯', isCorrect: true },
                            ],
                            explanation: {
                                text: '每一筆虧損都是市場給你的學費。如果你沒學到教訓，那這筆學費就白繳了。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-5',
        level: 5,
        title: '心法篇：倖存者法則',
        description: '在這個市場活下來，比什麼都重要。風險管理是唯一聖杯。',
        icon: "Shield",
        chapters: [
            {
                id: 'l5-c1',
                title: 'FOMO 與 FUD：情緒的魁儡',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你的大腦在騙你
*   **FOMO (Fear Of Missing Out)**：看到別人賺錢，覺得自己虧了，忍不住在山頂追高。
*   **FUD (Fear, Uncertainty, Doubt)**：看到鬼故事 (監管、駭客)，嚇到在谷底割肉。

市場專門收割情緒化的人。主力就是利用 FOMO 叫你接盤，利用 FUD 騙你交出籌碼。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '解藥',
                        content: '當你覺得「興奮到睡不著」時，賣出。當你覺得「絕望到想刪 App」時，買入。'
                    }
                ],
                practice: '回想一下你上次虧損的交易。是不是因為 FOMO 追高，還是因為恐慌割肉？',
                cta: {
                    label: '閱讀更多交易心理學',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c1',
                    title: '情緒檢測',
                    description: '誰在控制你的滑鼠？',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '當你在社群媒體上看到每個人都在曬 10 倍的獲利截圖，你這時候感到焦慮並想立刻進場。這叫做？',
                            options: [
                                { id: 'a', text: '洞察先機', isCorrect: false },
                                { id: 'b', text: 'FOMO (錯失恐懼症)', isCorrect: true },
                            ],
                            explanation: {
                                text: '這是典型的 FOMO。通常當大家都在曬單時，行情已經接近尾聲，進場往往是接盤。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c2',
                title: '賭徒謬誤：這次一定會開大',
                blocks: [
                    {
                        type: 'text',
                        content: `### 獨立事件的陷阱
如果你丟硬幣連續 10 次正面，第 11 次出現反面的機率是多少？
很多人覺得「一定是反面了吧？」。
**錯，還是 50%。**

*   不要覺得「跌這麼多了，一定要漲了吧」。
*   不要覺得「漲這麼多了，一定要跌了吧」。

市場沒有記憶，價格只反映當下的供需。`
                    },
                    {
                        type: 'key-point',
                        title: '心法',
                        points: [
                            '不要抄底：地板下面還有地下室，地下室下面還有十八層地獄。',
                            '順勢交易：如果連續漲 10 天，第 11 天漲的機率可能反而更高 (動能)。'
                        ]
                    }
                ],
                practice: '去看看 LUNA 歸零的K線圖。在它從 100 跌到 1 的過程中，無數人覺得「跌夠了吧」進去抄底，結果全部歸零。',
                cta: {
                    label: '查看 LUNA 歷史走勢',
                    href: 'https://tw.tradingview.com/chart',
                    type: 'external'
                },
                quiz: {
                    id: 'q-l5-c2',
                    title: '機率陷阱',
                    description: '相信數學，別相信直覺',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '比特幣連續下跌了 7 天。你認為今天「肯定」會漲，因為不可能一直跌。這種想法犯了什麼錯誤？',
                            options: [
                                { id: 'a', text: '賭徒謬誤 (Gambler\'s Fallacy)', isCorrect: true },
                                { id: 'b', text: '倖存者偏差', isCorrect: false },
                            ],
                            explanation: {
                                text: '你認為過去的結果會影響未來的獨立事件。事實上，跌了 7 天不代表第 8 天就會漲，趨勢可能會延續。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c3',
                title: '沈沒成本：為什麼你砍不下手？',
                blocks: [
                    {
                        type: 'text',
                        content: `### 已經賠掉的錢，不是你的錢
你有得過「不賣就不算賠」的病嗎？
這叫 **沈沒成本謬誤 (Sunk Cost Fallacy)**。

你因為不捨得已經賠掉的 10%，結果最後賠掉 90%。
以前賠多少不重要，重要的是：**「如果現在持有現金，你還會買這支幣嗎？」**
如果不會，那就賣掉。`
                    },
                    {
                        type: 'callout',
                        variant: 'tip',
                        title: '換倉思維',
                        content: '把爛幣賣掉，換到強勢幣。同樣是虧損狀態，但強勢幣回本的機率遠大於爛幣。'
                    }
                ],
                practice: '打開你的持倉，檢視有沒有虧損超過 50% 的幣？問自己：「如果我現在空手，我會買它嗎？」如果不會，執行清倉。',
                cta: {
                    label: '前往我的投資組合',
                    href: '/profile',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c3',
                    title: '斷捨離測驗',
                    description: '理性決策',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '面對虧損的部位，最理性的決策依據不僅是「回本」，而是？',
                            options: [
                                { id: 'a', text: '禱告', isCorrect: false },
                                { id: 'b', text: '資金效率 (Opportunity Cost)', isCorrect: true },
                            ],
                            explanation: {
                                text: '死守爛倉位會讓你錯過其他賺錢的機會 (機會成本)。理性做法是將資金移到勝率更高的地方。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c4',
                title: '倖存者偏差：死人不會說話',
                blocks: [
                    {
                        type: 'text',
                        content: `### 你只看到賺錢的人
你看到有人買土狗幣賺了 100 倍。
你沒看到的是，有 10000 個人買土狗幣歸零了。
這叫 **倖存者偏差 (Survivorship Bias)**。

社群媒體上充滿了倖存者。不要因為別人的幸運，而忽略了背後的巨大風險。
模仿倖存者的結果，通常是成為分母。`
                    },
                    {
                        type: 'key-point',
                        title: '真相',
                        points: [
                            '大V曬單通常只曬賺的，賠的你看不到。',
                            '不要羨慕買彩券中獎的人，去算算期望值。'
                        ]
                    }
                ],
                practice: '在這個市場上，每出現一個暴富神話，背後大約有多少個破產故事？ (大概是 1:10000)',
                cta: {
                    label: '了解更多偏差',
                    href: '#',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c4',
                    title: '盲點測試',
                    description: '看見看不見的',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '網路上有很多「合約大神」勝率 100%。你應該怎麼看？',
                            options: [
                                { id: 'a', text: '拜他為師，跟單發財', isCorrect: false },
                                { id: 'b', text: '懷疑是倖存者偏差或造假 (P圖)', isCorrect: true },
                            ],
                            explanation: {
                                text: '長期勝率 100% 幾乎不可能。這通常是只展示獲利單 (倖存者) 或單純詐騙。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c5',
                title: '稟賦效應：跟你的幣談戀愛',
                blocks: [
                    {
                        type: 'text',
                        content: `### 自己的孩子最可愛
一旦你買入了一個幣，你就會下意識地覺得它「比較好」，並且只看它的好消息，過濾掉壞消息。
這叫 **稟賦效應 (Endowment Effect)**。

不要跟你的幣談戀愛。它只是一個代碼。
該賣就賣，該換就換。做一個無情的渣男。`
                    },
                    {
                        type: 'callout',
                        variant: 'warning',
                        title: '同溫層',
                        content: 'Telegram 群組最容易強化這種效應。大家互相洗腦 (CX)，最後一起抱著歸零。'
                    }
                ],
                practice: '試著列出你持倉佔比最大的幣的 3 個「缺點」或「風險」。如果你列不出來，你可能已經戀愛了。',
                cta: {
                    label: '客觀分析工具',
                    href: '/indicators',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c5',
                    title: '客觀性測驗',
                    description: '保持中立',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '當有人批評你持有的幣是「垃圾」時，你感到非常生氣並想反駁。這可能代表？',
                            options: [
                                { id: 'a', text: '你非常有正義感', isCorrect: false },
                                { id: 'b', text: '你陷入了稟賦效應，過度情感投入', isCorrect: true },
                            ],
                            explanation: {
                                text: '投資應該是理性的。對批評感到憤怒通常是因為將資產視為自我的一部分 (Empowerment Effect)，這是危險的信號。',
                            }
                        }
                    ]
                }
            },
            {
                id: 'l5-c6',
                title: '生存法則：比氣長',
                blocks: [
                    {
                        type: 'text',
                        content: `### 活著，就是勝利
巴菲特 99% 的財富都是 50 歲以後賺到的。
複利需要時間。

但在幣圈，90% 的人第一年就畢業了 (爆倉、被駭、詐騙)。
你的首要目標不是「賺多少」，而是**「不要死」**。

*   不開高槓桿。
*   不碰看不懂的項目。
*   做好錢包隔離。`
                    },
                    {
                        type: 'key-point',
                        title: '終極目標',
                        points: [
                            '留在牌桌上。',
                            '只要你還在場內，機會永遠都有。',
                            '財富是耐心的變現。'
                        ]
                    }
                ],
                practice: '寫下你的「生存宣言」：我承諾不使用超過 5 倍槓桿，不隨意授權錢包，以此確保我明年還在這個市場。',
                cta: {
                    label: '回到首頁',
                    href: '/',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-l5-c6',
                    title: '畢業考',
                    description: '最重要的一課',
                    questions: [
                        {
                            id: 'q1',
                            type: 'basic',
                            question: '投資加密貨幣，最重要的第一原則是什麼？',
                            options: [
                                { id: 'a', text: '尋找百倍幣', isCorrect: false },
                                { id: 'b', text: '本金安全 (生存)', isCorrect: true },
                                { id: 'c', text: '全倉梭哈', isCorrect: false }
                            ],
                            explanation: {
                                text: '本金沒了，遊戲就結束了。活下來，才有輸贏。勝者往往是活得最久的人，而不是跑得最快的人。',
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'level-6',
        level: 6,
        title: 'Final Boss：實戰畢業考',
        description: '綜合應用所有知識，證明你不再是韭菜。通過後將獲得認證徽章。',
        icon: "Trophy",
        chapters: [
            {
                id: 'l6-final',
                title: '畢業考：模擬情境挑戰',
                blocks: [
                    {
                        type: 'text',
                        content: `### 恭喜你走到這裡 🎓
你已經學會了：
*   **Web3 基礎**：錢包與資產安全。
*   **交易所操作**：出入金、現貨與合約。
*   **市場數據**：FGI、資金費率、多空比。
*   **宏觀經濟**：Fed、CPI、流動性週期。
*   **技術策略**：趨勢判斷、支撐壓力、DCA。
*   **交易心理**：克服 FOMO、生存法則。

現在，是時候面對最終考驗了。
這個測驗包含 10 題高難度情境題。
這不是考記憶力，而是考**判斷力**。
祝你好運。`
                    }
                ],
                practice: '深呼吸，這不是演習。準備好你的知識與直覺。',
                cta: {
                    label: '🔥 開始最終挑戰 (Get Certified)',
                    href: '#start-final-quiz',
                    type: 'internal'
                },
                quiz: {
                    id: 'q-final',
                    title: 'CryptoTW 認證交易員資格考',
                    description: '證明你不是韭菜',
                    rewardBadge: 'pro-trader',
                    questions: [
                        {
                            id: 'q1',
                            type: 'scenario',
                            question: '【資產安全】你收到一封 Email 說你的 Metamask 錢包即將被凍結，請點擊連結進行驗證。看起來非常官方，且網址跟真的幾乎一樣。你該怎麼做？',
                            options: [
                                { id: 'a', text: '立刻點進去輸入助記詞解鎖', isCorrect: false },
                                { id: 'b', text: '忽視它。去中心化錢包沒有人能凍結，官方也絕不會要你的助記詞', isCorrect: true },
                                { id: 'c', text: '回信詢問客服確認真偽', isCorrect: false }
                            ],
                            explanation: {
                                text: '這是典型的釣魚詐騙。區塊鏈是非託管的，沒有「官方凍結」這回事。任何索要助記詞的都是詐騙。',
                            }
                        },
                        {
                            id: 'q2',
                            type: 'scenario',
                            question: '【交易策略】比特币剛創下歷史新高 (ATH)，所有媒體都在報導，你的朋友也都問你怎麼買。FGI 指數顯示 95。這時候最危險的動作是？',
                            options: [
                                { id: 'a', text: '分批止盈出場', isCorrect: false },
                                { id: 'b', text: '繼續持有現貨不動', isCorrect: false },
                                { id: 'c', text: '因為怕錯過更高點，開 50 倍槓桿追多', isCorrect: true }
                            ],
                            explanation: {
                                text: '在極度貪婪的情緒下開高槓桿追多，是賠錢最快的方式。一旦行情小幅回調 (去槓桿)，你會立刻爆倉。',
                            }
                        },
                        {
                            id: 'q3',
                            type: 'scenario',
                            question: '【宏觀判斷】聯準會 (Fed) 突然宣布緊急降息 2 碼 (0.5%)，但股市和幣市卻大跌。這最可能是因為與降息同時發生了什麼？',
                            options: [
                                { id: 'a', text: '市場認為降息幅度不夠', isCorrect: false },
                                { id: 'b', text: '市場解讀為「經濟衰退」恐慌，而非資金寬鬆利多', isCorrect: true },
                                { id: 'c', text: '大家錢太多沒地方花', isCorrect: false }
                            ],
                            explanation: {
                                text: '緊急大幅降息通常意味著經濟出了大問題 (衰退)。雖然長期資金變多，但短期恐慌會導致拋售 (衰退交易)。',
                            }
                        },
                        {
                            id: 'q4',
                            type: 'calculation',
                            question: '【風控計算】你有 10,000 U 本金。你想要嚴格執行「單筆虧損不超過 2%」的紀律。若你這次交易的止損空間是 10%，請問你可以開多大的倉位？',
                            options: [
                                { id: 'a', text: '2,000 U', isCorrect: true },
                                { id: 'b', text: '10,000 U', isCorrect: false },
                                { id: 'c', text: '200 U', isCorrect: false }
                            ],
                            explanation: {
                                text: '最大容許虧損 = 10,000 x 2% = 200 U。倉位 x 10% = 200 U。倉位 = 2,000 U。',
                            }
                        },
                        {
                            id: 'q5',
                            type: 'scenario',
                            question: '【數據解讀】你發現某個小幣的合約持倉量 (OI) 暴增，且資金費率變成 -0.1%。同時價格並沒有下跌，反而硬撐在支撐位。這可能是在醞釀？',
                            options: [
                                { id: 'a', text: '空頭陷阱 + 軋空 (Short Squeeze)', isCorrect: true },
                                { id: 'b', text: '多頭出貨', isCorrect: false },
                                { id: 'c', text: '沒人玩了', isCorrect: false }
                            ],
                            explanation: {
                                text: 'OI 增 + 費率負 + 跌不下去 = 很多人在做空，但主力在吸籌接盤。一旦拉盤，空頭會被迫平倉推升幣價，形成軋空。',
                            }
                        },
                        {
                            id: 'q6',
                            type: 'scenario',
                            question: '【心態控制】你剛賣掉一支幣，結果它馬上爆漲 50%。你感到非常痛苦，覺得自己是白癡。這時候最不該做的事情是？',
                            options: [
                                { id: 'a', text: '把電腦關掉，去運動', isCorrect: false },
                                { id: 'b', text: '立刻市價全倉追回來，發誓要賺到這波', isCorrect: true },
                                { id: 'c', text: '檢討賣出的理由是否合理', isCorrect: false }
                            ],
                            explanation: {
                                text: '這叫「報復性交易」或 FOMO 追高。通常心態崩了的操作勝率極低，且容易買在最高點 (山頂)。',
                            }
                        },
                        {
                            id: 'q7',
                            type: 'scenario',
                            question: '【技術分析】RSI 出現了「底背離」(價格創新低，RSI 墊高)，同時價格來到了週線級別的強力支撐區。這是一個？',
                            options: [
                                { id: 'a', text: '高勝率的做多 setup', isCorrect: true },
                                { id: 'b', text: '絕對會漲的訊號', isCorrect: false },
                                { id: 'c', text: '做空的訊號', isCorrect: false }
                            ],
                            explanation: {
                                text: '技術指標 + 關鍵價位 (共振)，是交易勝率最高的時刻。但記住，沒有絕對，仍需設止損。',
                            }
                        },
                        {
                            id: 'q8',
                            type: 'scenario',
                            question: '【交易所常識】為什麼在用網格機器人 (Grid Bot) 時，最怕遇到「單邊行情」？',
                            options: [
                                { id: 'a', text: '因為機器人會壞掉', isCorrect: false },
                                { id: 'b', text: '因為會導致「賣飛」(漲破區間) 或「套牢」(跌破區間)', isCorrect: true },
                            ],
                            explanation: {
                                text: '網格適合震盪。單邊上漲你會把幣越賣越少 (賣飛)，單邊下跌你會把U越買越少 (接刀子套牢)。',
                            }
                        },
                        {
                            id: 'q9',
                            type: 'scenario',
                            question: '【詐騙防範】有人私訊你，說有一個「套利機器人」每天穩賺 1%，只要把 USDT 轉到這個合約地址授權即可。他的群組裡有很多人都說賺翻了。這是？',
                            options: [
                                { id: 'a', text: '千載難逢的機會', isCorrect: false },
                                { id: 'b', text: '典型的龐氏騙局 (Ponzi) 或 盜取授權', isCorrect: true },
                            ],
                            explanation: {
                                text: '每天 1% = 年化 3650%，巴菲特都不敢想。這通常是龐氏騙局 (後金補前金) 或直接騙取你的錢包授權轉走所有資產。',
                            }
                        },
                        {
                            id: 'q10',
                            type: 'scenario',
                            question: '【終極哲學】在加密貨幣市場，什麼樣的人能活得最久，賺到大錢？',
                            options: [
                                { id: 'a', text: '最聰明、智商最高的人', isCorrect: false },
                                { id: 'b', text: '敢開最大的槓桿、最有種的人', isCorrect: false },
                                { id: 'c', text: '有耐心、懂風控、不隨情緒起舞的人', isCorrect: true }
                            ],
                            explanation: {
                                text: 'Crypto 專治各種不服。只有敬畏市場、嚴格風控、有耐心等待週期的人 (HODLer & Disciplined Trader)，才能笑到最後。',
                            }
                        }
                    ]
                }
            }
        ]
    }
]

export function getLearnerLevel(completedChapters: Set<string> | string[]): { level: number, title: string, color: string } {
    const completed = new Set(completedChapters)
    const count = completed.size

    // Simple logic based on count for now, perfect logic would check specific chapter IDs
    // Total chapters approx 12-15

    if (count >= 10) return { level: 3, title: '幣圈老司機', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' }
    if (count >= 5) return { level: 2, title: '數據分析師', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' }
    if (count >= 1) return { level: 1, title: '交易所學徒', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }

    return { level: 0, title: '新手韭菜', color: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20' }
}


console.log(JSON.stringify({ reviews: REVIEWS_DATA, learn: LEARN_LEVELS }, null, 2));
