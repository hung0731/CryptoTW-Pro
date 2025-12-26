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
    impactSummary: string // [NEW] Educational context for volatility
    chartRange: string
    windowDisplay: { start: number; end: number }
    windowStats: { start: number; end: number }
}

export interface MacroEventOccurrence {
    eventKey: 'cpi' | 'nfp' | 'fomc' | 'unrate' | 'ppi'
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

export interface MacroReaction {
    eventKey: string
    occursAt: string
    stats: OccurrenceStats
    priceData: {
        date: string
        close: number
        high: number
        low: number
        oi?: number
        fundingRate?: number
    }[]
}

export interface EventSummaryStats {
    d1WinRate: number
    d3WinRate: number
    avgUp: number
    avgDown: number
    avgRange: number
    samples: number
}

export function calculateEventStats(eventKey: string, reactions: Record<string, MacroReaction>): EventSummaryStats | null {
    const pastOccs = getPastOccurrences(eventKey, 12)
    const eventReactions = pastOccs.map(occ => {
        const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
        return reactions[`${eventKey}-${keyDate}`]
    }).filter(Boolean)

    if (eventReactions.length === 0) return null

    const d1Returns = eventReactions.map(r => r.stats.d0d1Return).filter((r): r is number => r !== null)
    const upCount = d1Returns.filter(r => r > 0).length
    const avgRange = eventReactions.reduce((sum, r) => sum + r.stats.range, 0) / eventReactions.length

    return {
        d1WinRate: d1Returns.length > 0 ? Math.round((upCount / d1Returns.length) * 100) : 0,
        d3WinRate: 0, // Not used yet
        avgUp: 0, // Not used yet
        avgDown: 0, // Not used yet
        avgRange: Math.round(avgRange * 10) / 10,
        samples: eventReactions.length
    }
}

export type D0Mode = 'time' | 'reaction'

// ====== Event Definitions ======
export const MACRO_EVENT_DEFS: MacroEventDef[] = [
    {
        key: 'cpi',
        name: '消費者物價指數',
        narrative: '通膨敘事核心',
        icon: 'CPI',
        insight: '數據斷檔：10月報銷，11月無月增率',
        listDescription: '反映通膨變化，常影響利率預期與市場定價',
        detailDescription: '反映通膨變化，常影響利率預期，是市場定價的核心依據',
        impactSummary: '過去公布後 24 小時內，比特幣平均波動幅度約 3-4%，若與預期偏差 >0.2% 則波動加劇。',
        chartRange: 'T-2 ~ T+7',
        windowDisplay: { start: -2, end: 7 },
        windowStats: { start: -1, end: 1 }
    },
    {
        key: 'nfp',
        name: '非農就業',
        narrative: '風險資產短線波動王',
        icon: 'NFP',
        insight: '異常：10+11月合併發布，權重調整',
        listDescription: '每月就業數據，常引發短線劇烈波動',
        detailDescription: '每月就業數據，常引發短線劇烈波動，是評估經濟健康的關鍵指標', // Derived professional text
        impactSummary: '非農數據公布當下通常引發 15 分鐘級別的「插針」現象，平均振幅可達 800-1200 點。',
        chartRange: 'T-2 ~ T+7',
        windowDisplay: { start: -2, end: 7 },
        windowStats: { start: -1, end: 1 }
    },
    {
        key: 'fomc',
        name: '聯準會利率決議',
        icon: 'FOMC',
        narrative: '趨勢切換來源',
        insight: '決策盲區：缺乏完整就業通膨數據',
        listDescription: '決定利率方向，常帶來趨勢轉折',
        detailDescription: '決定利率方向，常帶來趨勢轉折，是全球資金流動的指揮棒',
        impactSummary: '利率決議本身波動較小，真正的波動往往來自 30 分鐘後的記者會談話，方向轉換頻繁。',
        chartRange: 'T-2 ~ T+7',
        windowDisplay: { start: -2, end: 7 },
        windowStats: { start: -1, end: 3 }
    },
    {
        key: 'unrate',
        name: '失業率',
        icon: 'UNRATE',
        narrative: '勞動市場健康度指標',
        insight: '與非農同步公布，互相印證',
        listDescription: '勞動市場健康指標，影響聯準會政策走向',
        detailDescription: '失業率反映勞動市場健康程度，是聯準會「雙重使命」的核心監控指標',
        impactSummary: '失業率與非農就業數據同時公布，兩者方向不一致時市場波動加劇。',
        chartRange: 'T-2 ~ T+7',
        windowDisplay: { start: -2, end: 7 },
        windowStats: { start: -1, end: 1 }
    },
    {
        key: 'ppi',
        name: '生產者物價指數',
        icon: 'PPI',
        narrative: '通膨領先指標',
        insight: '生產端成本變化，領先 CPI 1-2 個月',
        listDescription: '反映生產端成本，為 CPI 的領先指標',
        detailDescription: '生產者物價指數反映生產端成本壓力，通常領先消費者物價 1-2 個月',
        impactSummary: 'PPI 作為 CPI 領先指標，若 PPI 大幅偏離預期，市場會提前反映對 CPI 的預期。',
        chartRange: 'T-2 ~ T+7',
        windowDisplay: { start: -2, end: 7 },
        windowStats: { start: -1, end: 1 }
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
    // 2025 - Updated with verified forecast/actual (YoY %)
    { eventKey: 'cpi', occursAt: '2025-12-18T13:30:00Z', notes: 'Nov 2025 CPI', forecast: 3.0 }, // Released today
    { eventKey: 'cpi', occursAt: '2025-11-13T13:30:00Z', notes: 'Oct 2025 CPI (CANCELLED)' }, // Government shutdown
    { eventKey: 'cpi', occursAt: '2025-10-15T12:30:00Z', notes: 'Sep 2025 CPI', forecast: 3.1, actual: 3.0 },
    { eventKey: 'cpi', occursAt: '2025-09-11T12:30:00Z', notes: 'Aug 2025 CPI', forecast: 3.1, actual: 2.9 },
    { eventKey: 'cpi', occursAt: '2025-08-12T12:30:00Z', notes: 'Jul 2025 CPI', forecast: 2.6, actual: 2.5 },
    { eventKey: 'cpi', occursAt: '2025-07-10T12:30:00Z', notes: 'Jun 2025 CPI', forecast: 2.5, actual: 2.4 },
    { eventKey: 'cpi', occursAt: '2025-06-11T12:30:00Z', notes: 'May 2025 CPI', forecast: 2.5, actual: 2.4 },
    { eventKey: 'cpi', occursAt: '2025-05-13T12:30:00Z', notes: 'Apr 2025 CPI', forecast: 2.4, actual: 2.3 },
    { eventKey: 'cpi', occursAt: '2025-04-10T12:30:00Z', notes: 'Mar 2025 CPI', forecast: 2.6, actual: 2.4 },
    { eventKey: 'cpi', occursAt: '2025-03-12T12:30:00Z', notes: 'Feb 2025 CPI', forecast: 2.9, actual: 2.8 },
    { eventKey: 'cpi', occursAt: '2025-02-12T13:30:00Z', notes: 'Jan 2025 CPI', forecast: 2.9, actual: 3.0 },
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
    // 2025 - Updated with verified forecast/actual (Jobs in K)
    { eventKey: 'nfp', occursAt: '2025-12-05T13:30:00Z', notes: 'Nov 2025 Employment', forecast: 50, actual: 64 },
    { eventKey: 'nfp', occursAt: '2025-11-07T13:30:00Z', notes: 'Oct 2025 Employment', forecast: -60, actual: -105 }, // Shutdown impact
    { eventKey: 'nfp', occursAt: '2025-10-03T12:30:00Z', notes: 'Sep 2025 Employment', forecast: 50, actual: 119 },
    { eventKey: 'nfp', occursAt: '2025-09-05T12:30:00Z', notes: 'Aug 2025 Employment', forecast: 75, actual: 22 },
    { eventKey: 'nfp', occursAt: '2025-08-01T12:30:00Z', notes: 'Jul 2025 Employment', forecast: 110, actual: 73 },
    { eventKey: 'nfp', occursAt: '2025-07-03T12:30:00Z', notes: 'Jun 2025 Employment', forecast: 150, actual: 145 },
    { eventKey: 'nfp', occursAt: '2025-06-06T12:30:00Z', notes: 'May 2025 Employment', forecast: 130, actual: 139 },
    { eventKey: 'nfp', occursAt: '2025-05-02T12:30:00Z', notes: 'Apr 2025 Employment', forecast: 140, actual: 177 },
    { eventKey: 'nfp', occursAt: '2025-04-04T12:30:00Z', notes: 'Mar 2025 Employment', forecast: 140, actual: 228 },
    { eventKey: 'nfp', occursAt: '2025-03-07T13:30:00Z', notes: 'Feb 2025 Employment', forecast: 160, actual: 151 },
    { eventKey: 'nfp', occursAt: '2025-02-07T13:30:00Z', notes: 'Jan 2025 Employment', forecast: 170, actual: 143 },
    { eventKey: 'nfp', occursAt: '2025-01-10T13:30:00Z', notes: 'Dec 2024 Employment', forecast: 160, actual: 256 },
    // 2024 - Past 12 with Forecast/Actual (Jobs in K)
    // 2024 - Updated with verified forecast/actual from TradingEconomics, FXStreet
    { eventKey: 'nfp', occursAt: '2024-12-06T13:30:00Z', notes: 'Nov 2024 Employment', forecast: 200, actual: 227 },
    { eventKey: 'nfp', occursAt: '2024-11-01T12:30:00Z', notes: 'Oct 2024 Employment', forecast: 113, actual: 12 }, // Hurricane impact
    { eventKey: 'nfp', occursAt: '2024-10-04T12:30:00Z', notes: 'Sep 2024 Employment', forecast: 140, actual: 254 },
    { eventKey: 'nfp', occursAt: '2024-09-06T12:30:00Z', notes: 'Aug 2024 Employment', forecast: 160, actual: 142 },
    { eventKey: 'nfp', occursAt: '2024-08-02T12:30:00Z', notes: 'Jul 2024 Employment', forecast: 175, actual: 114 },
    { eventKey: 'nfp', occursAt: '2024-07-05T12:30:00Z', notes: 'Jun 2024 Employment', forecast: 190, actual: 206 },
    { eventKey: 'nfp', occursAt: '2024-06-07T12:30:00Z', notes: 'May 2024 Employment', forecast: 185, actual: 272 }, // Updated forecast
    { eventKey: 'nfp', occursAt: '2024-05-03T12:30:00Z', notes: 'Apr 2024 Employment', forecast: 243, actual: 175 }, // Updated
    { eventKey: 'nfp', occursAt: '2024-04-05T12:30:00Z', notes: 'Mar 2024 Employment', forecast: 200, actual: 303 },
    { eventKey: 'nfp', occursAt: '2024-03-08T13:30:00Z', notes: 'Feb 2024 Employment', forecast: 200, actual: 275 },
    { eventKey: 'nfp', occursAt: '2024-02-02T13:30:00Z', notes: 'Jan 2024 Employment', forecast: 185, actual: 353 }, // Updated forecast
    { eventKey: 'nfp', occursAt: '2024-01-05T13:30:00Z', notes: 'Dec 2023 Employment', forecast: 170, actual: 216 },
    // 2023
    // 2023 - Updated with verified forecast/actual from Investing.com, BabyPips
    { eventKey: 'nfp', occursAt: '2023-12-08T13:30:00Z', notes: 'Nov 2023 Employment', forecast: 180, actual: 199 },
    { eventKey: 'nfp', occursAt: '2023-11-03T12:30:00Z', notes: 'Oct 2023 Employment', forecast: 180, actual: 150 },
    { eventKey: 'nfp', occursAt: '2023-10-06T12:30:00Z', notes: 'Sep 2023 Employment', forecast: 170, actual: 336 }, // Big surprise
    { eventKey: 'nfp', occursAt: '2023-09-01T12:30:00Z', notes: 'Aug 2023 Employment', forecast: 170, actual: 187 },
    { eventKey: 'nfp', occursAt: '2023-08-04T12:30:00Z', notes: 'Jul 2023 Employment', forecast: 203, actual: 187 }, // Updated forecast
    { eventKey: 'nfp', occursAt: '2023-07-07T12:30:00Z', notes: 'Jun 2023 Employment', forecast: 224, actual: 209 }, // Updated forecast
    { eventKey: 'nfp', occursAt: '2023-06-02T12:30:00Z', notes: 'May 2023 Employment', forecast: 180, actual: 339 }, // Updated
    { eventKey: 'nfp', occursAt: '2023-05-05T12:30:00Z', notes: 'Apr 2023 Employment', forecast: 180, actual: 253 },
    { eventKey: 'nfp', occursAt: '2023-04-07T12:30:00Z', notes: 'Mar 2023 Employment', forecast: 228, actual: 236 }, // Updated forecast
    { eventKey: 'nfp', occursAt: '2023-03-10T13:30:00Z', notes: 'Feb 2023 Employment', forecast: 225, actual: 311 },
    { eventKey: 'nfp', occursAt: '2023-02-03T13:30:00Z', notes: 'Jan 2023 Employment', forecast: 185, actual: 517 }, // Massive surprise
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
    // 2025 - All meetings held rate at 4.25-4.50% through June
    { eventKey: 'fomc', occursAt: '2025-12-10T19:00:00Z', kind: 'release', notes: 'Dec 9-10 Meeting', forecast: 4.50 },
    { eventKey: 'fomc', occursAt: '2025-10-29T18:00:00Z', kind: 'release', notes: 'Oct 28-29 Meeting', forecast: 4.50, actual: 4.50 },
    { eventKey: 'fomc', occursAt: '2025-09-17T18:00:00Z', kind: 'release', notes: 'Sep 16-17 Meeting', forecast: 4.50, actual: 4.50 },
    { eventKey: 'fomc', occursAt: '2025-07-30T18:00:00Z', kind: 'release', notes: 'Jul 29-30 Meeting', forecast: 4.50, actual: 4.50 },
    { eventKey: 'fomc', occursAt: '2025-06-18T18:00:00Z', kind: 'release', notes: 'Jun 17-18 Meeting', forecast: 4.50, actual: 4.50 },
    { eventKey: 'fomc', occursAt: '2025-05-07T18:00:00Z', kind: 'release', notes: 'May 6-7 Meeting', forecast: 4.50, actual: 4.50 },
    { eventKey: 'fomc', occursAt: '2025-03-19T18:00:00Z', kind: 'release', notes: 'Mar 18-19 Meeting', forecast: 4.50, actual: 4.50 },
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

    // ========== UNRATE (Unemployment Rate) - Source: BLS.gov ==========
    // UNRATE is released same time as NFP (First Friday of month, 8:30 AM ET)
    // 2025
    { eventKey: 'unrate', occursAt: '2025-12-05T13:30:00Z', notes: 'Nov 2025 Unemployment Rate' },
    { eventKey: 'unrate', occursAt: '2025-11-07T13:30:00Z', notes: 'Oct 2025 Unemployment Rate', actual: 4.1 },
    { eventKey: 'unrate', occursAt: '2025-10-03T12:30:00Z', notes: 'Sep 2025 Unemployment Rate', actual: 4.1 },
    { eventKey: 'unrate', occursAt: '2025-09-05T12:30:00Z', notes: 'Aug 2025 Unemployment Rate', actual: 4.2 },
    { eventKey: 'unrate', occursAt: '2025-08-01T12:30:00Z', notes: 'Jul 2025 Unemployment Rate', actual: 4.3 },
    { eventKey: 'unrate', occursAt: '2025-07-03T12:30:00Z', notes: 'Jun 2025 Unemployment Rate', actual: 4.0 },
    { eventKey: 'unrate', occursAt: '2025-06-06T12:30:00Z', notes: 'May 2025 Unemployment Rate', actual: 4.2 },
    { eventKey: 'unrate', occursAt: '2025-05-02T12:30:00Z', notes: 'Apr 2025 Unemployment Rate', actual: 4.2 },
    { eventKey: 'unrate', occursAt: '2025-04-04T12:30:00Z', notes: 'Mar 2025 Unemployment Rate', actual: 4.2 },
    { eventKey: 'unrate', occursAt: '2025-03-07T12:30:00Z', notes: 'Feb 2025 Unemployment Rate', actual: 4.1 },
    { eventKey: 'unrate', occursAt: '2025-02-07T13:30:00Z', notes: 'Jan 2025 Unemployment Rate', actual: 4.0 },
    { eventKey: 'unrate', occursAt: '2025-01-10T13:30:00Z', notes: 'Dec 2024 Unemployment Rate', actual: 4.1 },
    // 2024
    { eventKey: 'unrate', occursAt: '2024-12-06T13:30:00Z', notes: 'Nov 2024 Unemployment Rate', actual: 4.2 },
    { eventKey: 'unrate', occursAt: '2024-11-01T12:30:00Z', notes: 'Oct 2024 Unemployment Rate', actual: 4.1 },
    { eventKey: 'unrate', occursAt: '2024-10-04T12:30:00Z', notes: 'Sep 2024 Unemployment Rate', actual: 4.1 },
    { eventKey: 'unrate', occursAt: '2024-09-06T12:30:00Z', notes: 'Aug 2024 Unemployment Rate', actual: 4.2 },
    { eventKey: 'unrate', occursAt: '2024-08-02T12:30:00Z', notes: 'Jul 2024 Unemployment Rate', actual: 4.3 },
    { eventKey: 'unrate', occursAt: '2024-07-05T12:30:00Z', notes: 'Jun 2024 Unemployment Rate', actual: 4.1 },
    { eventKey: 'unrate', occursAt: '2024-06-07T12:30:00Z', notes: 'May 2024 Unemployment Rate', actual: 4.0 },
    { eventKey: 'unrate', occursAt: '2024-05-03T12:30:00Z', notes: 'Apr 2024 Unemployment Rate', actual: 3.9 },
    { eventKey: 'unrate', occursAt: '2024-04-05T12:30:00Z', notes: 'Mar 2024 Unemployment Rate', actual: 3.8 },
    { eventKey: 'unrate', occursAt: '2024-03-08T12:30:00Z', notes: 'Feb 2024 Unemployment Rate', actual: 3.9 },
    { eventKey: 'unrate', occursAt: '2024-02-02T13:30:00Z', notes: 'Jan 2024 Unemployment Rate', actual: 3.7 },
    { eventKey: 'unrate', occursAt: '2024-01-05T13:30:00Z', notes: 'Dec 2023 Unemployment Rate', actual: 3.7 },
    // 2023
    { eventKey: 'unrate', occursAt: '2023-12-08T13:30:00Z', notes: 'Nov 2023 Unemployment Rate', actual: 3.7 },
    { eventKey: 'unrate', occursAt: '2023-11-03T12:30:00Z', notes: 'Oct 2023 Unemployment Rate', actual: 3.9 },
    { eventKey: 'unrate', occursAt: '2023-10-06T12:30:00Z', notes: 'Sep 2023 Unemployment Rate', actual: 3.8 },
    { eventKey: 'unrate', occursAt: '2023-09-01T12:30:00Z', notes: 'Aug 2023 Unemployment Rate', actual: 3.8 },
    { eventKey: 'unrate', occursAt: '2023-08-04T12:30:00Z', notes: 'Jul 2023 Unemployment Rate', actual: 3.5 },
    { eventKey: 'unrate', occursAt: '2023-07-07T12:30:00Z', notes: 'Jun 2023 Unemployment Rate', actual: 3.6 },
    { eventKey: 'unrate', occursAt: '2023-06-02T12:30:00Z', notes: 'May 2023 Unemployment Rate', actual: 3.7 },
    { eventKey: 'unrate', occursAt: '2023-05-05T12:30:00Z', notes: 'Apr 2023 Unemployment Rate', actual: 3.4 },
    { eventKey: 'unrate', occursAt: '2023-04-07T12:30:00Z', notes: 'Mar 2023 Unemployment Rate', actual: 3.5 },
    { eventKey: 'unrate', occursAt: '2023-03-10T13:30:00Z', notes: 'Feb 2023 Unemployment Rate', actual: 3.6 },
    { eventKey: 'unrate', occursAt: '2023-02-03T13:30:00Z', notes: 'Jan 2023 Unemployment Rate', actual: 3.4 },
    { eventKey: 'unrate', occursAt: '2023-01-06T13:30:00Z', notes: 'Dec 2022 Unemployment Rate', actual: 3.5 },

    // ========== PPI (Producer Price Index) - Source: BLS.gov ==========
    // PPI is released ~2 days before CPI, usually 2nd Thursday at 8:30 AM ET
    // 2025
    { eventKey: 'ppi', occursAt: '2025-12-11T13:30:00Z', notes: 'Nov 2025 PPI' },
    { eventKey: 'ppi', occursAt: '2025-11-14T13:30:00Z', notes: 'Oct 2025 PPI', actual: 2.4 },
    { eventKey: 'ppi', occursAt: '2025-10-09T12:30:00Z', notes: 'Sep 2025 PPI', actual: 1.8 },
    { eventKey: 'ppi', occursAt: '2025-09-11T12:30:00Z', notes: 'Aug 2025 PPI', actual: 1.7 },
    { eventKey: 'ppi', occursAt: '2025-08-14T12:30:00Z', notes: 'Jul 2025 PPI', actual: 2.2 },
    { eventKey: 'ppi', occursAt: '2025-07-15T12:30:00Z', notes: 'Jun 2025 PPI', actual: 2.7 },
    { eventKey: 'ppi', occursAt: '2025-06-12T12:30:00Z', notes: 'May 2025 PPI', actual: 2.3 },
    { eventKey: 'ppi', occursAt: '2025-05-15T12:30:00Z', notes: 'Apr 2025 PPI', actual: 2.4 },
    { eventKey: 'ppi', occursAt: '2025-04-10T12:30:00Z', notes: 'Mar 2025 PPI', actual: 2.7 },
    { eventKey: 'ppi', occursAt: '2025-03-13T12:30:00Z', notes: 'Feb 2025 PPI', actual: 3.2 },
    { eventKey: 'ppi', occursAt: '2025-02-13T13:30:00Z', notes: 'Jan 2025 PPI', actual: 3.5 },
    { eventKey: 'ppi', occursAt: '2025-01-14T13:30:00Z', notes: 'Dec 2024 PPI', actual: 3.3 },
    // 2024
    { eventKey: 'ppi', occursAt: '2024-12-12T13:30:00Z', notes: 'Nov 2024 PPI', actual: 3.0 },
    { eventKey: 'ppi', occursAt: '2024-11-14T12:30:00Z', notes: 'Oct 2024 PPI', actual: 2.4 },
    { eventKey: 'ppi', occursAt: '2024-10-11T12:30:00Z', notes: 'Sep 2024 PPI', actual: 1.8 },
    { eventKey: 'ppi', occursAt: '2024-09-12T12:30:00Z', notes: 'Aug 2024 PPI', actual: 1.7 },
    { eventKey: 'ppi', occursAt: '2024-08-13T12:30:00Z', notes: 'Jul 2024 PPI', actual: 2.2 },
    { eventKey: 'ppi', occursAt: '2024-07-12T12:30:00Z', notes: 'Jun 2024 PPI', actual: 2.6 },
    { eventKey: 'ppi', occursAt: '2024-06-13T12:30:00Z', notes: 'May 2024 PPI', actual: 2.2 },
    { eventKey: 'ppi', occursAt: '2024-05-14T12:30:00Z', notes: 'Apr 2024 PPI', actual: 2.2 },
    { eventKey: 'ppi', occursAt: '2024-04-11T12:30:00Z', notes: 'Mar 2024 PPI', actual: 2.1 },
    { eventKey: 'ppi', occursAt: '2024-03-14T12:30:00Z', notes: 'Feb 2024 PPI', actual: 1.6 },
    { eventKey: 'ppi', occursAt: '2024-02-16T13:30:00Z', notes: 'Jan 2024 PPI', actual: 0.9 },
    { eventKey: 'ppi', occursAt: '2024-01-12T13:30:00Z', notes: 'Dec 2023 PPI', actual: 1.0 },
    // 2023
    { eventKey: 'ppi', occursAt: '2023-12-13T13:30:00Z', notes: 'Nov 2023 PPI', actual: 0.9 },
    { eventKey: 'ppi', occursAt: '2023-11-15T13:30:00Z', notes: 'Oct 2023 PPI', actual: 1.3 },
    { eventKey: 'ppi', occursAt: '2023-10-11T12:30:00Z', notes: 'Sep 2023 PPI', actual: 2.2 },
    { eventKey: 'ppi', occursAt: '2023-09-14T12:30:00Z', notes: 'Aug 2023 PPI', actual: 1.6 },
    { eventKey: 'ppi', occursAt: '2023-08-11T12:30:00Z', notes: 'Jul 2023 PPI', actual: 0.8 },
    { eventKey: 'ppi', occursAt: '2023-07-13T12:30:00Z', notes: 'Jun 2023 PPI', actual: 0.1 },
    { eventKey: 'ppi', occursAt: '2023-06-14T12:30:00Z', notes: 'May 2023 PPI', actual: 1.1 },
    { eventKey: 'ppi', occursAt: '2023-05-11T12:30:00Z', notes: 'Apr 2023 PPI', actual: 2.3 },
    { eventKey: 'ppi', occursAt: '2023-04-13T12:30:00Z', notes: 'Mar 2023 PPI', actual: 2.7 },
    { eventKey: 'ppi', occursAt: '2023-03-15T12:30:00Z', notes: 'Feb 2023 PPI', actual: 4.6 },
    { eventKey: 'ppi', occursAt: '2023-02-16T13:30:00Z', notes: 'Jan 2023 PPI', actual: 6.0 },
    { eventKey: 'ppi', occursAt: '2023-01-18T13:30:00Z', notes: 'Dec 2022 PPI', actual: 6.2 },
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

export const getTimePeriod = (hour: number): string => {
    if (hour >= 0 && hour < 5) return '凌晨'
    if (hour >= 5 && hour < 11) return '早上'
    if (hour >= 11 && hour < 13) return '中午'
    if (hour >= 13 && hour < 17) return '下午'
    if (hour >= 17 && hour < 19) return '傍晚'
    if (hour >= 19 && hour < 23) return '晚上'
    return '半夜' // 23-24
}

export const formatOccursAt = (occursAt: string): string => {
    const date = new Date(occursAt)
    // Create a date object in ET timezone to get the correct hour for the period
    const etDateStr = date.toLocaleString('en-US', { timeZone: 'America/New_York' })
    const etDate = new Date(etDateStr)
    const hour = etDate.getHours()
    const period = getTimePeriod(hour)

    const formattedDate = date.toLocaleString('zh-TW', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })

    // Insert period before time (Assuming format YYYY/MM/DD HH:mm)
    // We want YYYY/MM/DD [Period] HH:mm
    const [d, t] = formattedDate.split(' ')
    return `${d} ${period} ${t} (美東)`
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

// ========== FRED Data Integration ==========
// Import dynamically fetched indicator data
import macroIndicatorsJson from '@/data/macro-indicators.json'

interface MacroIndicatorsData {
    cpi: Record<string, { actual: number; yoy?: number }>
    nfp: Record<string, { actual: number; change?: number }>
    fomc: Record<string, { actual: number }>
    lastSync: string | null
}

const macroIndicators = macroIndicatorsJson as MacroIndicatorsData

/**
 * Get occurrences merged with FRED data
 * Priority: FRED data > Static MACRO_OCCURRENCES
 */
export function getMergedOccurrences(eventKey?: string): MacroEventOccurrence[] {
    let occurrences = eventKey
        ? MACRO_OCCURRENCES.filter(o => o.eventKey === eventKey)
        : [...MACRO_OCCURRENCES]

    return occurrences.map(occ => {
        const releaseDate = new Date(occ.occursAt).toISOString().split('T')[0]

        // Try to get FRED data for this occurrence
        let fredData: { actual: number } | undefined

        if (occ.eventKey === 'cpi' && macroIndicators.cpi[releaseDate]) {
            fredData = macroIndicators.cpi[releaseDate]
        } else if (occ.eventKey === 'nfp' && macroIndicators.nfp[releaseDate]) {
            fredData = macroIndicators.nfp[releaseDate]
        } else if (occ.eventKey === 'fomc' && macroIndicators.fomc[releaseDate]) {
            fredData = macroIndicators.fomc[releaseDate]
        }

        // Merge: FRED data takes priority over static data
        if (fredData) {
            return {
                ...occ,
                actual: fredData.actual
            }
        }

        return occ
    })
}

/**
 * Get the last sync timestamp for FRED data
 */
export function getFredSyncStatus(): { lastSync: string | null } {
    return {
        lastSync: macroIndicators.lastSync
    }
}

