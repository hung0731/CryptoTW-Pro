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
    Zap
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

interface SingleEventClientProps {
    eventKey: string
    reactions: Record<string, MacroReaction>
}

// 1. Hero Card: Key Stats
function EventHeroStats({ eventDef, stats }: { eventDef: any, stats: any }) {
    if (!stats) return null

    return (
        <UniversalCard variant="default" size="M">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        {eventDef.name}
                        <span className="text-[10px] text-[#666] font-normal px-1.5 py-0.5 rounded border border-[#333]">
                            {eventDef.key.toUpperCase()}
                        </span>
                    </h1>
                    <p className="text-xs text-[#808080] mt-1">{eventDef.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                    <div className="text-[10px] text-[#666] mb-1">平均波動 (D0-D1)</div>
                    <div className="text-base font-mono font-bold text-white">
                        {stats.avgRange?.toFixed(2)}%
                    </div>
                </div>
                <div>
                    <div className="text-[10px] text-[#666] mb-1">上漲機率</div>
                    <div className={cn(
                        "text-base font-mono font-bold",
                        stats.d1WinRate > 50 ? "text-red-400" : "text-green-400"
                    )}>
                        {stats.d1WinRate?.toFixed(0)}%
                    </div>
                </div>
            </div>
        </UniversalCard>
    )
}

// 2. Next Event Card
function NextEventCard({ nextOcc }: { nextOcc: MacroEventOccurrence | null }) {
    if (!nextOcc) return null

    const days = getDaysUntil(nextOcc.occursAt)
    const isToday = days === 0

    return (
        <UniversalCard variant="highlight" size="M" className="border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-blue-100">下一次發布</span>
                </div>
                {isToday && (
                    <span className="animate-pulse flex h-2 w-2 rounded-full bg-blue-400" />
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-xl font-mono font-bold text-white">
                        {formatOccursAt(nextOcc.occursAt)}
                    </div>
                    {nextOcc.forecast && (
                        <div className="text-[10px] text-blue-200/60 mt-1 font-mono">
                            預測值: {nextOcc.forecast}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                        {isToday ? '今天' : `還有 ${days} 天`}
                    </span>
                </div>
            </div>
        </UniversalCard>
    )

}

export default function SingleEventClient({ eventKey, reactions }: SingleEventClientProps) {
    const eventDef = MACRO_EVENT_DEFS.find(d => d.key === eventKey)
    const [selectedOcc, setSelectedOcc] = useState<string | null>(null)

    if (!eventDef) return <div>Event not found</div>

    const stats = calculateEventStats(eventKey, reactions)
    const nextOcc = getNextOccurrence(eventKey)
    const pastOccurrences = getPastOccurrences(eventKey, 12)

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/calendar" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-bold">返回日曆</span>
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px] text-white/80">{eventDef.name}</div>
                <div className="w-8" />
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                {/* 1. Top Section: Hero & Next Event */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EventHeroStats eventDef={eventDef} stats={stats} />
                    <NextEventCard nextOcc={nextOcc || null} />
                </div>

                {/* 2. Historical Review Section */}
                <UniversalCard variant="default" className="p-0 overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                        <SectionHeaderCard
                            title="歷史復盤"
                            description="過去 12 次發布的市場反應"
                            icon={Activity}
                        />
                    </div>

                    <div className="p-5 bg-[#0A0A0A]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(() => {
                                const validItems = pastOccurrences.map(occ => {
                                    const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                                    const reactionKey = `${eventKey}-${keyDate}`
                                    const reaction = reactions[reactionKey]
                                    return { occ, reaction, reactionKey }
                                }).filter(item => item.reaction && item.reaction.priceData && item.reaction.priceData.length > 0)

                                if (validItems.length === 0) {
                                    return (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-neutral-500">
                                            <Activity className="w-8 h-8 mb-3 opacity-20" />
                                            <p className="text-sm">尚無歷史數據</p>
                                            <p className="text-xs text-neutral-600 mt-1">請稍後再試或檢查資料庫</p>
                                        </div>
                                    )
                                }

                                return validItems.map(({ occ, reaction, reactionKey }) => {
                                    // Safe check as we filtered above
                                    if (!reaction) return null
                                    const d1Return = reaction.stats?.d0d1Return ?? 0

                                    return (
                                        <div key={occ.occursAt} className="rounded-xl border border-[#1A1A1A] bg-[#111] overflow-hidden hover:border-[#333] transition-colors">
                                            {/* Item Header (Deep Tech Blue) */}
                                            <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center justify-between bg-[#0A0B14]">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-mono font-bold text-white">
                                                        {occ.occursAt.slice(0, 10)}
                                                    </div>
                                                    <div className="flex gap-2 text-[10px] font-mono">
                                                        {occ.actual && <span className="text-neutral-500">ACT: <span className="text-neutral-300">{occ.actual}</span></span>}
                                                        {occ.forecast && <span className="text-neutral-600">FCST: {occ.forecast}</span>}
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "text-xs font-mono font-bold px-1.5 py-0.5 rounded border",
                                                    d1Return > 0 ? "text-emerald-400 bg-emerald-950/30 border-emerald-900/50" : "text-red-400 bg-red-950/30 border-red-900/50"
                                                )}>
                                                    {d1Return > 0 ? '+' : ''}{d1Return}%
                                                </div>
                                            </div>

                                            {/* Chart Area */}
                                            <div className="h-[100px] w-full bg-[#0E0E0E] relative">
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
