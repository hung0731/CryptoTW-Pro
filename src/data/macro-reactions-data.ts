// Auto-generated from scripts/fetch-macro-reactions.js
// This file exports the pre-calculated BTC price reactions for macro events

export interface MacroReactionStats {
    d0d1Return: number | null
    d0d3Return: number | null
    maxDrawdown: number
    maxUpside: number
    range: number
    direction: 'up' | 'down' | 'chop'
}

export interface MacroPricePoint {
    date: string
    close: number
    high: number
    low: number
}

export interface MacroReaction {
    eventKey: string
    occursAt: string
    stats: MacroReactionStats
    priceData: MacroPricePoint[]
}

// Data imported from macro-reactions.json
import rawData from './macro-reactions.json'

export const MACRO_REACTIONS: Record<string, MacroReaction> = rawData.data as Record<string, MacroReaction>

export function getReaction(eventKey: string, date: string): MacroReaction | undefined {
    const key = `${eventKey}-${date}`
    return MACRO_REACTIONS[key]
}
