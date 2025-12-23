'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    ChevronRight,
    Calendar,
    Activity,
    Briefcase,
    Landmark,
    BookOpen,
    History,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    formatValue,
    formatOccursAt,
    MacroEventOccurrence,
    MacroReaction
} from '@/lib/macro-events'
import { SPACING, TYPOGRAPHY, COLORS } from '@/lib/design-tokens'
import { AISummaryCard } from '@/components/ui/AISummaryCard'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { EnrichedMacroEvent } from '@/lib/services/macro-events'

interface CalendarClientProps {
    enrichedEvents: EnrichedMacroEvent[]
}

// Mini Sparkline Card (Educational Style)
function MiniChartCard({
    occ,
    reaction,
    eventKey,
    windowDisplayStart,
    isNext = false,
    isLatest = false,
    daysUntil
}: {
    occ: MacroEventOccurrence
    reaction?: MacroReaction
    eventKey: string
    windowDisplayStart: number
    isNext?: boolean
    isLatest?: boolean
    daysUntil?: number
}) {
    const dateStr = occ.occursAt.slice(5, 10).replace('-', '/')

    const chartContent = (() => {
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

        // Neural Color for educational purpose (White/Grey) unless extreme
        const color = '#A0A0A0'
        const centerIndex = -windowDisplayStart
        const d0X = padding + (centerIndex / (prices.length - 1)) * (width - padding * 2)

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
                {/* D0 marker line */}
                <line x1={d0X} y1={-5} x2={d0X} y2={height + 5} stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
                <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
            </svg>
        )
    })();

    return (
        <div className={cn(
            "flex-shrink-0 w-[130px] rounded-lg relative overflow-hidden flex flex-col justify-between border",
            isNext
                ? "bg-[#1A1A1A] border-[#2A2A2A]" // Highlight Next
                : "bg-[#0A0A0A] border-transparent" // Standard Dark
        )}>
            {/* Header: Date + Time + Badge */}
            <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
                <div className="flex flex-col">
                    <span className={cn(
                        "text-[10px] font-mono tracking-wide leading-tight",
                        isNext ? "text-white" : COLORS.textSecondary
                    )}>
                        {dateStr}
                    </span>
                    {isNext && (
                        <span className={cn("text-[9px] font-mono", COLORS.textTertiary)}>
                            {(() => {
                                const parts = formatOccursAt(occ.occursAt).split(' ')
                                return parts[1] && parts[2] ? `${parts[1]} ${parts[2]}` : '20:30'
                            })()}
                        </span>
                    )}
                </div>

                {isNext ? (
                    <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded ml-auto text-white bg-[#2A2A2A] border border-[#333]")}>
                        D-{daysUntil ?? 0}
                    </span>
                ) : (
                    // D+1 Return Badge - Neutral Style
                    reaction?.stats?.d0d1Return !== null && reaction?.stats?.d0d1Return !== undefined && (
                        <span className={cn(
                            "text-[10px] font-mono font-bold ml-auto text-neutral-400"
                        )}>
                            {reaction.stats.d0d1Return > 0 ? '+' : ''}{reaction.stats.d0d1Return}%
                        </span>
                    )
                )}
            </div>

            {/* Chart Area */}
            <div className="relative h-12 w-full px-1 my-1 opacity-80">
                {chartContent}
            </div>

            {/* Footer: Quiet Metrics */}
            <div className="px-2.5 pb-2.5 flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1">
                    <span className={cn("scale-90 origin-left opacity-60 font-mono", COLORS.textTertiary)}>預測</span>
                    <span className={cn("font-medium tracking-tight font-mono", COLORS.textSecondary)}>
                        {formatValue(eventKey, occ.forecast)}
                    </span>
                </div>
                {!isNext && (
                    <div className="flex items-center gap-1">
                        <span className={cn("scale-90 origin-right opacity-60 font-mono", COLORS.textTertiary)}>實際</span>
                        <span className={cn("font-medium tracking-tight font-mono", COLORS.textPrimary)}>
                            {formatValue(eventKey, occ.actual)}
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
        case 'cpi': return <Activity className="w-4 h-4" />
        case 'nfp': return <Briefcase className="w-4 h-4" />
        case 'fomc': return <Landmark className="w-4 h-4" />
        default: return <Calendar className="w-4 h-4" />
    }
}

export default function CalendarClient({ enrichedEvents }: CalendarClientProps) {
    const [alignMode, setAlignMode] = useState<'time' | 'reaction'>('time')
    const [aiSummary, setAiSummary] = useState<string>('')
    const [aiLoading, setAiLoading] = useState(true)

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
                // Use pre-calculated payloads
                const eventsData = enrichedEvents
                    .filter(e => e.daysUntil < 365)
                    .map(e => e.aiPayload)

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

        void fetchAISummary()
    }, [enrichedEvents])

    return (
        <div className={cn(SPACING.pageX, SPACING.pageTop, "pb-20 space-y-6 font-sans")}>

            {/* AI Summary Card */}
            <AISummaryCard
                summary={aiSummary || '正在分析近期宏觀事件結構...'}
                source="事件結構分析"
                loading={aiLoading}
            />

            {/* Mode Switch & Filter */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-[10px] text-[#666]">
                    <History className="w-3 h-3" />
                    <span>點擊卡片查看歷史復盤</span>
                </div>
                <div className="flex rounded-lg p-0.5 border border-[#1A1A1A] bg-[#0A0A0A]">
                    <button
                        onClick={() => setAlignMode('time')}
                        className={cn(
                            "px-3 py-1 text-[10px] rounded transition-colors",
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
                            "px-3 py-1 text-[10px] rounded transition-colors",
                            alignMode === 'reaction'
                                ? "text-white bg-[#1A1A1A]"
                                : "text-[#666] hover:text-[#999]"
                        )}
                    >
                        依波動
                    </button>
                </div>
            </div>

            {enrichedEvents.map((item) => {
                const { def, nextOccurrence, daysUntil, pastOccurrences } = item

                // Local sorting for display only
                const displayOccurrences = [...pastOccurrences]
                if (alignMode === 'reaction') {
                    displayOccurrences.sort((a, b) => {
                        const valA = a.reaction?.stats?.d0d1Return ? Math.abs(a.reaction.stats.d0d1Return) : 0
                        const valB = b.reaction?.stats?.d0d1Return ? Math.abs(b.reaction.stats.d0d1Return) : 0
                        return valB - valA
                    })
                }

                return (
                    <Link
                        href={`/calendar/${def.key}`}
                        key={def.key}
                        className="block group"
                    >
                        <UniversalCard variant="clickable" size="M" className="p-0 overflow-hidden">
                            {/* 1. Header Section: Name + Icon */}
                            <div className="px-4 py-3 border-b border-white/5 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] text-white")}>
                                        {getEventIcon(def.key)}
                                    </div>

                                    <div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <h2 className={cn(TYPOGRAPHY.cardTitle, "group-hover:text-white transition-colors")}>
                                                    {def.name} <span className="text-[#666] font-normal text-xs">{def.key.toUpperCase()}</span>
                                                </h2>
                                                <ChevronRight className="w-3 h-3 text-[#444] group-hover:text-[#666]" />
                                            </div>
                                            {/* Educational Description - Neutral */}
                                            <p className={cn(TYPOGRAPHY.bodySmall, "truncate max-w-[200px]")}>
                                                {def.listDescription}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Anchor: Time Indicator (Neutral) */}
                                {nextOccurrence ? (
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded font-mono border",
                                            daysUntil === 0
                                                ? "bg-white text-black border-white font-bold" // Today: White Highlight
                                                : "bg-[#0E0E0F] border-[#2A2A2A] text-[#666]"
                                        )}>
                                            {daysUntil === 0 ? '今天' : `D-${daysUntil}`}
                                        </span>
                                    </div>
                                ) : (
                                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#2A2A2A] bg-[#0E0E0F]", COLORS.textTertiary)}>
                                        待定
                                    </span>
                                )}
                            </div>

                            {/* 2. Educational Context Bar (Impact Summary) */}
                            <div className="px-4 py-3 bg-[#0A0A0A]/50">
                                <div className="flex items-start gap-2">
                                    <BookOpen className="w-3 h-3 text-[#444] mt-0.5 flex-shrink-0" />
                                    <p className="text-[10px] text-[#808080] leading-relaxed">
                                        {def.impactSummary}
                                    </p>
                                </div>
                            </div>

                            {/* 3. Horizontal Scroll Cards (History) */}
                            <div className="overflow-x-auto scrollbar-hide pb-4 pt-1 border-t border-[#2A2A2A] bg-[#0A0A0B]">
                                <div className="flex gap-2.5 px-4 min-w-max pt-3">
                                    {nextOccurrence && (
                                        <MiniChartCard
                                            occ={nextOccurrence}
                                            eventKey={def.key}
                                            windowDisplayStart={def.windowDisplay.start}
                                            isNext={true}
                                            daysUntil={daysUntil}
                                        />
                                    )}
                                    {displayOccurrences.map((occ, index) => (
                                        <MiniChartCard
                                            key={occ.occursAt}
                                            occ={occ}
                                            reaction={occ.reaction}
                                            eventKey={def.key}
                                            windowDisplayStart={def.windowDisplay.start}
                                            isLatest={alignMode === 'time' && index === 0}
                                        />
                                    ))}
                                </div>
                            </div>
                        </UniversalCard>
                    </Link>
                )
            })}
        </div >
    )
}
