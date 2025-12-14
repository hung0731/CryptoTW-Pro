'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, ExternalLink, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsFlashItem } from '@/lib/coinglass'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

export function FlashNewsFeed() {
    const [news, setNews] = useState<NewsFlashItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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

    useEffect(() => {
        fetchNews()
        // Auto refresh every 5 mins
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

    if (loading && news.length === 0) {
        return (
            <div className="space-y-4 pl-4 relative">
                <div className="absolute left-[21px] top-2 bottom-0 w-px bg-white/10" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="pl-8 pb-4 relative">
                        <div className="absolute left-[18px] top-1.5 w-2 h-2 rounded-full border border-black bg-neutral-800 ring-4 ring-black" />
                        <Skeleton className="h-4 w-20 mb-2 bg-neutral-800" />
                        <Skeleton className="h-6 w-3/4 mb-2 bg-neutral-800" />
                        <Skeleton className="h-16 w-full bg-neutral-800" />
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-400">
                <p className="mb-2">{error}</p>
                <button onClick={fetchNews} className="text-xs underline hover:text-white">重試</button>
            </div>
        )
    }

    if (news.length === 0) {
        return <div className="text-center py-12 text-neutral-500">暫無快訊</div>
    }

    return (
        <div className="relative space-y-0 pl-4">
            {/* Timeline Line */}
            <div className="absolute left-[21px] top-2 bottom-0 w-px bg-white/10" />

            <div className="absolute -top-10 right-0">
                <button onClick={fetchNews} className="text-neutral-500 hover:text-white p-2 transition-colors" title="重新整理">
                    <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
            </div>

            {news.map((item) => {
                let timeStr = '--:--'
                try {
                    const date = new Date(item.createTime)
                    // check if valid date
                    if (!isNaN(date.getTime())) {
                        timeStr = format(date, 'HH:mm')
                    }
                } catch (e) {
                    console.error('Date parsing error', e)
                }

                // Strip HTML tags for collapsed view
                const plainContent = item.content ? item.content.replace(/<[^>]+>/g, '') : ''

                const isExpanded = expandedIds.has(item.id)

                return (
                    <div key={item.id} className="relative pl-8 pb-8 group">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute left-[18px] top-1.5 w-2 h-2 rounded-full border border-black ring-4 ring-black transition-colors",
                            item.highlight ? "bg-amber-500" : "bg-neutral-600 group-hover:bg-blue-500"
                        )} />

                        <div className="flex flex-col gap-1">
                            {/* Header: Time & Source */}
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-0.5">
                                <span className={cn("font-mono font-bold", item.highlight ? "text-amber-400" : "text-neutral-400")}>
                                    {timeStr}
                                </span>
                                {item.source && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                        <span>{item.source}</span>
                                    </>
                                )}
                                {item.highlight && (
                                    <Badge variant="default" className="h-4 px-1 py-0 text-[10px] font-normal bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-none">
                                        重點
                                    </Badge>
                                )}
                            </div>

                            {/* Title */}
                            <h3
                                onClick={() => toggleExpand(item.id)}
                                className={cn(
                                    "text-base font-bold leading-snug cursor-pointer transition-colors",
                                    item.highlight ? "text-amber-100 hover:text-amber-200" : "text-neutral-200 hover:text-blue-400"
                                )}
                            >
                                {item.title}
                            </h3>

                            {/* Summary / Content */}
                            <div className="mt-1 text-sm text-neutral-400/90 leading-relaxed font-light">
                                {isExpanded ? (
                                    <div className="space-y-2">
                                        <div
                                            className="prose prose-invert prose-sm max-w-none text-neutral-300"
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />
                                        {item.images && item.images.length > 0 && (
                                            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                                {item.images.slice(0, 3).map((img, idx) => (
                                                    <img key={idx} src={img} alt="News" className="h-32 w-auto rounded-lg border border-white/10" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p onClick={() => toggleExpand(item.id)} className="cursor-pointer hover:text-neutral-300 transition-colors line-clamp-3">
                                        {plainContent}
                                    </p>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={() => toggleExpand(item.id)}
                                    className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider font-medium"
                                >
                                    {isExpanded ? (
                                        <>收起 <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>展開 <ChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>

                                {item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider font-medium"
                                    >
                                        原文 <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
