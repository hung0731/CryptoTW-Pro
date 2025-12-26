/**
 * Economic Event Schedule Generator
 * 
 * Generates future release dates for CPI, NFP, and FOMC based on known patterns.
 * 
 * Sources:
 * - CPI: https://www.bls.gov/schedule/news_release/cpi.htm
 * - NFP: https://www.bls.gov/schedule/news_release/empsit.htm  
 * - FOMC: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
 */

// Known FOMC meeting dates (2024-2026)
// These are typically announced 1+ year in advance
const FOMC_DATES_2024_2026 = [
    // 2024
    '2024-01-31', '2024-03-20', '2024-05-01', '2024-06-12',
    '2024-07-31', '2024-09-18', '2024-11-07', '2024-12-18',
    // 2025
    '2025-01-29', '2025-03-19', '2025-05-07', '2025-06-18',
    '2025-07-30', '2025-09-17', '2025-11-05', '2025-12-17',
    // 2026 (projected, follows typical pattern)
    '2026-01-28', '2026-03-18', '2026-05-06', '2026-06-17',
    '2026-07-29', '2026-09-16', '2026-11-04', '2026-12-16',
]

/**
 * Get the Nth occurrence of a specific weekday in a month
 * @param year 
 * @param month 0-indexed
 * @param weekday 0=Sunday, 1=Monday, ..., 5=Friday
 * @param nth 1=first, 2=second, etc.
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
    const firstDay = new Date(year, month, 1)
    const firstWeekday = firstDay.getDay()

    let dayOffset = weekday - firstWeekday
    if (dayOffset < 0) dayOffset += 7

    const day = 1 + dayOffset + (nth - 1) * 7
    return new Date(year, month, day)
}

/**
 * Generate CPI release dates
 * Pattern: Usually 2nd or 3rd Tuesday/Wednesday of the following month
 * Release time: 8:30 AM ET = 13:30 UTC (12:30 UTC during DST)
 */
export function generateCPIDates(startYear: number, endYear: number): string[] {
    const dates: string[] = []

    // CPI is released ~10-15 days into the month for previous month's data
    // Usually the 2nd Tuesday-Thursday
    for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
            // Get 2nd Tuesday of the month (most common)
            const releaseDate = getNthWeekdayOfMonth(year, month, 2, 2) // Tuesday = 2

            // If the 2nd Tuesday is before the 10th, use 3rd Tuesday
            const day = releaseDate.getDate()
            const finalDate = day < 10
                ? getNthWeekdayOfMonth(year, month, 2, 3)
                : releaseDate

            // Format with release time (8:30 AM ET)
            // January = 13:30 UTC, Summer = 12:30 UTC (DST)
            const isDST = month >= 2 && month <= 10 // March-November roughly
            const hour = isDST ? 12 : 13

            const isoDate = new Date(Date.UTC(
                finalDate.getFullYear(),
                finalDate.getMonth(),
                finalDate.getDate(),
                hour, 30, 0
            )).toISOString()

            dates.push(isoDate)
        }
    }

    return dates
}

/**
 * Generate NFP (Employment Situation) release dates
 * Pattern: First Friday of every month
 * Release time: 8:30 AM ET = 13:30 UTC (12:30 UTC during DST)
 */
export function generateNFPDates(startYear: number, endYear: number): string[] {
    const dates: string[] = []

    for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
            // First Friday of the month
            const releaseDate = getNthWeekdayOfMonth(year, month, 5, 1) // Friday = 5

            // DST adjustment
            const isDST = month >= 2 && month <= 10
            const hour = isDST ? 12 : 13

            const isoDate = new Date(Date.UTC(
                releaseDate.getFullYear(),
                releaseDate.getMonth(),
                releaseDate.getDate(),
                hour, 30, 0
            )).toISOString()

            dates.push(isoDate)
        }
    }

    return dates
}

/**
 * Get FOMC meeting dates from known schedule
 * Pattern: 8 meetings per year, dates are published 1+ year in advance
 * Statement time: 2:00 PM ET = 19:00 UTC (18:00 UTC during DST)
 */
export function getFOMCDates(startYear: number, endYear: number): string[] {
    return FOMC_DATES_2024_2026
        .filter(d => {
            const year = parseInt(d.split('-')[0])
            return year >= startYear && year <= endYear
        })
        .map(d => {
            const [year, month, day] = d.split('-').map(Number)
            // FOMC statement is at 2:00 PM ET
            const isDST = month >= 3 && month <= 11
            const hour = isDST ? 18 : 19

            return new Date(Date.UTC(year, month - 1, day, hour, 0, 0)).toISOString()
        })
}

/**
 * Generate a complete schedule for all events
 */
export interface GeneratedOccurrence {
    eventKey: 'cpi' | 'nfp' | 'fomc' | 'unrate' | 'ppi'
    occursAt: string
    notes?: string
    forecast?: number
    actual?: number
}

/**
 * Generate PPI release dates
 * Pattern: Usually 2nd week of the month, often Tuesday-Thursday
 * Release time: 8:30 AM ET = 13:30 UTC (12:30 UTC during DST)
 */
export function generatePPIDates(startYear: number, endYear: number): string[] {
    const dates: string[] = []

    // PPI is typically released 1-2 days before CPI
    // Usually the 2nd Thursday or Wednesday
    for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
            // Get 2nd Thursday of the month
            const releaseDate = getNthWeekdayOfMonth(year, month, 4, 2) // Thursday = 4

            // If the 2nd Thursday is before the 10th, use 3rd Thursday
            const day = releaseDate.getDate()
            const finalDate = day < 10
                ? getNthWeekdayOfMonth(year, month, 4, 3)
                : releaseDate

            const isDST = month >= 2 && month <= 10
            const hour = isDST ? 12 : 13

            const isoDate = new Date(Date.UTC(
                finalDate.getFullYear(),
                finalDate.getMonth(),
                finalDate.getDate(),
                hour, 30, 0
            )).toISOString()

            dates.push(isoDate)
        }
    }

    return dates
}

export function generateFullSchedule(startYear: number, endYear: number): GeneratedOccurrence[] {
    const schedule: GeneratedOccurrence[] = []

    // CPI
    const cpiDates = generateCPIDates(startYear, endYear)
    cpiDates.forEach((occursAt, i) => {
        const date = new Date(occursAt)
        const prevMonth = new Date(date)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const monthName = prevMonth.toLocaleString('en-US', { month: 'short' })
        const year = prevMonth.getFullYear()

        schedule.push({
            eventKey: 'cpi',
            occursAt,
            notes: `${monthName} ${year} CPI`
        })
    })

    // NFP
    const nfpDates = generateNFPDates(startYear, endYear)
    nfpDates.forEach((occursAt) => {
        const date = new Date(occursAt)
        const prevMonth = new Date(date)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const monthName = prevMonth.toLocaleString('en-US', { month: 'short' })
        const year = prevMonth.getFullYear()

        schedule.push({
            eventKey: 'nfp',
            occursAt,
            notes: `${monthName} ${year} Jobs Report`
        })
    })

    // UNRATE (same dates as NFP - released together)
    nfpDates.forEach((occursAt) => {
        const date = new Date(occursAt)
        const prevMonth = new Date(date)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const monthName = prevMonth.toLocaleString('en-US', { month: 'short' })
        const year = prevMonth.getFullYear()

        schedule.push({
            eventKey: 'unrate',
            occursAt,
            notes: `${monthName} ${year} Unemployment Rate`
        })
    })

    // PPI
    const ppiDates = generatePPIDates(startYear, endYear)
    ppiDates.forEach((occursAt) => {
        const date = new Date(occursAt)
        const prevMonth = new Date(date)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const monthName = prevMonth.toLocaleString('en-US', { month: 'short' })
        const year = prevMonth.getFullYear()

        schedule.push({
            eventKey: 'ppi',
            occursAt,
            notes: `${monthName} ${year} PPI`
        })
    })

    // FOMC
    const fomcDates = getFOMCDates(startYear, endYear)
    fomcDates.forEach((occursAt, i) => {
        const date = new Date(occursAt)
        const monthName = date.toLocaleString('en-US', { month: 'short' })
        const year = date.getFullYear()

        schedule.push({
            eventKey: 'fomc',
            occursAt,
            notes: `${monthName} ${year} FOMC`,
            kind: 'release'
        } as any)
    })

    // Sort by date
    return schedule.sort((a, b) =>
        new Date(a.occursAt).getTime() - new Date(b.occursAt).getTime()
    )
}

