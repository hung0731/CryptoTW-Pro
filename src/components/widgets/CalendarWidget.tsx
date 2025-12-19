'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, Info, TrendingUp, Star } from 'lucide-react'
import { CARDS, SPACING } from '@/lib/design-tokens'

// ============================================
// Economic Calendar Component
// ============================================
export function EconomicCalendar() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/calendar')
                const json = await res.json()
                setData(json.calendar)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    }

    if (loading) {
        return <Skeleton className="h-64 w-full bg-[#0A0A0A] rounded-xl" />
    }

    if (!data) return null

    const events = data.events || []

    if (events.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-neutral-500 text-sm">此期間無符合條件的數據</p>
            </div>
        )
    }

    // Group by date
    const grouped = events.reduce((acc: any, event: any) => {
        if (!acc[event.date]) acc[event.date] = []
        acc[event.date].push(event)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([date, events]: [string, any]) => (
                <div key={date} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur z-10 pt-2">
                        <h3 className="text-base font-bold text-white font-mono tracking-tight">{date}</h3>
                    </div>

                    <div className="space-y-3">
                        {events.map((event: any, i: number) => {
                            const isExpanded = expanded[event.id]
                            const isKey = event.tier === 'S'

                            return (
                                <div key={event.id} className={cn(
                                    "rounded-xl relative overflow-hidden border",
                                    "bg-[#0A0A0A] hover:bg-[#0E0E0F]",
                                    isKey
                                        ? "border-[#3B82F6]/30 hover:border-[#3B82F6]/50"
                                        : "border-[#1A1A1A]"
                                )}>
                                    {/* S-Tier Indicator */}
                                    {isKey && (
                                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 fill-current" />
                                            重點
                                        </div>
                                    )}

                                    {/* Main Card Content */}
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => toggleExpand(event.id)}
                                    >
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-neutral-400 bg-neutral-800/50 px-1.5 py-0.5 rounded border border-white/5">
                                                    {event.time}
                                                </span>
                                                <span className="text-xs font-bold text-neutral-300 px-1.5 py-0.5 border border-white/10 rounded">
                                                    {event.country}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={cn(
                                                "font-bold leading-tight flex-1",
                                                isKey ? "text-lg text-white" : "text-sm text-neutral-200"
                                            )}>
                                                {event.title}
                                            </h4>
                                            <button className="text-[#666666] hover:text-white">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Data Grid */}
                                        <div className="grid grid-cols-3 gap-2 text-xs mt-4">
                                            <div className="bg-black/20 p-2 rounded text-center">
                                                <span className="block text-neutral-500 mb-1 scale-90">今值</span>
                                                <span className={cn(
                                                    "font-mono font-bold text-sm",
                                                    event.actual ? "text-white" : "text-neutral-600"
                                                )}>{event.actual || '--'}</span>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded text-center">
                                                <span className="block text-neutral-500 mb-1 scale-90">預測</span>
                                                <span className="font-mono text-neutral-300 text-sm">{event.forecast || '--'}</span>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded text-center">
                                                <span className="block text-neutral-500 mb-1 scale-90">前值</span>
                                                <span className="font-mono text-neutral-400 text-sm">{event.previous || '--'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Educational Overlay (Expandable) */}
                                    {isExpanded && (event.whyImportant || event.cryptoReaction) && (
                                        <div className="bg-[#0E0E0F] border-t border-[#1A1A1A] p-4 space-y-4">
                                            {/* Why Important */}
                                            {event.whyImportant && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-neutral-400 mb-1.5">
                                                        <Info className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold text-neutral-300">為什麼重要？</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-300 leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                                                        {event.whyImportant}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Crypto Reaction */}
                                            {event.cryptoReaction && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-blue-400 mb-1.5">
                                                        <TrendingUp className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">加密市場常見反應</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-300 leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                                                        {event.cryptoReaction}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Quick Hint for collapsed state if S-Tier */}
                                    {!isExpanded && isKey && (
                                        <div className="px-4 pb-3 flex items-center justify-center">
                                            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                                                <Info className="w-3 h-3" />
                                                點擊查看影響與解讀
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            <div className="text-center pt-8 pb-4 space-y-1">
                <p className="text-[10px] text-neutral-600">
                    數據來源：Coinglass (UTC+8) • 只顯示高影響力事件 (S/A 級)
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-700">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> S 級核心</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></span> A 級關注</span>
                </div>
            </div>
        </div>
    )
}
