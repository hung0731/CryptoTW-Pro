'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Calendar,
    Activity,
    TrendingUp,
    BarChart2,
    Clock,
    Target,
    Zap,
    TrendingDown,
    DollarSign,
    Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    MacroEventOccurrence,
    MacroReaction,
    calculateEventStats,
    getPastOccurrences,
    getNextOccurrence,
    getDaysUntil,
    formatOccursAt
} from '@/lib/macro-events'
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { HistoryChart } from '@/components/HistoryChart'
import { UniversalCard, CardContent, CardHeader, CardTitle } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'

import { SuperimposedEventChart } from '@/components/charts/SuperimposedEventChart'
import { HistoricalEventTable } from '@/components/tables/HistoricalEventTable'
import { IndicatorTrendChart } from '@/components/charts/IndicatorTrendChart'

interface EventDetailClientProps {
    eventKey: string
    reactions: Record<string, MacroReaction>
}

// 1. Hero Stats Row (Refactored to Standard Card with Dividers)
function EventStatsRow({ stats }: { stats: any }) {
    if (!stats) return null

    return (
        <UniversalCard className="mb-6 p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0A0B14]">
                <SectionHeaderCard
                    title="統計數據"
                    icon={BarChart2}
                />
            </div>

            <div className="p-0">
                <div className="grid grid-cols-3 divide-x divide-[#1A1A1A]">
                    <div className="p-6 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">平均波動 (D0-D1)</div>
                        <div className="text-3xl font-bold font-mono text-white flex items-center gap-1">
                            {stats.avgRange?.toFixed(2)}%
                        </div>
                    </div>

                    <div className="p-6 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">上漲機率</div>
                        <div className={cn(
                            "text-3xl font-bold font-mono",
                            stats.d1WinRate > 50 ? "text-green-500" : "text-red-500"
                        )}>
                            {stats.d1WinRate?.toFixed(0)}%
                        </div>
                    </div>

                    <div className="p-6 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">樣本數</div>
                        <div className="text-3xl font-bold font-mono text-white">
                            {stats.samples}
                        </div>
                    </div>
                </div>
            </div>
        </UniversalCard>
    )
}

// 2. Next Event Card (Enhanced)
function NextEventCard({ nextOcc, eventDef }: { nextOcc: MacroEventOccurrence | null, eventDef: any }) {
    if (!nextOcc) return null

    const days = getDaysUntil(nextOcc.occursAt)
    const isToday = days === 0

    return (
        <UniversalCard variant="highlight" size="L" className="border-blue-500/20 bg-blue-900/10 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            即將到來
                        </span>
                        <h2 className="text-lg font-bold text-white">{eventDef.name} 發布</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-blue-200/80 font-mono">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatOccursAt(nextOcc.occursAt)}
                        </div>
                        {nextOcc.forecast !== undefined && (
                            <div className="flex items-center gap-1.5">
                                <Target className="w-4 h-4" />
                                前期: {nextOcc.forecast}{eventDef.key === 'nfp' ? 'K' : '%'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center bg-black/40 rounded-xl p-3 border border-blue-500/20 min-w-[100px]">
                    <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">倒數計時</div>
                    <div className="text-2xl font-bold text-white font-mono">
                        {isToday ? 'TODAY' : `${days} DAYS`}
                    </div>
                </div>
            </div>
        </UniversalCard>
    )

}

export default function EventDetailClient({ eventKey, reactions }: EventDetailClientProps) {
    const eventDef = MACRO_EVENT_DEFS.find(d => d.key === eventKey)

    if (!eventDef) return <div>Event not found</div>

    const [selectedYear, setSelectedYear] = useState<string>('all')
    const [selectedSurprise, setSelectedSurprise] = useState<'all' | 'beat' | 'miss'>('all')

    const stats = calculateEventStats(eventKey, reactions)
    const nextOcc = getNextOccurrence(eventKey)
    const pastOccurrences = getPastOccurrences(eventKey, 36)

    // Prepare data for Superimposed Chart & Table
    // Sort occurrences by date ascending first
    const sortedOccurrences = [...pastOccurrences].sort((a, b) =>
        new Date(a.occursAt).getTime() - new Date(b.occursAt).getTime()
    )

    const historicalEvents = sortedOccurrences.map((occ, index) => {
        const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
        const reactionKey = `${eventKey}-${keyDate}`
        const reaction = reactions[reactionKey]

        if (!reaction || !reaction.priceData || reaction.priceData.length === 0) return null

        // Use previous period's actual as forecast (for "vs previous period" comparison)
        // If forecast exists, use it; otherwise use previous occurrence's actual
        let forecastValue = occ.forecast
        if (forecastValue === undefined || forecastValue === null || forecastValue === 0) {
            // Find previous occurrence with actual value
            const previousOcc = sortedOccurrences[index - 1]
            if (previousOcc && previousOcc.actual !== undefined) {
                forecastValue = previousOcc.actual
            }
        }

        return {
            eventKey: reactionKey,
            date: keyDate,
            actual: occ.actual || 0,
            forecast: forecastValue || 0,  // Now represents "previous period" value
            priceData: reaction.priceData,
            stats: reaction.stats
        }
    }).filter(Boolean) as any[]

    // Sort back to descending for display (newest first)
    historicalEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Filter Data
    const years = Array.from(new Set(historicalEvents.map(e => e.date.split('-')[0]))).sort((a, b) => b.localeCompare(a))

    const filteredEvents = historicalEvents.filter(e => {
        const yearMatch = selectedYear === 'all' || e.date.startsWith(selectedYear)

        let surpriseMatch = true
        if (selectedSurprise !== 'all') {
            const diff = Number(e.actual) - Number(e.forecast)
            // For CPI/PPI/UNRATE: Lower is "低於前期" (beat), Higher is "高於前期" (miss)
            const isLowerThanPrevious = diff < 0
            const isCPIType = eventKey.includes('cpi') || eventKey.includes('ppi') || eventKey.includes('unrate')
            // For CPI-type: lower is beat; for NFP: higher is beat
            const isBeat = isCPIType ? isLowerThanPrevious : !isLowerThanPrevious

            if (selectedSurprise === 'beat') surpriseMatch = isBeat
            if (selectedSurprise === 'miss') surpriseMatch = !isBeat
        }

        return yearMatch && surpriseMatch
    })

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/calendar" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-bold">返回日曆</span>
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px] text-white/80">{eventDef.name}</div>
                <div className="w-8" />
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">

                {/* 1. Next Event Hero */}
                <NextEventCard nextOcc={nextOcc || null} eventDef={eventDef} />

                {/* 2. Narrative Timeline */}




                {/* 4. Combined Historical Analysis Card [NEW v2] */}
                <UniversalCard className="p-0 overflow-hidden bg-[#0A0A0A]">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] p-4">
                        <SectionHeaderCard
                            title="歷史復盤與數據分析"
                            description="過去 3 年的市場反應疊加與詳細數據"
                            icon={Activity}
                            className="p-0 border-none bg-transparent"
                        />
                    </div>

                    {/* Filter Toolbar */}
                    <div className="px-4 py-3 bg-[#0A0A0A] border-b border-[#1A1A1A] flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">年份</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="bg-[#1A1A1A] text-xs text-white border border-[#333] rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">全部年份</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="w-px h-4 bg-[#222]" />

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">篩選</span>
                            <div className="flex bg-[#1A1A1A] rounded-md p-0.5 border border-[#333]">
                                <button
                                    onClick={() => setSelectedSurprise('all')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-medium rounded transition-all",
                                        selectedSurprise === 'all' ? "bg-[#333] text-white" : "text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    全部
                                </button>
                                <button
                                    onClick={() => setSelectedSurprise('beat')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-medium rounded transition-all",
                                        selectedSurprise === 'beat' ? "bg-emerald-500/20 text-emerald-400" : "text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    低於前期
                                </button>
                                <button
                                    onClick={() => setSelectedSurprise('miss')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-medium rounded transition-all",
                                        selectedSurprise === 'miss' ? "bg-red-500/20 text-red-400" : "text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    高於前期
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        {/* Chart Section */}
                        <div className="px-6 pt-6 pb-2">
                            <SuperimposedEventChart
                                events={filteredEvents}
                                windowStart={eventDef.windowDisplay?.start || -5}
                                windowEnd={eventDef.windowDisplay?.end || 10}
                                variant="minimal"
                            />
                        </div>

                        {/* Sub Chart: Indicator Trend */}
                        <div className="px-6 pb-6">
                            <IndicatorTrendChart
                                events={historicalEvents}
                                title={eventDef.name}
                                className="border-none bg-transparent p-0 shadow-none !rounded-none"
                            />
                        </div>

                        {/* Table Section (Full Width) */}
                        <div className="border-t border-[#1A1A1A] bg-[#0A0A0A]">
                            <HistoricalEventTable
                                events={filteredEvents}
                                variant="minimal"
                            />
                        </div>
                    </div>
                </UniversalCard>
            </div>
        </div>
    )
}
