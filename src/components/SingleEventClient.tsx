'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, ExternalLink, TrendingUp, Activity, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    getMacroEventDef,
    getPastOccurrences,
    getFutureOccurrences,
    formatOccursAt,
    formatValue,
    getSurprise,
    MacroEventOccurrence
} from '@/lib/macro-events'
import { SURFACE, COLORS, CARDS } from '@/lib/design-tokens'

// Types (same as CalendarClient)
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

interface SingleEventClientProps {
    eventKey: string
    reactions: Record<string, MacroReaction>
}

export default function SingleEventClient({ eventKey, reactions }: SingleEventClientProps) {
    const eventDef = getMacroEventDef(eventKey)!
    const pastOccurrences = getPastOccurrences(eventKey, 36)
    const futureOccurrences = getFutureOccurrences(eventKey, 12)

    // Pre-process occurrences with reactions
    const occurrencesWithData = useMemo(() => {
        return pastOccurrences.map(occ => {
            const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
            const reactionKey = `${eventKey}-${keyDate}`
            const reaction = reactions[reactionKey]
            return { ...occ, reaction }
        })
    }, [eventKey, pastOccurrences, reactions])

    // State for selected occurrence (Layer 3)
    // Default to the first one that has data
    const [selectedOcc, setSelectedOcc] = useState<typeof occurrencesWithData[0] | null>(
        occurrencesWithData.find(o => o.reaction) || null
    )

    // Layer 1 Logic: Summary Stats
    const summaryStats = useMemo(() => {
        const validReactions = occurrencesWithData.filter(o => o.reaction).map(o => o.reaction!)
        if (validReactions.length === 0) return null

        const d1Returns = validReactions.map(r => r.stats.d0d1Return).filter((r): r is number => r !== null)
        const upCount = d1Returns.filter(r => r > 0).length
        const avgRange = validReactions.reduce((sum, r) => sum + r.stats.range, 0) / validReactions.length

        // Reversal Logic: How often does D0 move opposite to D3?
        // Simple proxy: if D0d1 and D0d3 have different signs
        const reversals = validReactions.filter(r => {
            const d1 = r.stats.d0d1Return || 0
            const d3 = r.stats.d0d3Return || 0
            return (d1 > 0 && d3 < 0) || (d1 < 0 && d3 > 0)
        }).length

        return {
            winRate: Math.round((upCount / d1Returns.length) * 100),
            reversalRate: Math.round((reversals / validReactions.length) * 100),
            avgRange: Math.round(avgRange * 10) / 10,
            count: validReactions.length
        }
    }, [occurrencesWithData])

    // Helper for visual impact (Layer 2)
    const getImpactLevel = (occ: typeof occurrencesWithData[0]) => {
        if (!occ.reaction) return 'none'
        const range = occ.reaction.stats.range
        const d1 = occ.reaction.stats.d0d1Return || 0

        if (Math.abs(d1) > 2.5) return 'high_trend' // Strong move
        if (range > 5) return 'high_vol' // High volatility but maybe chop
        if (d1 > 0) return 'up'
        if (d1 < 0) return 'down'
        return 'neutral'
    }

    const renderChart = (reaction: MacroReaction) => {
        if (!reaction?.priceData || reaction.priceData.length === 0) return null

        const prices = reaction.priceData.map(p => p.close)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const range = max - min || 1
        const width = 600
        const height = 240
        const padding = 20

        const points = prices.map((price, i) => {
            const x = padding + (i / (prices.length - 1)) * (width - padding * 2)
            const y = height - padding - ((price - min) / range) * (height - padding * 2)
            return `${x},${y}`
        }).join(' ')

        // Visual Principle 4: Chart Lines (Tools not News)
        // Main: #EDEDED, Secondary: #5A5A5A
        const color = '#EDEDED'

        // D0 Line logic
        const centerIndex = -eventDef.windowDisplay.start
        const d0X = padding + (centerIndex / (prices.length - 1)) * (width - padding * 2)

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Visual Principle 4: Grid Lines #111111 (Barely Visible) */}
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#111111" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#111111" strokeWidth="1" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#111111" strokeWidth="1" />

                {/* Visual Principle 4: D0 Marker (Vertical Dashed + Label, No Color) */}
                <line x1={d0X} y1={0} x2={d0X} y2={height} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
                <text x={d0X} y={-8} fill="#666" fontSize="9" textAnchor="middle" fontFamily="monospace">ANNOUNCEMENT</text>

                {/* Price Line */}
                <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />

                {/* Win/Loss Indicator (Subtle) */}
                {reaction.stats.d0d1Return !== null && (
                    <circle
                        cx={d0X}
                        cy={height - padding - ((prices[centerIndex] - min) / range) * (height - padding * 2)}
                        r="3"
                        fill={reaction.stats.d0d1Return > 0 ? COLORS.positive.replace('text-', '') : COLORS.negative.replace('text-', '')} // Use hex from token if possible, or mapping
                        className={reaction.stats.d0d1Return > 0 ? "fill-[#4ADE80]" : "fill-[#F87171]"}
                    />
                )}

                {/* Min/Max Labels */}
                <text x={width - padding + 4} y={padding} fill="#444" fontSize="9" dominantBaseline="middle" fontFamily="monospace">${Math.round(max)}</text>
                <text x={width - padding + 4} y={height - padding} fill="#444" fontSize="9" dominantBaseline="middle" fontFamily="monospace">${Math.round(min)}</text>
            </svg>
        )
    }

    // Get source URL
    const sourceUrl = eventKey === 'fomc'
        ? 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'
        : 'https://www.bls.gov/schedule/'

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/calendar" className="text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px] text-white flex items-center gap-2">
                    <span className="text-base">{eventDef.icon}</span>
                    <span>{eventDef.name}</span>
                </div>
                <div className="w-5" /> {/* Spacer */}
            </div>

            <div className="px-5 py-6 space-y-6">
                {/* Layer 1: Type A Card (Behavior Summary) */}
                {summaryStats && (
                    <section className={cn(CARDS.typeA, "min-h-[160px]")}>
                        {/* Header: Event Name + Status (Small) */}
                        <div className={cn("px-4 py-3 border-b flex items-center justify-between", SURFACE.border)}>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-bold", COLORS.textPrimary)}>NEXT EVENT</span>
                                <div className="w-[1px] h-3 bg-[#2A2A2A]" />
                                <span className={cn("text-xs", COLORS.textSecondary)}>行為傾向分析</span>
                            </div>
                            <div className="text-[10px] px-1.5 py-0.5 rounded bg-white text-black font-bold">
                                A 級關注
                            </div>
                        </div>

                        {/* Focus: Big Numbers */}
                        <div className="p-5 grid grid-cols-2 gap-8">
                            <div>
                                <div className={cn("text-[10px] mb-1", COLORS.textTertiary)}>D+1 上漲機率</div>
                                <div className={cn("text-3xl font-bold font-mono tracking-tighter", COLORS.textPrimary)}>
                                    {summaryStats.winRate}<span className="text-sm text-[#444] ml-1">%</span>
                                </div>
                            </div>
                            <div>
                                <div className={cn("text-[10px] mb-1", COLORS.textTertiary)}>平均波動</div>
                                <div className={cn("text-3xl font-bold font-mono tracking-tighter", COLORS.textPrimary)}>
                                    {summaryStats.avgRange}<span className="text-sm text-[#444] ml-1">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Meta: AI Insight */}
                        <div className={cn("px-5 py-3 border-t", SURFACE.border, "bg-[#0A0A0B]")}>
                            <div className="flex items-start gap-2">
                                <div className="w-0.5 h-3 bg-[#444] mt-1" />
                                <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>
                                    {eventDef.insight.split('：')[1] || eventDef.narrative}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Layer 2: Type B Card (Historical Matrix) */}
                <section>
                    <div className="px-1 mb-3 flex items-center justify-between">
                        <h2 className={cn("text-xs font-bold uppercase tracking-wider", COLORS.textTertiary)}>歷史回測矩陣</h2>
                        <div className="flex gap-4 text-[10px] text-[#666]">
                            <span>▲ 上漲</span>
                            <span>▼ 下跌</span>
                            <span>─ 震盪</span>
                        </div>
                    </div>

                    {/* Group by Year */}
                    {[2024, 2023, 2022].map(year => {
                        const yearOccs = occurrencesWithData.filter(o => o.occursAt.startsWith(String(year)))
                        if (yearOccs.length === 0) return null

                        return (
                            <div key={year} className="mb-4">
                                <h4 className={cn("text-[10px] font-bold mb-2 ml-1", COLORS.textTertiary)}>{year}</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {yearOccs.map(occ => {
                                        const impact = getImpactLevel(occ)
                                        const isSelected = selectedOcc?.occursAt === occ.occursAt
                                        const dateShort = occ.occursAt.slice(5, 10).replace('-', '/')
                                        const d1Return = occ.reaction?.stats.d0d1Return || 0

                                        // Visual Principle 3: Symbol Language
                                        const symbol = d1Return > 0.5 ? '▲' : d1Return < -0.5 ? '▼' : '─'

                                        return (
                                            <button
                                                key={occ.occursAt}
                                                onClick={() => occ.reaction && setSelectedOcc(occ)}
                                                disabled={!occ.reaction}
                                                className={cn(
                                                    CARDS.typeB,
                                                    "relative h-14 flex flex-col items-center justify-center gap-1",
                                                    isSelected
                                                        ? "bg-[#1A1A1A] outline outline-1 outline-[#2A2A2A]"
                                                        : SURFACE.card,
                                                    !occ.reaction && "opacity-30 cursor-not-allowed"
                                                )}
                                            >
                                                <span className={cn("text-xs font-mono", isSelected ? COLORS.textPrimary : COLORS.textSecondary)}>
                                                    {dateShort}
                                                </span>

                                                {/* Symbol Indicator (No Colors) */}
                                                {occ.reaction && (
                                                    <span className={cn(
                                                        "text-[10px] leading-none",
                                                        COLORS.textTertiary
                                                    )}>
                                                        {symbol}
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </section>

                {/* Layer 3: Detail View (Info Type C) */}
                {selectedOcc && selectedOcc.reaction && (
                    <section className="sticky bottom-6 z-30 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className={cn("rounded-xl border shadow-2xl overflow-hidden", SURFACE.card, SURFACE.border)}>
                            {/* Header */}
                            <div className={cn("px-4 py-3 border-b flex items-center justify-between", SURFACE.border)}>
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-sm font-bold font-mono", COLORS.textSecondary)}>
                                        {selectedOcc.occursAt.slice(0, 10)}
                                    </span>
                                    {selectedOcc.reaction.stats.d0d1Return !== null && (
                                        <span className={cn(
                                            "text-xs font-mono font-bold",
                                            selectedOcc.reaction.stats.d0d1Return > 0 ? "text-[#4ADE80]" : "text-[#F87171]"
                                        )}>
                                            {selectedOcc.reaction.stats.d0d1Return > 0 ? '+' : ''}{selectedOcc.reaction.stats.d0d1Return}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="aspect-[21/9] w-full relative p-4 bg-[#050505]">
                                {renderChart(selectedOcc.reaction)}
                            </div>

                            {/* Footer: Type C Info (Block Text + Divider) */}
                            <div className={cn("px-5 py-4 border-t flex items-center justify-between", SURFACE.border, SURFACE.card)}>
                                <div className={CARDS.typeC}>
                                    <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>預測 vs 實際</div>
                                    <div className="flex items-center gap-2 font-mono text-xs">
                                        <span className={COLORS.textSecondary}>{formatValue(eventKey, selectedOcc.forecast)}</span>
                                        <span className={COLORS.textTertiary}>→</span>
                                        <span className={cn("font-bold", COLORS.textPrimary)}>
                                            {formatValue(eventKey, selectedOcc.actual)}
                                        </span>
                                    </div>
                                </div>
                                <div className={CARDS.typeC}>
                                    <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>最大波幅</div>
                                    <div className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                        {selectedOcc.reaction.stats.range}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
