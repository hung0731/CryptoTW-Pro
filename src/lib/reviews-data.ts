
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
        ]
    },
    {
        id: 'review-mtgox-2014',
        slug: 'mtgox-collapse-2014',
        title: '2014 Mt.Gox 倒閉：第一次大規模交易所信用毀滅',
        year: 2014,
        importance: 'S',
        featuredRank: 5,
        tags: ['交易所風險', '資產遺失', '信任崩潰'],
        marketStates: ['崩跌', '極恐'],
        relatedMetrics: ['price', 'fearGreed'],
        readingMinutes: 6,
        isProOnly: false,
        publishedAt: '2025-12-15',
        updatedAt: '2025-12-15',
        eventStartAt: '2014-02-07',
        eventEndAt: '2014-02-28',

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
        slug: 'the-dao-hack-2016',
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
        slug: 'ico-mania-2017',
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
        slug: 'china-crypto-ban-2021',
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
        slug: 'ethereum-merge-2022',
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
