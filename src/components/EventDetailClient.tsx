'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Calendar,
    Activity,
    TrendingUp,
    BarChart2,
    Clock,
    Target,
    Zap,
    TrendingDown,
    DollarSign,
    Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    MacroEventOccurrence,
    MacroReaction,
    calculateEventStats,
    getPastOccurrences,
    getNextOccurrence,
    getDaysUntil,
    formatOccursAt
} from '@/lib/macro-events'
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { ReviewChart } from '@/components/ReviewChart'
import { UniversalCard, CardContent, CardHeader, CardTitle } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { EventNarrativeTimeline } from './calendar/EventNarrativeTimeline'

interface SingleEventClientProps {
    eventKey: string
    reactions: Record<string, MacroReaction>
}

// 1. Hero Stats Row (Refactored to Standard Card with Dividers)
function EventStatsRow({ stats }: { stats: any }) {
    if (!stats) return null

    return (
        <UniversalCard className="mb-6 p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0A0B14]">
                <SectionHeaderCard
                    title="統計數據 (Statistical Data)"
                    icon={BarChart2}
                />
            </div>

            <div className="p-0">
                <div className="grid grid-cols-3 divide-x divide-[#1A1A1A]">
                    <div className="p-6 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">平均波動 (D0-D1)</div>
                        <div className="text-3xl font-bold font-mono text-white flex items-center gap-1">
                            {stats.avgRange?.toFixed(2)}%
                        </div>
                    </div>

                    <div className="p-6 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">上漲機率 (Win Rate)</div>
                        <div className={cn(
                            "text-3xl font-bold font-mono",
                            stats.d1WinRate > 50 ? "text-green-500" : "text-red-500"
                        )}>
                            {stats.d1WinRate?.toFixed(0)}%
                        </div>
                    </div>

                    <div className="p-6 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">樣本數</div>
                        <div className="text-3xl font-bold font-mono text-white">
                            {stats.samples}
                        </div>
                    </div>
                </div>
            </div>
        </UniversalCard>
    )
}

// 2. Next Event Card (Enhanced)
function NextEventCard({ nextOcc, eventDef }: { nextOcc: MacroEventOccurrence | null, eventDef: any }) {
    if (!nextOcc) return null

    const days = getDaysUntil(nextOcc.occursAt)
    const isToday = days === 0

    return (
        <UniversalCard variant="highlight" size="L" className="border-blue-500/20 bg-blue-900/10 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            即將到來
                        </span>
                        <h2 className="text-lg font-bold text-white">{eventDef.name} 發布</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-blue-200/80 font-mono">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatOccursAt(nextOcc.occursAt)}
                        </div>
                        {nextOcc.forecast !== undefined && (
                            <div className="flex items-center gap-1.5">
                                <Target className="w-4 h-4" />
                                預測: {nextOcc.forecast}{eventDef.key === 'nfp' ? 'K' : '%'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center bg-black/40 rounded-xl p-3 border border-blue-500/20 min-w-[100px]">
                    <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">倒數計時</div>
                    <div className="text-2xl font-bold text-white font-mono">
                        {isToday ? 'TODAY' : `${days} DAYS`}
                    </div>
                </div>
            </div>
        </UniversalCard>
    )

}

export default function SingleEventClient({ eventKey, reactions }: SingleEventClientProps) {
    const eventDef = MACRO_EVENT_DEFS.find(d => d.key === eventKey)
    const [overlayType, setOverlayType] = useState<'oi' | 'funding' | null>(null)

    if (!eventDef) return <div>Event not found</div>

    const stats = calculateEventStats(eventKey, reactions)
    const nextOcc = getNextOccurrence(eventKey)
    const pastOccurrences = getPastOccurrences(eventKey, 12)

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/calendar" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-bold">返回日曆</span>
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px] text-white/80">{eventDef.name}</div>
                <div className="w-8" />
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-6">

                {/* 1. Next Event Hero */}
                <NextEventCard nextOcc={nextOcc || null} eventDef={eventDef} />

                {/* 2. Narrative Timeline [NEW v1.1] */}
                <EventNarrativeTimeline eventKey={eventKey} />

                {/* 3. Stats Grid */}
                <EventStatsRow stats={stats} />

                {/* 3. Historical Analysis */}
                <UniversalCard variant="default" className="p-0 overflow-hidden bg-[#0A0A0A]">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <SectionHeaderCard
                            title="歷史復盤與資金流向"
                            description="過去 12 次發布的市場反應 (Price + OI/Funding)"
                            icon={Activity}
                            className="p-0 border-none bg-transparent"
                        />

                        {/* Overlay Controls */}
                        <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-lg border border-[#2A2A2A]">
                            <button
                                onClick={() => setOverlayType(null)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    overlayType === null ? "bg-[#333] text-white shadow-sm" : "text-[#666] hover:text-[#999]"
                                )}
                            >
                                純價格
                            </button>
                            <button
                                onClick={() => setOverlayType('oi')}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                                    overlayType === 'oi' ? "bg-[#333] text-yellow-400 shadow-sm" : "text-[#666] hover:text-[#999]"
                                )}
                            >
                                <Layers className="w-3 h-3" />
                                持倉量 OI
                            </button>
                            <button
                                onClick={() => setOverlayType('funding')}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                                    overlayType === 'funding' ? "bg-[#333] text-yellow-400 shadow-sm" : "text-[#666] hover:text-[#999]"
                                )}
                            >
                                <DollarSign className="w-3 h-3" />
                                費率 Funding
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-[#0A0A0A]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                                const validItems = pastOccurrences.map(occ => {
                                    const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                                    const reactionKey = `${eventKey}-${keyDate}`
                                    const reaction = reactions[reactionKey]
                                    return { occ, reaction, reactionKey }
                                }).filter(item => item.reaction && item.reaction.priceData && item.reaction.priceData.length > 0)

                                if (validItems.length === 0) {
                                    return (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-neutral-500 border border-dashed border-[#2A2A2A] rounded-xl">
                                            <Activity className="w-10 h-10 mb-4 opacity-20" />
                                            <p className="text-sm font-medium">尚無歷史數據</p>
                                            <p className="text-xs text-neutral-600 mt-2">正在同步區塊鏈數據...</p>
                                        </div>
                                    )
                                }

                                return validItems.map(({ occ, reaction, reactionKey }) => {
                                    if (!reaction) return null
                                    const d1Return = reaction.stats?.d0d1Return ?? 0
                                    const isPositive = d1Return > 0

                                    return (
                                        <div key={reactionKey} className="group rounded-xl border border-[#1A1A1A] bg-[#111] overflow-hidden hover:border-[#333] transition-colors relative">
                                            {/* Header */}
                                            <div className="flex items-stretch border-b border-[#1A1A1A]">
                                                <div className="px-4 py-3 bg-[#0A0B14] flex-1">
                                                    <div className="text-sm font-mono font-bold text-white mb-1">
                                                        {occ.occursAt.slice(0, 10)}
                                                    </div>
                                                    <div className="flex gap-3 text-[10px] font-mono">
                                                        {occ.actual && (
                                                            <span className={cn(
                                                                "px-1.5 py-0.5 rounded border",
                                                                "bg-neutral-900 border-neutral-800 text-neutral-400"
                                                            )}>
                                                                ACT: <span className="text-white">{occ.actual}</span>
                                                            </span>
                                                        )}
                                                        {occ.forecast && (
                                                            <span className="px-1.5 py-0.5 rounded border bg-transparent border-transparent text-neutral-600">
                                                                FCST: {occ.forecast}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "w-24 flex flex-col items-center justify-center border-l border-[#1A1A1A]",
                                                    isPositive ? "bg-emerald-950/20" : "bg-red-950/20"
                                                )}>
                                                    <span className="text-[10px] text-neutral-500 font-mono mb-0.5">D+1 Return</span>
                                                    <span className={cn(
                                                        "text-lg font-bold font-mono",
                                                        isPositive ? "text-emerald-400" : "text-red-400"
                                                    )}>
                                                        {isPositive ? '+' : ''}{d1Return}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Chart */}
                                            <div className="h-[180px] w-full bg-[#0E0E0E] relative">
                                                <ReviewChart
                                                    type="price"
                                                    symbol="BTC"
                                                    eventStart={formatOccursAt(occ.occursAt)}
                                                    eventEnd={formatOccursAt(occ.occursAt)}
                                                    reviewSlug={reactionKey}
                                                    focusWindow={[eventDef.windowDisplay.start, eventDef.windowDisplay.end]}
                                                    isPercentage={true}
                                                    className="w-full h-full"
                                                    overrideData={reaction.priceData}
                                                    overlayType={overlayType || undefined}
                                                />
                                            </div>
                                        </div>
                                    )
                                })
                            })()}
                        </div>
                    </div>
                </UniversalCard>
            </div>
        </div>
    )
}
