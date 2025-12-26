/**
 * FRED API Client
 * Federal Reserve Economic Data API Integration
 * 
 * Docs: https://fred.stlouisfed.org/docs/api/fred/
 */

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred'

// Series IDs for economic indicators
export const FRED_SERIES = {
    CPI: 'CPIAUCSL',      // Consumer Price Index (All Urban, Seasonally Adjusted)
    CORE_CPI: 'CPILFESL', // Core CPI (Less Food and Energy)
    NFP: 'PAYEMS',        // Total Nonfarm Payrolls (Thousands)
    PCE: 'PCEPI',         // Personal Consumption Expenditures Price Index
    FED_RATE: 'DFEDTARU', // Federal Funds Target Rate - Upper Bound
    UNRATE: 'UNRATE',     // Unemployment Rate (%)
    PPI: 'PPIACO',        // Producer Price Index (All Commodities)
} as const

export type FredSeriesId = typeof FRED_SERIES[keyof typeof FRED_SERIES]

interface FredObservation {
    realtime_start: string
    realtime_end: string
    date: string
    value: string
}

interface FredSeriesResponse {
    realtime_start: string
    realtime_end: string
    observation_start: string
    observation_end: string
    units: string
    output_type: number
    file_type: string
    order_by: string
    sort_order: string
    count: number
    offset: number
    limit: number
    observations: FredObservation[]
}

/**
 * Fetch observations for a FRED series
 */
export async function fetchFredSeries(
    seriesId: string,
    options?: {
        startDate?: string // YYYY-MM-DD
        endDate?: string   // YYYY-MM-DD
        limit?: number
    }
): Promise<FredObservation[]> {
    const apiKey = process.env.FRED_API_KEY

    if (!apiKey) {
        throw new Error('FRED_API_KEY environment variable is not set')
    }

    const params = new URLSearchParams({
        series_id: seriesId,
        api_key: apiKey,
        file_type: 'json',
        sort_order: 'desc',
        limit: String(options?.limit || 120), // ~10 years of monthly data
    })

    if (options?.startDate) {
        params.set('observation_start', options.startDate)
    }
    if (options?.endDate) {
        params.set('observation_end', options.endDate)
    }

    const url = `${FRED_BASE_URL}/series/observations?${params.toString()}`

    const response = await fetch(url, {
        next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
        throw new Error(`FRED API error: ${response.status} ${response.statusText}`)
    }

    const data: FredSeriesResponse = await response.json()
    return data.observations
}

/**
 * Calculate Year-over-Year percentage change
 * CPI is reported as an index, so we calculate: (current - yearAgo) / yearAgo * 100
 */
export function calculateYoY(observations: FredObservation[]): Map<string, number> {
    const result = new Map<string, number>()

    // Sort by date descending (most recent first)
    const sorted = [...observations].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i]
        const currentValue = parseFloat(current.value)

        if (isNaN(currentValue) || current.value === '.') continue

        // Find observation from ~12 months ago
        const currentDate = new Date(current.date)
        const targetDate = new Date(currentDate)
        targetDate.setFullYear(targetDate.getFullYear() - 1)

        // Find closest match within 45 days
        const yearAgoObs = sorted.find(obs => {
            const obsDate = new Date(obs.date)
            const diffDays = Math.abs((obsDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
            return diffDays < 45 && obs.value !== '.'
        })

        if (yearAgoObs) {
            const yearAgoValue = parseFloat(yearAgoObs.value)
            if (!isNaN(yearAgoValue) && yearAgoValue !== 0) {
                const yoyChange = ((currentValue - yearAgoValue) / yearAgoValue) * 100
                result.set(current.date, Math.round(yoyChange * 10) / 10) // Round to 1 decimal
            }
        }
    }

    return result
}

/**
 * Calculate Month-over-Month change (for NFP)
 * NFP is reported as thousands of jobs, so we calculate: current - previous
 */
export function calculateMoMChange(observations: FredObservation[]): Map<string, number> {
    const result = new Map<string, number>()

    // Sort by date descending
    const sorted = [...observations].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i]
        const previous = sorted[i + 1]

        const currentValue = parseFloat(current.value)
        const previousValue = parseFloat(previous.value)

        if (isNaN(currentValue) || isNaN(previousValue)) continue
        if (current.value === '.' || previous.value === '.') continue

        const change = currentValue - previousValue
        result.set(current.date, Math.round(change)) // Jobs in thousands
    }

    return result
}

/**
 * Map FRED observation dates to our event occurrence dates
 * FRED reports data for the reference month, but we store by release date
 */
export function matchToReleaseDate(
    fredDate: string,
    occurrences: { occursAt: string; notes?: string }[]
): string | null {
    // FRED date is the reference month (e.g., "2024-10-01" for October data)
    // Our occursAt is the release date (e.g., "2024-11-13" for October CPI released in November)

    const fredMonth = new Date(fredDate)
    const fredYM = `${fredMonth.getFullYear()}-${String(fredMonth.getMonth() + 1).padStart(2, '0')}`

    // Find occurrence that references this month in its notes
    // e.g., "Oct 2024 CPI" matches FRED date "2024-10-01"
    for (const occ of occurrences) {
        if (!occ.notes) continue

        // Extract month/year from notes like "Oct 2024 CPI"
        const monthMatch = occ.notes.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/)
        if (!monthMatch) continue

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = monthNames.indexOf(monthMatch[1])
        const year = parseInt(monthMatch[2])

        const notesYM = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

        if (notesYM === fredYM) {
            return new Date(occ.occursAt).toISOString().split('T')[0]
        }
    }

    return null
}

/**
 * Get the latest value for display
 */
export async function getLatestIndicatorValue(seriesId: string): Promise<{
    date: string
    value: number
    yoy?: number
} | null> {
    try {
        const observations = await fetchFredSeries(seriesId, { limit: 24 })

        if (observations.length === 0) return null

        const latest = observations[0]
        const value = parseFloat(latest.value)

        if (isNaN(value)) return null

        // Calculate YoY if applicable
        const yoyMap = calculateYoY(observations)
        const yoy = yoyMap.get(latest.date)

        return {
            date: latest.date,
            value,
            yoy
        }
    } catch (error) {
        console.error(`Failed to fetch ${seriesId}:`, error)
        return null
    }
}
