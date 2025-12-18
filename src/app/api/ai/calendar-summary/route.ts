import { NextResponse } from 'next/server'
import { generateCalendarSummary, CalendarSummaryInput } from '@/lib/gemini'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // 30 minutes cache

export async function POST(request: Request) {
    try {
        const data: CalendarSummaryInput = await request.json()

        // Validate required fields
        if (!data.events || !Array.isArray(data.events) || data.events.length === 0) {
            return NextResponse.json(
                { error: 'Missing events array' },
                { status: 400 }
            )
        }

        const result = await generateCalendarSummary(data)

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to generate summary' },
                { status: 500 }
            )
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Calendar Summary API Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
