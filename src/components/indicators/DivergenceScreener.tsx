'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { ArrowUp, ArrowDown, ExternalLink, Activity, Info, TrendingUp, TrendingDown, Crosshair } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/design-tokens'
import { UniversalCard } from '@/components/ui/UniversalCard'

interface DivergenceItem {
    symbol: string
    price: number
    priceChange: number
    oiChange: number
    volume: number
    score: number
    signal: 'absorption' | 'distribution' | 'overheated'
}

// ----------------------------------------------------------------------
// Sub-Component: Stats Card (Replicated for independence)
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
        <UniversalCard variant="subtle" className="flex flex-col relative overflow-hidden group border-white/5 bg-[#0A0A0A]">
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
export function DivergenceScreener() {
    const [data, setData] = useState<DivergenceItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/alpha/divergence')
                const json = await res.json()
                if (json.data) {
                    setData(json.data)
                }
            } catch (error) {
                console.error('Failed to fetch screener:', error)
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [])

    const stats = useMemo(() => {
        if (!data || data.length === 0) return null

        const bullish = data.filter(i => i.signal === 'absorption').length
        const bearish = data.filter(i => i.signal === 'distribution').length
        // Top Opportunity: Highest absolute score
        const top = [...data].sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0]

        return { bullish, bearish, top }
    }, [data])

    if (loading) {
        return (
            <UniversalCard className="w-full h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="animate-spin text-neutral-500">
                        <Activity className="w-5 h-5" />
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">Scanning market divergence...</span>
                </div>
            </UniversalCard>
        )
    }

    // Clean market state
    if (!data.length) {
        return (
            <UniversalCard className="w-full py-12 flex flex-col items-center justify-center text-neutral-500">
                <span className="text-sm">目前市場無顯著主力異常訊號 (Clean Market)</span>
            </UniversalCard>
        )
    }

    return (
        <div className="space-y-4">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats && (
                    <>
                        <StatsCard
                            label="主力吸籌信號"
                            icon={TrendingUp}
                            trend="up"
                            value={stats.bullish.toString()}
                            subtext="買盤強勁的幣種數量"
                        />
                        <StatsCard
                            label="主力出貨信號"
                            icon={TrendingDown}
                            trend="down"
                            value={stats.bearish.toString()}
                            subtext="賣壓沉重的幣種數量"
                        />
                        <StatsCard
                            label="頂級關注代幣"
                            icon={Crosshair}
                            trend="neutral"
                            value={stats.top.symbol}
                            subtext={`SmartScore: ${stats.top.score.toFixed(2)}`}
                        />
                    </>
                )}
            </div>

            {/* Main Screener Table */}
            <UniversalCard variant="luma" className="w-full p-0 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        <span className={cn("text-xs font-medium", COLORS.textSecondary)}>主力意圖掃描器</span>
                        <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">ALPHA</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-2">
                        <span>Rank by SmartScore™</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.04] text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                                <th className="px-4 py-3 font-medium">Token</th>
                                <th className="px-4 py-3 font-medium text-right">Price (24h%)</th>
                                <th className="px-4 py-3 font-medium text-right">OI (24h%)</th>
                                <th className="px-4 py-3 font-medium text-center">Signal / Intent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {data.map((item) => (
                                <tr key={item.symbol} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{item.symbol}</span>
                                            <ExternalLink className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-white" />
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-neutral-300 font-mono">${item.price.toFixed(item.price < 1 ? 4 : 2)}</span>
                                            <span className={cn(
                                                "text-[10px] font-mono",
                                                item.priceChange >= 0 ? "text-green-400" : "text-red-400"
                                            )}>
                                                {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end">
                                            {/* OI Visual Bar */}
                                            <div className="w-16 h-1 bg-white/10 rounded-full mb-1 overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", item.oiChange > 0 ? "bg-cyan-400" : "bg-orange-400")}
                                                    style={{ width: `${Math.min(Math.abs(item.oiChange) * 2, 100)}%` }} // Visual scaling
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-mono",
                                                item.oiChange >= 0 ? "text-cyan-400" : "text-orange-400"
                                            )}>
                                                {item.oiChange > 0 ? '+' : ''}{item.oiChange.toFixed(2)}%
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <SignalBadge signal={item.signal} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-3 border-t border-white/[0.04] bg-white/[0.01]">
                    <div className="text-[10px] text-neutral-500 font-mono flex gap-4 justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            吸籌 (價跌量增)
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            出貨 (價漲量縮)
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            過熱 (雙噴)
                        </div>
                    </div>
                </div>
            </UniversalCard>
        </div>
    )
}

function SignalBadge({ signal }: { signal: DivergenceItem['signal'] }) {
    if (signal === 'absorption') {
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                    <span className="text-[10px] text-green-400 font-bold">主力吸籌</span>
                    <ArrowUp className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-[9px] text-neutral-600 mt-0.5">Bullish</span>
            </div>
        )
    }
    if (signal === 'distribution') {
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                    <span className="text-[10px] text-red-400 font-bold">主力出貨</span>
                    <ArrowDown className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-[9px] text-neutral-600 mt-0.5">Bearish</span>
            </div>
        )
    }
    if (signal === 'overheated') {
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-[10px] text-yellow-500 font-bold">過度擁擠</span>
                    <Activity className="w-3 h-3 text-yellow-500" />
                </div>
                <span className="text-[9px] text-neutral-600 mt-0.5">High Risk</span>
            </div>
        )
    }
    return null
}
