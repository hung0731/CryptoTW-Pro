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

export function FlashNewsFeed() {
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
                    {[1, 2, 3, 4, 5].map(i => (
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

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl overflow-hidden">
            {/* AI Header */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-b border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-blue-200">AI 懶人包</h3>
                    {marketContext?.sentiment && (
                        <span className="text-lg ml-1">{getSentimentEmoji(marketContext.sentiment)}</span>
                    )}
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                    {marketContext?.summary || '正在分析市場動態...'}
                </p>
            </div>

            {/* AI Ranked News List */}
            <div className="divide-y divide-white/5">
                {marketContext?.highlights?.slice(0, 10).map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors"
                    >
                        {/* Rank Number */}
                        <span className={cn(
                            "shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                            index < 3 ? "bg-red-500/20 text-red-400" : "bg-neutral-800 text-neutral-500"
                        )}>
                            {index + 1}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white leading-snug mb-1">
                                {item.title}
                            </h4>
                            <p className="text-xs text-neutral-500">
                                {item.reason}
                            </p>
                        </div>

                        {/* Impact Badge */}
                        <span className={cn(
                            "shrink-0 px-2 py-0.5 text-xs font-bold rounded border",
                            getImpactColor(item.impact)
                        )}>
                            {item.impact}
                        </span>
                    </div>
                )) || (
                        <div className="p-8 text-center text-neutral-500 text-sm">
                            暫無 AI 分析結果
                        </div>
                    )}
            </div>
        </div>
    )
}
