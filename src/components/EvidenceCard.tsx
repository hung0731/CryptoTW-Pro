'use client'

import React from 'react'
import { TrendingUp, BarChart2, Activity } from 'lucide-react'
import { ReviewChart } from './ReviewChart'

interface EvidenceCardProps {
    title: string
    chartType: 'price' | 'flow' | 'oi' | 'supply'
    symbol: string
    daysBuffer?: number
    eventStart: string
    eventEnd: string
    reviewSlug: string
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
            return <TrendingUp className="w-4 h-4 text-neutral-400" />
        case 'flow':
            return <Activity className="w-4 h-4 text-neutral-400" />
        default:
            return <BarChart2 className="w-4 h-4 text-neutral-400" />
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
}: EvidenceCardProps) {
    // Build title text (remove emoji, add symbol)
    const cleanTitle = title.replace(/^[📈📊🔍🧠⚠️✅\s]+/, '')
    const displayTitle = `${symbol}/USDT ${cleanTitle}`

    return (
        <div className="rounded-xl border border-white/[0.08] overflow-hidden" style={{ backgroundColor: '#0E0E0F' }}>
            {/* Unified Header (Title + Brand) */}
            <div className="px-3.5 py-2.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getChartIcon(chartType)}
                    <span className="text-sm font-medium text-neutral-200">{displayTitle}</span>
                </div>
                <span className="text-[10px] text-neutral-500">加密台灣 Pro</span>
            </div>
            {/* Chart Area */}
            <div className="aspect-video w-full relative" style={{ backgroundColor: '#0B0B0C' }}>
                <ReviewChart
                    type={chartType}
                    symbol={symbol}
                    daysBuffer={daysBuffer}
                    eventStart={eventStart}
                    eventEnd={eventEnd}
                    reviewSlug={reviewSlug}
                />
            </div>
            {/* Evidence Interpretation (Narrative Style) */}
            <div className="px-3.5 py-3 border-t border-white/5" style={{ backgroundColor: '#101012' }}>
                {interpretation ? (
                    <p className="text-xs text-neutral-300 leading-relaxed">
                        {interpretation.whatItMeans}
                        {interpretation.whatToWatch && (
                            <span className="text-amber-400/70 block mt-2">{interpretation.whatToWatch}</span>
                        )}
                    </p>
                ) : caption ? (
                    <p className="text-xs text-neutral-300 leading-relaxed">{caption.replace('圖表解讀：', '')}</p>
                ) : null}
            </div>
        </div>
    )
}
