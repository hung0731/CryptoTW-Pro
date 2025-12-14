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
        reason: string
        impact: '高' | '中' | '低'
    }[]
}

export function FlashNewsFeed({ compact = false }: { compact?: boolean }) {
    const [marketContext, setMarketContext] = useState<MarketContext | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContext = async () => {
            try {
                // Add timestamp to bypass browser cache
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
        const interval = setInterval(fetchContext, 300000) // Refresh every 5 min
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-4 w-24 bg-neutral-900/50 rounded animate-pulse" />
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-4 animate-pulse">
                    <div className="h-20 bg-neutral-800/50 rounded-lg" />
                    <div className="space-y-2">
                        <div className="h-12 bg-neutral-800/50 rounded-lg" />
                        <div className="h-12 bg-neutral-800/50 rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    const displayItems = compact ? marketContext?.highlights?.slice(0, 3) : marketContext?.highlights?.slice(0, 10)

    return (
        <div className="space-y-3">
            {/* Unified Section Header */}
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">AI 市場快訊</h3>

            {/* Main Card Container - Matches MarketEntryWidgets style */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm transition-all hover:bg-neutral-900/40">

                {/* 1. AI Summary Section - Clean & Flat */}
                <div className="p-4 relative">
                    {/* Decorative subtle glow - very low opacity */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] -mr-10 -mt-10 pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                        <div>
                            <h4 className="text-sm font-bold text-neutral-200 mb-2">AI 重點摘要</h4>
                            <p className="text-sm text-neutral-400 leading-relaxed text-justify">
                                {marketContext?.summary || '正在分析市場數據中...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider - Matches standard borders */}
                <div className="h-px bg-white/5 w-full" />

                {/* 2. News List - Minimalist Dashboard Style */}
                <div className="divide-y divide-white/5">
                    {displayItems?.map((item, index) => (
                        <div key={index} className="p-4 flex gap-3 group hover:bg-white/[0.02] transition-colors cursor-default">
                            {/* Rank - Monospace, muted */}
                            <span className="shrink-0 font-mono text-xs text-neutral-600 pt-0.5">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            <div className="space-y-1">
                                <h5 className="text-sm font-medium text-neutral-300 group-hover:text-blue-100 transition-colors line-clamp-2">
                                    {item.title}
                                </h5>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-500 line-clamp-1">
                                        {item.reason}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) || (
                            <div className="p-8 text-center text-neutral-500 text-sm">
                                暫無相關數據
                            </div>
                        )}
                </div>

                {/* Footer Link */}
                {compact && (
                    <Link
                        href="/news"
                        className="flex items-center justify-center py-3 text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5"
                    >
                        完整報告 <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                )}
            </div>
        </div>
    )
}
