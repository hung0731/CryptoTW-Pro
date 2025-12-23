'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BarChart3, Newspaper } from 'lucide-react'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'
import { DashboardData } from './types'
import { CARDS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { formatPercent } from '@/lib/format-helpers'
import { logger } from '@/lib/logger'

// ============================================
// Derivatives AI Summary Card
// ============================================
export function DerivativesAiSummaryCard() {
    const [summary, setSummary] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/market/derivatives')
                const data = await res.json()
                if (data.summary) {
                    setSummary(data.summary)
                }
            } catch (e) {
                logger.error('Failed to fetch derivatives summary', e as Error, { feature: 'dashboard-widgets' })
            } finally {
                setLoading(false)
            }
        }
        void fetchSummary()
    }, [])

    // Loading Skeleton
    if (loading) {
        return (
            <div className={cn(CARDS.primary, SPACING.card, "overflow-hidden mb-5")}>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-5 h-5 rounded bg-neutral-700" />
                        <Skeleton className="h-4 w-28 bg-neutral-700" />
                    </div>
                    <Skeleton className="h-3 w-full bg-neutral-700 mb-2" />
                    <Skeleton className="h-3 w-3/4 bg-neutral-700" />
                </div>
            </div>
        )
    }

    if (!summary) return null

    // Determine emoji based on content
    let contextEmoji = '⚡️'
    if (summary.includes('多頭') || summary.includes('偏多') || summary.includes('接多')) {
        contextEmoji = '🐂'
    } else if (summary.includes('空頭') || summary.includes('偏空') || summary.includes('找空')) {
        contextEmoji = '🐻'
    } else if (summary.includes('震盪') || summary.includes('觀望')) {
        contextEmoji = '⚖️'
    }

    return (
        <div className={cn(CARDS.primary, SPACING.card, "overflow-hidden mb-5")}>
            {/* AI Context Card */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{contextEmoji}</span>
                    <span className="text-sm font-bold text-blue-200 tracking-wider">AI 速覽</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    {summary}
                </p>
            </div>

            {/* Branding Footer */}
            <div className="mt-4 border-t border-white/5 flex items-center justify-between text-[11px] bg-blue-950/20 -mx-4 -mb-4 px-4 py-2.5">
                <div className="flex items-center gap-2 text-neutral-400">
                    <Newspaper className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-medium">合約情緒</span>
                </div>
                <span className="text-blue-300 font-bold tracking-wide">加密台灣 Pro</span>
            </div>
        </div>
    )
}

// ============================================
// Open Interest Card
// ============================================
export function OpenInterestCard({ data }: { data?: DashboardData['openInterest'] }) {
    if (!data) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />

    const isPositive = data.change24h >= 0
    const hasData = data.value > 0

    return (
        <div className={cn(CARDS.primary, SPACING.cardCompact, "h-full")}>
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold text-white">未平倉</span>
                <ExplainTooltip
                    term={INDICATOR_KNOWLEDGE.openInterest.term}
                    definition={INDICATOR_KNOWLEDGE.openInterest.definition}
                    explanation={INDICATOR_KNOWLEDGE.openInterest.interpretation}
                    timeline={INDICATOR_KNOWLEDGE.openInterest.timeline}
                />
            </div>
            <div className="space-y-1">
                <div className="text-lg font-bold font-mono text-white flex items-baseline gap-1">
                    {data.formatted}
                    <span className="text-xs text-neutral-500 font-sans">USD</span>
                </div>
                {hasData && (
                    <div className={cn("text-xs font-mono", isPositive ? "text-green-400" : "text-red-400")}>
                        24H: {formatPercent(data.change24h)}
                    </div>
                )}
                {!hasData && (
                    <div className="text-xs text-neutral-500">尚無數據</div>
                )}
            </div>
        </div>
    )
}
