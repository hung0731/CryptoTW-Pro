'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    getNextOccurrence,
    getPastOccurrences,
    getDaysUntil,
    getSurprise,
    formatValue,
    formatOccursAt,
    MacroEventOccurrence
} from '@/lib/macro-events'

// Types
interface MacroReaction {
    eventKey: string
    occursAt: string
    stats: {
        d0d1Return: number | null
        d0d3Return: number | null
        maxDrawdown: number
        maxUpside: number
        range: number
        direction: 'up' | 'down' | 'chop'
    }
    priceData: { date: string; close: number; high: number; low: number }[]
}

interface CalendarClientProps {
    reactions: Record<string, MacroReaction>
}

// Mini Sparkline Card
function MiniChartCard({
    occ,
    eventDef,
    reactions,
    isNext = false,
    isLatest = false
}: {
    occ: MacroEventOccurrence
    eventDef: typeof MACRO_EVENT_DEFS[0]
    reactions: Record<string, MacroReaction>
    isNext?: boolean
    isLatest?: boolean
}) {
    const dateStr = occ.occursAt.slice(5, 10).replace('-', '/')
    const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
    const reactionKey = `${occ.eventKey}-${keyDate}`
    const reaction = reactions[reactionKey]
    const surprise = getSurprise(occ)
    const daysUntil = getDaysUntil(occ.occursAt)

    const formatCountdown = (days: number) => {
        if (days <= 0) return '今天'
        if (days === 1) return '明天'
        if (days <= 7) return `${days}天`
        return `${Math.ceil(days / 7)}週`
    }

    // Chart rendering
    const renderChart = () => {
        if (!reaction?.priceData || reaction.priceData.length === 0) {
            return (
                <div className="w-full h-12 flex items-center justify-center opacity-30">
                    <div className="flex gap-0.5">
                        {[16, 24, 20, 28, 22].map((h, i) => (
                            <div key={i} className="w-1 bg-neutral-700 rounded-full" style={{ height: h }} />
                        ))}
                    </div>
                </div>
            )
        }

        const prices = reaction.priceData.map(p => p.close)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const range = max - min || 1
        const width = 110
        const height = 48
        const padding = 2

        const points = prices.map((price, i) => {
            const x = padding + (i / (prices.length - 1)) * (width - padding * 2)
            const y = height - padding - ((price - min) / range) * (height - padding * 2)
            return `${x},${y}`
        }).join(' ')

        const color = reaction.stats.direction === 'up' ? '#22c55e' :
            reaction.stats.direction === 'down' ? '#ef4444' : '#6b7280'

        // Calculate D0 X position
        // Event data is D-WindowStart to D+WindowEnd
        // For D-3 to D+3 (7 days), center index is 3
        const totalPoints = prices.length // e.g. 7
        // We know reaction data struct matches windowDisplay
        // center index for D-3..D+3 is 3. For D-1..D+5 is 1.
        const centerIndex = -eventDef.windowDisplay.start
        const d0X = padding + (centerIndex / (totalPoints - 1)) * (width - padding * 2)

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
                {/* D0 marker line */}
                <line x1={d0X} y1={-5} x2={d0X} y2={height + 5} stroke="#ffffff20" strokeWidth="1" strokeDasharray="2,2" />
                <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
            </svg>
        )
    }

    const getSurpriseText = () => {
        if (!surprise) return null
        if (surprise === 'high') return '↑'
        if (surprise === 'low') return '↓'
        return '='
    }

    return (
        <div className={cn(
            "flex-shrink-0 w-[130px] rounded-xl relative overflow-hidden flex flex-col justify-between border transition-all duration-300",
            isNext
                ? "bg-amber-500/10 border-amber-500/30"
                : isLatest
                    ? "bg-neutral-800 border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                    : "bg-neutral-900/40 border-white/5 opacity-80 hover:opacity-100"
        )}>
            {/* Header: Date + Time + Badge */}
            <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
                <div className="flex flex-col">
                    <span className={cn(
                        "text-[11px] font-mono tracking-wide leading-tight",
                        isNext ? "text-amber-400 font-bold" : isLatest ? "text-white font-bold" : "text-neutral-500"
                    )}>
                        {dateStr}
                    </span>
                    {isNext && (
                        <span className="text-[9px] text-amber-500/80 font-mono">
                            {formatOccursAt(occ.occursAt).split(', ')[1] || '20:30'}
                        </span>
                    )}
                </div>

                {isNext ? (
                    <span className="text-[9px] text-amber-500/90 font-medium px-1.5 py-0.5 bg-amber-500/20 rounded ml-auto">{formatCountdown(daysUntil)}</span>
                ) : (
                    // D+1 Return Badge
                    reaction?.stats?.d0d1Return !== null && reaction?.stats?.d0d1Return !== undefined && (
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto",
                            reaction.stats.d0d1Return > 0 ? "bg-green-500/20 text-green-400" :
                                reaction.stats.d0d1Return < 0 ? "bg-red-500/20 text-red-400" :
                                    "bg-neutral-600/30 text-neutral-400"
                        )}>
                            {reaction.stats.d0d1Return > 0 ? '+' : ''}{reaction.stats.d0d1Return}%
                        </span>
                    )
                )}
            </div>

            {/* Chart Area */}
            <div className="relative h-12 w-full px-1 my-1">
                {renderChart()}
            </div>

            {/* Footer: Quiet Metrics */}
            <div className="px-2.5 pb-2.5 flex items-center justify-between text-[9px] text-neutral-500">
                <div className="flex items-center gap-1">
                    <span className="scale-90 origin-left opacity-60 font-mono">預測</span>
                    <span className={cn(
                        "font-medium tracking-tight font-mono",
                        isNext ? "text-amber-500/90" : "text-neutral-400"
                    )}>
                        {formatValue(eventDef.key, occ.forecast)}
                    </span>
                </div>
                {!isNext && (
                    <div className="flex items-center gap-1">
                        <span className="scale-90 origin-right opacity-60 font-mono">實際</span>
                        <div className="flex items-center gap-0.5">
                            <span className={cn(
                                "font-medium tracking-tight font-mono",
                                surprise === 'high' ? "text-white" :
                                    surprise === 'low' ? "text-white" : "text-neutral-400"
                            )}>
                                {formatValue(eventDef.key, occ.actual)}
                            </span>
                            {/* Surprise Dot instead of arrow for subtle effect */}
                            <div className={cn(
                                "w-1 h-1 rounded-full ml-0.5",
                                surprise === 'high' ? "bg-green-500" :
                                    surprise === 'low' ? "bg-red-500" : "bg-neutral-600"
                            )} />
                        </div>
                    </div>
                )}
            </div>

            {/* Next Badge */}
            {isNext && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-[9px] font-bold text-black rounded-bl-lg z-20 shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
                    NEXT
                </div>
            )}
        </div>
    )
}

export default function CalendarClient({ reactions }: CalendarClientProps) {
    const [alignMode, setAlignMode] = React.useState<'time' | 'reaction'>('time')

    const getSummaryStats = (eventKey: string) => {
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
            avgRange: Math.round(avgRange * 10) / 10,
        }
    }

    const formatCountdown = (days: number) => {
        if (days <= 0) return '今天'
        if (days === 1) return '明天'
        if (days <= 7) return `${days}天後`
        return `${Math.ceil(days / 7)}週後`
    }

    return (
        <div className="px-4 space-y-6">
            {/* Mode Switch */}
            <div className="flex items-center justify-end px-2">
                <div className="flex bg-neutral-900 rounded-lg p-0.5 border border-white/5">
                    <button
                        onClick={() => setAlignMode('time')}
                        className={cn(
                            "px-3 py-1 text-[10px] rounded shadow-sm border font-medium transition-all duration-200",
                            alignMode === 'time'
                                ? "text-white bg-neutral-800 border-white/5"
                                : "text-neutral-500 border-transparent hover:text-neutral-300"
                        )}
                    >
                        時間對齊 ⏱
                    </button>
                    <button
                        onClick={() => setAlignMode('reaction')}
                        className={cn(
                            "px-3 py-1 text-[10px] rounded shadow-sm border font-medium transition-all duration-200",
                            alignMode === 'reaction'
                                ? "text-white bg-neutral-800 border-white/5"
                                : "text-neutral-500 border-transparent hover:text-neutral-300"
                        )}
                    >
                        反應對齊 ⚡
                    </button>
                </div>
            </div>

            {MACRO_EVENT_DEFS.map((eventDef) => {
                const nextOccurrence = getNextOccurrence(eventDef.key)

                // Get past occurrences and filter
                const allPastOccurrences = getPastOccurrences(eventDef.key, 36)
                let pastOccurrences = allPastOccurrences
                    .filter(occ => {
                        const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                        const reactionKey = `${eventDef.key}-${keyDate}`
                        return !!reactions[reactionKey]
                    })
                    .slice(0, 11)

                // Sorting logic for 'reaction' mode
                if (alignMode === 'reaction') {
                    pastOccurrences = [...pastOccurrences].sort((a, b) => {
                        const getDate = (occ: typeof a) => new Date(occ.occursAt).toISOString().split('T')[0]
                        const rA = reactions[`${eventDef.key}-${getDate(a)}`]
                        const rB = reactions[`${eventDef.key}-${getDate(b)}`]
                        const valA = rA?.stats?.d0d1Return ? Math.abs(rA.stats.d0d1Return) : 0
                        const valB = rB?.stats?.d0d1Return ? Math.abs(rB.stats.d0d1Return) : 0
                        return valB - valA // Descending order of absolute return
                    })
                }

                const daysUntil = nextOccurrence ? getDaysUntil(nextOccurrence.occursAt) : 999
                const summaryStats = getSummaryStats(eventDef.key)

                return (
                    <div
                        key={eventDef.key}
                        className="bg-neutral-900/30 border border-white/5 rounded-2xl overflow-hidden"
                    >
                        {/* Card Header Section */}
                        <div className="p-4 pb-2">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex gap-3">
                                    <span className="text-2xl mt-0.5">{eventDef.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-base font-bold text-white tracking-wide">
                                                {eventDef.name}
                                            </h2>
                                            <Link href={`/calendar/${eventDef.key}`} className="text-blue-500 hover:text-blue-400 transition-colors bg-blue-500/10 p-1 rounded-full">
                                                <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                        {/* Insight One-Liner */}
                                        <p className="text-[11px] text-neutral-400 font-medium">
                                            {eventDef.insight}
                                        </p>
                                    </div>
                                </div>

                                {/* Chart Range Label */}
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] text-neutral-500 font-mono border border-white/5 rounded px-1.5 py-0.5 bg-neutral-900">
                                        ⏱ {eventDef.chartRange}
                                    </span>
                                </div>
                            </div>

                            {/* Summary Stats Row */}
                            <div className="flex items-center gap-2 text-[10px]">
                                {nextOccurrence && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                        <Calendar className="w-3 h-3 text-amber-500" />
                                        <span className={cn("font-medium", daysUntil <= 7 ? "text-amber-400" : "text-neutral-400")}>
                                            {formatCountdown(daysUntil)}
                                        </span>
                                    </div>
                                )}
                                {summaryStats && (
                                    <>
                                        <div className="h-4 w-px bg-white/10 mx-1" />
                                        {eventDef.key === 'fomc' ? (
                                            // FOMC specific stats
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-neutral-500">上漲機率</span>
                                                    <span className={cn("font-bold", summaryStats.d1WinRate >= 50 ? "text-green-400" : "text-red-400")}>
                                                        {summaryStats.d1WinRate}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-neutral-500">平均波幅</span>
                                                    <span className="text-amber-400 font-bold">{summaryStats.avgRange}%</span>
                                                </div>
                                            </>
                                        ) : (
                                            // CPI/NFP specific stats
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-neutral-500">歷史勝率</span>
                                                    <span className={cn("font-bold", summaryStats.d1WinRate >= 50 ? "text-green-400" : "text-red-400")}>
                                                        {summaryStats.d1WinRate}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-neutral-500">平均波動</span>
                                                    <span className="text-neutral-300 font-medium">{summaryStats.avgRange}%</span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Horizontal Scroll Cards */}
                        <div className="overflow-x-auto scrollbar-hide pb-4 pt-1">
                            <div className="flex gap-2.5 px-4 min-w-max">
                                {/* Always show next occurrence first */}
                                {nextOccurrence && (
                                    <MiniChartCard
                                        occ={nextOccurrence}
                                        eventDef={eventDef}
                                        reactions={reactions}
                                        isNext={true}
                                    />
                                )}
                                {/* Past occurrences (Sorted by Time or Reaction) */}
                                {pastOccurrences.map((occ, index) => (
                                    <MiniChartCard
                                        key={occ.occursAt}
                                        occ={occ}
                                        eventDef={eventDef}
                                        reactions={reactions}
                                        // Only highlight latest in 'time' mode
                                        isLatest={alignMode === 'time' && index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )
            })}

            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 text-center">
                <p className="text-[10px] text-neutral-600">
                    資料來源：<a href="https://www.bls.gov" className="text-neutral-500 hover:text-white transition-colors">BLS</a>・
                    <a href="https://www.federalreserve.gov" className="text-neutral-500 hover:text-white transition-colors">Fed</a>・
                    <span className="text-neutral-500">Binance Spot Pair</span>
                </p>
            </div>
        </div>
    )
}
