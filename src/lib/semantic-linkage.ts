
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
