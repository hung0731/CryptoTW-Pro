'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles, Newspaper } from 'lucide-react'

interface AISummaryCardProps {
    summary: string
    source?: string // e.g. "幣圈快訊", "市場分析"
    loading?: boolean
    className?: string
    variant?: 'default' | 'compact' | 'hero'
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
    summary,
    source = '幣圈快訊',
    loading = false,
    className,
    variant = 'default'
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
        "relative rounded-xl overflow-hidden p-[1px]", // 1px padding for border width
        className,
        "border-none" // Force remove any static border passed from parent to avoid double-line artifact
    )

    const contentClasses = cn(
        "relative h-full w-full rounded-xl bg-[#0A0A0A] overflow-hidden", // The actual card background
        // Size variations padding
        isHero && "p-5",
        isCompact && "p-3",
        !isHero && !isCompact && "p-4"
    )

    if (loading) {
        return (
            <div className={wrapperClasses}>
                {/* 1. Animated Gradient Border */}
                <div className="absolute inset-[-100%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#0000_90%,#3b82f6_100%)] opacity-70" />

                {/* 2. Inner Content */}
                <div className={contentClasses}>
                    <div className={cn("relative z-10", contentMinHeight)}>
                        <div className="h-3.5 bg-[#1A1A1A] rounded w-3/4 animate-pulse" />
                        <div className="h-3.5 bg-[#1A1A1A] rounded w-full animate-pulse" />
                        {!isCompact && <div className="h-3.5 bg-[#1A1A1A] rounded w-5/6 animate-pulse" />}
                    </div>

                    {/* Footer */}
                    <div className={cn(
                        "flex items-center justify-between border-t border-white/5",
                        "bg-[#0F0F10]", // Flat footer background
                        isHero && "mt-5 -mx-5 -mb-5 px-5 py-3",
                        isCompact && "mt-3 -mx-3 -mb-3 px-3 py-2",
                        !isHero && !isCompact && "mt-4 -mx-4 -mb-4 px-4 py-2.5"
                    )}>
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Newspaper strokeWidth={1.5} className={cn("text-blue-400", isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                            <span className={cn("font-medium", isCompact ? "text-[10px]" : "text-[11px]")}>{source}</span>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <Sparkles strokeWidth={1.5} className="w-2.5 h-2.5 text-blue-400" />
                                <span className="text-[8px] font-bold text-blue-300 uppercase tracking-wider">AI</span>
                            </div>
                        </div>
                        <span className={cn(
                            "font-bold tracking-wide text-blue-300",
                            isCompact ? "text-[10px]" : "text-[11px]"
                        )}>
                            加密台灣 Pro
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={wrapperClasses}>
            {/* 1. Animated Gradient Border */}
            <div className="absolute inset-[-100%] animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#0000_90%,#3b82f6_100%)] opacity-100" />

            {/* 2. Inner Content */}
            <div className={contentClasses}>
                <div className={cn("relative z-10", contentMinHeight)}>
                    <p className={cn(
                        "leading-relaxed text-neutral-300",
                        isHero && "text-base",
                        isCompact && "text-xs",
                        !isHero && !isCompact && "text-sm"
                    )}>
                        {displayedText || summary || '正在分析市場動態...'}
                        {/* Typing cursor */}
                        {isTyping && (
                            <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-400 animate-pulse" />
                        )}
                    </p>
                </div>

                {/* Branded Footer */}
                <div className={cn(
                    "flex items-center justify-between border-t border-white/5",
                    "bg-[#0F0F10]", // Flat footer background
                    isHero && "mt-5 -mx-5 -mb-5 px-5 py-3",
                    isCompact && "mt-3 -mx-3 -mb-3 px-3 py-2",
                    !isHero && !isCompact && "mt-4 -mx-4 -mb-4 px-4 py-2.5"
                )}>
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Newspaper strokeWidth={1.5} className={cn(
                            "text-blue-400",
                            isCompact ? "w-3 h-3" : "w-3.5 h-3.5"
                        )} />
                        <span className={cn(
                            "font-medium",
                            isCompact ? "text-[10px]" : "text-[11px]"
                        )}>
                            {source}
                        </span>
                        {/* AI Badge - Next to source */}
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Sparkles strokeWidth={1.5} className="w-2.5 h-2.5 text-blue-400" />
                            <span className="text-[8px] font-bold text-blue-300 uppercase tracking-wider">AI</span>
                        </div>
                    </div>
                    <span className={cn(
                        "font-bold tracking-wide text-blue-300",
                        isCompact ? "text-[10px]" : "text-[11px]"
                    )}>
                        加密台灣 Pro
                    </span>
                </div>
            </div>
        </div>
    )
}
