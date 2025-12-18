'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Flame } from 'lucide-react'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'
import { DashboardData } from './types'
import { CARDS, SPACING } from '@/lib/design-tokens'

// ============================================
// Liquidation Waterfall Component
// ============================================
export function LiquidationWaterfall() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'1h' | '4h' | '12h' | '24h'>('24h')

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch liquidation data with timeframe param
                const res = await fetch(`/api/coinglass/liquidation?symbol=BTC&limit=20&timeframe=${timeframe}`)
                const json = await res.json()
                setData(json.liquidations)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [timeframe])

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-neutral-900/50 rounded-xl" />)}
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-4">
            {/* Header with Timeframe Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex bg-neutral-900 rounded-lg p-0.5 border border-white/5">
                    {['1h', '4h', '12h', '24h'].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf as any)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md",
                                timeframe === tf ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            {tf.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    即時
                </div>
            </div>

            {/* Summary - Compact Grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-neutral-400 mb-1">多單爆倉 ({timeframe.toUpperCase()})</span>
                    <span className="text-xl font-bold text-red-400 font-mono tracking-tight flex items-baseline gap-1">
                        {data.summary?.longLiquidatedFormatted || '$0'}
                        <span className="text-xs text-red-400/50 font-sans">USD</span>
                    </span>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-neutral-400 mb-1">空單爆倉 ({timeframe.toUpperCase()})</span>
                    <span className="text-xl font-bold text-green-400 font-mono tracking-tight flex items-baseline gap-1">
                        {data.summary?.shortLiquidatedFormatted || '$0'}
                        <span className="text-xs text-green-400/50 font-sans">USD</span>
                    </span>
                </div>
            </div>

            {/* Signal */}
            {data.summary?.signal && (
                <div className={cn(
                    "rounded-lg p-2.5 border flex items-center justify-center",
                    data.summary.signal.type === 'bullish' ? 'bg-green-500/10 border-green-500/20' :
                        data.summary.signal.type === 'bearish' ? 'bg-red-500/10 border-red-500/20' :
                            'bg-neutral-800/50 border-white/5'
                )}>
                    <p className="text-xs text-neutral-300 font-medium">💡 {data.summary.signal.text}</p>
                </div>
            )}
        </div>
    )
}

export function LiquidationSummary({ data }: { data?: DashboardData['liquidation'] }) {
    if (!data) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />

    return (
        <div className={cn(CARDS.primary, SPACING.cardCompact, "h-full")}>
            <div className="flex items-center gap-2 mb-2">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-white">24H 爆倉</span>
                <ExplainTooltip
                    term={INDICATOR_KNOWLEDGE.liquidation.term}
                    definition={INDICATOR_KNOWLEDGE.liquidation.definition}
                    explanation={INDICATOR_KNOWLEDGE.liquidation.interpretation}
                    timeline={INDICATOR_KNOWLEDGE.liquidation.timeline}
                />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="text-center bg-red-500/10 rounded py-1.5">
                    <span className="text-[9px] text-neutral-400 block mb-0.5">多單</span>
                    <span className="text-xs font-mono text-red-400 font-bold block">
                        {data.longFormatted} <span className="text-[9px] opacity-70">USD</span>
                    </span>
                </div>
                <div className="text-center bg-green-500/10 rounded py-1.5">
                    <span className="text-[9px] text-neutral-400 block mb-0.5">空單</span>
                    <span className="text-xs font-mono text-green-400 font-bold block">
                        {data.shortFormatted} <span className="text-[9px] opacity-70">USD</span>
                    </span>
                </div>
            </div>
        </div>
    )
}
