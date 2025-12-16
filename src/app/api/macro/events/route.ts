import { NextResponse } from 'next/server'
import { MACRO_EVENT_TYPES, MACRO_EVENT_DATES } from '@/lib/macro-events'

/**
 * GET /api/macro/events
 * Returns upcoming macro events with basic info
 */
export async function GET() {
    try {
        const today = new Date()
        const upcoming: any[] = []

        for (const eventType of MACRO_EVENT_TYPES) {
            // Find the next upcoming date for this event type
            const dates = MACRO_EVENT_DATES[eventType.key] || []

            // Find future dates (or today)
            const futureDate = dates.find(d => new Date(d) >= today)

            if (futureDate) {
                const eventDate = new Date(futureDate)
                const diffTime = eventDate.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                upcoming.push({
                    ...eventType,
                    nextDate: futureDate,
                    daysUntil: diffDays,
                    isToday: diffDays === 0,
                    isThisWeek: diffDays <= 7
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
