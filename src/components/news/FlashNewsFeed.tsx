'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Scale } from 'lucide-react'

interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary: string
    highlights: {
        title: string
        reason: string
        impact: '高' | '中' | '低'
    }[]
}

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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

    // Loading state
    if (loading) {
        return (
            <div className="bg-neutral-900/50 border border-white/5 rounded-xl overflow-hidden animate-pulse">
                {/* AI Header Skeleton */}
                <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-b border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-6 h-6 rounded bg-neutral-700" />
                        <Skeleton className="h-4 w-24 bg-neutral-700" />
                    </div>
                    <Skeleton className="h-4 w-full bg-neutral-700" />
                </div>

                {/* List Skeleton */}
                <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton className="w-6 h-6 rounded bg-neutral-700 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full bg-neutral-700" />
                                <Skeleton className="h-3 w-1/2 bg-neutral-700" />
                            </div>
                            <Skeleton className="w-8 h-6 rounded bg-neutral-700" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Get sentiment display
    const getSentimentEmoji = (sentiment: string) => {
        const map: Record<string, string> = {
            '樂觀': '🚀',
            '保守': '🛡️',
            '恐慌': '⚠️',
            '中性': '⚖️'
        }
        return map[sentiment] || '📊'
    }

    const getImpactColor = (impact: string) => {
        if (impact === '高') return 'text-red-400 border-red-400/30 bg-red-500/10'
        if (impact === '中') return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10'
        return 'text-blue-400 border-blue-400/30 bg-blue-500/10'
    }

    const displayItems = compact ? marketContext?.highlights?.slice(0, 3) : marketContext?.highlights?.slice(0, 10)

    return (

        <div className="space-y-3">
            {/* Section Header */}
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">AI 市場快訊</h3>

            <div className="bg-neutral-900/30 border border-white/5 rounded-xl overflow-hidden">
                {/* AI Header - Professional Report Style */}
                <div className="bg-neutral-900/50 border-b border-white/5 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-500/10 text-blue-400">
                            <Scale className="w-3 h-3" />
                        </div>
                        <h3 className="text-sm font-bold text-blue-100">AI 重點摘要</h3>
                        {marketContext?.sentiment && (
                            <div className="flex items-center gap-1.5 ml-auto bg-white/5 px-2 py-1 rounded text-xs border border-white/5">
                                <span>{getSentimentEmoji(marketContext.sentiment)}</span>
                                <span className="text-neutral-300">情緒{marketContext.sentiment}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed font-medium relative z-10">
                        {marketContext?.summary || '正在分析市場動態...'}
                    </p>
                </div>

                {/* AI Ranked News List */}
                <div className="divide-y divide-white/5">
                    {displayItems?.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3.5 hover:bg-white/5 transition-colors group"
                        >
                            {/* Rank Number - Cleaner */}
                            <span className={cn(
                                "shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 font-mono",
                                index < 3 ? "bg-blue-500/10 text-blue-400" : "bg-neutral-800 text-neutral-600"
                            )}>
                                0{index + 1}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-neutral-200 leading-tight mb-1.5 group-hover:text-blue-200 transition-colors">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded border",
                                        getImpactColor(item.impact)
                                    )}>
                                        影響{item.impact}
                                    </span>
                                    <p className="text-xs text-neutral-500 truncate">
                                        {item.reason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )) || (
                            <div className="p-8 text-center text-neutral-500 text-sm">
                                暫無 AI 分析結果
                            </div>
                        )}
                </div>

                {/* Compact Footer */}
                {compact && (
                    <Link
                        href="/news"
                        className="flex items-center justify-center gap-1.5 p-3 text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/5 transition-all border-t border-white/5"
                    >
                        完整報告 <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
            </div>
        </div>
    )
}
