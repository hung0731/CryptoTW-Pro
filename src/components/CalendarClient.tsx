'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar, Activity, Briefcase, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    getNextOccurrence,
    getPastOccurrences,
    getDaysUntil,
    getSurprise,
    formatValue,
    formatOccursAt,
    MacroEventOccurrence,
    MacroReaction,
    calculateEventStats
} from '@/lib/macro-events'
import { SURFACE, COLORS, CARDS } from '@/lib/design-tokens'
import { AISummaryCard } from '@/components/ui/AISummaryCard'
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet"
import SingleEventClient from '@/components/SingleEventClient'

interface CalendarClientProps {
    reactions: Record<string, MacroReaction>
}

// Mini Sparkline Card (Styled like Type B in SingleEvent)
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

    // Chart rendering
    const renderChart = () => {
        if (!reaction?.priceData || reaction.priceData.length === 0) {
            return (
                <div className="w-full h-12 flex items-center justify-center opacity-30">
                    <div className="flex gap-0.5">
                        {[16, 24, 20, 28, 22].map((h, i) => (
                            <div key={i} className="w-1 bg-[#333] rounded-full" style={{ height: h }} />
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

        // Pro Style: Green/Red for Up/Down, otherwise Grey
        const d1 = reaction.stats.d0d1Return || 0
        const color = d1 > 0 ? '#4ADE80' : '#F87171' // Green : Red
        const centerIndex = -eventDef.windowDisplay.start
        const d0X = padding + (centerIndex / (prices.length - 1)) * (width - padding * 2)

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
                {/* D0 marker line */}
                <line x1={d0X} y1={-5} x2={d0X} y2={height + 5} stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
                <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
            </svg>
        )
    }

    return (
        <div className={cn(
            CARDS.typeB,
            "flex-shrink-0 w-[130px] rounded-lg relative overflow-hidden flex flex-col justify-between border border-transparent",
            isNext
                ? "bg-[#1A1A1A] border-[#2A2A2A]" // Highlight Next
                : SURFACE.card // Standard Dark
        )}>
            {/* Header: Date + Time + Badge */}
            <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
                <div className="flex flex-col">
                    <span className={cn(
                        "text-[10px] font-mono tracking-wide leading-tight",
                        isNext ? COLORS.positive : COLORS.textSecondary
                    )}>
                        {dateStr}
                    </span>
                    {isNext && (
                        <span className={cn("text-[9px] font-mono", COLORS.textTertiary)}>
                            {(() => {
                                const parts = formatOccursAt(occ.occursAt).split(' ')
                                // [0]=Date, [1]=Period, [2]=Time, [3]=(Zone)
                                return parts[1] && parts[2] ? `${parts[1]} ${parts[2]}` : '20:30'
                            })()}
                        </span>
                    )}
                </div>

                {isNext ? (
                    <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded ml-auto text-black bg-[#4ADE80]")}>
                        下次
                    </span>
                ) : (
                    // D+1 Return Badge
                    reaction?.stats?.d0d1Return !== null && (
                        <span className={cn(
                            "text-[10px] font-mono font-bold ml-auto",
                            reaction.stats.d0d1Return > 0 ? COLORS.positive : COLORS.negative
                        )}>
                            {reaction.stats.d0d1Return > 0 ? '+' : ''}{reaction.stats.d0d1Return}%
                        </span>
                    )
                )}
            </div>

            {/* Chart Area */}
            <div className="relative h-12 w-full px-1 my-1 opacity-80">
                {renderChart()}
            </div>

            {/* Footer: Quiet Metrics */}
            <div className="px-2.5 pb-2.5 flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1">
                    <span className={cn("scale-90 origin-left opacity-60 font-mono", COLORS.textTertiary)}>預測</span>
                    <span className={cn("font-medium tracking-tight font-mono", COLORS.textSecondary)}>
                        {formatValue(eventDef.key, occ.forecast)}
                    </span>
                </div>
                {!isNext && (
                    <div className="flex items-center gap-1">
                        <span className={cn("scale-90 origin-right opacity-60 font-mono", COLORS.textTertiary)}>實際</span>
                        <span className={cn("font-medium tracking-tight font-mono", COLORS.textPrimary)}>
                            {formatValue(eventDef.key, occ.actual)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

// Helper to get Icon
const getEventIcon = (key: string) => {
    switch (key) {
        case 'cpi': return 'CPI'
        case 'nfp': return 'NFP'
        case 'fomc': return 'FED'
        default: return 'EVT'
    }
}

export default function CalendarClient({ reactions }: CalendarClientProps) {
    const [alignMode, setAlignMode] = useState<'time' | 'reaction'>('time')
    const [aiSummary, setAiSummary] = useState<string>('')
    const [aiLoading, setAiLoading] = useState(true)
    const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null)

    const getSummaryStats = (eventKey: string) => {
        return calculateEventStats(eventKey, reactions)
    }

    // Fetch AI summary on mount (4 小時快取)
    useEffect(() => {
        const CACHE_KEY = 'calendar-ai-summary';
        const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

        const fetchAISummary = async () => {
            // Check cache first
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { summary, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setAiSummary(summary);
                        setAiLoading(false);
                        return;
                    }
                } catch (e) {
                    // Invalid cache, continue to fetch
                }
            }

            try {
                // Build event data for AI
                const eventsData = MACRO_EVENT_DEFS.map(eventDef => {
                    const nextOccurrence = getNextOccurrence(eventDef.key)
                    const daysUntil = nextOccurrence ? getDaysUntil(nextOccurrence.occursAt) : 999
                    const stats = calculateEventStats(eventDef.key, reactions)

                    // Get last event with reaction data
                    const pastEvents = getPastOccurrences(eventDef.key, 5)
                    const lastWithData = pastEvents.find(occ => {
                        const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                        const reactionKey = `${eventDef.key}-${keyDate}`
                        return reactions[reactionKey]
                    })

                    let lastEvent = undefined
                    if (lastWithData) {
                        const keyDate = new Date(lastWithData.occursAt).toISOString().split('T')[0]
                        const reactionKey = `${eventDef.key}-${keyDate}`
                        const reaction = reactions[reactionKey]
                        lastEvent = {
                            date: lastWithData.occursAt,
                            forecast: lastWithData.forecast,
                            actual: lastWithData.actual,
                            d1Return: reaction?.stats?.d0d1Return
                        }
                    }

                    return {
                        eventType: eventDef.key as 'cpi' | 'nfp' | 'fomc',
                        eventName: eventDef.name,
                        nextDate: nextOccurrence?.occursAt || '',
                        daysUntil,
                        stats: {
                            avgD1Return: stats?.avgUp ?? 0, // Use avgUp as proxy
                            winRate: stats?.d1WinRate ?? 50,
                            avgRange: stats?.avgRange ?? 0,
                            sampleSize: stats?.samples ?? 0
                        },
                        lastEvent
                    }
                }).filter(e => e.daysUntil < 365) // Only include events within a year

                const res = await fetch('/api/ai/calendar-summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: eventsData })
                })

                const data = await res.json()
                if (data.summary) {
                    setAiSummary(data.summary)
                    // Save to cache
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        summary: data.summary,
                        timestamp: Date.now()
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch calendar AI summary:', error)
            } finally {
                setAiLoading(false)
            }
        }

        fetchAISummary()
    }, [reactions])

    return (
        <div className="px-4 space-y-6 pb-20 pt-6">
            {/* AI Summary Card */}
            <AISummaryCard
                summary={aiSummary || '正在分析近期宏觀事件...'}
                source="事件預測"
                loading={aiLoading}
            />

            {/* Mode Switch */}
            <div className="flex items-center justify-end px-2">
                <div className={cn("flex rounded-lg p-0.5 border", SURFACE.card, SURFACE.border)}>
                    <button
                        onClick={() => setAlignMode('time')}
                        className={cn(
                            "px-3 py-1 text-[10px] rounded",
                            alignMode === 'time'
                                ? "text-white bg-[#1A1A1A]"
                                : "text-[#666] hover:text-[#999]"
                        )}
                    >
                        依日期
                    </button>
                    <button
                        onClick={() => setAlignMode('reaction')}
                        className={cn(
                            "px-3 py-1 text-[10px] rounded",
                            alignMode === 'reaction'
                                ? "text-white bg-[#1A1A1A]"
                                : "text-[#666] hover:text-[#999]"
                        )}
                    >
                        依波動
                    </button>
                </div>
            </div>

            {MACRO_EVENT_DEFS.map((eventDef) => {
                const nextOccurrence = getNextOccurrence(eventDef.key)
                const daysUntil = nextOccurrence ? getDaysUntil(nextOccurrence.occursAt) : 999
                const summaryStats = getSummaryStats(eventDef.key)

                // Get past occurrences
                const allPastOccurrences = getPastOccurrences(eventDef.key, 36)
                let pastOccurrences = allPastOccurrences
                    .filter(occ => {
                        const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                        const reactionKey = `${eventDef.key}-${keyDate}`
                        return !!reactions[reactionKey]
                    })
                    .slice(0, 11)

                if (alignMode === 'reaction') {
                    pastOccurrences = [...pastOccurrences].sort((a, b) => {
                        const getDate = (occ: typeof a) => new Date(occ.occursAt).toISOString().split('T')[0]
                        const rA = reactions[`${eventDef.key}-${getDate(a)}`]
                        const rB = reactions[`${eventDef.key}-${getDate(b)}`]
                        const valA = rA?.stats?.d0d1Return ? Math.abs(rA.stats.d0d1Return) : 0
                        const valB = rB?.stats?.d0d1Return ? Math.abs(rB.stats.d0d1Return) : 0
                        return valB - valA
                    })
                }

                return (
                    <div
                        onClick={() => setSelectedEventKey(eventDef.key)}
                        key={eventDef.key}
                        className={cn(
                            "cursor-pointer block group relative overflow-hidden active:opacity-90 transition-opacity",
                            CARDS.secondary
                        )}
                    >
                        {/* 1. Header Section: Name vs Next Badge */}
                        <div className={cn("px-4 py-3 border-b flex items-start justify-between", SURFACE.border)}>
                            <div className="flex items-center gap-3">
                                <span className={cn("text-xs font-black tracking-tighter text-[#444] mt-0.5", COLORS.textPrimary)}>
                                    {getEventIcon(eventDef.key)}
                                </span>

                                <div>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <h2 className={cn("text-sm font-bold tracking-wide group-hover:text-white", COLORS.textPrimary)}>
                                                {eventDef.name}
                                            </h2>
                                            <ChevronRight className="w-3 h-3 text-[#444] group-hover:text-[#666]" />
                                        </div>
                                        {/* Market Definition / Insight */}
                                        <p className={cn("text-[10px] truncate max-w-[200px]", COLORS.textTertiary)}>
                                            {eventDef.insight.includes('⚠️') ? (
                                                <span className="text-amber-500 font-medium">{eventDef.insight}</span>
                                            ) : (
                                                eventDef.listDescription
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Anchor: Next Occurrence Badge */}
                            {nextOccurrence ? (
                                <div className={cn(
                                    "flex flex-col items-end",
                                    daysUntil <= 7 ? "text-white" : "text-[#666]"
                                )}>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded font-bold border",
                                        daysUntil <= 3
                                            ? "bg-white/10 border-white/20 text-white"
                                            : "bg-[#0E0E0F] border-[#2A2A2A] text-[#666]"
                                    )}>
                                        {daysUntil === 0 ? '今天' : `T-${daysUntil}`}
                                    </span>
                                </div>
                            ) : (
                                <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#2A2A2A] bg-[#0E0E0F]", COLORS.textTertiary)}>
                                    待定
                                </span>
                            )}
                        </div>

                        {/* 2. Summary Stats Bar */}
                        <div className="px-4 py-3 flex items-center justify-between text-[10px]">
                            {/* Left: Chart Range / Next Date */}
                            <div className="flex items-center gap-2 text-neutral-500">
                                <span className="font-mono bg-[#1A1A1A] px-1 rounded">{eventDef.chartRange}</span>
                                {nextOccurrence && (
                                    <span>
                                        {(() => {
                                            const parts = formatOccursAt(nextOccurrence.occursAt).split(' ')
                                            return parts[1] && parts[2] ? `${parts[1]} ${parts[2]}` : '20:30'
                                        })()}
                                    </span>
                                )}
                            </div>

                            {/* Right: Stats Anchors */}
                            {summaryStats && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className={COLORS.textTertiary}>波動</span>
                                        <span className={cn("font-mono font-bold", COLORS.textPrimary)}>
                                            {summaryStats.avgRange}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={COLORS.textTertiary}>上漲</span>
                                        <span className={cn("font-mono font-bold", summaryStats.d1WinRate >= 50 ? COLORS.positive : COLORS.negative)}>
                                            {summaryStats.d1WinRate}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Horizontal Scroll Cards */}
                        <div className="overflow-x-auto scrollbar-hide pb-4 pt-1 border-t border-[#2A2A2A] bg-[#0A0A0B]">
                            <div className="flex gap-2.5 px-4 min-w-max pt-3">
                                {nextOccurrence && (
                                    <MiniChartCard
                                        occ={nextOccurrence}
                                        eventDef={eventDef}
                                        reactions={reactions}
                                        isNext={true}
                                    />
                                )}
                                {pastOccurrences.map((occ, index) => (
                                    <MiniChartCard
                                        key={occ.occursAt}
                                        occ={occ}
                                        eventDef={eventDef}
                                        reactions={reactions}
                                        isLatest={alignMode === 'time' && index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )
            })}


            <Sheet open={!!selectedEventKey} onOpenChange={(open) => !open && setSelectedEventKey(null)}>
                <SheetContent side="bottom" className="h-[85vh] p-0 bg-[#0A0A0A] border-t-white/10">
                    {selectedEventKey && (
                        <SingleEventClient
                            eventKey={selectedEventKey}
                            reactions={Object.entries(reactions)
                                .filter(([k, v]) => k.startsWith(selectedEventKey))
                                .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
                            }
                            isDrawer
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div >
    )
}
