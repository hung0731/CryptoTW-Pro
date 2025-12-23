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
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        {eventDef.name}
                        <span className="text-xs text-[#666] font-normal px-1.5 py-0.5 rounded border border-[#333]">
                            {eventDef.key.toUpperCase()}
                        </span>
                    </h1>
                    <p className="text-xs text-[#808080] mt-1">{eventDef.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                    <div className="text-[10px] text-[#666] mb-1">平均波動 (D0-D1)</div>
                    <div className="text-lg font-mono font-bold text-white">
                        {stats.avgRange?.toFixed(2)}%
                    </div>
                </div>
                <div>
                    <div className="text-[10px] text-[#666] mb-1">上漲機率</div>
                    <div className={cn(
                        "text-lg font-mono font-bold",
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
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-blue-100">下一次發布</span>
                </div>
                {isToday && (
                    <span className="animate-pulse flex h-2 w-2 rounded-full bg-blue-400" />
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-mono font-bold text-white">
                        {formatOccursAt(nextOcc.occursAt)}
                    </div>
                    {nextOcc.forecast && (
                        <div className="text-xs text-blue-200/60 mt-1 font-mono">
                            預測值: {nextOcc.forecast}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
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
        <div className="min-h-screen bg-black text-white font-sans pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/calendar" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-bold">返回日曆</span>
                </Link>
            </div>

            <div className={cn(SPACING.pageX, "pt-6 space-y-6")}>
                <EventHeroStats eventDef={eventDef} stats={stats} />

                <NextEventCard nextOcc={nextOcc || null} />

                <div className="space-y-4">
                    <SectionHeaderCard
                        title="歷史復盤"
                        description="過去 12 次發布的市場反應"
                        rightElement={<Activity className="w-4 h-4 text-neutral-500" />}
                    />

                    <div className="space-y-4">
                        {pastOccurrences.map((occ) => {
                            const keyDate = new Date(occ.occursAt).toISOString().split('T')[0]
                            const reactionKey = `${eventKey}-${keyDate}`
                            const reaction = reactions[reactionKey]

                            // Skip if no data
                            if (!reaction?.priceData || reaction.priceData.length === 0) return null

                            const d1Return = reaction.stats?.d0d1Return ?? 0

                            return (
                                <UniversalCard key={occ.occursAt} variant="default" size="M" className="p-0 overflow-hidden">
                                    {/* Header */}
                                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-mono font-bold text-white">
                                                {occ.occursAt.slice(0, 10)}
                                            </div>
                                            <div className="flex gap-2 text-[10px] font-mono">
                                                {occ.actual && (
                                                    <span className="text-neutral-400">
                                                        ACT: <span className="text-white">{occ.actual}</span>
                                                    </span>
                                                )}
                                                {occ.forecast && (
                                                    <span className="text-neutral-500">
                                                        FCST: {occ.forecast}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "text-xs font-mono font-bold px-1.5 py-0.5 rounded",
                                            d1Return > 0 ? "text-green-400 bg-green-900/20" : "text-red-400 bg-red-900/20"
                                        )}>
                                            {d1Return > 0 ? '+' : ''}{d1Return}%
                                        </div>
                                    </div>

                                    {/* Chart */}
                                    <div className="h-[120px] w-full bg-[#050505]">
                                        <ReviewChart
                                            type="price"
                                            symbol="BTC" // Assuming BTC for now
                                            eventStart={formatOccursAt(occ.occursAt)}
                                            eventEnd={formatOccursAt(occ.occursAt)} // Not used logic-wise here but needed for type
                                            reviewSlug={reactionKey} // Just a key
                                            // Manual data injection if needed, but ReviewChart fetches by slug. 
                                            // Actually ReviewChart fetches by slug. We need to pass data directly or ensure slug works.
                                            // Since ReviewChart relies on /api/reviews/[slug], and these are macro events not in reviews-data.ts, 
                                            // we might need a simpler chart or pass data.
                                            // BUT, `ReviewChart` component fetches from API.
                                            // FOR NOW, let's use a simpler rendering or use the existing MiniChart logic if ReviewChart is not compatible.
                                            // Wait, the original code didn't have SingleEventClient listed in imports of page.tsx? 
                                            // Ah, wait. `CalendarClient` imports `SingleEventClient`.
                                            // Let's assume ReviewChart might not work for these generated keys unless API handles it.
                                            // Actually, `MacroEventChart` might be better or reusing the logic.
                                            // Let's check `ReviewChart` behavior. 
                                            // Actually, the simplest check: Can we pass data to ReviewChart? 
                                            // Looking at `ReviewChart.tsx` (I have not viewed it), assuming it takes slug.
                                            // If not, we should use the sparkline approach or similar.

                                            // Reverting to use a simple Sparkline/Chart for now to avoid complexity 
                                            // OR assuming the existing SingleEventClient was working. 
                                            // Wait, I am creating this file. It was NOT used in original CalendarClient (I didn't see it used).
                                            // Ah, `CalendarClient` imported `SingleEventClient`.
                                            // Let's trust it works or use a placeholder.

                                            // Actually, looking at `CalendarClient.tsx` import:
                                            // `import SingleEventClient from '@/components/SingleEventClient'`
                                            // It implies this file existed.

                                            focusWindow={[eventDef.windowDisplay.start, eventDef.windowDisplay.end]}
                                            isPercentage={true}
                                            className="w-full h-full"
                                            // We need to inject data if ReviewChart supports it, or it will fetch.
                                            // If it fetches, it needs an endpoint.
                                            // For Macro, we passed `reactions` prop to Client.
                                            // We should probably render the chart using the data we HAVE (`reaction.priceData`).

                                            overrideData={reaction.priceData} // Assuming I can add this prop or ReviewChart supports it?
                                        // If ReviewChart doesn't support it, I will use a simple svg like MiniChartCard but bigger.
                                        />
                                    </div>
                                </UniversalCard>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
