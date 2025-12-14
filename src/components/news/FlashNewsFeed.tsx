'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, ExternalLink, Newspaper, Sparkles, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsFlashItem } from '@/lib/coinglass'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    summary: string
    highlights: {
        title: string
        reason: string
        impact: '高' | '中' | '低'
    }[]
}

// Helper: Get relative time in Chinese
function getRelativeTime(dateInput: string | number | Date): string {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return ''

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '剛剛'
    if (diffMins < 60) return `${diffMins} 分鐘前`
    if (diffHours < 24) return `${diffHours} 小時前`
    if (diffDays < 7) return `${diffDays} 天前`
    return format(date, 'MM/dd')
}

export function FlashNewsFeed() {
    const [news, setNews] = useState<NewsFlashItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [marketContext, setMarketContext] = useState<MarketContext | null>(null)
    const [contextLoading, setContextLoading] = useState(true)

    const fetchNews = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/coinglass/news')
            const json = await res.json()
            if (json.error) {
                setError('無法獲取快訊')
            } else if (json.news) {
                setNews(json.news)
            }
        } catch (e) {
            console.error(e)
            setError('連線錯誤')
        } finally {
            setLoading(false)
        }
    }

    const fetchContext = async () => {
        setContextLoading(true)
        try {
            const res = await fetch('/api/market/home-router')
            const json = await res.json()
            if (json.router?.marketContext) {
                setMarketContext(json.router.marketContext)
            }
        } catch (e) {
            console.error('Failed to fetch market context', e)
        } finally {
            setContextLoading(false)
        }
    }

    useEffect(() => {
        fetchNews()
        fetchContext()
        const interval = setInterval(fetchNews, 300000)
        return () => clearInterval(interval)
    }, [])

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedIds(newSet)
    }

    // Generate context text from market context
    const getContextDisplay = () => {
        if (!marketContext) {
            return { emoji: '📰', text: '新聞數據載入中，AI 正在分析市場脈絡...' }
        }

        const sentimentEmoji = {
            '樂觀': '🚀',
            '保守': '🛡️',
            '恐慌': '🔻',
            '中性': '⚖️'
        }

        const emoji = sentimentEmoji[marketContext.sentiment] || '📊'

        // Use the summary from AI response
        return {
            emoji,
            text: marketContext.summary || `市場整體呈現${marketContext.sentiment}態勢。`
        }
    }

    const { emoji: contextEmoji, text: contextText } = getContextDisplay()

    if (loading && news.length === 0) {
        return (
            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-0 overflow-hidden animate-pulse">
                {/* AI Context Skeleton */}
                <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-b border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-5 h-5 rounded bg-neutral-700" />
                        <Skeleton className="h-4 w-28 bg-neutral-700" />
                    </div>
                    <Skeleton className="h-3 w-full bg-neutral-700 mb-2" />
                    <Skeleton className="h-3 w-3/4 bg-neutral-700" />
                </div>

                {/* Timeline Skeleton */}
                <div className="p-4 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <Skeleton className="w-2 h-2 rounded-full bg-neutral-700" />
                                <Skeleton className="w-0.5 h-16 bg-neutral-800" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-20 bg-neutral-700" />
                                <Skeleton className="h-4 w-full bg-neutral-700" />
                                <Skeleton className="h-3 w-3/4 bg-neutral-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 text-center">
                <p className="text-red-400 mb-2">{error}</p>
                <button onClick={fetchNews} className="text-xs underline hover:text-white text-neutral-500">重試</button>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-0 overflow-hidden relative">

            {/* AI Context Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-b border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{contextEmoji}</span>
                    <h3 className="text-sm font-bold text-blue-200">今日重點</h3>
                </div>
                {contextLoading ? (
                    <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                ) : (
                    <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                        {contextText}
                    </p>
                )}
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/30">
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-bold text-neutral-400">即時快訊</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] text-green-500 font-bold font-mono">LIVE</span>
                </div>
            </div>

            {/* Timeline News List */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                {news.length === 0 && (
                    <div className="text-center py-6 text-xs text-neutral-500">
                        暫無快訊
                    </div>
                )}

                <div className="relative">
                    {news.slice(0, 30).map((item, index) => {
                        const relativeTime = getRelativeTime(item.createTime)
                        const plainContent = item.content ? item.content.replace(/<[^>]+>/g, '') : ''
                        const isExpanded = expandedIds.has(item.id)
                        const isFirst = index === 0

                        return (
                            <div
                                key={item.id}
                                className="relative flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                            >
                                {/* Timeline */}
                                <div className="flex flex-col items-center pt-1.5">
                                    {/* Dot */}
                                    <div className={cn(
                                        "w-2 h-2 rounded-full shrink-0 z-10",
                                        isFirst ? "bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]" :
                                            item.highlight ? "bg-amber-500" : "bg-neutral-600"
                                    )} />
                                    {/* Line */}
                                    <div className="w-0.5 flex-1 bg-neutral-800 mt-1" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pb-2">
                                    {/* Time & Source */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "text-[10px] font-medium",
                                            isFirst ? "text-green-400" : "text-neutral-500"
                                        )}>
                                            {relativeTime}
                                        </span>
                                        <span className="text-[10px] text-neutral-600">·</span>
                                        <span className={cn(
                                            "text-[10px] font-bold",
                                            item.highlight ? "text-amber-400" : "text-neutral-500"
                                        )}>
                                            {item.source || 'News'}
                                        </span>
                                        {item.highlight && (
                                            <Badge variant="default" className="h-3.5 px-1 py-0 text-[8px] font-bold bg-amber-500/20 text-amber-400 border-none">
                                                HOT
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h4
                                        onClick={() => toggleExpand(item.id)}
                                        className={cn(
                                            "text-sm font-medium leading-snug cursor-pointer transition-colors",
                                            item.highlight ? "text-amber-100 hover:text-amber-50" : "text-neutral-200 hover:text-white"
                                        )}
                                    >
                                        {item.title}
                                    </h4>

                                    {/* Content Preview or Full */}
                                    {isExpanded ? (
                                        <div className="mt-2 space-y-2">
                                            <div
                                                className="prose prose-invert prose-sm max-w-none text-neutral-400 text-xs leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: item.content }}
                                            />
                                            {item.images && item.images.length > 0 && (
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {item.images.slice(0, 2).map((img, idx) => (
                                                        <img key={idx} src={img} alt="News" className="h-24 w-auto rounded-lg border border-white/10" />
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => toggleExpand(item.id)}
                                                className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors"
                                            >
                                                收起 <ChevronUp className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p
                                            onClick={() => toggleExpand(item.id)}
                                            className="text-xs text-neutral-500 line-clamp-2 cursor-pointer hover:text-neutral-400 transition-colors mt-1"
                                        >
                                            {plainContent}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

