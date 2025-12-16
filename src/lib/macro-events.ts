// 策略事件卡 (Strategy Event Cards)
// All dates stored in UTC, displayed in America/New_York (ET)
// 
// OFFICIAL SOURCES:
// - CPI: https://www.bls.gov/schedule/news_release/cpi.htm
// - NFP: https://www.bls.gov/schedule/news_release/empsit.htm
// - FOMC: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm

// ====== Types ======
export interface MacroEventDef {
    key: string
    name: string
    icon: string
    narrative: string
    insight: string
    listDescription: string // [NEW] For Calendar Page
    detailDescription: string // [NEW] For Detail Page
    chartRange: string
    windowDisplay: { start: number; end: number }
    windowStats: { start: number; end: number }
}

export interface MacroEventOccurrence {
    eventKey: 'cpi' | 'nfp' | 'fomc'
    occursAt: string       // ISO 8601 UTC
    kind?: 'release' | 'pressconf'
    notes?: string
    // Forecast vs Actual (for CPI/NFP: %, for FOMC: rate %)
    forecast?: number
    actual?: number
}

export interface OccurrenceStats {
    d0d1Return: number     // %
    d0d3Return: number     // %
    maxDrawdown: number    // %
    maxUpside: number      // %
    range: number          // %
    direction: 'up' | 'down' | 'chop'
}

export interface EventSummaryStats {
    d1WinRate: number
    d3WinRate: number
    avgUp: number
    avgDown: number
    avgRange: number
}

export type D0Mode = 'time' | 'reaction'

// ====== Event Definitions ======
export const MACRO_EVENT_DEFS: MacroEventDef[] = [
    {
        key: 'cpi',
        name: '消費者物價指數',
        narrative: '通膨敘事核心',
        icon: 'CPI',
        insight: '⚠️ 數據斷檔：10月報銷，11月無月增率',
        listDescription: '反映通膨變化，常影響利率預期與市場定價',
        detailDescription: '反映通膨變化，常影響利率預期，是市場定價的核心依據',
        chartRange: 'D-3 ~ D+3',
        windowDisplay: { start: -3, end: 3 },
        windowStats: { start: -1, end: 1 }
    },
    {
        key: 'nfp',
        name: '非農就業',
        narrative: '風險資產短線波動王',
        icon: 'NFP',
        insight: '⚠️ 異常：10+11月合併發布，權重調整',
        listDescription: '每月就業數據，常引發短線劇烈波動',
        detailDescription: '每月就業數據，常引發短線劇烈波動，是評估經濟健康的關鍵指標', // Derived professional text
        chartRange: 'D-3 ~ D+3',
        windowDisplay: { start: -3, end: 3 },
        windowStats: { start: -1, end: 1 }
    },
    {
        key: 'fomc',
        name: '聯準會利率決議',
        icon: 'FOMC',
        narrative: '趨勢切換來源',
        insight: '決策盲區：缺乏完整就業通膨數據',
        listDescription: '決定利率方向，常帶來趨勢轉折',
        detailDescription: '決定利率方向，常帶來趨勢轉折，是全球資金流動的指揮棒', // Derived professional text
        chartRange: 'D-1 ~ D+5',
        windowDisplay: { start: -1, end: 5 },
        windowStats: { start: -1, end: 3 }
    }
]

// ====== VERIFIED Event Occurrences with Forecast/Actual ======
// CPI: YoY % | NFP: Jobs K | FOMC: Rate Range %
export const MACRO_OCCURRENCES: MacroEventOccurrence[] = [
    // ========== CPI (Source: BLS.gov) ==========
    // 2026 (Projected)
    { eventKey: 'cpi', occursAt: '2026-03-11T12:30:00Z', notes: 'Feb 2026 CPI' },
    { eventKey: 'cpi', occursAt: '2026-02-11T13:30:00Z', notes: 'Jan 2026 CPI' },
    { eventKey: 'cpi', occursAt: '2026-01-13T13:30:00Z', notes: 'Dec 2025 CPI' },
    // 2025
    { eventKey: 'cpi', occursAt: '2025-12-18T13:30:00Z', notes: 'Nov 2025 CPI (Delayed - Thu)' }, // Modified: Thursday Dec 18
    { eventKey: 'cpi', occursAt: '2025-11-13T13:30:00Z', notes: 'Oct 2025 CPI (CANCELLED)', forecast: undefined, actual: undefined }, // Modified: Cancelled
    { eventKey: 'cpi', occursAt: '2025-10-15T12:30:00Z', notes: 'Sep 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-09-11T12:30:00Z', notes: 'Aug 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-08-12T12:30:00Z', notes: 'Jul 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-07-10T12:30:00Z', notes: 'Jun 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-06-11T12:30:00Z', notes: 'May 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-05-13T12:30:00Z', notes: 'Apr 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-04-10T12:30:00Z', notes: 'Mar 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-03-12T12:30:00Z', notes: 'Feb 2025 CPI' },
    { eventKey: 'cpi', occursAt: '2025-02-12T13:30:00Z', notes: 'Jan 2025 CPI', forecast: 2.8 },
    { eventKey: 'cpi', occursAt: '2025-01-15T13:30:00Z', notes: 'Dec 2024 CPI', forecast: 2.8, actual: 2.9 },
    // 2024 - Past 12 with Forecast/Actual (YoY %)
    { eventKey: 'cpi', occursAt: '2024-12-11T13:30:00Z', notes: 'Nov 2024 CPI', forecast: 2.7, actual: 2.7 },
    { eventKey: 'cpi', occursAt: '2024-11-13T13:30:00Z', notes: 'Oct 2024 CPI', forecast: 2.6, actual: 2.6 },
    { eventKey: 'cpi', occursAt: '2024-10-10T12:30:00Z', notes: 'Sep 2024 CPI', forecast: 2.3, actual: 2.4 },
    { eventKey: 'cpi', occursAt: '2024-09-11T12:30:00Z', notes: 'Aug 2024 CPI', forecast: 2.6, actual: 2.5 },
    { eventKey: 'cpi', occursAt: '2024-08-14T12:30:00Z', notes: 'Jul 2024 CPI', forecast: 2.9, actual: 2.9 },
    { eventKey: 'cpi', occursAt: '2024-07-11T12:30:00Z', notes: 'Jun 2024 CPI', forecast: 3.1, actual: 3.0 },
    { eventKey: 'cpi', occursAt: '2024-06-12T12:30:00Z', notes: 'May 2024 CPI', forecast: 3.4, actual: 3.3 },
    { eventKey: 'cpi', occursAt: '2024-05-15T12:30:00Z', notes: 'Apr 2024 CPI', forecast: 3.4, actual: 3.4 },
    { eventKey: 'cpi', occursAt: '2024-04-10T12:30:00Z', notes: 'Mar 2024 CPI', forecast: 3.4, actual: 3.5 },
    { eventKey: 'cpi', occursAt: '2024-03-12T12:30:00Z', notes: 'Feb 2024 CPI', forecast: 3.1, actual: 3.2 },
    { eventKey: 'cpi', occursAt: '2024-02-13T13:30:00Z', notes: 'Jan 2024 CPI', forecast: 2.9, actual: 3.1 },
    { eventKey: 'cpi', occursAt: '2024-01-11T13:30:00Z', notes: 'Dec 2023 CPI', forecast: 3.2, actual: 3.4 },
    // 2023
    { eventKey: 'cpi', occursAt: '2023-12-12T13:30:00Z', notes: 'Nov 2023 CPI', forecast: 3.1, actual: 3.1 },
    { eventKey: 'cpi', occursAt: '2023-11-14T13:30:00Z', notes: 'Oct 2023 CPI', forecast: 3.3, actual: 3.2 },
    { eventKey: 'cpi', occursAt: '2023-10-12T12:30:00Z', notes: 'Sep 2023 CPI', forecast: 3.6, actual: 3.7 },
    { eventKey: 'cpi', occursAt: '2023-09-13T12:30:00Z', notes: 'Aug 2023 CPI', forecast: 3.6, actual: 3.7 },
    { eventKey: 'cpi', occursAt: '2023-08-10T12:30:00Z', notes: 'Jul 2023 CPI', forecast: 3.3, actual: 3.2 },
    { eventKey: 'cpi', occursAt: '2023-07-12T12:30:00Z', notes: 'Jun 2023 CPI', forecast: 3.1, actual: 3.0 },
    { eventKey: 'cpi', occursAt: '2023-06-13T12:30:00Z', notes: 'May 2023 CPI', forecast: 4.1, actual: 4.0 },
    { eventKey: 'cpi', occursAt: '2023-05-10T12:30:00Z', notes: 'Apr 2023 CPI', forecast: 5.0, actual: 4.9 },
    { eventKey: 'cpi', occursAt: '2023-04-12T12:30:00Z', notes: 'Mar 2023 CPI', forecast: 5.2, actual: 5.0 },
    { eventKey: 'cpi', occursAt: '2023-03-14T12:30:00Z', notes: 'Feb 2023 CPI', forecast: 6.0, actual: 6.0 },
    { eventKey: 'cpi', occursAt: '2023-02-14T13:30:00Z', notes: 'Jan 2023 CPI', forecast: 6.2, actual: 6.4 },
    { eventKey: 'cpi', occursAt: '2023-01-12T13:30:00Z', notes: 'Dec 2022 CPI', forecast: 6.5, actual: 6.5 },
    // 2022
    { eventKey: 'cpi', occursAt: '2022-12-13T13:30:00Z', notes: 'Nov 2022 CPI', forecast: 7.3, actual: 7.1 },
    { eventKey: 'cpi', occursAt: '2022-11-10T13:30:00Z', notes: 'Oct 2022 CPI', forecast: 8.0, actual: 7.7 },
    { eventKey: 'cpi', occursAt: '2022-10-13T12:30:00Z', notes: 'Sep 2022 CPI', forecast: 8.1, actual: 8.2 },
    { eventKey: 'cpi', occursAt: '2022-09-13T12:30:00Z', notes: 'Aug 2022 CPI', forecast: 8.1, actual: 8.3 },

    // ========== NFP (Source: BLS.gov) ==========
    // 2026 (Projected)
    { eventKey: 'nfp', occursAt: '2026-03-06T13:30:00Z', notes: 'Feb 2026 Employment' },
    { eventKey: 'nfp', occursAt: '2026-02-06T13:30:00Z', notes: 'Jan 2026 Employment' },
    { eventKey: 'nfp', occursAt: '2026-01-09T13:30:00Z', notes: 'Dec 2025 Employment' },
    // 2025
    { eventKey: 'nfp', occursAt: '2025-12-16T13:30:00Z', notes: 'Nov+Oct Merged Report (Delayed)' }, // Modified: Tonight Dec 16
    { eventKey: 'nfp', occursAt: '2025-11-07T13:30:00Z', notes: 'Oct 2025 Employment (DELAYED)', forecast: undefined, actual: undefined }, // Modified: Delayed
    { eventKey: 'nfp', occursAt: '2025-10-03T12:30:00Z', notes: 'Sep 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-09-05T12:30:00Z', notes: 'Aug 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-08-01T12:30:00Z', notes: 'Jul 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-07-03T12:30:00Z', notes: 'Jun 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-06-06T12:30:00Z', notes: 'May 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-05-02T12:30:00Z', notes: 'Apr 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-04-04T12:30:00Z', notes: 'Mar 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-03-07T13:30:00Z', notes: 'Feb 2025 Employment' },
    { eventKey: 'nfp', occursAt: '2025-02-07T13:30:00Z', notes: 'Jan 2025 Employment', forecast: 180 },
    { eventKey: 'nfp', occursAt: '2025-01-10T13:30:00Z', notes: 'Dec 2024 Employment', forecast: 160, actual: 256 },
    // 2024 - Past 12 with Forecast/Actual (Jobs in K)
    { eventKey: 'nfp', occursAt: '2024-12-06T13:30:00Z', notes: 'Nov 2024 Employment', forecast: 200, actual: 227 },
    { eventKey: 'nfp', occursAt: '2024-11-01T12:30:00Z', notes: 'Oct 2024 Employment', forecast: 113, actual: 12 },
    { eventKey: 'nfp', occursAt: '2024-10-04T12:30:00Z', notes: 'Sep 2024 Employment', forecast: 140, actual: 254 },
    { eventKey: 'nfp', occursAt: '2024-09-06T12:30:00Z', notes: 'Aug 2024 Employment', forecast: 160, actual: 142 },
    { eventKey: 'nfp', occursAt: '2024-08-02T12:30:00Z', notes: 'Jul 2024 Employment', forecast: 175, actual: 114 },
    { eventKey: 'nfp', occursAt: '2024-07-05T12:30:00Z', notes: 'Jun 2024 Employment', forecast: 190, actual: 206 },
    { eventKey: 'nfp', occursAt: '2024-06-07T12:30:00Z', notes: 'May 2024 Employment', forecast: 180, actual: 272 },
    { eventKey: 'nfp', occursAt: '2024-05-03T12:30:00Z', notes: 'Apr 2024 Employment', forecast: 240, actual: 175 },
    { eventKey: 'nfp', occursAt: '2024-04-05T12:30:00Z', notes: 'Mar 2024 Employment', forecast: 200, actual: 303 },
    { eventKey: 'nfp', occursAt: '2024-03-08T13:30:00Z', notes: 'Feb 2024 Employment', forecast: 200, actual: 275 },
    { eventKey: 'nfp', occursAt: '2024-02-02T13:30:00Z', notes: 'Jan 2024 Employment', forecast: 180, actual: 353 },
    { eventKey: 'nfp', occursAt: '2024-01-05T13:30:00Z', notes: 'Dec 2023 Employment', forecast: 170, actual: 216 },
    // 2023
    { eventKey: 'nfp', occursAt: '2023-12-08T13:30:00Z', notes: 'Nov 2023 Employment', forecast: 180, actual: 199 },
    { eventKey: 'nfp', occursAt: '2023-11-03T12:30:00Z', notes: 'Oct 2023 Employment', forecast: 180, actual: 150 },
    { eventKey: 'nfp', occursAt: '2023-10-06T12:30:00Z', notes: 'Sep 2023 Employment', forecast: 170, actual: 336 },
    { eventKey: 'nfp', occursAt: '2023-09-01T12:30:00Z', notes: 'Aug 2023 Employment', forecast: 170, actual: 187 },
    { eventKey: 'nfp', occursAt: '2023-08-04T12:30:00Z', notes: 'Jul 2023 Employment', forecast: 200, actual: 187 },
    { eventKey: 'nfp', occursAt: '2023-07-07T12:30:00Z', notes: 'Jun 2023 Employment', forecast: 225, actual: 209 },
    { eventKey: 'nfp', occursAt: '2023-06-02T12:30:00Z', notes: 'May 2023 Employment', forecast: 190, actual: 339 },
    { eventKey: 'nfp', occursAt: '2023-05-05T12:30:00Z', notes: 'Apr 2023 Employment', forecast: 180, actual: 253 },
    { eventKey: 'nfp', occursAt: '2023-04-07T12:30:00Z', notes: 'Mar 2023 Employment', forecast: 240, actual: 236 },
    { eventKey: 'nfp', occursAt: '2023-03-10T13:30:00Z', notes: 'Feb 2023 Employment', forecast: 225, actual: 311 },
    { eventKey: 'nfp', occursAt: '2023-02-03T13:30:00Z', notes: 'Jan 2023 Employment', forecast: 185, actual: 517 },
    { eventKey: 'nfp', occursAt: '2023-01-06T13:30:00Z', notes: 'Dec 2022 Employment', forecast: 200, actual: 223 },
    // 2022
    { eventKey: 'nfp', occursAt: '2022-12-02T13:30:00Z', notes: 'Nov 2022 Employment', forecast: 200, actual: 263 },
    { eventKey: 'nfp', occursAt: '2022-11-04T12:30:00Z', notes: 'Oct 2022 Employment', forecast: 200, actual: 261 },
    { eventKey: 'nfp', occursAt: '2022-10-07T12:30:00Z', notes: 'Sep 2022 Employment', forecast: 250, actual: 263 },
    { eventKey: 'nfp', occursAt: '2022-09-02T12:30:00Z', notes: 'Aug 2022 Employment', forecast: 300, actual: 315 },

    // ========== FOMC (Source: FederalReserve.gov) ==========
    // Statement release = 14:00 ET, Actual = target rate upper bound %
    // 2026 (Projected)
    { eventKey: 'fomc', occursAt: '2026-03-18T18:00:00Z', kind: 'release', notes: 'Mar 17-18 Meeting' },
    { eventKey: 'fomc', occursAt: '2026-01-28T19:00:00Z', kind: 'release', notes: 'Jan 27-28 Meeting' },
    // 2025
    { eventKey: 'fomc', occursAt: '2025-12-10T19:00:00Z', kind: 'release', notes: 'Dec 9-10 Meeting' },
    { eventKey: 'fomc', occursAt: '2025-10-29T18:00:00Z', kind: 'release', notes: 'Oct 28-29 Meeting' },
    { eventKey: 'fomc', occursAt: '2025-09-17T18:00:00Z', kind: 'release', notes: 'Sep 16-17 Meeting' },
    { eventKey: 'fomc', occursAt: '2025-07-30T18:00:00Z', kind: 'release', notes: 'Jul 29-30 Meeting' },
    { eventKey: 'fomc', occursAt: '2025-06-18T18:00:00Z', kind: 'release', notes: 'Jun 17-18 Meeting' },
    { eventKey: 'fomc', occursAt: '2025-05-07T18:00:00Z', kind: 'release', notes: 'May 6-7 Meeting' },
    { eventKey: 'fomc', occursAt: '2025-03-19T18:00:00Z', kind: 'release', notes: 'Mar 18-19 Meeting', forecast: 4.25 },
    { eventKey: 'fomc', occursAt: '2025-01-29T19:00:00Z', kind: 'release', notes: 'Jan 28-29 Meeting', forecast: 4.50, actual: 4.50 },
    // 2024 - Rate decisions (upper bound of target range)
    { eventKey: 'fomc', occursAt: '2024-12-18T19:00:00Z', kind: 'release', notes: 'Dec 17-18 Meeting', forecast: 4.50, actual: 4.50 },
    { eventKey: 'fomc', occursAt: '2024-11-07T19:00:00Z', kind: 'release', notes: 'Nov 6-7 Meeting', forecast: 4.75, actual: 4.75 },
    { eventKey: 'fomc', occursAt: '2024-09-18T18:00:00Z', kind: 'release', notes: 'Sep 17-18 Meeting', forecast: 5.25, actual: 5.00 },
    { eventKey: 'fomc', occursAt: '2024-07-31T18:00:00Z', kind: 'release', notes: 'Jul 30-31 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2024-06-12T18:00:00Z', kind: 'release', notes: 'Jun 11-12 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2024-05-01T18:00:00Z', kind: 'release', notes: 'Apr 30 - May 1 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2024-03-20T18:00:00Z', kind: 'release', notes: 'Mar 19-20 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2024-01-31T19:00:00Z', kind: 'release', notes: 'Jan 30-31 Meeting', forecast: 5.50, actual: 5.50 },
    // 2023
    { eventKey: 'fomc', occursAt: '2023-12-13T19:00:00Z', kind: 'release', notes: 'Dec 12-13 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2023-11-01T18:00:00Z', kind: 'release', notes: 'Oct 31 - Nov 1 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2023-09-20T18:00:00Z', kind: 'release', notes: 'Sep 19-20 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2023-07-26T18:00:00Z', kind: 'release', notes: 'Jul 25-26 Meeting', forecast: 5.50, actual: 5.50 },
    { eventKey: 'fomc', occursAt: '2023-06-14T18:00:00Z', kind: 'release', notes: 'Jun 13-14 Meeting', forecast: 5.25, actual: 5.25 },
    { eventKey: 'fomc', occursAt: '2023-05-03T18:00:00Z', kind: 'release', notes: 'May 2-3 Meeting', forecast: 5.25, actual: 5.25 },
    { eventKey: 'fomc', occursAt: '2023-03-22T18:00:00Z', kind: 'release', notes: 'Mar 21-22 Meeting', forecast: 5.00, actual: 5.00 },
    { eventKey: 'fomc', occursAt: '2023-02-01T19:00:00Z', kind: 'release', notes: 'Jan 31 - Feb 1 Meeting', forecast: 4.75, actual: 4.75 },
    // 2022
    { eventKey: 'fomc', occursAt: '2022-12-14T19:00:00Z', kind: 'release', notes: 'Dec 13-14 Meeting', forecast: 4.50, actual: 4.50 },
    { eventKey: 'fomc', occursAt: '2022-11-02T18:00:00Z', kind: 'release', notes: 'Nov 1-2 Meeting', forecast: 4.00, actual: 4.00 },
    { eventKey: 'fomc', occursAt: '2022-09-21T18:00:00Z', kind: 'release', notes: 'Sep 20-21 Meeting', forecast: 3.25, actual: 3.25 },
    { eventKey: 'fomc', occursAt: '2022-07-27T18:00:00Z', kind: 'release', notes: 'Jul 26-27 Meeting', forecast: 2.50, actual: 2.50 },
]

// ====== Helper Functions ======
export const getMacroEventDef = (key: string): MacroEventDef | undefined => {
    return MACRO_EVENT_DEFS.find(e => e.key === key)
}

export const getOccurrences = (eventKey: string): MacroEventOccurrence[] => {
    return MACRO_OCCURRENCES
        .filter(o => o.eventKey === eventKey)
        .sort((a, b) => new Date(a.occursAt).getTime() - new Date(b.occursAt).getTime())
}

export const getPastOccurrences = (eventKey: string, limit = 12): MacroEventOccurrence[] => {
    const now = new Date()
    return getOccurrences(eventKey)
        .filter(o => new Date(o.occursAt) < now)
        .sort((a, b) => new Date(b.occursAt).getTime() - new Date(a.occursAt).getTime())
        .slice(0, limit)
}

export const getFutureOccurrences = (eventKey: string, limit = 12): MacroEventOccurrence[] => {
    const now = new Date()
    return getOccurrences(eventKey)
        .filter(o => new Date(o.occursAt) >= now)
        .slice(0, limit)
}

export const getNextOccurrence = (eventKey: string): MacroEventOccurrence | undefined => {
    return getFutureOccurrences(eventKey, 1)[0]
}

export const formatOccursAt = (occursAt: string): string => {
    const date = new Date(occursAt)
    return date.toLocaleString('zh-TW', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }) + ' (美東)'
}

export const getDaysUntil = (occursAt: string): number => {
    const now = new Date()
    const event = new Date(occursAt)
    const diff = event.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Surprise calculation
export const getSurprise = (occ: MacroEventOccurrence): 'high' | 'neutral' | 'low' | null => {
    if (occ.forecast === undefined || occ.actual === undefined) return null
    const diff = occ.actual - occ.forecast
    const threshold = occ.eventKey === 'nfp' ? 50 : 0.2 // NFP: 50K, CPI/FOMC: 0.2%
    if (diff > threshold) return 'high'
    if (diff < -threshold) return 'low'
    return 'neutral'
}

export const formatValue = (eventKey: string, value: number | undefined): string => {
    if (value === undefined) return '-'
    if (eventKey === 'nfp') return `${value}K`
    return `${value}%`
}
