'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/design-tokens'
import { Calendar, TrendingUp, TrendingDown, Leaf } from 'lucide-react'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'

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

// ----------------------------------------------------------------------
// Sub-Component: Stats Card
// ----------------------------------------------------------------------
function StatsCard({
    label,
    value,
    subtext,
    icon: Icon,
    trend = 'neutral'
}: {
    label: string
    value: React.ReactNode
    subtext: string
    icon: any
    trend?: 'up' | 'down' | 'neutral'
}) {
    return (
        <UniversalCard variant="subtle" className="relative overflow-hidden group border-white/5 bg-[#0A0A0A]">
            <div className={cn(
                "absolute inset-0 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20",
                trend === 'up' && "bg-gradient-to-br from-green-500/10 to-transparent",
                trend === 'down' && "bg-gradient-to-br from-red-500/10 to-transparent",
                trend === 'neutral' && "bg-gradient-to-br from-blue-500/10 to-transparent"
            )} />

            <div className="flex items-center gap-2 mb-2 z-10">
                <Icon className={cn("w-4 h-4",
                    trend === 'up' && "text-green-400",
                    trend === 'down' && "text-red-400",
                    trend === 'neutral' && "text-blue-400"
                )} />
                <span className="text-xs font-medium text-neutral-400">{label}</span>
            </div>

            <div className="text-2xl font-bold text-white z-10 font-mono tracking-tight flex items-baseline gap-1">
                {value}
            </div>
            <div className="text-[10px] text-neutral-500 z-10 mt-1">{subtext}</div>
        </UniversalCard>
    )
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
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
        void fetchSeasonality()
    }, [])

    const stats = useMemo(() => {
        if (!data) return null

        const monthStats = Object.entries(data.stats).map(([m, s]) => ({
            month: parseInt(m),
            ...s
        }))

        // Best Month (Highest Avg Return)
        const best = [...monthStats].sort((a, b) => b.avg - a.avg)[0]

        // Worst Month (Lowest Avg Return)
        const worst = [...monthStats].sort((a, b) => a.avg - b.avg)[0]

        // Q4 Win Rate
        const q4Stats = monthStats.filter(s => [10, 11, 12].includes(s.month))
        const q4WinRate = q4Stats.reduce((acc, curr) => acc + curr.winRate, 0) / 3

        return {
            best: { month: MONTHS[best.month - 1], val: best.avg },
            worst: { month: MONTHS[worst.month - 1], val: worst.avg },
            q4: { winRate: q4WinRate }
        }
    }, [data])


    if (loading) {
        return (
            <UniversalCard className="w-full h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="animate-spin text-2xl">⏳</span>
                    <span className="text-xs text-neutral-500 font-mono">Loading Data...</span>
                </div>
            </UniversalCard>
        )
    }

    if (!data || !stats) return null

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
        if (Math.abs(value) > 20) return 'text-white font-bold'
        if (value > 0) return 'text-green-400'
        return 'text-red-400'
    }

    return (
        <div className="space-y-4">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    label="歷史最強月份"
                    icon={TrendingUp}
                    trend="up"
                    value={
                        <span>{stats.best.month} <span className="text-lg text-green-400">+{stats.best.val.toFixed(1)}%</span></span>
                    }
                    subtext="平均回報率最高"
                />
                <StatsCard
                    label="歷史最弱月份"
                    icon={TrendingDown}
                    trend="down"
                    value={
                        <span>{stats.worst.month} <span className="text-lg text-red-400">{stats.worst.val.toFixed(1)}%</span></span>
                    }
                    subtext="平均回報率最低"
                />
                <StatsCard
                    label="Q4 季節性勝率"
                    icon={Calendar}
                    trend="neutral"
                    value={stats.q4.winRate.toFixed(0) + '%'}
                    subtext="第 4 季平均上漲機率"
                />
            </div>

            {/* Main Heatmap Card */}
            <UniversalCard className="w-full p-0 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-white/[0.04] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="比特幣月度回報熱力圖"
                        icon={Leaf}
                        rightElement={
                            <div className="flex items-center gap-1.5 mr-4">
                                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                                <span className="text-[10px] text-neutral-500 mr-2">上漲</span>
                                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                                <span className="text-[10px] text-neutral-500">下跌</span>
                            </div>
                        }
                    />
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
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 border border-white/10 rounded text-xs whitespace-nowrap hidden group-hover:block z-20 pointer-events-none">
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
            </UniversalCard>
        </div>
    )
}
