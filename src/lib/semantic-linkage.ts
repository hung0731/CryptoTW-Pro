
export interface RelatedIndicator {
    name: string;
    slug: string;
    reason: string; // The "Why" displayed in the tooltip or label
    matchPattern?: string; // e.g. "Funding rate extreme"
    matchProb?: string; // e.g. "67%"
}

export interface RelatedEventStats {
    eventKey: string;
    eventName: string; // e.g. "CPI", "FOMC"
    hitRate: string; // e.g. "8/12"
    context: string; // e.g. "Funding Rate x CPI"
    slug: string; // e.g. "cpi-us"
}

// Map Event Key (from macro-events.ts) to Indicator Slug
const EVENT_TO_INDICATOR_MAP: Record<string, RelatedIndicator> = {
    'cpi-core-us': {
        name: '資金費率',
        slug: 'funding-rate-aggregated',
        reason: 'CPI 公布前後，市場情緒與資金費率的極端值往往預示反轉',
        matchPattern: '費率極端化伴隨下殺',
        matchProb: '67%'
    },
    'fomc-rate-decision': {
        name: '未平倉合約 (OI)',
        slug: 'open-interest-aggregated',
        reason: '利率決策對槓桿影響巨大，OI 的劇烈變化是主要觀察點',
        matchPattern: 'OI 快速積累',
        matchProb: '75%'
    },
    'nfp-us': {
        name: '多空比 (Long/Short)',
        slug: 'long-short-ratio',
        reason: '非農數據常引發散戶過度反應，觀察多空比可捕捉假突破',
        matchPattern: '多空比失衡',
        matchProb: '60%'
    }
    // Default fallback
};

// Map Indicator Slug to Event Types
const INDICATOR_TO_EVENTS_MAP: Record<string, RelatedEventStats[]> = {
    'funding-rate-aggregated': [
        {
            eventKey: 'cpi-core-us',
            eventName: 'CPI',
            hitRate: '8/12',
            context: 'CPI × 資金費率',
            slug: 'cpi-core-us'
        },
        {
            eventKey: 'fomc-rate-decision',
            eventName: 'FOMC',
            hitRate: '5/8',
            context: 'FOMC × 資金費率',
            slug: 'fomc-rate-decision'
        }
    ],
    'open-interest-aggregated': [
        {
            eventKey: 'fomc-rate-decision',
            eventName: 'FOMC',
            hitRate: '9/12',
            context: 'FOMC × OI 變化',
            slug: 'fomc-rate-decision'
        }
    ]
};

export function getRelatedIndicator(eventKey: string): RelatedIndicator | null {
    // Attempt to find direct match
    if (EVENT_TO_INDICATOR_MAP[eventKey]) {
        return EVENT_TO_INDICATOR_MAP[eventKey];
    }
    // Simple fallback logic or null
    return {
        name: '資金費率',
        slug: 'funding-rate-aggregated',
        reason: '此類宏觀事件常引發情緒波動，資金費率是最佳觀察指標',
        matchPattern: '費率異常',
        matchProb: '55%'
    };
}

export function getRelatedEvents(indicatorSlug: string): RelatedEventStats[] {
    return INDICATOR_TO_EVENTS_MAP[indicatorSlug] || [];
}

// ============================================
// Part 2: 指標間關聯 (Indicator-to-Indicator)
// ============================================

export interface RelatedIndicatorConcept {
    indicatorId: string;       // 指標 ID (對應 indicator-stories.ts)
    name: string;              // 顯示名稱
    slug: string;              // 路由 slug
    relationship: 'prerequisite' | 'complementary' | 'contrast';
    reason: string;            // 為什麼相關（一句話）
}

// 指標 → 相關指標 映射
const INDICATOR_RELATIONS: Record<string, RelatedIndicatorConcept[]> = {
    'fear-greed': [
        {
            indicatorId: 'funding-rate', name: '資金費率', slug: 'funding-rate',
            relationship: 'complementary', reason: '恐貪指數高時，資金費率通常也偏高，可交叉驗證'
        },
        {
            indicatorId: 'long-short-ratio', name: '多空比', slug: 'long-short-ratio',
            relationship: 'complementary', reason: '情緒極端時，多空比常呈現一致方向'
        },
    ],
    'funding-rate': [
        {
            indicatorId: 'liquidation', name: '清算數據', slug: 'liquidation',
            relationship: 'complementary', reason: '費率極端後常伴隨大規模清算'
        },
        {
            indicatorId: 'open-interest', name: '未平倉量', slug: 'open-interest',
            relationship: 'prerequisite', reason: '理解 OI 有助於判斷費率是否可持續'
        },
        {
            indicatorId: 'long-short-ratio', name: '多空比', slug: 'long-short-ratio',
            relationship: 'complementary', reason: '費率 + 多空比可判斷槓桿方向'
        },
    ],
    'liquidation': [
        {
            indicatorId: 'funding-rate', name: '資金費率', slug: 'funding-rate',
            relationship: 'complementary', reason: '費率極端是清算的前兆'
        },
        {
            indicatorId: 'long-short-ratio', name: '多空比', slug: 'long-short-ratio',
            relationship: 'complementary', reason: '判斷清算的多空方向'
        },
        {
            indicatorId: 'open-interest', name: '未平倉量', slug: 'open-interest',
            relationship: 'complementary', reason: 'OI 急降 = 清算發生中'
        },
    ],
    'open-interest': [
        {
            indicatorId: 'funding-rate', name: '資金費率', slug: 'funding-rate',
            relationship: 'complementary', reason: 'OI 上升 + 費率極端 = 高風險'
        },
        {
            indicatorId: 'liquidation', name: '清算數據', slug: 'liquidation',
            relationship: 'complementary', reason: 'OI 急降通常伴隨清算'
        },
    ],
    'long-short-ratio': [
        {
            indicatorId: 'funding-rate', name: '資金費率', slug: 'funding-rate',
            relationship: 'complementary', reason: '多空比 + 費率可交叉驗證情緒'
        },
        {
            indicatorId: 'fear-greed', name: '恐懼貪婪', slug: 'fear-greed',
            relationship: 'complementary', reason: '情緒端指標互相印證'
        },
    ],
    'etf-flow': [
        {
            indicatorId: 'coinbase-premium', name: 'Coinbase 溢價', slug: 'coinbase-premium',
            relationship: 'complementary', reason: '兩者皆反映美國機構資金動向'
        },
        {
            indicatorId: 'stablecoin-supply', name: '穩定幣供應', slug: 'stablecoin-supply',
            relationship: 'complementary', reason: 'ETF 流入 + 穩定幣增加 = 牛市訊號'
        },
    ],
    'futures-basis': [
        {
            indicatorId: 'funding-rate', name: '資金費率', slug: 'funding-rate',
            relationship: 'complementary', reason: '基差與費率都反映市場槓桿程度'
        },
        {
            indicatorId: 'open-interest', name: '未平倉量', slug: 'open-interest',
            relationship: 'complementary', reason: '高基差 + 高 OI = 槓桿過熱'
        },
    ],
    'coinbase-premium': [
        {
            indicatorId: 'etf-flow', name: 'ETF 資金流', slug: 'etf-flow',
            relationship: 'complementary', reason: '兩者皆反映美國機構買盤'
        },
    ],
    'stablecoin-supply': [
        {
            indicatorId: 'etf-flow', name: 'ETF 資金流', slug: 'etf-flow',
            relationship: 'complementary', reason: '穩定幣 + ETF 同步增長 = 強趨勢'
        },
    ],
};

export function getRelatedIndicators(indicatorId: string): RelatedIndicatorConcept[] {
    return INDICATOR_RELATIONS[indicatorId] || [];
}

// ============================================
// Part 3: 基礎概念定義 (為 /learn 預留)
// ============================================

export interface KnowledgeConcept {
    id: string;
    term: string;              // 術語名稱
    definition: string;        // 一句話定義
    learnMoreSlug?: string;    // 未來 /learn/[slug] 連結
}

// 指標 → 前置概念 映射
const INDICATOR_CONCEPTS: Record<string, KnowledgeConcept[]> = {
    'fear-greed': [
        {
            id: 'market-sentiment', term: '市場情緒',
            definition: '投資者對市場的整體樂觀或悲觀程度'
        },
        {
            id: 'contrarian-indicator', term: '反向指標',
            definition: '當多數人看法一致時，市場往往反向發展'
        },
    ],
    'etf-flow': [
        {
            id: 'etf', term: 'ETF（交易所交易基金）',
            definition: '在交易所上市、可買賣的投資基金，追蹤特定資產'
        },
        {
            id: 'institutional-investor', term: '機構投資者',
            definition: '以專業方式管理大量資金的組織，如基金、銀行'
        },
    ],
    'funding-rate': [
        {
            id: 'perpetual-contract', term: '永續合約',
            definition: '無到期日的期貨合約，透過資金費率與現貨價格錨定'
        },
        {
            id: 'leverage', term: '槓桿交易',
            definition: '借入資金放大倉位，同時放大收益與風險'
        },
    ],
    'liquidation': [
        {
            id: 'margin', term: '保證金',
            definition: '開立槓桿倉位所需的抵押金'
        },
        {
            id: 'maintenance-margin', term: '維持保證金',
            definition: '維持倉位所需的最低保證金，低於此會被強制平倉'
        },
    ],
    'open-interest': [
        {
            id: 'perpetual-contract', term: '永續合約',
            definition: '無到期日的期貨合約，透過資金費率與現貨價格錨定'
        },
        {
            id: 'open-position', term: '持倉',
            definition: '尚未平倉的合約倉位，代表市場上的未結算籌碼'
        },
    ],
    'long-short-ratio': [
        {
            id: 'long-position', term: '多頭',
            definition: '看漲持倉，預期價格上漲時獲利'
        },
        {
            id: 'short-position', term: '空頭',
            definition: '看跌持倉，預期價格下跌時獲利'
        },
    ],
    'futures-basis': [
        {
            id: 'spot-price', term: '現貨價格',
            definition: '當下市場即時交易價格'
        },
        {
            id: 'futures-price', term: '期貨價格',
            definition: '期貨合約的交易價格，反映市場對未來價格的預期'
        },
    ],
    'coinbase-premium': [
        {
            id: 'price-premium', term: '溢價',
            definition: '某交易所價格高於其他交易所的差額'
        },
        {
            id: 'regional-demand', term: '區域需求',
            definition: '不同地區（如美國、亞洲）對比特幣的需求差異'
        },
    ],
    'stablecoin-supply': [
        {
            id: 'stablecoin', term: '穩定幣',
            definition: '與法幣（如美元）掛鉤的加密貨幣，價值相對穩定'
        },
        {
            id: 'market-liquidity', term: '市場流動性',
            definition: '市場中可用於交易的資金量，流動性高代表買賣容易'
        },
    ],
};

export function getPrerequisiteConcepts(indicatorId: string): KnowledgeConcept[] {
    return INDICATOR_CONCEPTS[indicatorId] || [];
}
