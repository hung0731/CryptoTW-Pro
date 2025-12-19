
export type MarketEventImportance = 'S' | 'A' | 'B';
export type MarketState = '極恐' | '過熱' | '修復' | '崩跌' | '觀望';
export type MetricType = 'fearGreed' | 'etfFlow' | 'oi' | 'funding' | 'price' | 'stablecoin' | 'liquidation' | 'longShort' | 'basis' | 'premium';

export type TimelineRiskLevel = 'high' | 'medium' | 'low';

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
    };
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

    // 2. Context
    context: {
        what: string;
        narrative: string;
        realImpact: string;
    };

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

export const REVIEWS_DATA: MarketEvent[] = [
    {
        id: 'review-etf-2024',
        slug: 'etf',
        title: '2024 比特幣 ETF 上線：預期兌現後的結構性調整',
        year: 2024,
        importance: 'S',
        featuredRank: 1,
        tags: ['ETF', '機構資金', '市場結構'],
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
            daysBuffer: 10
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
        tags: ['系統性風險', '信任危機', '流動性'],
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
            '當公鏈代幣與其生態系項目出現異常連動下跌時'
        ],

        summary: '當 FTX 宣佈破產時，市場真正面對的不是單純的資產跌價，而是中心化信任機制的全面崩潰與流動性真空。',

        context: {
            what: '全球流動性第二大的加密貨幣交易所 FTX 因資產挪用與流動性枯竭宣告破產。',
            narrative: '事件初期，市場普遍認為 FTX 具備「大到不能倒」的系統重要性，並將流動性問題視為短期謠言。',
            realImpact: '該事件揭露了不透明的內部槓桿操作，引發了全產業的信用緊縮 (Credit Crunch) 與償付能力危機。'
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
            daysBuffer: 7
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
        tags: ['算法穩定幣', '機制風險', '死亡螺旋'],
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
            daysBuffer: 5
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
            similarity: '兩者皆涉及高槓桿、結構複雜的金融產品崩潰，且投資人皆因「市場規模極大」而忽視了底層資產質量的脆弱性。'
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
        tags: ['黑天鵝', '流動性危機', '連鎖爆倉'],
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
            daysBuffer: 10
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
        tags: ['交易所風險', '資產遺失', '信任崩潰'],
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
            daysBuffer: 14
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
        tags: ['智能合約', '治理分歧', '硬分叉'],
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
        impactSummary: '智能合約漏洞導致以太坊硬分叉，確立了回滾機制的可能性。',

        usageGuide: [
            '當新型智能合約協議出現安全漏洞時',
            '當社群面臨是否介入逆轉交易的辯論時',
            '當鏈上治理出現重大分歧時'
        ],

        summary: '當 The DAO 被駭客盜取 360 萬枚 ETH 時，以太坊社群選擇硬分叉逆轉交易，這重新定義了「不可竄改」的邊界。',

        context: {
            what: '史上最大的群眾募資項目 The DAO 因智能合約漏洞被盜取約 5,000 萬美元的以太幣。',
            narrative: '市場當時相信智能合約是「程式碼即法律」，無需人為干預。',
            realImpact: '事件導致以太坊硬分叉，分裂為 ETH 與 ETC，開創了社群可投票逆轉交易的先例。'
        },

        initialState: {
            price: 'ETH 約 $20，剛完成大型群募',
            fearGreed: '極度恐慌 - 項目資金被盜'
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
            daysBuffer: 14
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
        tags: ['ICO', '散戶狂熱', '熊市前兆'],
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
        impactSummary: 'ICO 狂熱導致 ETH 需求激增，泡沫破裂後 90% 項目歸零。',

        usageGuide: [
            '當新幣發行速度遠超市場資金承接能力時',
            '當「萬物皆可代幣化」成為主流敘事時'
        ],

        summary: '當任何項目都能透過 ICO 募集數百萬美元時，市場過熱的訊號已非常明確。',

        context: {
            what: '2017 年 ICO 狂潮見證了超過 50 億美元透過代幣發行募集，多數項目最終歸零。',
            narrative: '白皮書即正義，任何聽起來有區塊鏈概念的項目都能輕易募資。',
            realImpact: '這次泡沫教育了一整代散戶投資者，也催生了監管對證券型代幣的關注。'
        },

        initialState: {
            price: 'ETH 從年初 $8 飆升至 $1,400',
            fearGreed: '極度貪婪 - 散戶蜂擁進場'
        },

        misconceptions: [
            {
                myth: '白皮書代表真實的商業計畫',
                fact: '多數 ICO 項目僅有概念，缺乏可執行的產品或團隊，最終 80% 以上歸零。'
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
                description: '大量項目透過以太坊發行代幣，募資金額屢創新高。',
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
            daysBuffer: 30
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
            similarity: '兩者都是新技術引發的過度投機，最終只有少數優質項目存活。'
        },

        actionableChecklist: [
            {
                type: 'alert',
                label: '審視項目基本面',
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
        tags: ['監管政策', '算力遷徙', '供給衝擊'],
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
            daysBuffer: 14
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
        tags: ['以太坊', '共識機制', 'PoS'],
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
            daysBuffer: 14
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
        tags: ['減半', '供給衝擊', '稀缺性'],
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
            daysBuffer: 30
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
        tags: ['減半', '週期', '機構關注'],
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
            daysBuffer: 30
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
        tags: ['減半', '機構入場', '供給衝擊'],
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
            daysBuffer: 30
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
        tags: ['減半', 'ETF', '機構需求', '供給衝擊'],
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
            daysBuffer: 30
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
        tags: ['DeFi', '流動性挖礦', 'TVL'],
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
            daysBuffer: 30
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
        tags: ['機構入場', '企業配置', 'Elon Musk'],
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
            daysBuffer: 14
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
        tags: ['IPO', '合規', '機構化'],
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
            daysBuffer: 14
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
        tags: ['國家採用', '法規', '實驗'],
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
            daysBuffer: 14
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
        tags: ['CeFi', '擠兌', '借貸危機'],
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
            daysBuffer: 14
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
        tags: ['對沖基金', '槓桿', '清算'],
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
            daysBuffer: 14
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
        tags: ['監管', 'SEC', '合規'],
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
            daysBuffer: 14
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
        tags: ['監管', 'SEC', 'XRP'],
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
            daysBuffer: 14
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
        tags: ['交易所', '合規', '和解'],
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
            daysBuffer: 14
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
        tags: ['Macro Shock', 'Black Swan', 'Liquidity Crisis'],
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
            daysBuffer: 10
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
        tags: ['Supply Shock', 'Government Selling'],
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
            daysBuffer: 7
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
        tags: ['Geopolitics', 'Flash Crash'],
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
        title: '2021/05 槓桿崩盤：多殺多連環爆倉',
        year: 2021,
        type: 'leverage_cleanse',
        impactSummary: '長期偏正費率 + 高 OI，回調時形成連環爆倉',
        importance: 'B',
        tags: ['槓桿崩盤', '多殺多', '連鎖爆倉'],
        marketStates: ['崩跌', '過熱'],
        relatedMetrics: ['funding', 'oi', 'fearGreed'],
        readingMinutes: 4,
        isProOnly: false,
        publishedAt: '2025-12-17',
        updatedAt: '2025-12-17',
        eventStartAt: '2021-05-12',
        eventEndAt: '2021-05-19',
        reactionStartAt: '2021-05-12',
        reactionType: 'trust_collapse',
        impactedTokens: ['BTC', 'ETH'],
        usageGuide: [
            '當資金費率持續偏高時（>0.01%）',
            '當 OI 累積過高且價格開始走弱時'
        ],
        summary: '牛市中後段，資金費率長期偏正 + 持倉量高位堆積，Elon Musk 推特成為導火索，引發多殺多連環爆倉。',
        context: {
            what: 'Tesla 暫停 BTC 支付 + 中國加強監管，引發槓桿多頭踩踏式出逃。',
            narrative: '牛市還在繼續，買跌就對了。',
            realImpact: '過度擁擠的多頭槓桿形成連鎖清算，單週跌幅超過 30%。'
        },
        initialState: {
            price: '$58,000 → $30,000',
            fearGreed: '75（貪婪）→ 10（極度恐懼）',
            funding: '持續 > 0.03% 偏高',
            oi: '歷史高位'
        },
        misconceptions: [
            {
                myth: '這是牛市正常回調，很快會反彈',
                fact: '當槓桿過度擁擠時，回調會被放大成崩盤，恢復時間遠超預期。'
            }
        ],
        timeline: [
            {
                date: '2021-05-12',
                title: 'Elon Musk 推特',
                description: 'Tesla 暫停接受 BTC 購車。',
                marketImpact: 'BTC 單日跌 10%，情緒急轉。',
                riskState: '恐慌開始',
                riskLevel: 'high'
            },
            {
                date: '2021-05-19',
                title: '連環爆倉',
                description: '價格跌破 $40,000 後觸發大規模清算。',
                marketImpact: '單日清算超過 $8B，多殺多加劇。',
                riskState: '流動性危機',
                riskLevel: 'high'
            }
        ],
        charts: {
            flow: {
                url: '',
                caption: '圖表解讀：ETF 凈流出入與價格呈現高度相關性。'
            },
            oi: {
                url: '',
                caption: '圖表解讀：OI 隨着 ETF 資金持續堆積，顯示機構持續加倉。',
                interpretation: {
                    whatItMeans: '持倉量驟降代表槓桿被強制去化。',
                    whatToWatch: '當 OI 降至低點且費率轉負時，通常是階段性底部。'
                }
            },
            funding: {
                url: '',
                caption: '圖表解讀：長期偏正費率，多頭過度擁擠，回調時形成連環爆倉。',
                interpretation: {
                    whatItMeans: '費率過高代表槓桿過熱。',
                    whatToWatch: '費率是否快速轉負（清洗完成）。'
                }
            },
            liquidation: {
                url: '',
                caption: '圖表解讀：單日清算超過 $8B，多殺多加劇。',
                interpretation: {
                    whatItMeans: '清算量驟增是去槓桿的標誌。',
                    whatToWatch: '清算峰值通常對應短期底部。'
                }
            },
            longShort: {
                url: '',
                caption: '圖表解讀：長時間偏多，下跌時形成多殺多連環爆倉。',
                interpretation: {
                    whatItMeans: '高多空比 + 價格下跌 = 多殺多。',
                    whatToWatch: '多空比回落至中性區域。'
                }
            },
            main: {
                url: '',
                caption: '圖表解讀：高位堆積的槓桿 + 突發利空 = 多殺多崩盤結構。'
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：情緒從極度貪婪 (75) 直接墜入極度恐懼 (10)。'
            }
        },
        historicalComparison: {
            event: '2020/03 COVID',
            similarity: '都是槓桿去化型崩盤，清算主導下跌。'
        },
        actionableChecklist: [
            { type: 'alert', label: '費率偏高警示', desc: '當費率 > 0.01% 持續多日，降低槓桿。' }
        ]
    },
    // ================================================
    // 2024/03 新高回調
    // ================================================
    {
        id: 'review-2024-03',
        slug: '2024-ath-pullback',
        title: '2024/03 新高回調：槓桿升溫後的典型清算',
        year: 2024,
        type: 'leverage_cleanse',
        impactSummary: '新高附近槓桿升溫，費率偏高引發回調',
        importance: 'B',
        tags: ['新高', '回調', '清算'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['funding', 'oi', 'price'],
        readingMinutes: 3,
        isProOnly: false,
        publishedAt: '2025-12-17',
        updatedAt: '2025-12-17',
        eventStartAt: '2024-03-14',
        eventEndAt: '2024-03-20',
        reactionStartAt: '2024-03-14',
        reactionType: 'priced_in',
        impactedTokens: ['BTC'],
        usageGuide: [
            '當價格創新高但費率急升時',
            '當 OI 快速堆積時警惕回調'
        ],
        summary: 'BTC 創下 $73,000 新高後，資金費率飆升，槓桿過熱導致 15% 回調。',
        context: {
            what: 'ETF 資金推動 BTC 創新高，但槓桿跟進速度過快。',
            narrative: 'ETF 持續買入，上看 10 萬。',
            realImpact: '費率偏高 + OI 急升 = 典型的清算前兆。'
        },
        initialState: {
            price: '$73,000 → $62,000',
            fearGreed: '85（極度貪婪）→ 65',
            funding: '0.025% 偏高'
        },
        misconceptions: [
            {
                myth: '有 ETF 買盤，不會大跌',
                fact: 'ETF 是現貨買盤，無法阻止合約市場的槓桿清算。'
            }
        ],
        timeline: [
            {
                date: '2024-03-14',
                title: '創新高 $73,000',
                description: '費率飆升至 0.03%。',
                marketImpact: '槓桿過熱訊號明確。',
                riskState: '過熱',
                riskLevel: 'medium'
            },
            {
                date: '2024-03-15',
                title: '回調開始',
                description: '多頭清算引發連鎖反應。',
                marketImpact: '24H 清算超過 $1B。',
                riskState: '去槓桿',
                riskLevel: 'high'
            }
        ],
        charts: {
            main: { url: '', caption: '新高 + 高費率 = 回調風險升高' },
            oi: {
                url: '',
                caption: '圖表解讀：OI 在新高處快速堆積，隨後隨價格回調而減少。',
                interpretation: {
                    whatItMeans: '這是典型的多頭獲利了結與追高者被清洗的過程。',
                    whatToWatch: 'OI 是否回歸健康水位。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：FGI 從極度貪婪回落至修復區間。'
            },
            funding: {
                url: '',
                caption: '圖表解讀：創新高時費率飆升，顯示突破是由高槓桿推動而非現貨。',
                interpretation: {
                    whatItMeans: '高費率突破往往難以持續。',
                    whatToWatch: '費率回落後的價格支撐測試。'
                }
            }
        },
        historicalComparison: {
            event: '2021/04 ATH',
            similarity: '新高附近槓桿過熱後的回調結構相似。'
        },
        actionableChecklist: [
            { type: 'alert', label: '新高警示', desc: '創新高時若費率 > 0.02%，考慮減倉。' }
        ]
    },
    // ================================================
    // 2021/11 高位接盤
    // ================================================
    {
        id: 'review-2021-11',
        slug: '2021-nov-top',
        title: '2021/11 高位接盤：OI 見頂訊號',
        year: 2021,
        type: 'market_structure',
        impactSummary: '高位 OI + 價格走弱 = 典型頂部結構',
        importance: 'B',
        tags: ['頂部', 'OI', '分配'],
        marketStates: ['過熱', '觀望'],
        relatedMetrics: ['oi', 'price', 'fearGreed'],
        readingMinutes: 3,
        isProOnly: false,
        publishedAt: '2025-12-17',
        updatedAt: '2025-12-17',
        eventStartAt: '2021-11-10',
        eventEndAt: '2021-11-14',
        reactionStartAt: '2021-11-10',
        reactionType: 'priced_in',
        impactedTokens: ['BTC'],
        usageGuide: [
            '當 OI 創新高但價格無法跟進時',
            '當價格走弱但 OI 不降時',
            '當期貨基差 (Basis) 異常飆升至 20% 以上時'
        ],
        summary: 'BTC 創下 $69,000 歷史新高後，OI 維持高位但價格開始走弱，形成典型的頂部分配結構。',
        context: {
            what: '牛市頂部，槓桿高位但現貨買盤不足。',
            narrative: '年底上看 10 萬。',
            realImpact: 'OI 高位 + 價格走弱 = 長達一年的熊市開端。'
        },
        initialState: {
            price: '$69,000 → $55,000 (一週)',
            fearGreed: '84（極度貪婪）→ 50',
            oi: '歷史新高'
        },
        misconceptions: [
            {
                myth: 'OI 增加代表市場看漲',
                fact: '高 OI + 價格走弱代表槓桿多頭被套，是危險訊號。'
            }
        ],
        timeline: [
            {
                date: '2021-11-10',
                title: '創 $69,000 ATH',
                description: 'OI 同步創新高。',
                marketImpact: '表面強勢，實則分配開始。',
                riskState: '表面樂觀',
                riskLevel: 'medium'
            },
            {
                date: '2021-11-14',
                title: '價格開始走弱',
                description: 'OI 維持但價格下跌。',
                marketImpact: '槓桿多頭開始被套。',
                riskState: '分配階段',
                riskLevel: 'high'
            }
        ],
        charts: {
            main: { url: '', caption: 'OI 頂背離：價格走弱但 OI 不降' },
            oi: {
                url: '',
                caption: '圖表解讀：OI 在高位維持不墜，顯示多頭不願離場，最終成為下跌燃料。',
                interpretation: {
                    whatItMeans: '價格下跌但 OI 不降，代表主力出貨給槓桿散戶。',
                    whatToWatch: 'OI 何時開始崩潰，通常伴隨大跌。'
                }
            },
            basis: {
                url: '',
                caption: '圖表解讀：年化基差飆升至 25%，市場極度樂觀，典型的頂部特徵。',
                interpretation: {
                    whatItMeans: '過高的基差代表期貨市場過度擁擠。',
                    whatToWatch: '基差快速收斂通常對應價格下跌。'
                }
            },
            sentiment: {
                url: '',
                caption: '圖表解讀：FGI 長期處於貪婪高位，隨後快速冷卻。'
            },

        },
        historicalComparison: {
            event: '2017/12 頂部',
            similarity: '都是 OI/成交量頂背離後的長期熊市。'
        },
        actionableChecklist: [
            { type: 'alert', label: 'OI 頂背離', desc: '價格走弱但 OI 不降時，警惕頂部。' }
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
        tags: ['去槓桿', '3AC', 'Celsius'],
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
        tags: ['軋空', '銀行危機', '反彈'],
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
