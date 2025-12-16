'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    getMacroEventDef,
    getPastOccurrences,
    getFutureOccurrences,
    formatValue,
    MacroEventOccurrence
} from '@/lib/macro-events'
import { SURFACE, COLORS, CARDS } from '@/lib/design-tokens'

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

interface SingleEventClientProps {
    eventKey: string
    reactions: Record<string, MacroReaction>
}

export default function SingleEventClient({ eventKey, reactions }: SingleEventClientProps) {
    const eventDef = getMacroEventDef(eventKey)!
    const pastOccurrences = getPastOccurrences(eventKey, 36)

    // Pre-process occurrences with reactions
    const occurrencesWithData = useMemo(() => {
        return pastOccurrences.map(occ => {
            const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
            const reactionKey = `${eventKey}-${keyDate}`
            const reaction = reactions[reactionKey]
            return { ...occ, reaction }
        })
    }, [eventKey, pastOccurrences, reactions])

    // State for selected occurrence
    // Default to NULL (Show All / Aggregate View)
    const [selectedOcc, setSelectedOcc] = useState<typeof occurrencesWithData[0] | null>(null)

    // Filter valid reactions for specific calculations
    const validOccs = useMemo(() => occurrencesWithData.filter(o => o.reaction && o.reaction.priceData.length > 0), [occurrencesWithData])

    // Layer 1 Logic: Summary Stats
    const summaryStats = useMemo(() => {
        if (validOccs.length === 0) return null

        const d1Returns = validOccs.map(o => o.reaction!.stats.d0d1Return).filter((r): r is number => r !== null)
        const upCount = d1Returns.filter(r => r > 0).length
        const avgRange = validOccs.reduce((sum, o) => sum + o.reaction!.stats.range, 0) / validOccs.length

        return {
            winRate: Math.round((upCount / d1Returns.length) * 100),
            avgRange: Math.round(avgRange * 10) / 10,
            count: validOccs.length
        }
    }, [validOccs])

    // Chart Rendering Logic (Spider Plot)
    const renderChart = () => {
        if (validOccs.length === 0) return <div className="flex h-full items-center justify-center text-xs text-[#444]">Insufficient Data</div>

        const width = 600
        const height = 280 // Taller for better detail
        const padding = 20

        // Normalize Data
        // We need to normalize all series to % change from Start (Index 0) to overlay them
        // Or normalize to D0? Let's normalize to Window Start to keep it clean left-to-right.
        // Actually, aligning D0 is "Pro". Let's try to align D0.
        // But priceData length might differ slightly.
        // Simplest robust method: Normalize to % Change from Start of Window.

        type NormalizedSeries = { points: string; color: string; width: string; opacity: number; zIndex: number }

        // 1. Calculate Bounds
        let minPct = 0
        let maxPct = 0

        const seriesList: { pctValues: number[]; isSelected: boolean }[] = []

        validOccs.forEach(occ => {
            const prices = occ.reaction!.priceData.map(p => p.close)
            const startPrice = prices[0]
            if (!startPrice) return

            const pctValues = prices.map(p => ((p - startPrice) / startPrice) * 100)

            // Update Bounds
            const sMin = Math.min(...pctValues)
            const sMax = Math.max(...pctValues)
            if (sMin < minPct) minPct = sMin
            if (sMax > maxPct) maxPct = sMax

            seriesList.push({
                pctValues,
                isSelected: selectedOcc?.occursAt === occ.occursAt
            })
        })

        // Add padding to bounds
        const range = maxPct - minPct || 1

        // 2. Generate Paths
        // User Requirement: 
        // - Default: All Events Overlay (Neutral Gray)
        // - Selected: ONLY show selected event (Remove others)

        const validSeries = selectedOcc
            ? seriesList.filter(s => s.isSelected)
            : seriesList

        const paths = validSeries.map((series, idx) => {
            const isTarget = series.isSelected

            // Style Logic
            let stroke = '#444' // Default Neutral Gray
            let strokeWidth = '1'
            let opacity = 0.5

            if (selectedOcc) {
                // Since we filtered, this MUST be the target
                stroke = '#EDEDED'
                strokeWidth = '2'
                opacity = 1
            }

            const points = series.pctValues.map((pct, i) => {
                const x = padding + (i / (series.pctValues.length - 1)) * (width - padding * 2)
                const y = height - padding - ((pct - minPct) / range) * (height - padding * 2)
                return `${x},${y}`
            }).join(' ')

            return (
                <polyline
                    key={idx}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    opacity={opacity}
                    style={{ transition: 'all 0.3s ease' }}
                />
            )
        })

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Grid */}
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#111111" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#111111" strokeWidth="1" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#111111" strokeWidth="1" />

                {/* D0 Marker */}
                {(() => {
                    const centerIdx = -eventDef.windowDisplay.start
                    const totalLen = 1 + eventDef.windowDisplay.end - eventDef.windowDisplay.start
                    const d0X = padding + (centerIdx / (totalLen - 1)) * (width - padding * 2)
                    return (
                        <>
                            <line x1={d0X} y1={0} x2={d0X} y2={height} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
                            <text x={d0X} y={-8} fill="#666" fontSize="9" textAnchor="middle" fontFamily="monospace">ANNOUNCEMENT</text>
                        </>
                    )
                })()}

                {/* Paths */}
                {paths}

                {/* Labels */}
                <text x={width - padding + 5} y={padding} fill="#444" fontSize="9" dominantBaseline="middle" fontFamily="monospace">+{Math.round(maxPct)}%</text>
                <text x={width - padding + 5} y={height - padding} fill="#444" fontSize="9" dominantBaseline="middle" fontFamily="monospace">{Math.round(minPct)}%</text>
            </svg>
        )
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/calendar" className="text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px] text-white flex items-center gap-2">
                    <span className="text-base font-mono">{eventDef.icon}</span>
                    <span>{eventDef.name}</span>
                </div>
                <div className="w-5" />
            </div>

            <div className="px-5 py-6 space-y-6">
                {/* 1. Summary Card (Type A) */}
                {summaryStats && (
                    <section className={cn(CARDS.typeA, "min-h-[160px]")}>
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

                        <div className={cn("px-5 py-3 border-t", SURFACE.border, "bg-[#0A0A0B]")}>
                            <div className="flex items-start gap-2">
                                <div className="w-0.5 h-3 bg-[#444] mt-1" />
                                <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>
                                    {/* Clean text only */}
                                    {eventDef.insight.split('：')[1] || eventDef.narrative}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. Chart Section (MOVED UP) */}
                <section className={cn(CARDS.base, "overflow-hidden")}>
                    <div className={cn("px-4 py-3 border-b flex items-center justify-between", SURFACE.border)}>
                        <h2 className={cn("text-xs font-bold uppercase tracking-wider", COLORS.textSecondary)}>
                            Price Action
                        </h2>
                        {selectedOcc ? (
                            <button
                                onClick={() => setSelectedOcc(null)}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                            >
                                清除篩選 ✕
                            </button>
                        ) : (
                            <span className="text-[10px] text-neutral-600">Showing All History</span>
                        )}
                    </div>

                    {/* Chart Canvas */}
                    <div className="aspect-[21/10] w-full relative p-4 bg-[#050505]">
                        {renderChart()}
                    </div>

                    {/* Dynamic Footer Info */}
                    {selectedOcc ? (
                        // Detail View
                        <div className={cn("px-5 py-4 border-t flex items-center justify-between", SURFACE.border, SURFACE.card)}>
                            {selectedOcc.reaction ? (
                                <>
                                    <div className={CARDS.typeC}>
                                        <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>日期</div>
                                        <div className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                            {selectedOcc.occursAt.slice(0, 10)}
                                        </div>
                                    </div>
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
                                        <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>D+1 反應</div>
                                        <div className={cn("font-mono text-xs font-bold",
                                            (selectedOcc.reaction.stats.d0d1Return || 0) > 0 ? COLORS.positive : COLORS.negative
                                        )}>
                                            {selectedOcc.reaction.stats.d0d1Return}%
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-xs text-neutral-500">尚無數據</div>
                            )}
                        </div>
                    ) : (
                        // Aggregate View Info
                        <div className={cn("px-5 py-4 border-t grid grid-cols-2 gap-4", SURFACE.border, SURFACE.card)}>
                            <div className={CARDS.typeC}>
                                <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>總樣本數</div>
                                <div className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                    {summaryStats?.count || 0} Events
                                </div>
                            </div>
                            <div className={CARDS.typeC}>
                                <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>平均波動範圍</div>
                                <div className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                    {summaryStats?.avgRange}%
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* 3. Historical Matrix (Type B) */}
                <section>
                    <div className="px-1 mb-3 flex items-center justify-between">
                        <h2 className={cn("text-xs font-bold uppercase tracking-wider", COLORS.textTertiary)}>歷史回測矩陣</h2>
                        <div className="flex gap-4 text-[10px] text-[#666]">
                            <span>▲ 上漲</span>
                            <span>▼ 下跌</span>
                            <span>─ 震盪</span>
                        </div>
                    </div>

                    {[2024, 2023, 2022].map(year => {
                        const yearOccs = occurrencesWithData.filter(o => o.occursAt.startsWith(String(year)))
                        if (yearOccs.length === 0) return null

                        return (
                            <div key={year} className="mb-4">
                                <h4 className={cn("text-[10px] font-bold mb-2 ml-1", COLORS.textTertiary)}>{year}</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {yearOccs.map(occ => {
                                        const isSelected = selectedOcc?.occursAt === occ.occursAt
                                        const dateShort = occ.occursAt.slice(5, 10).replace('-', '/')
                                        const d1Return = occ.reaction?.stats.d0d1Return || 0
                                        const symbol = d1Return > 0.5 ? '▲' : d1Return < -0.5 ? '▼' : '─'

                                        return (
                                            <button
                                                key={occ.occursAt}
                                                onClick={() => {
                                                    // Toggle selection
                                                    if (isSelected) setSelectedOcc(null)
                                                    else if (occ.reaction) setSelectedOcc(occ)
                                                }}
                                                disabled={!occ.reaction}
                                                className={cn(
                                                    CARDS.typeB,
                                                    "relative h-14 flex flex-col items-center justify-center gap-1 transition-all duration-200",
                                                    isSelected
                                                        ? "bg-[#1A1A1A] border border-[#444]" // Selected: Brighter BG, Visible Border
                                                        : "bg-[#0E0E0F] border border-transparent hover:bg-[#151515] hover:border-[#2A2A2A]", // Default: Dark BG, No Border (Hover effect)
                                                    !occ.reaction && "opacity-30 cursor-not-allowed"
                                                )}
                                            >
                                                <span className={cn("text-xs font-mono", isSelected ? COLORS.textPrimary : COLORS.textSecondary)}>
                                                    {dateShort}
                                                </span>
                                                {occ.reaction && (
                                                    <span className={cn("text-[10px] leading-none", COLORS.textTertiary)}>
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
            </div>
        </div>
    )
}
