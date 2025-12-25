import React from 'react'
import { TrendingUp, BarChart2, Activity } from 'lucide-react'
import { ReviewChart } from './ReviewChart'
import { getChartCitation } from '@/lib/citation-mapping'
import { SemanticChartCTA } from '@/components/citation/SemanticChartCTA'
import { ResponsibilityDisclaimer } from '@/components/citation/ResponsibilityDisclaimer'
import { cn } from '@/lib/utils'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { SURFACE, BORDER, TYPOGRAPHY, SPACING } from '@/lib/design-tokens'

interface EvidenceCardProps {
    title: string
    chartType: 'price' | 'flow' | 'oi' | 'supply' | 'fgi' | 'funding' | 'liquidation' | 'longShort' | 'basis' | 'premium' | 'stablecoin'
    symbol: string
    daysBuffer?: number
    eventStart: string
    eventEnd: string
    reviewSlug: string
    newsDate?: string
    interpretation?: {
        whatItMeans: string
        whatToWatch: string
    }
    caption?: string
}

// Get icon based on chart type
function getChartIcon(type: string) {
    switch (type) {
        case 'price':
            return <TrendingUp className="w-4 h-4 text-neutral-500" />
        case 'flow':
            return <Activity className="w-4 h-4 text-neutral-500" />
        case 'fgi':
            return <Activity className="w-4 h-4 text-neutral-500" />
        default:
            return <BarChart2 className="w-4 h-4 text-neutral-500" />
    }
}

export function EvidenceCard({
    title,
    chartType,
    symbol,
    daysBuffer,
    eventStart,
    eventEnd,
    reviewSlug,
    interpretation,
    caption,
    newsDate,
}: EvidenceCardProps) {
    // Build title text (remove emoji, add symbol)
    const cleanTitle = title.replace(/^[📈📊🔍🧠⚠️✅\s]+/, '')
    const displayTitle = `${symbol}/USDT ${cleanTitle}`

    // Get Semantic Citation Data
    const citation = getChartCitation(chartType)

    return (
        <UniversalCard
            variant="default"
            size="M"
            className="p-0 overflow-hidden flex flex-col" // Reset padding for custom internal layout
        >
            {/* Unified Header (Title + Brand) */}
            <div className={cn(
                "px-3.5 py-2.5 flex items-center justify-between border-b",
                SURFACE.tertiary, // Use tertiary bg for header
                BORDER.divider
            )}>
                <div className="flex items-center gap-2">
                    {getChartIcon(chartType)}
                    <span className={cn(TYPOGRAPHY.cardTitle, "font-medium text-neutral-300")}>{displayTitle}</span>
                </div>
                <span className={cn(TYPOGRAPHY.micro, "text-neutral-600")}>加密台灣 Pro</span>
            </div>

            {/* Chart Area */}
            <div className="aspect-video w-full relative group/chart bg-[#0B0B0C]">
                {/* Pattern 1: Embedded CTA */}
                {citation && (
                    <SemanticChartCTA
                        label={citation.ctaLabel}
                        indicatorSlug={citation.indicatorSlug}
                        className="opacity-0 group-hover/chart:opacity-100 translate-y-2 group-hover/chart:translate-y-0"
                    />
                )}

                <ReviewChart
                    type={chartType}
                    symbol={symbol}
                    daysBuffer={daysBuffer}
                    eventStart={eventStart}
                    eventEnd={eventEnd}
                    reviewSlug={reviewSlug}
                    newsDate={newsDate}
                />
            </div>

            {/* Evidence Interpretation (Narrative Style) */}
            <div className={cn(
                "px-3.5 py-3 border-t",
                SURFACE.elevated,
                BORDER.divider
            )}>
                {interpretation ? (
                    <div className="space-y-2">
                        <p className={TYPOGRAPHY.bodyDefault}>{interpretation.whatItMeans}</p>
                        {interpretation.whatToWatch && (
                            <p className={cn(TYPOGRAPHY.bodyDefault, "text-neutral-500")}>{interpretation.whatToWatch}</p>
                        )}
                    </div>
                ) : caption ? (
                    <p className={TYPOGRAPHY.bodyDefault}>{caption.replace('圖表解讀：', '')}</p>
                ) : null}

                {/* Pattern 2: Responsibility Disclaimer - ONLY show if we have a citation mapping */}
                {citation && (
                    <div className="mt-3 pt-2 border-t border-white/5">
                        <ResponsibilityDisclaimer
                            indicatorName={citation.indicatorName}
                            indicatorSlug={citation.indicatorSlug}
                        />
                    </div>
                )}
            </div>
        </UniversalCard>
    )
}
