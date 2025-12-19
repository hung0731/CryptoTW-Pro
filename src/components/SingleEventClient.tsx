'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    getMacroEventDef,
    getPastOccurrences,
    formatValue,
    getSurprise,
    formatOccursAt,
    MacroEventOccurrence
} from '@/lib/macro-events'
import { SURFACE, COLORS, CARDS } from '@/lib/design-tokens'
import { SemanticChartCTA } from '@/components/citation/SemanticChartCTA'
import { ResponsibilityDisclaimer } from '@/components/citation/ResponsibilityDisclaimer'
import { getRelatedIndicator } from '@/lib/semantic-linkage'

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
    isDrawer?: boolean
}

export default function SingleEventClient({ eventKey, reactions, isDrawer = false }: SingleEventClientProps) {
    const eventDef = getMacroEventDef(eventKey)!
    const pastOccurrences = getPastOccurrences(eventKey, 36)

    // Get Connected Indicator Context
    const relatedIndicator = getRelatedIndicator(eventKey)

    // Pre-process occurrences with reactions
    const occurrencesWithData = useMemo(() => {
        return pastOccurrences.map(occ => {
            const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
            const reactionKey = `${eventKey}-${keyDate}`
            const reaction = reactions[reactionKey]
            // Calculate Surprise
            const surprise = getSurprise(occ)
            return { ...occ, reaction, surprise }
        })
    }, [eventKey, pastOccurrences, reactions])

    // State for selected occurrence
    const [selectedOcc, setSelectedOcc] = useState<typeof occurrencesWithData[0] | null>(null)

    // State for Time Filter (View Filter)
    const [timeFilter, setTimeFilter] = useState<'3m' | '1y' | '2y' | 'all'>('all')

    // State for Surprise Filter
    const [surpriseFilter, setSurpriseFilter] = useState<'all' | 'high' | 'neutral' | 'low'>('all')

    // Filter valid reactions for specific calculations
    // Base valid occurrences (has data)
    const baseValidOccs = useMemo(() => occurrencesWithData.filter(o => o.reaction && o.reaction.priceData.length > 0), [occurrencesWithData])

    // Apply Filters (Time & Surprise)
    const filteredOccs = useMemo(() => {
        let result = baseValidOccs

        // 1. Time Filter
        if (timeFilter !== 'all') {
            const now = new Date()
            const cutoff = new Date()
            switch (timeFilter) {
                case '3m': cutoff.setMonth(now.getMonth() - 3); break
                case '1y': cutoff.setFullYear(now.getFullYear() - 1); break
                case '2y': cutoff.setFullYear(now.getFullYear() - 2); break
            }
            result = result.filter(o => new Date(o.occursAt) >= cutoff)
        }

        // 2. Surprise Filter
        if (surpriseFilter !== 'all') {
            result = result.filter(o => o.surprise === surpriseFilter)
        }

        return result
    }, [baseValidOccs, timeFilter, surpriseFilter])

    // Layer 1 Logic: Summary Stats (Uses Filtered Data)
    const summaryStats = useMemo(() => {
        if (filteredOccs.length === 0) return null

        const d1Returns = filteredOccs.map(o => o.reaction!.stats.d0d1Return).filter((r): r is number => r !== null)
        const upCount = d1Returns.filter(r => r > 0).length
        const avgRange = filteredOccs.reduce((sum, o) => sum + o.reaction!.stats.range, 0) / filteredOccs.length

        return {
            winRate: Math.round((upCount / d1Returns.length) * 100),
            avgRange: Math.round(avgRange * 10) / 10,
            count: filteredOccs.length
        }
    }, [filteredOccs])

    // Chart Rendering Logic (Spider Plot)
    const renderChart = () => {
        const targetData = selectedOcc ? [selectedOcc] : filteredOccs

        if (targetData.length === 0) return (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                <span className="text-xs">此篩選條件下無數據</span>
            </div>
        )

        const width = 600
        const height = 280
        const padding = 20

        // 1. Calculate Standardized Percentages for all series
        let minPct = 0
        let maxPct = 0
        const allSeries: { pctValues: number[]; isSelected: boolean; isAverage?: boolean }[] = []

        // Temporary arrays for Average calculation
        const sumAtIdx: number[] = []
        const countAtIdx: number[] = []

        targetData.forEach(occ => {
            if (!occ.reaction) return
            const prices = occ.reaction.priceData.map(p => p.close)
            const startPrice = prices[0]
            if (!startPrice) return

            const pctValues = prices.map((p, i) => {
                const val = ((p - startPrice) / startPrice) * 100
                // Accumulate for Average (Only if we are in Aggregate view)
                if (!selectedOcc) {
                    sumAtIdx[i] = (sumAtIdx[i] || 0) + val
                    countAtIdx[i] = (countAtIdx[i] || 0) + 1
                }
                return val
            })

            // Update Bounds
            const sMin = Math.min(...pctValues)
            const sMax = Math.max(...pctValues)
            if (sMin < minPct) minPct = sMin
            if (sMax > maxPct) maxPct = sMax

            allSeries.push({
                pctValues,
                isSelected: selectedOcc?.occursAt === occ.occursAt
            })
        })

        // 2. Calculate Average Series (If not single view)
        let averageSeries: number[] | null = null
        if (!selectedOcc && countAtIdx.length > 0) {
            averageSeries = []
            for (let i = 0; i < sumAtIdx.length; i++) {
                if (countAtIdx[i] > 0) {
                    averageSeries[i] = sumAtIdx[i] / countAtIdx[i]
                }
            }
        }

        // Add padding to bounds
        const range = maxPct - minPct || 1

        // Helper to get coordinates
        const getPoints = (values: number[]) => values.map((pct, i) => {
            // Safe alignment if lengths differ slightly
            // Assuming longest length defines width might be shaky if data is sparse, 
            // but assuming standard window (7 points usually).
            // We normalize X by the specific series length or the MAX length?
            // Ideally alignment by D0. For now normalize by its own length to span width.
            const totalPoints = values.length
            const x = padding + (i / (totalPoints - 1)) * (width - padding * 2)
            const y = height - padding - ((pct - minPct) / range) * (height - padding * 2)
            return `${x},${y}`
        }).join(' ')


        // Generate Paths for History
        const historyPaths = allSeries.map((series, idx) => {
            let stroke = '#222' // Very low subtle grey for background
            let strokeWidth = '1'
            let opacity = 0.6 // Blend them

            if (series.isSelected) {
                stroke = '#EDEDED'
                strokeWidth = '2'
                opacity = 1
            }

            return (
                <polyline
                    key={`hist-${idx}`}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={getPoints(series.pctValues)}
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
                            <text x={d0X} y={-8} fill="#666" fontSize="9" textAnchor="middle" fontFamily="monospace">發布時刻</text>
                        </>
                    )
                })()}

                {/* Historical Paths (Spaghetti) */}
                {historyPaths}

                {/* Average Line (On Top) */}
                {averageSeries && (
                    <polyline
                        fill="none"
                        stroke="#888" // Lighter grey, distinct
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={getPoints(averageSeries)}
                        opacity="1"
                        className="drop-shadow-sm" // Optional subtle lift
                    />
                )}

                {/* Labels */}
                <text x={width - padding + 5} y={padding} fill="#444" fontSize="9" dominantBaseline="middle" fontFamily="monospace">+{Math.round(maxPct)}%</text>
                <text x={width - padding + 5} y={height - padding} fill="#444" fontSize="9" dominantBaseline="middle" fontFamily="monospace">{Math.round(minPct)}%</text>
            </svg>
        )
    }

    return (
        <div className={cn("max-w-3xl mx-auto h-full overflow-y-auto no-scrollbar", isDrawer ? "pb-8" : "pb-20")}>
            {/* Header */}
            <div className={cn(
                "sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between",
                isDrawer && "bg-black"
            )}>
                {!isDrawer && (
                    <Link href="/calendar" className="text-[#808080] hover:text-white flex items-center gap-1">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-xs">返回日曆</span>
                    </Link>
                )}
                {isDrawer && <div />} {/* Spacer if drawer */}

                <div className="text-sm font-bold truncate max-w-[200px] text-white flex items-center gap-2">
                    <span className="text-base font-mono">{eventDef.icon}</span>
                    <div className="flex flex-col">
                        <span>{eventDef.name}</span>
                        {/* Market Definition */}
                        <span className="text-[10px] text-neutral-500 font-normal leading-tight">
                            {eventDef.detailDescription}
                        </span>
                    </div>
                </div>
                <div className="w-5" />
            </div>

            <div className="px-5 py-6 space-y-6">
                {/* 1. Summary Card (Type A) */}
                {summaryStats && (
                    <section className={cn(CARDS.typeA, "min-h-[160px]")}>
                        <div className={cn("px-4 py-3 border-b flex items-center justify-between", SURFACE.border)}>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-bold", COLORS.textPrimary)}>下一次發布</span>
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
                                <p className="text-[10px] text-neutral-600 mt-1">過去同類事件中，隔天上漲的比例</p>
                            </div>
                            <div>
                                <div className={cn("text-[10px] mb-1", COLORS.textTertiary)}>平均波動</div>
                                <div className={cn("text-3xl font-bold font-mono tracking-tighter", COLORS.textPrimary)}>
                                    {summaryStats.avgRange}<span className="text-sm text-[#444] ml-1">%</span>
                                </div>
                                <p className="text-[10px] text-neutral-600 mt-1">公布後常見的價格震盪幅度</p>
                            </div>
                        </div>

                        <div className={cn("px-5 py-3 border-t", SURFACE.border, "bg-[#0A0A0B]")}>
                            <div className="flex items-start gap-2">
                                <div className="w-0.5 h-3 bg-[#444] mt-1" />
                                <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>
                                    {eventDef.insight.includes('⚠️') ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-red-500 font-bold">!</span>
                                            <span className="text-neutral-300">{eventDef.insight.replace('⚠️ ', '')}</span>
                                        </span>
                                    ) : (
                                        eventDef.insight.split('：')[1] || eventDef.narrative
                                    )}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. Chart Section (MOVED UP) */}
                <section className={cn(CARDS.primary, "overflow-hidden")}>
                    {/* Toolbar / Filters */}
                    <div className={cn("px-4 py-3 border-b flex flex-col gap-3", SURFACE.border)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className={cn("text-xs font-bold uppercase tracking-wider", COLORS.textSecondary)}>
                                    價格走勢
                                </h2>
                                <p className="text-[10px] text-neutral-600 mt-0.5">顯示指定時間範圍內的歷史事件反應</p>
                            </div>

                            {selectedOcc ? (
                                <button
                                    onClick={() => setSelectedOcc(null)}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#808080] hover:text-white"
                                >
                                    清除篩選 ✕
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {(['all', '2y', '1y', '3m'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setTimeFilter(mode)}
                                            className={cn(
                                                "text-[10px] font-mono uppercase",
                                                timeFilter === mode
                                                    ? "text-white underline decoration-wavy decoration-neutral-600"
                                                    : "text-neutral-600 hover:text-neutral-400"
                                            )}
                                        >
                                            {mode === 'all' ? '全部' : mode === '2y' ? '2年' : mode === '1y' ? '1年' : '3個月'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Surprise Filters */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                            <span className="text-[9px] text-neutral-600 uppercase tracking-widest mr-1">預期偏差</span>
                            {[
                                { k: 'all', l: '全部' },
                                { k: 'high', l: '高於預期' },
                                { k: 'neutral', l: '符合預期' },
                                { k: 'low', l: '低於預期' }
                            ].map(opt => (
                                <button
                                    key={opt.k}
                                    onClick={() => setSurpriseFilter(opt.k as any)}
                                    className={cn(
                                        "text-[10px] px-2 py-0.5 rounded",
                                        surpriseFilter === opt.k
                                            ? "bg-[#1A1A1A] text-white border border-[#333]"
                                            : "text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </div>



                    {/* Chart Canvas */}
                    <div className="aspect-[21/10] w-full relative p-4 bg-[#050505]">

                        {/* 1. CHART EMBEDDED CTA (Pattern 1) */}
                        {relatedIndicator && (
                            <SemanticChartCTA
                                label={relatedIndicator.matchPattern || relatedIndicator.name}
                                indicatorSlug={relatedIndicator.slug}
                            />
                        )}

                        {renderChart()}
                    </div>

                    {/* Dynamic Footer Info */}
                    {selectedOcc ? (
                        // Detail View
                        // Detail View
                        <div className={cn("px-5 py-4 border-t", SURFACE.border, SURFACE.card)}>
                            {selectedOcc.reaction ? (
                                <div className="space-y-3">
                                    {/* Row 1: Date & Result */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] text-neutral-500">日期</div>
                                            <div className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                                {formatOccursAt(selectedOcc.occursAt)}
                                            </div>
                                        </div>

                                        {/* Right Anchor: D+1 Return */}
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] text-neutral-500">D+1 反應</div>
                                            <div className={cn("font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#333]",
                                                (selectedOcc.reaction.stats.d0d1Return || 0) > 0 ? COLORS.positive : COLORS.negative
                                            )}>
                                                {selectedOcc.reaction.stats.d0d1Return}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Forecast vs Actual Bar */}
                                    <div className={cn("p-2.5 rounded-lg flex items-center justify-between mt-2", CARDS.secondary)}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] text-neutral-500">預測值</span>
                                            <span className={cn("font-mono text-xs", COLORS.textSecondary)}>
                                                {formatValue(eventKey, selectedOcc.forecast)}
                                            </span>
                                        </div>

                                        <div className="flex-1 px-4 flex items-center justify-center">
                                            <div className="h-[1px] w-full bg-[#333] relative">
                                                <div className="absolute right-0 -top-1 w-1 h-1 rounded-full bg-[#666]" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[9px] text-neutral-500">實際公布</span>
                                            <span className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                                {formatValue(eventKey, selectedOcc.actual)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-neutral-500 text-center py-2">尚無數據</div>
                            )}
                        </div>
                    ) : (
                        // Aggregate View Info
                        <div className={cn("px-5 py-4 border-t grid grid-cols-2 gap-4", SURFACE.border, SURFACE.card)}>
                            <div className={CARDS.typeB}>
                                <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>總樣本數</div>
                                <div className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                    {summaryStats?.count || 0} 次事件
                                </div>
                            </div>
                            <div className={CARDS.typeB}>
                                <div className={cn("text-[9px] mb-1", COLORS.textTertiary)}>平均波動範圍</div>
                                <div className={cn("font-mono text-xs font-bold", COLORS.textPrimary)}>
                                    {summaryStats?.avgRange}%
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* 2. RESPONSIBILITY DISCLAIMER (Pattern 2) */}
                {relatedIndicator && (
                    <ResponsibilityDisclaimer
                        indicatorName={relatedIndicator.name}
                        indicatorSlug={relatedIndicator.slug}
                    />
                )}

                {/* 3. Historical Matrix (Type B) */}
                <section>
                    <div className="px-1 mb-3 flex items-center justify-between">
                        <div>
                            <h2 className={cn("text-xs font-bold uppercase tracking-wider", COLORS.textTertiary)}>歷史回測矩陣</h2>
                            <p className="text-[10px] text-neutral-600 mt-0.5">點選任一日期，可單獨查看該次事件走勢</p>
                        </div>
                        <div className="flex gap-4 text-[10px] text-[#666]">
                            <span>▲ 上漲</span>
                            <span>▼ 下跌</span>
                            <span>─ 震盪</span>
                        </div>
                    </div>

                    {[2025, 2024, 2023, 2022].map(year => {
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

                                        // Highlight Surprise & Filter Logic
                                        let isDimmed = false
                                        // If filtering, dim non-matches?
                                        // The user said "Placed in Matrix". 
                                        // If I filter CHART, Matrix should probably still be selectable but denote which ones match?
                                        // Or should Matrix ALSO be filtered?
                                        // "不影響：歷史回測矩陣" (Do NOT affect Matrix) was for Time Filter.
                                        // For Surprise Filter? "Placed in Chart AND Matrix". 
                                        // Let's assume Matrix should highlight/dim.

                                        // Logic: If Surprise Filter is Active, Dim non-matches.
                                        if (surpriseFilter !== 'all') {
                                            if (occ.surprise !== surpriseFilter) isDimmed = true
                                        }

                                        return (
                                            <button
                                                key={occ.occursAt}
                                                onClick={() => {
                                                    if (isSelected) setSelectedOcc(null)
                                                    else if (occ.reaction) setSelectedOcc(occ)
                                                }}
                                                disabled={!occ.reaction}
                                                className={cn(
                                                    CARDS.typeB,
                                                    "relative h-14 flex flex-col items-center justify-center gap-1",
                                                    isSelected
                                                        ? "bg-[#1A1A1A] border border-[#444]"
                                                        : "bg-[#0E0E0F] border border-transparent hover:bg-[#151515] hover:border-[#2A2A2A]",
                                                    (!occ.reaction || isDimmed) && "opacity-30"
                                                )}
                                            >
                                                <span className={cn("text-xs font-mono", isSelected ? COLORS.textPrimary : COLORS.textSecondary)}>
                                                    {dateShort}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <span className={cn("text-[10px] leading-none", COLORS.textTertiary)}>
                                                        {symbol}
                                                    </span>
                                                    {occ.surprise === 'high' && <span className="w-1 h-1 rounded-full bg-red-500" />}
                                                    {occ.surprise === 'low' && <span className="w-1 h-1 rounded-full bg-green-500" />}
                                                </div>
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
