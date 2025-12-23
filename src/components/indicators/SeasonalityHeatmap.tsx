'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { COLORS, TYPOGRAPHY } from '@/lib/design-tokens'

interface SeasonalityData {
    years: number[]
    months: {
        [year: number]: {
            [month: number]: number
        }
    }
    stats: {
        [month: number]: {
            avg: number
            winRate: number
        }
    }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function SeasonalityHeatmap() {
    const [data, setData] = useState<SeasonalityData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSeasonality = async () => {
            try {
                const res = await fetch('/api/binance/seasonality')
                const json = await res.json()
                if (json.data) {
                    setData(json.data)
                }
            } catch (error) {
                console.error('Failed to fetch seasonality:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSeasonality()
    }, [])

    if (loading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-[#050505] rounded-2xl border border-white/[0.08]">
                <div className="flex flex-col items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-neutral-500"></span>
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">Loading data...</span>
                </div>
            </div>
        )
    }

    if (!data) return null

    // Determine cell color based on value
    const getCellColor = (value: number | undefined) => {
        if (value === undefined) return 'bg-[#111]' // Empty cell

        if (value > 0) {
            // Green scale
            if (value > 40) return 'bg-[#22C55E]'
            if (value > 20) return 'bg-[#22C55E]/80'
            if (value > 10) return 'bg-[#22C55E]/60'
            if (value > 5) return 'bg-[#22C55E]/40'
            return 'bg-[#22C55E]/20'
        } else {
            // Red scale
            if (value < -40) return 'bg-[#EF4444]'
            if (value < -20) return 'bg-[#EF4444]/80'
            if (value < -10) return 'bg-[#EF4444]/60'
            if (value < -5) return 'bg-[#EF4444]/40'
            return 'bg-[#EF4444]/20'
        }
    }

    const getTextColor = (value: number | undefined) => {
        if (value === undefined) return 'text-transparent'
        // High opacity backgrounds need white text, low opacity can use color text
        if (Math.abs(value) > 20) return 'text-white font-bold'
        if (value > 0) return 'text-green-400'
        return 'text-red-400'
    }

    return (
        <div className="w-full bg-[#050505] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", COLORS.textSecondary)}>比特幣月度回報熱力圖</span>
                    <span className="text-[10px] text-neutral-600 font-mono">(BTC/USDT)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                    <span className="text-[10px] text-neutral-500 mr-2">上漲</span>
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                    <span className="text-[10px] text-neutral-500">下跌</span>
                </div>
            </div>

            {/* Scrollable Container for Mobile */}
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px] p-4">
                    {/* Grid Header */}
                    <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-1">
                        <div className="text-[10px] font-mono text-neutral-500 text-center">Year</div>
                        {MONTHS.map(m => (
                            <div key={m} className="text-[10px] font-mono text-neutral-500 text-center">{m}</div>
                        ))}
                    </div>

                    {/* Grid Body */}
                    <div className="space-y-1">
                        {data.years.map(year => (
                            <div key={year} className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 h-10">
                                <div className="flex items-center justify-center text-[10px] font-mono text-neutral-400 bg-white/[0.02] rounded">
                                    {year}
                                </div>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                                    const val = data.months[year]?.[month]
                                    return (
                                        <div
                                            key={`${year}-${month}`}
                                            className={cn(
                                                "flex items-center justify-center rounded transition-colors group relative",
                                                getCellColor(val)
                                            )}
                                        >
                                            <span className={cn(
                                                "text-[10px] font-mono",
                                                getTextColor(val)
                                            )}>
                                                {val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(0)}%` : ''}
                                            </span>

                                            {/* Tooltip */}
                                            {val !== undefined && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 border border-white/10 rounded text-xs whitespace-nowrap hidden group-hover:block z-20">
                                                    {year} {MONTHS[month - 1]}: <span className={getTextColor(val)}>{val.toFixed(2)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Grid Footer (Stats) */}
                    <div className="mt-4 pt-4 border-t border-white/[0.04]">
                        {/* Avg Return */}
                        <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-1">
                            <div className="text-[9px] font-mono text-neutral-500 text-right pr-2 leading-8">Avg</div>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                                const avg = data.stats[month]?.avg || 0
                                return (
                                    <div key={`avg-${month}`} className="flex items-center justify-center h-8">
                                        <span className={cn(
                                            "text-[10px] font-mono font-bold",
                                            avg > 0 ? "text-green-400" : "text-red-400"
                                        )}>
                                            {avg > 0 ? '+' : ''}{avg.toFixed(1)}%
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Win Rate */}
                        <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1">
                            <div className="text-[9px] font-mono text-neutral-500 text-right pr-2 leading-8">Win%</div>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                                const wr = data.stats[month]?.winRate || 0
                                return (
                                    <div key={`wr-${month}`} className="flex items-center justify-center h-8 bg-white/[0.02] rounded">
                                        <span className={cn(
                                            "text-[10px] font-mono",
                                            wr >= 50 ? "text-green-400" : "text-neutral-400"
                                        )}>
                                            {wr.toFixed(0)}%
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
