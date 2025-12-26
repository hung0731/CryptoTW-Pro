'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { CARDS, COLORS } from '@/lib/design-tokens'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UniversalCard } from '@/components/ui/UniversalCard'

import { MarketContext } from '@/lib/types'

export function FlashNewsFeed({ compact = false, initialContext = null }: { compact?: boolean, initialContext?: MarketContext | null }) {
    const [marketContext, setMarketContext] = useState<MarketContext | null>(initialContext)
    const [loading, setLoading] = useState(!initialContext)

    // If initialContext is provided, we don't need to fetch immediately.
    // However, we might want to keep polling for fresh updates every 5 mins.
    useEffect(() => {
        if (!initialContext && !marketContext) {
            const fetchContext = async () => {
                setLoading(true)
                try {
                    const res = await fetch(`/api/market-context?t=${Date.now()}`)
                    const json = await res.json()
                    if (json.context) setMarketContext(json.context)
                } catch (e) {
                    console.error('Market context fetch error:', e)
                } finally {
                    setLoading(false)
                }
            }
            void fetchContext()
        }

        // Polling interval (e.g., 5 mins)
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/market-context?t=${Date.now()}`)
                const json = await res.json()
                if (json.context) setMarketContext(json.context)
            } catch (e) { console.error(e) }
        }, 300000)

        return () => clearInterval(interval)
    }, [initialContext])

    if (loading) {
        return (
            <div className={cn("overflow-hidden flex flex-col justify-center", CARDS.primary, "p-4 min-h-[90px]")}>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4 bg-[#1A1A1A]" />
                    <Skeleton className="h-4 w-1/2 bg-[#1A1A1A]" />
                </div>
            </div>
        )
    }

    // Only show top 2 highlights for homepage (compact mode)
    const displayItems = compact ? marketContext?.highlights?.slice(0, 2) : marketContext?.highlights?.slice(0, 10)

    // Bias styling
    const getBiasStyle = (bias: string) => {
        switch (bias) {
            case '偏多': return COLORS.positive
            case '偏空': return COLORS.negative
            default: return COLORS.textSecondary
        }
    }

    // If no highlights, don't render
    if (!displayItems || displayItems.length === 0) {
        return null
    }

    return (
        <div className="w-full">
            <UniversalCard variant="luma" className="p-0 overflow-hidden">
                {/* Header (Integrated if needed, or just content for minimal feed) */}
                {/* Since it's often used between two other titled cards, let's give it a title too or keep it minimal? */}
                {/* The user didn't ask for a title here but consistent style. Let's add a small header "重點快訊" if standalone, or just keep it list style. */}
                {/* Current implementation: No header. Let's add one to match others "快訊預覽" */}

                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="市場快訊"
                        icon={Zap}
                    />
                </div>

                <div className="divide-y divide-[#1A1A1A]">
                    {displayItems.map((item, index) => (
                        <div
                            key={index}
                            className="px-5 py-4 flex items-center gap-3 hover:bg-[#1A1A1A] transition-colors"
                        >
                            {/* Bias Direction */}
                            <span className={cn(
                                "text-sm font-bold shrink-0 w-6 text-center tabular-nums",
                                getBiasStyle(item.bias)
                            )}>
                                {item.bias === '偏多' ? '↑' : item.bias === '偏空' ? '↓' : '→'}
                            </span>

                            {/* One Line Description */}
                            <p className="text-sm text-neutral-300 truncate flex-1 font-medium">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Single Cognitive CTA */}
                {compact && (
                    <Link
                        href="/news"
                        className="flex items-center justify-center gap-1.5 py-3 text-xs text-neutral-500 hover:text-white border-t border-[#1A1A1A] bg-[#0F0F10] hover:bg-[#141414] transition-colors"
                    >
                        <span>查看更多快訊</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                )}
            </UniversalCard>
        </div>
    )
}
