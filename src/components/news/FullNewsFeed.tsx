'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { AIQuickRead } from '@/components/ui/AIQuickRead'
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { UniversalCard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { Tag } from '@/components/ui/tag'
import { TrendingUp, TrendingDown, Zap, Minus } from 'lucide-react'

interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary?: string
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
        let retryCount = 0
        let timeoutId: NodeJS.Timeout

        const fetchContext = async () => {
            try {
                const res = await fetch(`/api/market-context?t=${Date.now()}`)
                const json = await res.json()

                if (json.context) {
                    setMarketContext(json.context)

                    // If AI is still analyzing, retry shortly
                    const summary = json.context.summary || ''
                    if (summary.includes('正在分析') || summary.includes('Analyzing')) {
                        if (retryCount < 10) { // Retry up to 10 times (50s)
                            retryCount++
                            timeoutId = setTimeout(fetchContext, 5000)
                            return
                        }
                    } else {
                        // Success - reset retry
                        retryCount = 0
                    }
                }
            } catch (e) {
                console.error('Market context fetch error:', e)
            } finally {
                setLoading(false)
            }
        }

        void fetchContext()

        // Regular polling every 5 minutes
        const interval = setInterval(() => {
            retryCount = 0 // Reset for periodic fetch
            fetchContext()
        }, 300000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeoutId)
        }
    }, [])

    if (loading) {
        return (
            <div className={SPACING.classes.gapCards}>
                <AIQuickRead summary="" loading={true} />
                <div className={SPACING.classes.gapCards}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* AI Summary Card */}
            <AIQuickRead
                summary={marketContext?.summary || '正在分析市場快訊...'}
                source="幣圈快訊"
            />

            {/* Unified News Section */}
            <UniversalCard variant="luma" className="p-0 overflow-hidden">
                {/* Header Section */}
                {/* Header Section */}
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="今日重點快訊"
                        rightElement={
                            <span className="text-[10px] font-normal text-[#666666] bg-[#1A1A1A] px-2 py-0.5 rounded-full border border-[#2A2A2A]">
                                即時
                            </span>
                        }
                    />
                </div>

                {/* News List */}
                <div className="flex flex-col">
                    {marketContext?.highlights && marketContext.highlights.length > 0 ? (
                        marketContext.highlights.map((item, index) => (
                            <div
                                key={index}
                                className="group relative px-5 py-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors duration-200"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Rank Number - Stylish & Integrated */}
                                    <div className={cn(
                                        "hidden sm:flex shrink-0 w-8 h-8 items-center justify-center rounded-lg font-mono text-xs border transition-colors",
                                        item.bias === '偏多'
                                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                                            : item.bias === '偏空'
                                                ? "bg-red-950/40 text-red-400 border-red-900/50"
                                                : "bg-[#111111] text-[#A0A0A0] border-[#1A1A1A] group-hover:border-[#2A2A2A] group-hover:text-white"
                                    )}>
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* Mobile Rank (Inline) */}
                                        <span className={cn(
                                            "sm:hidden font-mono text-[10px] mr-2",
                                            item.bias === '偏多' ? "text-emerald-500" :
                                                item.bias === '偏空' ? "text-red-500" :
                                                    "text-[#666666]"
                                        )}>
                                            #{String(index + 1).padStart(2, '0')}
                                        </span>

                                        {/* Title */}
                                        <h4 className="text-sm font-medium text-[#E0E0E0] group-hover:text-white leading-snug transition-colors">
                                            {item.title}
                                        </h4>

                                        {/* Reason / Subtitle */}
                                        {item.reason && (
                                            <p className="mt-1.5 text-xs text-[#666666] group-hover:text-[#A0A0A0] line-clamp-2 leading-relaxed transition-colors">
                                                {item.reason}
                                            </p>
                                        )}

                                        {/* Tags Row */}
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            {/* Bias Tag */}
                                            {item.bias && item.bias !== '中性' && (
                                                <Tag
                                                    variant={item.bias === '偏多' ? 'success' : 'error'}
                                                    size="sm"
                                                    icon={item.bias === '偏多' ? TrendingUp : TrendingDown}
                                                >
                                                    {item.bias === '偏多' ? '看多' : '看空'}
                                                </Tag>
                                            )}

                                            {/* Impact Tag */}
                                            {item.impact === '高' && (
                                                <Tag variant="error" size="sm" icon={Zap}>
                                                    高影響
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* AI-style Loading Animation */
                        <div className="relative p-8 flex flex-col items-center justify-center text-center">
                            {/* Soft Ambient Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-transparent opacity-50" />

                            <div className="relative z-10 space-y-3">
                                {/* Icon Animation */}
                                <div className="relative flex items-center justify-center mx-auto w-10 h-10">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-purple-500/20 animate-ping opacity-75"></span>
                                    <div className="relative inline-flex items-center justify-center rounded-full h-8 w-8 bg-purple-500/10 border border-purple-500/30 text-purple-400">
                                        <Zap className="w-4 h-4 animate-pulse" />
                                    </div>
                                </div>

                                {/* Status Text */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-white">
                                        AI 正在篩選重點快訊
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        正在從最新消息中提取關鍵資訊...
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 w-32 mx-auto bg-neutral-800 rounded overflow-hidden">
                                    <div className="h-full bg-purple-500/50 w-2/3 animate-[shimmer_1.5s_infinite]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </UniversalCard>
        </div>
    )
}
