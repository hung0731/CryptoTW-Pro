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
            return <TrendingUp className="w-4 h-4 text-neutral-500" />
        case 'flow':
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
}: EvidenceCardProps) {
    // Build title text (remove emoji, add symbol)
    const cleanTitle = title.replace(/^[📈📊🔍🧠⚠️✅\s]+/, '')
    const displayTitle = `${symbol}/USDT ${cleanTitle}`

    return (
        <div className="rounded-lg border border-white/5 overflow-hidden" style={{ backgroundColor: '#0E0E0F' }}>
            {/* Unified Header (Title + Brand) */}
            <div className="px-3.5 py-2.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getChartIcon(chartType)}
                    <span className="text-sm text-neutral-300">{displayTitle}</span>
                </div>
                <span className="text-[10px] text-neutral-600">加密台灣 Pro</span>
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
                    <div className="space-y-2">
                        <p className="text-xs text-neutral-400 leading-relaxed">{interpretation.whatItMeans}</p>
                        {interpretation.whatToWatch && (
                            <p className="text-xs text-neutral-500 leading-relaxed">{interpretation.whatToWatch}</p>
                        )}
                    </div>
                ) : caption ? (
                    <p className="text-xs text-neutral-400 leading-relaxed">{caption.replace('圖表解讀：', '')}</p>
                ) : null}
            </div>
        </div>
    )
}
