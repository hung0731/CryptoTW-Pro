'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Newspaper } from 'lucide-react'

interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary: string
    highlights: {
        title: string
        reason?: string
        impact?: '高' | '中' | '低'
        bias?: '偏多' | '偏空' | '中性'
        impact_note?: string
    }[]
}

export function FullNewsFeed() {
    const [marketContext, setMarketContext] = useState<MarketContext | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const res = await fetch(`/api/market-context?t=${Date.now()}`)
                const json = await res.json()
                if (json.context) {
                    setMarketContext(json.context)
                }
            } catch (e) {
                console.error('Market context fetch error:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchContext()
        const interval = setInterval(fetchContext, 300000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full bg-[#1A1A1A] rounded-xl" />
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-12 w-full bg-[#1A1A1A] rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* AI Summary Card - Like Derivatives Style */}
            <div className="bg-[#0E0E0F] border border-[#1A1A1A] rounded-xl p-4 relative overflow-hidden">
                {/* Subtle glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-8 -mt-8 pointer-events-none" />

                <div className="relative z-10">
                    {/* Summary Text */}
                    <p className="text-sm text-neutral-300 leading-relaxed">
                        {marketContext?.summary || '正在分析市場快訊...'}
                    </p>
                </div>

                {/* Branding Footer */}
                <div className="mt-4 border-t border-white/5 flex items-center justify-between text-[11px] bg-blue-950/20 -mx-4 -mb-4 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Newspaper className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-medium">幣圈快訊</span>
                    </div>
                    <span className="text-blue-300 font-bold tracking-wide">加密台灣 Pro</span>
                </div>
            </div>

            {/* Section Header */}
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
                今日重點快訊
            </h3>

            {/* Professional One-Line News List */}
            <div className="space-y-1">
                {marketContext?.highlights?.map((item, index) => (
                    <div
                        key={index}
                        className="group bg-[#0A0A0A] hover:bg-[#0E0E0F] border border-[#1A1A1A] rounded-lg px-4 py-3"
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank Number */}
                            <span className="shrink-0 font-mono text-[10px] text-neutral-600 w-4">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            {/* Title - One Line */}
                            <h4 className="flex-1 text-sm font-medium text-[#E0E0E0] group-hover:text-white truncate">
                                {item.title}
                            </h4>
                        </div>

                        {/* Reason - Shown below, muted */}
                        {item.reason && (
                            <p className="text-xs text-neutral-500 mt-1.5 ml-7 line-clamp-1">
                                {item.reason}
                            </p>
                        )}
                    </div>
                )) || (
                        <div className="p-8 text-center text-neutral-500 text-sm">
                            尚無相關數據
                        </div>
                    )}
            </div>
        </div>
    )
}
