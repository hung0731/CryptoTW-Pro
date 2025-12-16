/**
 * CryptoTW Pro Format Helpers
 * 
 * Canonical formatting functions based on Product Consistency Rules v1.0
 * All display formatting MUST use these functions.
 * 
 * @see product_consistency_rules.md
 */

// ================================================
// NUMERIC FORMATTING
// ================================================

/**
 * Format percentage value according to rules:
 * - ≤ 10: 1 decimal place
 * - > 10: 0 decimal places
 * - Positive values get + prefix
 * - Uses functional colors for display
 */
export function formatPercent(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—'

    const absValue = Math.abs(value)
    const decimals = absValue <= 10 ? 1 : 0
    const formatted = absValue.toFixed(decimals)

    if (value > 0) return `+${formatted}%`
    if (value < 0) return `-${formatted}%`
    return '0%'
}

/**
 * Get color class for percentage value
 */
export function getPercentColor(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'text-[#808080]'
    if (value > 0) return 'text-[#22C55E]'
    if (value < 0) return 'text-[#EF4444]'
    return 'text-[#808080]'
}

/**
 * Format price in USD
 * - ≥ $1000: 0 decimal places
 * - < $1000: 2 decimal places
 */
export function formatPrice(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—'

    const decimals = value >= 1000 ? 0 : 2
    return `$${value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`
}

/**
 * Format large numbers with abbreviations (T/B/M/K)
 */
export function formatLargeNumber(value: number | null | undefined, prefix = '$'): string {
    if (value === null || value === undefined) return '—'

    const absValue = Math.abs(value)

    if (absValue >= 1_000_000_000_000) {
        return `${prefix}${(value / 1_000_000_000_000).toFixed(1)}T`
    }
    if (absValue >= 1_000_000_000) {
        return `${prefix}${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (absValue >= 1_000_000) {
        return `${prefix}${(value / 1_000_000).toFixed(0)}M`
    }
    if (absValue >= 1_000) {
        return `${prefix}${(value / 1_000).toFixed(1)}K`
    }
    return `${prefix}${value}`
}

/**
 * Format sample size: "(n = N)"
 */
export function formatSampleSize(n: number): string {
    return `(n = ${n})`
}

// ================================================
// NULL VALUE
// ================================================

/** Canonical null display character (Em Dash U+2014) */
export const NULL_DISPLAY = '—'

// ================================================
// TIME RANGE SELECTOR
// ================================================

/** Allowed time range values */
export type TimeRange = 'all' | '2y' | '1y' | '3m'

/** Time range configuration (display order: long to short) */
export const TIME_RANGE_CONFIG: { value: TimeRange; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: '2y', label: '2年' },
    { value: '1y', label: '1年' },
    { value: '3m', label: '3個月' },
]

/** Default time range */
export const DEFAULT_TIME_RANGE: TimeRange = 'all'

/**
 * Get cutoff date for time range filter
 */
export function getTimeRangeCutoff(range: TimeRange): Date | null {
    if (range === 'all') return null

    const now = new Date()
    const cutoff = new Date()

    switch (range) {
        case '3m': cutoff.setMonth(now.getMonth() - 3); break
        case '1y': cutoff.setFullYear(now.getFullYear() - 1); break
        case '2y': cutoff.setFullYear(now.getFullYear() - 2); break
    }

    return cutoff
}

// ================================================
// SORT MODE
// ================================================

/** Allowed sort modes */
export type SortMode = 'time' | 'reaction'

/** Sort mode configuration */
export const SORT_MODE_CONFIG: { value: SortMode; label: string }[] = [
    { value: 'time', label: '依日期' },
    { value: 'reaction', label: '依波動' },
]

/** Default sort mode */
export const DEFAULT_SORT_MODE: SortMode = 'time'

// ================================================
// SURPRISE FILTER
// ================================================

/** Allowed surprise filter values */
export type SurpriseFilter = 'all' | 'high' | 'neutral' | 'low'

/** Surprise filter configuration */
export const SURPRISE_FILTER_CONFIG: { value: SurpriseFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'high', label: '高於預期' },
    { value: 'neutral', label: '符合預期' },
    { value: 'low', label: '低於預期' },
]

/** Default surprise filter */
export const DEFAULT_SURPRISE_FILTER: SurpriseFilter = 'all'

// ================================================
// STATE MESSAGES (Canonical Copy)
// ================================================

export const STATE_MESSAGES = {
    // Empty states
    empty: {
        filterNoResult: '沒有找到相關事件',
        chartNoData: '此篩選條件下無數據',
        listEmpty: '尚無數據',
        historyEmpty: '尚無歷史記錄',
    },
    // Error states
    error: {
        loadFailed: '無法載入數據',
        connectionFailed: '連線失敗',
        noPermission: '無存取權限',
    },
} as const

// ================================================
// FILTER CONTROL STYLES
// ================================================

export const FILTER_STYLES = {
    /** Chip filter (e.g., event type) */
    chip: {
        base: 'flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium border shrink-0',
        selected: 'bg-white text-black border-white',
        unselected: 'bg-[#0A0A0A] text-[#666666] border-[#1A1A1A] hover:border-[#2A2A2A] hover:text-[#A0A0A0]',
    },
    /** Time range selector */
    timeRange: {
        base: 'text-[10px] font-mono transition-colors uppercase',
        selected: 'text-white underline decoration-wavy decoration-neutral-600',
        unselected: 'text-neutral-600 hover:text-neutral-400',
    },
    /** Toggle button (e.g., sort mode) */
    toggle: {
        base: 'px-3 py-1 text-[10px] rounded',
        selected: 'text-white bg-[#1A1A1A]',
        unselected: 'text-[#666] hover:text-[#999]',
    },
} as const
