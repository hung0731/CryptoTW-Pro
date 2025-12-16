import { NextResponse } from 'next/server'
import { MACRO_EVENT_DEFS, getNextOccurrence } from '@/lib/macro-events'

/**
 * GET /api/macro/events
 * Returns upcoming macro events with basic info
 */
export async function GET() {
    try {
        const today = new Date()
        const upcoming: any[] = []

        for (const eventDef of MACRO_EVENT_DEFS) {
            const nextEvent = getNextOccurrence(eventDef.key)

            if (nextEvent) {
                const eventDate = new Date(nextEvent.occursAt)
                const diffTime = eventDate.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                upcoming.push({
                    ...eventDef,
                    nextDate: nextEvent.occursAt,
                    daysUntil: diffDays,
                    isToday: diffDays === 0,
                    isThisWeek: diffDays <= 7,
                    notes: nextEvent.notes
                })
            }
        }

        // Sort by date (soonest first)
        upcoming.sort((a, b) => a.daysUntil - b.daysUntil)

        return NextResponse.json({
            success: true,
            data: upcoming
        })
    } catch (error) {
        console.error('Error fetching macro events:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch macro events'
        }, { status: 500 })
    }
}
