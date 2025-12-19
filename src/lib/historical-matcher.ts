import { MarketState as RealtimeState } from '@/lib/market-state'
import { REVIEWS_DATA, MarketEvent, MarketState as HistoricalTag } from '@/lib/reviews-data'

export interface HistoricalMatch {
    event: MarketEvent
    similarityScore: number // 0-100
    matchReason: string
}

/**
 * 根據即時市場狀態，尋找最相似的歷史事件
 */
export function findHistoricalSimilarity(current: RealtimeState): HistoricalMatch | null {
    if (!current) return null

    // 1. Convert Realtime State to Abstract Tags
    const currentTags = deriveCurrentTags(current)

    // 2. Score each historical event
    const scoredEvents = REVIEWS_DATA.map(event => {
        const score = calculateScore(currentTags, event.marketStates)
        return {
            event,
            score
        }
    })

    // 3. Sort by score (desc) and Importance (S > A > B)
    scoredEvents.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        // If tie, prefer Importance 'S'
        if (a.event.importance === 'S') return -1
        if (b.event.importance === 'S') return 1
        return 0
    })

    const bestMatch = scoredEvents[0]

    // Threshold: Need at least some similarity
    if (bestMatch.score < 50) return null

    return {
        event: bestMatch.event,
        similarityScore: bestMatch.score,
        matchReason: generateMatchReason(currentTags, bestMatch.event)
    }
}

/**
 * Derive abstract tags from technical metrics
 */
function deriveCurrentTags(state: RealtimeState): HistoricalTag[] {
    const tags: HistoricalTag[] = []

    // Logic Mapping
    // Overheated: High Funding OR High Long/Short dominance with High Liquidation risk
    if (state.fundingState === '偏多') {
        tags.push('過熱')
    }

    // Fear / Crash: Negative funding OR High Liquidation
    if (state.fundingState === '偏空' || state.liquidationState === '高') {
        if (state.fundingState === '偏空') tags.push('極恐')
        if (state.liquidationState === '高') tags.push('崩跌')
    }

    // Recovery / Wait: Neutral funding
    if (state.fundingState === '中性') {
        if (state.liquidationState === '低') {
            tags.push('觀望')
        } else {
            tags.push('修復')
        }
    }

    return tags
}

/**
 * Calculate similarity score (0-100)
 */
function calculateScore(currentTags: HistoricalTag[], eventTags: HistoricalTag[]): number {
    if (!currentTags.length || !eventTags.length) return 0

    let matches = 0
    currentTags.forEach(tag => {
        if (eventTags.includes(tag)) matches++
    })

    // Jaccard similarity-ish
    // Base score = (matches / combined_unique) * 100
    // But simplified weighting for UX
    const matchRatio = matches / Math.max(currentTags.length, 1)

    // Boost base score to make it look nicer (60-95 range usually)
    let score = matchRatio * 100

    // Bonus for exact primary tag match
    if (matches > 0) score += 20

    return Math.min(Math.round(score), 98)
}

function generateMatchReason(currentTags: HistoricalTag[], event: MarketEvent): string {
    const matchedState = currentTags.find(t => event.marketStates.includes(t)) || currentTags[0]
    return `市場呈現「${matchedState}」結構，類似 ${event.year} 年情境`
}
