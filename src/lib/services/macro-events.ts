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

import { createAdminClient } from '@/lib/supabase-admin'

export class MacroEventsService {

    // [DEPRECATED] No longer using file system
    static getReactions(): Record<string, MacroReaction> {
        return {}
    }

    static async getCalendarViewModel(): Promise<EnrichedMacroEvent[]> {
        const supabase = createAdminClient()

        try {
            // Lazy load reviews
            const { REVIEWS_DATA } = require('@/lib/reviews-data') as { REVIEWS_DATA: import('@/lib/reviews-data').MarketEvent[] }

            // 1. Fetch all events and reactions from DB
            const { data: eventsData, error } = await supabase
                .from('macro_events')
                .select(`
                    *,
                    macro_price_reactions (
                        d0d1_return,
                        max_drawdown,
                        max_upside,
                        price_range,
                        direction,
                        price_data
                    )
                `)
                .order('occurs_at', { ascending: false })

            if (error) throw error

            // Group by event type
            const eventsByType: Record<string, any[]> = {}
            eventsData?.forEach(e => {
                const type = e.event_type
                if (!eventsByType[type]) eventsByType[type] = []
                eventsByType[type].push(e)
            })

            // Map DEFS to Enriched Events
            return MACRO_EVENT_DEFS.map(eventDef => {
                const allEvents = eventsByType[eventDef.key] || []

                // Find next occurrence (first future event)
                const now = new Date()
                // events are sorted desc, so reverse to find first future
                const futureEvents = [...allEvents].reverse().filter(e => new Date(e.occurs_at) > now)
                const nextEvent = futureEvents[0]

                const nextOccurrence: MacroEventOccurrence | undefined = nextEvent ? {
                    eventKey: nextEvent.event_type,
                    occursAt: nextEvent.occurs_at,
                    actual: nextEvent.actual,
                    forecast: nextEvent.forecast, // or previous_actual if we want to use that for next
                    notes: nextEvent.notes
                } : undefined

                const daysUntil = nextOccurrence ? getDaysUntil(nextOccurrence.occursAt) : 999

                // Convert DB reaction format to MacroReaction for compatibility with stats calc
                // This is a bit inefficient but keeps compatibility for now
                const reactionsMap: Record<string, MacroReaction> = {}
                allEvents.forEach(e => {
                    const dateKey = new Date(e.occurs_at).toISOString().split('T')[0]
                    const key = `${eventDef.key}-${dateKey}`
                    if (e.macro_price_reactions) {
                        // reaction is an array in supabase response due to one-to-one mapping returning array? 
                        // Actually one-to-one returns single object if not array mode, but select usually returns array. 
                        // However, with single relation it might be object. Let's handle generic case.
                        // Wait, select(*, macro_price_reactions(*)) returns the joined data.
                        // Since it is 1:1, it should be an object or null if using query builder correctly, 
                        // but Supabase JS sometimes returns array for relations unless single() is used on the relation?
                        // Let's assume it's data properly.

                        const r = Array.isArray(e.macro_price_reactions) ? e.macro_price_reactions[0] : e.macro_price_reactions
                        if (r) {
                            reactionsMap[key] = {
                                eventKey: key,
                                occursAt: e.occurs_at, // Add missing property
                                priceData: r.price_data,
                                stats: {
                                    d0d1Return: r.d0d1_return,
                                    d0d3Return: r.d0d3_return, // Add missing property
                                    maxDrawdown: r.max_drawdown,
                                    maxUpside: r.max_upside,
                                    range: r.price_range,
                                    direction: r.direction
                                }
                            }
                        }
                    }
                })

                const stats = calculateEventStats(eventDef.key, reactionsMap)

                // Process Past Occurrences (Last 36)
                // Filter out future events and take first 36
                const pastDbEvents = allEvents
                    .filter(e => new Date(e.occurs_at) <= now)
                    .slice(0, 36)

                // Map to View Model
                const pastOccurrences = pastDbEvents
                    .slice(0, 11) // Display only last 11
                    .map(e => {
                        const reaction = Array.isArray(e.macro_price_reactions) ? e.macro_price_reactions[0] : e.macro_price_reactions
                        const occDate = new Date(e.occurs_at)

                        // Replay Link Logic
                        const linkedReview = REVIEWS_DATA.find(r => {
                            const reviewDate = new Date(r.reactionStartAt)
                            const diffTime = Math.abs(reviewDate.getTime() - occDate.getTime())
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            return diffDays <= 3
                        })

                        return {
                            eventKey: e.event_type,
                            occursAt: e.occurs_at,
                            actual: e.actual,
                            // Use DB computed previous_actual as forecast if available
                            forecast: e.previous_actual ?? e.forecast,
                            notes: e.notes,
                            reaction: reaction ? {
                                eventKey: e.event_type,
                                occursAt: reaction.occurs_at || e.occurs_at, // Use event date if reaction lacks it
                                priceData: reaction.price_data,
                                stats: {
                                    d0d1Return: reaction.d0d1_return,
                                    d0d3Return: reaction.d0d3_return, // Add missing property
                                    maxDrawdown: reaction.max_drawdown,
                                    maxUpside: reaction.max_upside,
                                    range: reaction.price_range,
                                    direction: reaction.direction
                                }
                            } : undefined,
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

                // [NEW v1.1] Narrative Injection (Mock) - Same as before
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
        } catch (error) {
            logger.error('Failed to get calendar view model from DB:', error, { feature: 'macro-events' })
            return []
        }
    }
}
