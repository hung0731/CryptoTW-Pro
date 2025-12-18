'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { AISummaryCard } from '@/components/ui/AISummaryCard'
import { CARDS, TYPOGRAPHY } from '@/lib/design-tokens'

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
                <AISummaryCard summary="" loading={true} />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* AI Summary Card - Dedicated Component */}
            <AISummaryCard
                summary={marketContext?.summary || '正在分析市場快訊...'}
                source="幣圈快訊"
            />

            {/* Section Header */}
            <h3 className={cn(TYPOGRAPHY.sectionLabel, "px-1")}>
                今日重點快訊
            </h3>

            {/* Professional One-Line News List */}
            <div className="space-y-1">
                {marketContext?.highlights?.map((item, index) => (
                    <div
                        key={index}
                        className={cn("group flex flex-col", CARDS.secondary)}
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
