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
    pastOccurrences: (MacroEventOccurrence & { reaction?: MacroReaction })[]
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
                    // Only include if reaction exists, similar to original filtered list logic
                    // Original filtered by `!!reactions[reactionKey]` then sliced to 11
                    return !!reactions[reactionKey]
                })
                .slice(0, 11)
                .map(occ => {
                    const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                    const reactionKey = `${eventDef.key}-${keyDate}`
                    return {
                        ...occ,
                        reaction: reactions[reactionKey]
                    }
                })

            // Construct AI Payload (Pre-calculated)
            const lastWithData = pastOccurrences[0] // Since it's already sorted and filtered
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

            return {
                def: eventDef,
                nextOccurrence,
                daysUntil,
                stats,
                pastOccurrences,
                aiPayload
            }
        })
    }
}
