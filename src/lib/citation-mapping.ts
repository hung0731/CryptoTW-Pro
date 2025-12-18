export type ChartCitation = {
    indicatorSlug: string;
    indicatorName: string;
    ctaLabel: string; // "這段波動，主要由「資金費率極端化」驅動"
};

export const CHART_CITATION_MAP: Record<string, ChartCitation> = {
    'funding': {
        indicatorSlug: 'funding-rate',
        indicatorName: '資金費率',
        ctaLabel: '這段波動，主要由「資金費率極端化」驅動'
    },
    'oi': {
        indicatorSlug: 'open-interest',
        indicatorName: '未平倉合約量',
        ctaLabel: '此段行情伴隨顯著的「槓桿堆積/去化」'
    },
    'fgi': {
        indicatorSlug: 'fear-greed',
        indicatorName: '恐懼貪婪指數',
        ctaLabel: '市場情緒在此時達到「極端值」'
    },
    'liquidation': {
        indicatorSlug: 'liquidation',
        indicatorName: '清算（爆倉）',
        ctaLabel: '此類走勢常由「連環清算」推動'
    },
    'longShort': {
        indicatorSlug: 'long-short-ratio',
        indicatorName: '多空比',
        ctaLabel: '散戶情緒出現「極端單邊押注」'
    },
    'flow': {
        indicatorSlug: 'etf-flow',
        indicatorName: 'ETF 資金流',
        ctaLabel: '價格變動主要受「機構資金流向」影響'
    },
    'basis': {
        indicatorSlug: 'futures-basis',
        indicatorName: '期貨基差',
        ctaLabel: '期現價差顯示「機構情緒」異常'
    },
    'premium': {
        indicatorSlug: 'coinbase-premium',
        indicatorName: 'Coinbase 溢價',
        ctaLabel: '此走勢反映了強烈的「美國機構買盤」'
    },
    'stablecoin': {
        indicatorSlug: 'stablecoin-supply',
        indicatorName: '穩定幣供應量',
        ctaLabel: '流動性水位支撐了此段行情'
    }
};

export function getChartCitation(chartType: string): ChartCitation | null {
    return CHART_CITATION_MAP[chartType] || null;
}
