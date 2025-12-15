
export type MarketEventImportance = 'S' | 'A' | 'B';
export type MarketState = '極恐' | '過熱' | '修復' | '崩跌' | '觀望';
export type MetricType = 'fearGreed' | 'etfFlow' | 'oi' | 'funding' | 'price' | 'stablecoin';

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
    marketStates: MarketState[];
    relatedMetrics: MetricType[];
    readingMinutes: number;
    isProOnly: boolean;
    publishedAt: string;
    updatedAt: string;
    eventStartAt: string;
    eventEndAt: string;

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
    };

    // 7. Analysis Modules (New)
    historicalComparison: {
        event: string;
        similarity: string;
    };

    actionableChecklist: {
        label: string;
        desc: string;
        type: 'check' | 'alert';
    }[];
}

export const REVIEWS_DATA: MarketEvent[] = [
    {
        id: 'review-etf-2024',
        slug: 'bitcoin-etf-launch-2024',
        title: '2024 比特幣 ETF 上線：預期兌現後的結構性調整',
        year: 2024,
        importance: 'S',
        featuredRank: 1,
        tags: ['ETF', '機構資金', '市場結構'],
        marketStates: ['過熱', '修復'],
        relatedMetrics: ['etfFlow', 'price', 'funding'],
        readingMinutes: 8,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2024-01-01',
        eventEndAt: '2024-01-25',

        usageGuide: [
            '當重大利好消息落地，價格卻不漲反跌時',
            '當市場過度擁擠導致資金費率異常偏高時',
            '當機構資金流向與價格走勢出現背離時'
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
            }
        },

        historicalComparison: {
            event: '2021 Coinbase 直接上市 (IPO)',
            similarity: '兩者皆為幣圈歷史性的合規里程碑，且都在上市當天見到短期價格頂部，隨後市場經歷了數週的估值修正與情緒冷卻。'
        },

        actionableChecklist: [
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
        ]
    },
    {
        id: 'review-ftx-2022',
        slug: 'ftx-collapse-2022',
        title: '2022 FTX 倒閉：中心化信任機制的崩潰',
        year: 2022,
        importance: 'S',
        featuredRank: 2,
        tags: ['系統性風險', '信任危機', '流動性'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'stablecoin', 'fearGreed'],
        readingMinutes: 8,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2022-11-02',
        eventEndAt: '2022-11-15',

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
        ]
    },
    {
        id: 'review-luna-2022',
        slug: 'luna-ust-collapse-2022',
        title: '2022 LUNA/UST 崩潰：算法穩定幣的機制失效',
        year: 2022,
        importance: 'S',
        featuredRank: 3,
        tags: ['算法穩定幣', '機制風險', '死亡螺旋'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'stablecoin', 'fearGreed'],
        readingMinutes: 7,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2022-05-07',
        eventEndAt: '2022-05-13',

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
        ]
    },
    {
        id: 'review-covid-2020',
        slug: 'covid-crash-2020',
        title: '2020 COVID 312 黑天鵝：流動性危機的極致考驗',
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
                desc: '當系統性風險發生時，持有現金 (USD/USDT) 等待恐慌情緒釋放是最佳策略。'
            },
            {
                type: 'check',
                label: '觀察爆倉數據',
                desc: '歷史級別的單日爆倉量 (清洗槓桿) 往往意味著短期底部的接近。'
            },
            {
                type: 'check',
                label: '逆向思維',
                desc: '如果你相信資產的長期價值，像 312 這種非基本面因素導致的流動性崩盤，是十年一遇的戰略性買點。'
            }
        ]
    }
];

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
