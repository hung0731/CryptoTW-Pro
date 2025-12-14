'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, ExternalLink, Newspaper, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsFlashItem } from '@/lib/coinglass'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    themes: {
        title: string
        summary: string
        watch: 'contracts' | 'whales' | 'macro' | 'sentiment' | 'etf'
        why_it_matters: string
    }[]
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

        if (marketContext.themes.length === 0) {
            return { emoji, text: `市場情緒${marketContext.sentiment}，暫無明顯主線。` }
        }

        const mainThemes = marketContext.themes.slice(0, 2)
        const themeTexts = mainThemes.map(t => t.summary).join(' ')

        return {
            emoji,
            text: themeTexts || `市場整體呈現${marketContext.sentiment}態勢。`
        }
    }

    const { emoji: contextEmoji, text: contextText } = getContextDisplay()

    if (loading && news.length === 0) {
        return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />
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

            {/* AI Context Card (Same style as Whale page) */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-b border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{contextEmoji}</span>
                    <h3 className="text-sm font-bold text-blue-200">市場脈絡 (快訊)</h3>
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
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/50">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-bold text-neutral-400">幣圈快訊</span>
                    <span className="text-[9px] font-mono text-neutral-600 border-l border-white/10 pl-2">
                        即時更新
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] text-green-500 font-bold font-mono">LIVE</span>
                </div>
            </div>

            {/* News List - Full Height */}
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                {news.length === 0 && (
                    <div className="text-center py-6 text-xs text-neutral-500">
                        暫無快訊
                    </div>
                )}

                {news.slice(0, 30).map((item) => {
                    let timeStr = '--:--'
                    try {
                        const date = new Date(item.createTime)
                        if (!isNaN(date.getTime())) {
                            timeStr = format(date, 'HH:mm')
                        }
                    } catch (e) {
                        console.error('Date parsing error', e)
                    }

                    const plainContent = item.content ? item.content.replace(/<[^>]+>/g, '') : ''
                    const isExpanded = expandedIds.has(item.id)

                    return (
                        <div
                            key={item.id}
                            className="px-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                        >
                            {/* Header: Source & Time */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-bold text-xs",
                                        item.highlight ? "text-amber-400" : "text-neutral-400"
                                    )}>
                                        {item.source || 'News'}
                                    </span>
                                    {item.highlight && (
                                        <Badge variant="default" className="h-4 px-1 py-0 text-[9px] font-normal bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-none">
                                            重點
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-[10px] font-mono text-neutral-600">
                                    {timeStr}
                                </span>
                            </div>

                            {/* Title */}
                            <h4
                                onClick={() => toggleExpand(item.id)}
                                className={cn(
                                    "text-sm font-medium leading-snug cursor-pointer transition-colors mb-1",
                                    item.highlight ? "text-amber-100 hover:text-amber-200" : "text-neutral-200 hover:text-blue-400"
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
                                    className="text-xs text-neutral-500 line-clamp-2 cursor-pointer hover:text-neutral-400 transition-colors"
                                >
                                    {plainContent}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
