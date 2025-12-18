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

    if (loading) {
        return (
            <div className={cn(
                "relative overflow-hidden rounded-xl",
                "bg-gradient-to-br from-[#0E0E10] via-[#0C0C0F] to-[#0A0A0D]",
                "border border-[#1A1A1C]",
                isHero && "p-5",
                isCompact && "p-3",
                !isHero && !isCompact && "p-4",
                className
            )}>
                {/* Ambient glow effects */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[60px] -mr-10 -mt-10 pointer-events-none" />

                {/* Loading skeleton with fixed height */}
                <div className={cn("space-y-2", contentMinHeight)}>
                    <div className="h-3.5 bg-[#1A1A1A] rounded w-3/4 animate-pulse" />
                    <div className="h-3.5 bg-[#1A1A1A] rounded w-full animate-pulse" />
                    {!isCompact && <div className="h-3.5 bg-[#1A1A1A] rounded w-5/6 animate-pulse" />}
                </div>

                {/* Footer */}
                <div className={cn(
                    "flex items-center justify-between border-t border-white/5",
                    "bg-gradient-to-r from-blue-950/20 via-blue-950/15 to-indigo-950/10",
                    isHero && "mt-5 -mx-5 -mb-5 px-5 py-3",
                    isCompact && "mt-3 -mx-3 -mb-3 px-3 py-2",
                    !isHero && !isCompact && "mt-4 -mx-4 -mb-4 px-4 py-2.5"
                )}>
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Newspaper className={cn("text-blue-400", isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                        <span className={cn("font-medium", isCompact ? "text-[10px]" : "text-[11px]")}>{source}</span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                            <span className="text-[8px] font-bold text-blue-300 uppercase tracking-wider">AI</span>
                        </div>
                    </div>
                    <span className={cn(
                        "font-bold tracking-wide bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent",
                        isCompact ? "text-[10px]" : "text-[11px]"
                    )}>
                        加密台灣 Pro
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl",
            // Background gradient with subtle blue tint
            "bg-gradient-to-br from-[#0E0E10] via-[#0C0C0F] to-[#0A0A0D]",
            "border border-[#1A1A1C]",
            // Size variations
            isHero && "p-5",
            isCompact && "p-3",
            !isHero && !isCompact && "p-4",
            className
        )}>
            {/* Ambient glow effects */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[60px] -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/3 blur-[50px] -ml-8 -mb-8 pointer-events-none" />

            {/* Content with fixed min-height */}
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
                "bg-gradient-to-r from-blue-950/20 via-blue-950/15 to-indigo-950/10",
                isHero && "mt-5 -mx-5 -mb-5 px-5 py-3",
                isCompact && "mt-3 -mx-3 -mb-3 px-3 py-2",
                !isHero && !isCompact && "mt-4 -mx-4 -mb-4 px-4 py-2.5"
            )}>
                <div className="flex items-center gap-2 text-neutral-400">
                    <Newspaper className={cn(
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
                        <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                        <span className="text-[8px] font-bold text-blue-300 uppercase tracking-wider">AI</span>
                    </div>
                </div>
                <span className={cn(
                    "font-bold tracking-wide",
                    // Gradient text for premium feel
                    "bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent",
                    isCompact ? "text-[10px]" : "text-[11px]"
                )}>
                    加密台灣 Pro
                </span>
            </div>
        </div>
    )
}
