'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Share2, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsItem {
    id: string
    title: string
    content?: string
    summary?: string
    created_at: number | string
    source?: string
    url?: string
    sentiment?: 'bullish' | 'bearish' | 'neutral'
    important?: boolean
}

export function FlashNewsFeed({ items }: { items: NewsItem[] }) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedIds(newSet)
    }

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500">
                暫無快訊
            </div>
        )
    }

    // Group by Date (Today, Yesterday, etc.) - Simplified for now to just list

    return (
        <div className="relative space-y-0 pl-4">
            {/* Timeline Line */}
            <div className="absolute left-[21px] top-2 bottom-0 w-px bg-white/10" />

            {items.map((item, index) => {
                const date = new Date(item.created_at)
                const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
                const isExpanded = expandedIds.has(item.id)

                // Strip HTML for summary viewing
                const plainSummary = item.summary ? item.summary.replace(/<[^>]+>/g, '') : ''

                return (
                    <div key={item.id} className="relative pl-8 pb-8 group">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute left-[18px] top-1.5 w-2 h-2 rounded-full border border-black ring-4 ring-black transition-colors",
                            item.important ? "bg-red-500" : "bg-neutral-600 group-hover:bg-blue-500"
                        )} />

                        <div className="flex flex-col gap-1">
                            {/* Header: Time & Source */}
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-0.5">
                                <span className="font-mono text-neutral-400 font-bold">{timeStr}</span>
                                {item.source && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                        <span>{item.source}</span>
                                    </>
                                )}
                                {item.important && (
                                    <Badge variant="destructive" className="h-4 px-1 py-0 text-[9px] font-normal uppercase">
                                        Important
                                    </Badge>
                                )}
                            </div>

                            {/* Title */}
                            <h3
                                onClick={() => toggleExpand(item.id)}
                                className={cn(
                                    "text-base font-bold leading-snug cursor-pointer transition-colors",
                                    item.important ? "text-red-100 hover:text-red-200" : "text-neutral-200 hover:text-blue-400"
                                )}
                            >
                                {item.title}
                            </h3>

                            {/* Summary / Content */}
                            <div className="mt-1 text-sm text-neutral-400/90 leading-relaxed font-light">
                                {isExpanded ? (
                                    <div
                                        className="prose prose-invert prose-sm max-w-none text-neutral-300"
                                        dangerouslySetInnerHTML={{ __html: item.content || item.summary || '' }}
                                    />
                                ) : (
                                    <p onClick={() => toggleExpand(item.id)} className="cursor-pointer hover:text-neutral-300 transition-colors line-clamp-3">
                                        {plainSummary}
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

                                <button className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider font-medium ml-auto">
                                    <Share2 className="w-3 h-3" /> 分享
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
