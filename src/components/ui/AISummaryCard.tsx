'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles, Newspaper, Activity, ChevronRight } from 'lucide-react'
import { Tag } from '@/components/ui/tag'

// Structured tagged segment for AI summaries
export interface TaggedSegment {
    tag: 'info' | 'success' | 'warning' | 'error' | 'brand' | 'purple' | 'default'
    label: string
    content: string
}

// Helper to map tag types to Tag variants
const tagVariantMap: Record<string, 'info' | 'success' | 'warning' | 'error' | 'brand' | 'purple' | 'default'> = {
    '恐慌': 'error',
    '風險': 'error',
    '偏空': 'error',
    '偏多': 'success',
    '機會': 'success',
    '震盪': 'warning',
    '觀望': 'warning',
    '資金流': 'info',
    '數據': 'info',
    '趨勢': 'info',
    '關鍵位': 'brand',
    '爆倉': 'brand',
    '費率': 'info',
    '巨鯨': 'info',
    '結論': 'purple',
    '劇本': 'purple',
    '背離': 'warning',
    // Additional tags from API
    '籌碼': 'info',
    '情緒': 'warning',
}

interface AISummaryCardProps {
    summary?: string
    summarySegments?: TaggedSegment[]  // New: structured tagged segments
    source?: string // e.g. "幣圈快訊", "市場分析"
    loading?: boolean
    className?: string
    variant?: 'default' | 'compact' | 'hero'
    recommendations?: Array<{
        title: string
        path: string
        reason?: string
        type?: 'review' | 'indicator' | 'event'
    }>
}

/**
 * AI Summary Card - Dedicated component for AI-generated summaries
 * Features typewriter animation on initial load with fixed height to prevent layout shift
 * 
 * Usage:
 * <AISummaryCard summary={text} source="幣圈快訊" />
 * <AISummaryCard summary={text} variant="compact" />
 */
export function AISummaryCard({
    summary = '',
    summarySegments,
    source = '幣圈快訊',
    loading = false,
    className,
    variant = 'default',
    recommendations = []
}: AISummaryCardProps) {
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const previousSummary = useRef<string>('')
    const typingSpeed = 15 // ms per character (faster)

    // Typewriter effect when summary changes
    useEffect(() => {
        // Skip if loading or same summary or empty
        if (loading || !summary || summary === previousSummary.current) {
            return
        }

        // New summary received - start typing animation
        previousSummary.current = summary
        setIsTyping(true)
        setDisplayedText('')

        let index = 0
        const timer = setInterval(() => {
            if (index < summary.length) {
                setDisplayedText(summary.substring(0, index + 1))
                index++
            } else {
                clearInterval(timer)
                setIsTyping(false)
            }
        }, typingSpeed)

        return () => clearInterval(timer)
    }, [summary, loading])

    const isHero = variant === 'hero'
    const isCompact = variant === 'compact'

    // Fixed minimum heights to prevent layout shift
    const contentMinHeight = isCompact ? 'min-h-[40px]' : isHero ? 'min-h-[60px]' : 'min-h-[48px]'

    // Layout Classes
    const wrapperClasses = cn(
        "relative rounded-xl overflow-hidden p-[1px]", // Keep p-[1px] for the border thickness
        className
    )

    // Padding styles for the main text content
    const contentPadding = cn(
        isHero && "p-6",
        isCompact && "p-4",
        !isHero && !isCompact && "p-5"
    )

    // Footer padding styles (matching previous visual density)
    const footerPadding = cn(
        isHero && "px-5 py-3",
        isCompact && "px-3 py-2",
        !isHero && !isCompact && "px-4 py-2.5"
    )

    // Auto-detect "Analyzing" state from text content
    const isAnalyzing = loading || summary.includes('正在分析') || summary.includes('Analyzing')

    // Rotating loading messages for better UX
    const loadingMessages = [
        "正在交叉比對鏈上數據...",
        "正在回測歷史市場模型...",
        "正在生成多維度風險評估...",
        "正在解讀最新市場情緒..."
    ]
    const [msgIndex, setMsgIndex] = useState(0)

    useEffect(() => {
        if (isAnalyzing) {
            const interval = setInterval(() => {
                setMsgIndex(prev => (prev + 1) % loadingMessages.length)
            }, 2000)
            return () => clearInterval(interval)
        }
    }, [isAnalyzing])

    if (isAnalyzing) {
        return (
            <div className={wrapperClasses}>
                {/* 1. Subtle Animated Border (Breathing) - with rounded corners */}
                <div className="absolute inset-0 rounded-xl bg-purple-500 animate-breath" />

                {/* 2. Inner Content */}
                <div className="relative h-full w-full rounded-xl bg-[#0A0A0A] overflow-hidden flex flex-col">
                    {/* Soft Ambient Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent opacity-50" />

                    <div className={cn("flex-1 flex flex-col justify-center items-center text-center", contentPadding)}>
                        <div className="relative z-10 space-y-3">
                            {/* Icon Animation */}
                            <div className="relative flex items-center justify-center mx-auto w-10 h-10">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-purple-500/20 animate-ping opacity-75"></span>
                                <div className="relative inline-flex items-center justify-center rounded-full h-8 w-8 bg-purple-500/10 border border-purple-500/30 text-purple-400">
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                </div>
                            </div>

                            {/* Main Status Text */}
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white tracking-wide">
                                    AI 正在深度分析中
                                </p>
                                {/* Dynamic Subtext */}
                                <p className="text-xs text-neutral-500 h-4 transition-all duration-300">
                                    {loadingMessages[msgIndex]}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Consistent with standard card */}
                    <div className={cn(
                        "flex items-center justify-between border-t border-white/5 bg-[#0F0F10/80]",
                        footerPadding
                    )}>
                        <div className="flex items-center gap-2 text-neutral-500">
                            <div className="h-1.5 w-20 bg-neutral-800 rounded overflow-hidden">
                                <div className="h-full bg-purple-500/50 w-2/3 animate-[shimmer_1.5s_infinite]" />
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-purple-500/70">
                            處理中...
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={wrapperClasses}>
            {/* 1. Background for Border (Animated Breathing) */}
            <div className="absolute inset-0 bg-purple-500 animate-breath" />

            {/* 2. Unified Inner Container */}
            <div className="relative h-full w-full rounded-xl bg-[#0A0A0A] overflow-hidden flex flex-col text-left">

                {/* A. Main Text Content */}
                <div className={cn("flex-1 cursor-default", contentPadding)}>
                    <div className={cn("relative z-10", contentMinHeight)}>
                        {/* Render tagged segments if provided */}
                        {summarySegments && summarySegments.length > 0 ? (
                            <div className={cn(
                                "space-y-2",
                                isHero && "text-sm",
                                isCompact && "text-xs",
                                !isHero && !isCompact && "text-sm"
                            )}>
                                {summarySegments.map((segment, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <Tag
                                            variant={tagVariantMap[segment.tag] || tagVariantMap[segment.label] || 'default'}
                                            size="sm"
                                            className="shrink-0 mt-0.5"
                                        >
                                            {segment.label}
                                        </Tag>
                                        <span className="text-neutral-300 leading-relaxed">
                                            {segment.content}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Fallback: plain text summary */
                            <p className={cn(
                                "leading-relaxed text-neutral-300",
                                isHero && "text-sm",
                                isCompact && "text-xs",
                                !isHero && !isCompact && "text-sm"
                            )}>
                                {displayedText || summary || '正在分析市場動態...'}
                                {isTyping && (
                                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-purple-400 animate-pulse" />
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* C. Recommendations Section (Moved to Middle) */}
                {recommendations && recommendations.length > 0 && (
                    <div className="shrink-0 border-t border-white/5 bg-[#0A0A0A] px-4 py-3">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                推薦閱讀
                            </span>

                            {/* Conditional Layout: Scrollable if > 2, Grid if <= 2 */}
                            <div className={cn(
                                recommendations.length > 2
                                    ? "flex overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar gap-3"
                                    : "grid grid-cols-1 sm:grid-cols-2 gap-2"
                            )}>
                                {recommendations.map((rec, idx) => (
                                    <a
                                        key={idx}
                                        href={rec.path}
                                        className={cn(
                                            "group relative flex items-center gap-3 p-2.5 rounded-lg bg-[#0F0F10] border border-[#1A1A1A] hover:bg-[#141414] hover:border-purple-500/30 transition-all duration-300",
                                            // Conditional item sizing
                                            recommendations.length > 2
                                                ? "min-w-[85%] sm:min-w-[280px] shrink-0 snap-center"
                                                : "w-full"
                                        )}
                                    >
                                        <div className="shrink-0 w-7 h-7 rounded bg-[#1A1A1A] flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                                            {rec.path.includes('indicators') ? (
                                                <Activity className="w-3.5 h-3.5 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                            ) : (
                                                <Newspaper className="w-3.5 h-3.5 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[11px] font-medium text-neutral-300 group-hover:text-white transition-colors truncate">
                                                {rec.title}
                                            </h4>
                                            <p className="text-[10px] text-neutral-500 mt-0.5 truncate group-hover:text-neutral-400 transition-colors">
                                                {rec.reason || (rec.path.includes('indicators') ? '查看市場數據指標詳情' : '回顧歷史類似市場事件')}
                                            </p>
                                        </div>

                                        <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-purple-400 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* B. Branded Footer (Moved to Bottom) */}
                <div className={cn(
                    "shrink-0 flex items-center justify-between border-t border-white/5 bg-[#0F0F10]",
                    footerPadding
                )}>
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Newspaper strokeWidth={1.5} className={cn(
                            "text-purple-400",
                            isCompact ? "w-3 h-3" : "w-3.5 h-3.5"
                        )} />
                        <span className={cn(
                            "font-medium",
                            isCompact ? "text-[10px]" : "text-[11px]"
                        )}>
                            {source}
                        </span>
                        {/* AI Badge - Next to source */}
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <Sparkles strokeWidth={1.5} className="w-2.5 h-2.5 text-purple-400" />
                            <span className="text-[8px] font-bold text-purple-300 uppercase tracking-wider">AI</span>
                        </div>
                    </div>
                    <span className={cn(
                        "font-bold tracking-wide text-purple-300",
                        isCompact ? "text-[10px]" : "text-[11px]"
                    )}>
                        加密台灣 Pro
                    </span>
                </div>
            </div>
        </div>
    )
}
