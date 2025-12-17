'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CARDS } from '@/lib/design-tokens'
import { ChevronRight } from 'lucide-react'
import { INDICATOR_STORIES, IndicatorStory, ZONE_COLORS, getZoneFromValue } from '@/lib/indicator-stories'

// Define the indicators we want to show on the dashboard
const DASHBOARD_INDICATORS = ['fear-greed', 'etf-flow', 'coinbase-premium', 'stablecoin-supply', 'funding-rate']

interface IndicatorStatus {
    slug: string
    name: string
    value: string | number
    zone: keyof typeof ZONE_COLORS
    loading: boolean
}

export function SentimentMatrix() {
    const [indicators, setIndicators] = useState<IndicatorStatus[]>([])

    useEffect(() => {
        const initIndicators = DASHBOARD_INDICATORS.map(slug => {
            const story = INDICATOR_STORIES.find(s => s.slug === slug)
            return {
                slug,
                name: story?.name || slug,
                value: '...',
                zone: 'lean_fear' as const, // Default neutral
                loading: true
            }
        })
        setIndicators(initIndicators)

        const fetchData = async () => {
            const promises = DASHBOARD_INDICATORS.map(async (slug) => {
                const story = INDICATOR_STORIES.find(s => s.slug === slug)
                if (!story) return null

                try {
                    const params = new URLSearchParams(story.chart.api.params as Record<string, string>)
                    const res = await fetch(`${story.chart.api.endpoint}?${params.toString()}`)
                    const json = await res.json()

                    let value = 0
                    if (json.history && json.history.length > 0) {
                        value = json.history[json.history.length - 1].value
                    } else if (typeof json.value === 'number') {
                        value = json.value
                    }

                    // Format value based on type
                    let displayValue: string | number = value
                    if (story.chart.unit === '%') displayValue = `${value.toFixed(2)}%`
                    if (story.chart.unit === 'B') displayValue = `$${value.toFixed(1)}B`
                    if (story.chart.valueFormat === 'ratio') displayValue = value.toFixed(2)

                    return {
                        slug,
                        name: story.name,
                        value: displayValue,
                        zone: getZoneFromValue(value),
                        loading: false
                    }
                } catch (e) {
                    console.error(`Failed to fetch ${slug}`, e)
                    return {
                        slug,
                        name: story.name,
                        value: 'N/A',
                        zone: 'lean_fear' as const,
                        loading: false
                    }
                }
            })

            const results = await Promise.all(promises)
            setIndicators(results.filter((i): i is IndicatorStatus => i !== null))
        }

        fetchData()
    }, [])

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">全局情緒儀表板</h3>
                <span className="text-[10px] text-neutral-600 animate-pulse">● Live</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                {indicators.map((item) => {
                    const colors = ZONE_COLORS[item.zone]

                    return (
                        <div
                            key={item.slug}
                            className={cn(
                                "flex-none w-36 h-28 relative overflow-hidden group snap-center transition-all duration-300",
                                CARDS.secondary,
                                "border border-[#1A1A1A]", // Force static border
                                "hover:border-[#3A3A3A]"   // lighter border on hover
                            )}
                        >
                            <Link href={`/indicators/${item.slug}`} className="block p-4 h-full w-full flex flex-col justify-between">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-neutral-400 truncate pr-2">
                                        {item.name}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#808080] group-hover:text-white transition-colors" />
                                </div>

                                {/* Value */}
                                <div className="mt-2">
                                    <div className={cn(
                                        "text-xl font-bold font-mono tracking-tight",
                                        item.loading ? "animate-pulse bg-neutral-800 text-transparent rounded w-16" : "text-white"
                                    )}>
                                        {item.value}
                                    </div>
                                </div>

                                {/* Status Bar */}
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium w-fit",
                                    colors.bg,
                                    colors.text,
                                    "border", colors.border
                                )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.text.replace('text-', 'bg-'))} />
                                    {item.loading ? '載入中...' : (
                                        item.zone === 'greed' ? '過熱' :
                                            item.zone === 'fear' ? '恐懼' :
                                                item.zone === 'lean_greed' ? '偏多' : '偏空'
                                    )}
                                </div>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
