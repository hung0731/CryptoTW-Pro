'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary: string
    highlights: {
        title: string
        bias: '偏多' | '偏空' | '中性'
        impact_note: string
    }[]
}

export function FlashNewsFeed({ compact = false }: { compact?: boolean }) {
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
            <div className="space-y-3">
                <div className="h-4 w-32 bg-[#1A1A1A] rounded animate-pulse" />
                <div className="bg-[#0E0E0F] border border-[#1A1A1A] rounded-xl p-3 space-y-3 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-neutral-800/50 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    const displayItems = compact ? marketContext?.highlights?.slice(0, 4) : marketContext?.highlights?.slice(0, 8)

    // Bias styling
    const getBiasStyle = (bias: string) => {
        switch (bias) {
            case '偏多': return 'text-green-400'
            case '偏空': return 'text-red-400'
            default: return 'text-neutral-500'
        }
    }

    return (
        <div className="space-y-3">
            {/* Repositioned Header: "Market Impact" not "News" */}
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
                盤勢影響快訊
            </h3>

            {/* Signal-style Card */}
            <div className="bg-[#0E0E0F] border border-[#1A1A1A] rounded-xl overflow-hidden">

                {/* Summary - One line, scannable */}
                {marketContext?.summary && (
                    <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm text-neutral-300 leading-relaxed">
                            {marketContext.summary}
                        </p>
                    </div>
                )}

                {/* Impact List - Signal style, not article style */}
                <div className="divide-y divide-white/5">
                    {displayItems?.map((item, index) => (
                        <div
                            key={index}
                            className="px-4 py-3 flex items-start gap-3 group hover:bg-[#0E0E0F]"
                        >
                            {/* Bias Indicator */}
                            <span className={cn(
                                "shrink-0 text-[10px] font-bold w-10 text-center pt-0.5",
                                getBiasStyle(item.bias)
                            )}>
                                {item.bias}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-[#E0E0E0] group-hover:text-white truncate">
                                    {item.title}
                                </h5>
                                {/* Impact Note - Always visible but muted */}
                                <p className="text-xs text-neutral-500 mt-0.5 truncate">
                                    {item.impact_note}
                                </p>
                            </div>
                        </div>
                    )) || (
                            <div className="p-6 text-center text-neutral-500 text-sm">
                                尚無盤勢影響事件
                            </div>
                        )}
                </div>

                {/* Footer Link */}
                {compact && (
                    <Link
                        href="/news"
                        className="flex items-center justify-center py-2.5 text-xs font-medium text-[#666666] hover:text-white hover:bg-[#0E0E0F] border-t border-[#1A1A1A]"
                    >
                        查看更多 <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                )}
            </div>
        </div>
    )
}
