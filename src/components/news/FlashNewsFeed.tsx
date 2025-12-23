'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CARDS, COLORS } from '@/lib/design-tokens'

import { MarketContext } from '@/lib/types'

export function FlashNewsFeed({ compact = false, initialContext = null }: { compact?: boolean, initialContext?: MarketContext | null }) {
    const [marketContext, setMarketContext] = useState<MarketContext | null>(initialContext)
    const [loading, setLoading] = useState(!initialContext)

    useEffect(() => {
        if (initialContext) {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/market-context?t=${Date.now()}`)
                    const json = await res.json()
                    if (json.context) setMarketContext(json.context)
                } catch (e) { console.error(e) }
            }, 300000)
            return () => clearInterval(interval)
        }

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
        void fetchContext()
        const interval = setInterval(fetchContext, 300000)
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
        <div className={cn("overflow-hidden flex flex-col", CARDS.primary, "p-0")}>
            {/* Compact: Only 2 impact factors with direction */}
            <div className="divide-y divide-white/5">
                {displayItems.map((item, index) => (
                    <div
                        key={index}
                        className="px-4 py-3 flex items-center gap-3"
                    >
                        {/* Bias Direction */}
                        <span className={cn(
                            "text-sm font-bold shrink-0",
                            getBiasStyle(item.bias)
                        )}>
                            {item.bias === '偏多' ? '↑' : item.bias === '偏空' ? '↓' : '→'}
                        </span>

                        {/* One Line Description */}
                        <p className="text-sm text-neutral-300 truncate flex-1">
                            {item.title}
                        </p>
                    </div>
                ))}
            </div>

            {/* Single Cognitive CTA */}
            {compact && (
                <Link
                    href="/reviews"
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-neutral-500 hover:text-white border-t border-[#1A1A1A] hover:bg-[#0A0A0A]"
                >
                    <span>這類事件過去如何影響市場？</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            )}
        </div>
    )
}
