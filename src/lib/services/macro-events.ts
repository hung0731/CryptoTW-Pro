import fs from 'fs'
import path from 'path'
import {
    MACRO_EVENT_DEFS,
    getNextOccurrence,
    getDaysUntil,
    calculateEventStats,
    getPastOccurrences,
    MacroReaction,
    MacroEventDef,
    MacroEventOccurrence,
    EventSummaryStats
} from '@/lib/macro-events'
import { logger } from '@/lib/logger'

export interface EnrichedMacroEvent {
    def: MacroEventDef
    nextOccurrence: MacroEventOccurrence | undefined
    daysUntil: number
    stats: EventSummaryStats | null
    pastOccurrences: (MacroEventOccurrence & {
        reaction?: MacroReaction;
        linkedReviewSlug?: string;
        linkedReviewTitle?: string;
    })[]
    // For AI Summary payload
    aiPayload: {
        eventType: 'cpi' | 'nfp' | 'fomc'
        eventName: string
        nextDate: string
        daysUntil: number
        stats: {
            avgD1Return: number
            winRate: number
            avgRange: number
            sampleSize: number
        }
        lastEvent?: {
            date: string
            forecast?: number
            actual?: number
            d1Return?: number
        }
    }
    // [NEW v1.1] Narrative & Risk Context
    narrative?: string
    narrativeStatus?: 'neutral' | 'bullish_surprise' | 'bearish_risk'
    riskSignal?: {
        label: string;
        level: 'low' | 'medium' | 'high';
    }
}

export class MacroEventsService {
    private static getDataPath() {
        return path.join(process.cwd(), 'src/data/macro-reactions.json')
    }

    static getReactions(): Record<string, MacroReaction> {
        try {
            const filePath = this.getDataPath()
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf-8')
                const data = JSON.parse(fileContent)
                return data.data || {}
            }
        } catch (error) {
            logger.error('Failed to load reactions:', error, { feature: 'macro-events-service' })
        }
        return {}
    }

    static getCalendarViewModel(): EnrichedMacroEvent[] {
        const reactions = this.getReactions()
        // Lazy load reviews to avoid circular deps if any
        const { REVIEWS_DATA } = require('@/lib/reviews-data') as { REVIEWS_DATA: import('@/lib/reviews-data').MarketEvent[] }

        return MACRO_EVENT_DEFS.map(eventDef => {
            const nextOccurrence = getNextOccurrence(eventDef.key)
            const daysUntil = nextOccurrence ? getDaysUntil(nextOccurrence.occursAt) : 999
            const stats = calculateEventStats(eventDef.key, reactions)

            // Get past occurrences with reactions merged
            const allPastOccurrences = getPastOccurrences(eventDef.key, 36)
            const pastOccurrences = allPastOccurrences
                .filter(occ => {
                    const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                    const reactionKey = `${eventDef.key}-${keyDate}`
                    return !!reactions[reactionKey]
                })
                .slice(0, 11)
                .map(occ => {
                    const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                    const reactionKey = `${eventDef.key}-${keyDate}`

                    // [NEW] Try to find a matching Review for Replay
                    // Check if occ date is close to any review's reactionStartAt
                    const occDate = new Date(occ.occursAt)
                    const linkedReview = REVIEWS_DATA.find(r => {
                        const reviewDate = new Date(r.reactionStartAt)
                        const diffTime = Math.abs(reviewDate.getTime() - occDate.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 3 // Match within 3 days
                    })

                    return {
                        ...occ,
                        reaction: reactions[reactionKey],
                        linkedReviewSlug: linkedReview ? `${linkedReview.slug}-${linkedReview.year}` : undefined,
                        linkedReviewTitle: linkedReview?.title
                    }
                })

            // Construct AI Payload (Pre-calculated)
            const lastWithData = pastOccurrences[0]
            let lastEventForAI = undefined
            if (lastWithData) {
                lastEventForAI = {
                    date: lastWithData.occursAt,
                    forecast: lastWithData.forecast,
                    actual: lastWithData.actual,
                    d1Return: lastWithData.reaction?.stats?.d0d1Return
                }
            }

            const aiPayload = {
                eventType: eventDef.key as 'cpi' | 'nfp' | 'fomc',
                eventName: eventDef.name,
                nextDate: nextOccurrence?.occursAt || '',
                daysUntil,
                stats: {
                    avgD1Return: stats?.avgUp ?? 0,
                    winRate: stats?.d1WinRate ?? 50,
                    avgRange: stats?.avgRange ?? 0,
                    sampleSize: stats?.samples ?? 0
                },
                lastEvent: lastEventForAI
            }

            // [NEW v1.1] Narrative Injection (Mock)
            let narrative = '';
            let narrativeStatus: 'neutral' | 'bullish_surprise' | 'bearish_risk' = 'neutral';
            let riskSignal: { label: string, level: 'low' | 'medium' | 'high' } = { label: '中性', level: 'low' };

            if (eventDef.key === 'cpi') {
                narrative = daysUntil <= 2 ? '通膨降溫預期強，但若高於 3.2% 將引發下殺' : '市場關注核心通膨是否黏著';
                narrativeStatus = daysUntil <= 2 ? 'bearish_risk' : 'neutral';
                riskSignal = { label: '高波動預警', level: 'high' };
            } else if (eventDef.key === 'fomc') {
                narrative = '市場押注不降息，但在尋找 2024 降息指引';
                narrativeStatus = 'neutral';
                riskSignal = { label: '高槓桿風險', level: 'high' };
            } else if (eventDef.key === 'nfp') {
                narrative = '就業數據轉弱將利好風險資產（壞消息是好消息）';
                narrativeStatus = 'bullish_surprise';
                riskSignal = { label: '流動性缺口', level: 'medium' };
            }

            return {
                def: eventDef,
                nextOccurrence,
                daysUntil,
                stats,
                pastOccurrences,
                aiPayload,
                narrative,
                narrativeStatus,
                riskSignal
            }
        })
    }
}
