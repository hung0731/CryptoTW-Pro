'use client'

import React from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    formatValue,
    formatOccursAt,
    MacroEventOccurrence,
    MacroReaction
} from '@/lib/macro-events'
import { COLORS } from '@/lib/design-tokens'

interface MiniChartCardProps {
    occ: MacroEventOccurrence & { linkedReviewSlug?: string, linkedReviewTitle?: string }
    reaction?: MacroReaction
    eventKey: string
    windowDisplayStart: number
    isNext?: boolean
    isLatest?: boolean
    daysUntil?: number
    onReplay?: (occ: any) => void
}

/**
 * @utility-component
 * @description Custom card for calendar event grid only.
 * Does not use UniversalCard due to specific chart layout requirements.
 * NOT FOR GENERAL USE - Calendar page specific implementation.
 */
export function MiniChartCard({
    occ,
    reaction,
    eventKey,
    windowDisplayStart,
    isNext = false,
    isLatest = false,
    daysUntil,
    onReplay
}: MiniChartCardProps) {
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
                    <span className={cn("scale-90 origin-left opacity-60 font-mono", COLORS.textTertiary)}>前期</span>
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
