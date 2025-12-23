import { INDICATOR_STORIES, IndicatorStory, getZoneLabel } from '@/lib/indicator-stories'
import { logger } from '@/lib/logger'

// Types for the View Model
export interface IndicatorMetricView {
    id: string
    name: string
    slug: string
    value: number
    formattedValue: string
    zone: 'fear' | 'lean_fear' | 'lean_greed' | 'greed'
    zoneLabel: string
    headline: string // e.g. "Greed (74)" or static placeholder
    description: string
    isPro: boolean
    loading: boolean // for client compatibility
}

export interface IndicatorsPageViewModel {
    alphaTools: IndicatorStory[]
    marketMetrics: IndicatorMetricView[]
}

const POPULARITY_ORDER = [
    'fear-greed',
    'funding-rate',
    'liquidation',
    'open-interest',
    'long-short-ratio',
    'etf-flow',
    'coinbase-premium',
    'futures-basis',
    'stablecoin-supply',
    'seasonality',
    'halving-cycles',
    'divergence-screener',
]

export class IndicatorsListService {
    // Helper to calculate zone (replicated from client logic for server consistency)
    private static calculateZone(value: number, story: IndicatorStory): 'fear' | 'lean_fear' | 'lean_greed' | 'greed' {
        const zones = story.chart.zones
        if (value <= zones.fear.max) return 'fear'
        if (value <= zones.leanFear.max) return 'lean_fear'
        if (value <= zones.leanGreed.max) return 'lean_greed'
        return 'greed'
    }

    // Helper to format value
    private static formatValue(value: number, story: IndicatorStory): string {
        const format = story.chart.valueFormat
        const unit = story.chart.unit
        if (format === 'percent') return `${value.toFixed(3)}%`
        if (format === 'ratio') return value.toFixed(2)
        if (unit === 'M') return `$${value.toFixed(0)}M`
        if (unit === 'B') return `$${value.toFixed(1)}B`
        return value.toFixed(0)
    }

    // Helper to get description
    private static getZoneDescription(id: string, zone: string): string {
        // Reuse the descriptions map from client (moved here)
        const descriptions: Record<string, Record<string, string>> = {
            'fear-greed': {
                fear: '市場恐慌，可留意歷史低點行為',
                lean_fear: '情緒偏謹慎，觀望氣氛濃厚',
                lean_greed: '情緒偏樂觀，短線追價需謹慎',
                greed: '市場過熱，歷史顯示回調機率上升',
            },
            'funding-rate': {
                fear: '空頭擁擠，潛在軋空風險',
                lean_fear: '資金費率偏負，空方佔優',
                lean_greed: '資金費率正常偏多',
                greed: '多頭過熱，爆倉燃料累積中',
            },
            'liquidation': {
                fear: '清算清淡，波動偏低',
                lean_fear: '清算正常，市場相對平穩',
                lean_greed: '清算增加，短線波動放大',
                greed: '清算劇烈，市場正在出清槓桿',
            },
            'open-interest': {
                fear: 'OI 偏低，做市觀望中',
                lean_fear: 'OI 正常，無明顯異常',
                lean_greed: 'OI 偏高，槓桿累積中',
                greed: 'OI 過熱，潛在連環爆倉風險',
            },
            'long-short-ratio': {
                fear: '散戶極端偏空，反向指標留意',
                lean_fear: '散戶偏空，市場觀望',
                lean_greed: '散戶偏多，短線追價需謹慎',
                greed: '散戶極端偏多，反向指標警戒',
            },
            'etf-flow': {
                fear: '機構大量撤資，需關注支撐',
                lean_fear: '機構淨流出，買盤減弱',
                lean_greed: '機構持續買入中',
                greed: '機構大量流入，支撐強勁',
            },
            'coinbase-premium': {
                fear: '美國需求疲軟，折價明顯',
                lean_fear: '溢價正常偏低',
                lean_greed: '美國買盤積極',
                greed: '美國需求強勁，溢價拉高',
            },
            'futures-basis': {
                fear: '期貨折價，市場悲觀',
                lean_fear: '基差正常偏低',
                lean_greed: '基差正常偏高',
                greed: '期貨高溢價，套利空間大',
            },
            'stablecoin-supply': {
                fear: '穩定幣供應下降，資金外流',
                lean_fear: '供應正常偏低',
                lean_greed: '供應正常偏高',
                greed: '穩定幣供應充裕，潛在買盤',
            },
        }
        return descriptions[id]?.[zone] || '—'
    }

    private static async fetchIndicatorValue(story: IndicatorStory, baseUrl: string): Promise<number | undefined> {
        try {
            // Only fetch if endpoint is internal API (starts with /api)
            // Since we are server-side, we need absolute URL or call internal helper
            // Assuming endpoint in story.chart.api.endpoint is relative like /api/...
            // We'll mimic the fetch
            const endpoint = story.chart.api.endpoint
            const params = new URLSearchParams({
                range: '1M',
                ...(story.chart.api.params as Record<string, string>)
            })

            // Construct absolute URL for server-side fetch
            const url = `${baseUrl}${endpoint}?${params.toString()}`

            const res = await fetch(url, { next: { revalidate: 60 } }) // Cache for 1 min
            if (!res.ok) return undefined

            const data = await res.json()
            return data.current?.value
        } catch (error) {
            logger.error(`Failed to fetch ${story.id}`, error, { feature: 'indicators-list' })
            return undefined
        }
    }

    static async getPageViewModel(baseUrl: string): Promise<IndicatorsPageViewModel> {
        // 1. Separate Alpha Tools vs Metrics
        const alphaToolIds = ['seasonality', 'halving-cycles', 'divergence-screener']
        const alphaTools = alphaToolIds
            .map(id => INDICATOR_STORIES.find(s => s.id === id))
            .filter(Boolean) as IndicatorStory[]

        const metricIds = POPULARITY_ORDER.filter(id => !alphaToolIds.includes(id))
        const marketMetricsStories = metricIds
            .map(id => INDICATOR_STORIES.find(s => s.id === id))
            .filter(Boolean) as IndicatorStory[]

        // 2. Fetch metrics data in parallel
        const PRO_INDICATORS = ['etf-flow', 'coinbase-premium', 'futures-basis', 'stablecoin-supply']

        const metricsPromises = marketMetricsStories.map(async (story) => {
            const fetchedValue = await this.fetchIndicatorValue(story, baseUrl)

            // Use fetched value or fallback to static current value
            const value = fetchedValue !== undefined ? fetchedValue : (story.currentValue ?? 0)

            const zone = this.calculateZone(value, story)
            const zoneLabel = getZoneLabel(story.id, zone)
            const formattedValue = this.formatValue(value, story)

            return {
                id: story.id,
                name: story.name,
                slug: story.slug,
                value,
                formattedValue,
                zone,
                zoneLabel,
                headline: `${zoneLabel} (${formattedValue})`,
                description: this.getZoneDescription(story.id, zone),
                isPro: PRO_INDICATORS.includes(story.id),
                loading: false
            }
        })

        const marketMetrics = await Promise.all(metricsPromises)

        return {
            alphaTools,
            marketMetrics
        }
    }
}
