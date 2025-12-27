'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, Activity, Shield, Newspaper, TrendingUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { CARDS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UI_LABELS } from '@/config/naming'

interface Highlight {
    title: string
    reason: string
    impact: '高' | '中' | '低'
}

interface MarketContextProps {
    data: {
        sentiment: '樂觀' | '保守' | '恐慌' | '中性'
        summary: string
        highlights: Highlight[]
    } | null
    isLoading?: boolean
}

const SentimentEmoji = {
    '樂觀': '🚀',
    '保守': '🛡️',
    '恐慌': '🔻',
    '中性': '⚖️',
}

const ImpactColor = {
    '高': 'text-red-400 bg-red-500/10 border-red-500/20',
    '中': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    '低': 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20',
}

// Loading Skeleton component
export function MarketContextSkeleton() {
    return (
        <div className={cn(CARDS.primary, "p-0 overflow-hidden")}>
            {/* AI Context Card Skeleton */}
            <div className="p-4 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="w-5 h-5 rounded bg-neutral-700" />
                    <Skeleton className="h-4 w-28 bg-neutral-700" />
                </div>
                <Skeleton className="h-3 w-full bg-neutral-700 mb-2" />
                <Skeleton className="h-3 w-3/4 bg-neutral-700" />
            </div>

            {/* Highlights List Skeleton */}
            <div className="px-3 py-2 space-y-2">
                {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between py-2 px-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-4 h-3 bg-neutral-700" />
                            <Skeleton className="h-3 w-32 bg-neutral-700" />
                        </div>
                        <Skeleton className="h-3 w-16 bg-neutral-700" />
                    </div>
                ))}
            </div>
        </div>
    )
}



export function MarketContextCard({ data, isLoading }: MarketContextProps) {
    const router = useRouter()

    if (isLoading) {
        return <MarketContextSkeleton />
    }

    if (!data) return null

    const contextEmoji = SentimentEmoji[data.sentiment] || '📊'
    const contextText = data.summary || `市場整體呈現${data.sentiment}態勢。`


    return (
        <UniversalCard variant="luma" size="S" className="overflow-hidden">
            {/* Header */}
            <div className="mb-3">
                <SectionHeaderCard
                    title={UI_LABELS.AI.QUICK_READ}
                    icon={Sparkles}
                    className="!p-0 !bg-transparent mb-2" // Minimal, integrated header
                    rightElement={<span className="text-lg">{contextEmoji}</span>}
                />

                <p className="text-xs text-neutral-300 leading-relaxed font-medium pl-1">
                    {contextText}
                </p>
            </div>

            {/* Highlights List - Show top 3 on homepage */}
            {data.highlights && data.highlights.length > 0 && (
                <div className="space-y-1 mb-3">
                    {data.highlights.slice(0, 3).map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-start justify-between py-2 px-2 rounded-lg hover:bg-[#1A1A1A] cursor-pointer group transition-colors"
                            onClick={() => router.push('/news')}
                        >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="text-[10px] text-neutral-600 font-mono w-4 pt-0.5">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs text-[#A0A0A0] group-hover:text-white transition-colors line-clamp-2">
                                        {item.title}
                                    </span>
                                    <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                                        {item.reason}
                                    </p>
                                </div>
                            </div>
                            <div className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded border shrink-0 ml-2",
                                ImpactColor[item.impact] || ImpactColor['低']
                            )}>
                                {item.impact}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Branding Footer - Standardized */}
            <div className="border-t border-[#1A1A1A] pt-3 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-neutral-400">
                    <Newspaper className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-medium">市場重點</span>
                </div>
                <span className="text-blue-300 font-bold tracking-wide">加密台灣 Pro</span>
            </div>
        </UniversalCard>
    )
}

