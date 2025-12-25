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
    Play
} from 'lucide-react'
import { JudgmentReplay } from '@/components/JudgmentReplay'
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
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { EnrichedMacroEvent } from '@/lib/services/macro-events'

interface CalendarPageClientProps {
    enrichedEvents: EnrichedMacroEvent[]
}


/**
 * @utility-component
 * @description Custom card for calendar event grid only.
 * Does not use UniversalCard due to specific chart layout requirements.
 * NOT FOR GENERAL USE - Calendar page specific implementation.
 */
function MiniChartCard({
    occ,
    reaction,
    eventKey,
    windowDisplayStart,
    isNext = false,
    isLatest = false,
    daysUntil,
    onReplay
}: {
    occ: MacroEventOccurrence & { linkedReviewSlug?: string, linkedReviewTitle?: string }
    reaction?: MacroReaction
    eventKey: string
    windowDisplayStart: number
    isNext?: boolean
    isLatest?: boolean
    daysUntil?: number
    onReplay?: (occ: any) => void
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
            "flex-shrink-0 w-[130px] rounded-lg relative overflow-hidden flex flex-col justify-between border group/card",
            isNext
                ? "bg-[#1A1A1A] border-[#2A2A2A]" // Highlight Next
                : "bg-[#0A0A0A] border-transparent" // Standard Dark
        )}>
            {/* Hover overlay for Replay */}
            {!isNext && occ.linkedReviewSlug && onReplay && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover/card:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (onReplay) onReplay(occ);
                        }}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <Play className="w-4 h-4 fill-current" />
                    </button>
                    <span className="text-[9px] font-bold text-blue-200 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-500/30">
                        情境重播
                    </span>
                </div>
            )}

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

export default function CalendarPageClient({ enrichedEvents }: CalendarPageClientProps) {
    const [alignMode, setAlignMode] = useState<'time' | 'reaction'>('time')
    const [aiSummary, setAiSummary] = useState<string>('')
    const [aiLoading, setAiLoading] = useState(true)
    const [activeReplayEvent, setActiveReplayEvent] = useState<(MacroEventOccurrence & { linkedReviewSlug?: string }) | null>(null)

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

            {/* Pre-Event Checklist (War Room) - Only if imminent event */}
            {enrichedEvents.some(e => e.daysUntil <= 3 && e.daysUntil >= 0) && (() => {
                const imminentEvent = enrichedEvents.find(e => e.daysUntil <= 3 && e.daysUntil >= 0)!
                return (
                    <UniversalCard className="bg-gradient-to-br from-blue-950/30 to-[#0F0F10] border-blue-500/30 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Activity className="w-16 h-16 text-blue-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <h3 className="text-sm font-bold text-blue-100 tracking-wide uppercase">
                                    即將到來：{imminentEvent.def.name} (D-{imminentEvent.daysUntil})
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="text-xs text-neutral-400 font-mono mb-2">PRE-FLIGHT CHECKLIST</div>
                                    <div className="space-y-2">
                                        <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0B] border border-[#2A2A2A] hover:border-blue-500/50 transition-colors cursor-pointer group">
                                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-[#1A1A1A]" />
                                            <div>
                                                <span className="text-sm text-neutral-200 group-hover:text-white font-medium">检查資金費率 (Funding Rate)</span>
                                                <p className="text-xs text-neutral-500 mt-0.5">確認是否有多頭過度擁擠的跡象 (&gt;0.01% with high OI)</p>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0B] border border-[#2A2A2A] hover:border-blue-500/50 transition-colors cursor-pointer group">
                                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-[#1A1A1A]" />
                                            <div>
                                                <span className="text-sm text-neutral-200 group-hover:text-white font-medium">標記關鍵支撐阻力</span>
                                                <p className="text-xs text-neutral-500 mt-0.5">預先設定好如果插針 (Wick) 發生的接單點位。</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs text-neutral-400 font-mono mb-2">TACTICAL INTELLIGENCE</div>
                                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-blue-300 font-bold">歷史波動慣性</span>
                                            <span className="text-xs text-blue-400">{imminentEvent.stats?.avgRange}% (Avg Range)</span>
                                        </div>
                                        <p className="text-xs text-neutral-400 leading-relaxed">
                                            {imminentEvent.def.impactSummary}
                                        </p>
                                        {imminentEvent.aiPayload.lastEvent && (
                                            <div className="mt-3 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs">
                                                <span className="text-neutral-500">上次 ({imminentEvent.aiPayload.lastEvent.date.split('T')[0]})</span>
                                                <span className={cn(
                                                    "font-mono",
                                                    (imminentEvent.aiPayload.lastEvent.d1Return ?? 0) > 0 ? "text-green-400" : "text-red-400"
                                                )}>
                                                    {(imminentEvent.aiPayload.lastEvent.d1Return ?? 0) > 0 ? '+' : ''}{imminentEvent.aiPayload.lastEvent.d1Return}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UniversalCard>
                )
            })()}

            {/* Unified Calendar Container */}
            <UniversalCard className="w-full p-0 overflow-hidden">
                {/* Header */}
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="經濟日曆"
                        icon={Calendar}
                        rightElement={
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
                        }
                    />
                </div>

                {/* Event List */}
                <div className="flex flex-col">
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
                            <div key={def.key} className="group border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors">
                                <Link
                                    href={`/calendar/${def.key}`}
                                    className="block px-5 py-4"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] text-white group-hover:border-[#333]")}>
                                                {getEventIcon(def.key)}
                                            </div>

                                            <div>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <h2 className={cn("text-sm font-bold text-[#E0E0E0] group-hover:text-white transition-colors")}>
                                                            {def.name}
                                                        </h2>
                                                        <span className="text-[10px] font-mono text-[#666] bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-[#2A2A2A]">{def.key.toUpperCase()}</span>
                                                    </div>
                                                    <p className="text-xs text-[#666] truncate max-w-[240px]">
                                                        {item.narrative || def.impactSummary}
                                                    </p>
                                                    {/* [NEW v1.1] Narrative Status Badge */}
                                                    {item.narrative && (
                                                        <div className="mt-1.5 flex items-center gap-2">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border",
                                                                item.narrativeStatus === 'bullish_surprise' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                                                item.narrativeStatus === 'bearish_risk' && "bg-red-500/10 text-red-500 border-red-500/20",
                                                                item.narrativeStatus === 'neutral' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                            )}>
                                                                {item.narrativeStatus === 'bullish_surprise' && <Activity className="w-3 h-3" />}
                                                                {item.narrativeStatus === 'bearish_risk' && <Activity className="w-3 h-3" />}
                                                                {item.narrativeStatus === 'neutral' ? '觀望' : item.narrativeStatus === 'bullish_surprise' ? '利好預期' : '風險警示'}
                                                            </div>
                                                            {/* Risk Signal */}
                                                            {item.riskSignal && (
                                                                <div className={cn(
                                                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border",
                                                                    item.riskSignal.level === 'high' && "bg-red-500/10 text-red-500 border-red-500/20",
                                                                    item.riskSignal.level === 'medium' && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                                                                    item.riskSignal.level === 'low' && "bg-neutral-800 text-neutral-400 border-neutral-700"
                                                                )}>
                                                                    <span>{item.riskSignal.label}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Anchor: Time Indicator */}
                                        {nextOccurrence ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded font-mono border font-medium",
                                                    daysUntil === 0
                                                        ? "bg-white text-black border-white"
                                                        : "bg-[#0E0E0F] border-[#2A2A2A] text-[#888]"
                                                )}>
                                                    {daysUntil === 0 ? '今天' : `D-${daysUntil}`}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border border-[#2A2A2A] bg-[#0E0E0F] text-[#666]")}>
                                                待定
                                            </span>
                                        )}
                                    </div>

                                    {/* Horizontal Scroll Cards (History) - Integrated darker area */}
                                    <div className="rounded-lg bg-[#050505] border border-[#1A1A1A] p-3 overflow-hidden">
                                        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
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
                                                    onReplay={(occ) => setActiveReplayEvent(occ)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </UniversalCard>
            {/* Replay Modal */}
            {activeReplayEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-5xl bg-[#0F0F10] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden relative">
                        <button
                            onClick={() => setActiveReplayEvent(null)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <JudgmentReplay
                            symbol="BTC"
                            eventStart={activeReplayEvent.linkedReviewSlug ? '2022-11-06' : activeReplayEvent.occursAt.split('T')[0]}
                            eventEnd={activeReplayEvent.occursAt.split('T')[0]}
                            reviewSlug={activeReplayEvent.linkedReviewSlug || 'demo'}
                            daysBuffer={90}
                        />
                    </div>
                </div>
            )}
        </div >
    )
}
