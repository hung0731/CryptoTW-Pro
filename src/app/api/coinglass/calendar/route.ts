import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

// Economic Calendar Data (Static/Mock for now as specified in proposal)
// In a real production environment, this should scrape Investing.com or use a paid API

export async function GET() {
    try {
        const today = new Date()
        const calendarData = getMockCalendarData(today)

        return NextResponse.json({
            calendar: {
                events: calendarData,
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Calendar API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            calendar: { events: [], lastUpdated: new Date().toISOString() }
        })
    }
}

function getMockCalendarData(date: Date) {
    // Generate dates
    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    // Recent & Upcoming important events
    return [
        {
            id: '1',
            date: formatDate(date),
            time: '20:30',
            currency: 'USD',
            country: '🇺🇸',
            event: '非農就業人口 (Non-Farm Employment Change)',
            importance: 3, // 1-3 stars
            actual: '199K',
            forecast: '180K',
            previous: '150K',
            impact: 'high', // high, medium, low
            effect: 'bullish' // bullish for USD if high, bearish for crypto
        },
        {
            id: '2',
            date: formatDate(date),
            time: '22:00',
            currency: 'USD',
            country: '🇺🇸',
            event: 'ISM 非製造業 PMI',
            importance: 2,
            actual: '',
            forecast: '52.0',
            previous: '51.8',
            impact: 'medium',
            effect: 'neutral'
        },
        {
            id: '3',
            date: formatDate(new Date(date.getTime() + 86400000)), // Tomorrow
            time: '02:00',
            currency: 'USD',
            country: '🇺🇸',
            event: 'FOMC 利率決議 (Fed Interest Rate Decision)',
            importance: 3,
            actual: '',
            forecast: '5.50%',
            previous: '5.50%',
            impact: 'critical', // critical
            effect: 'volatile'
        },
        {
            id: '4',
            date: formatDate(new Date(date.getTime() + 86400000)),
            time: '20:30',
            currency: 'USD',
            country: '🇺🇸',
            event: 'CPI 消費者物價指數 (MoM)',
            importance: 3,
            actual: '',
            forecast: '0.1%',
            previous: '0.0%',
            impact: 'high',
            effect: 'bearish'
        },
        {
            id: '5',
            date: formatDate(new Date(date.getTime() + 86400000 * 2)), // Day after tomorrow
            time: '20:30',
            currency: 'USD',
            country: '🇺🇸',
            event: 'PPI 生產者物價指數 (MoM)',
            importance: 2,
            actual: '',
            forecast: '0.1%',
            previous: '-0.5%',
            impact: 'medium',
            effect: 'neutral'
        }
    ]
}
