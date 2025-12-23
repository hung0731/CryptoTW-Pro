'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { CARDS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { ChevronRight } from 'lucide-react'
import { INDICATOR_STORIES, IndicatorStory, ZONE_COLORS, getZoneLabel, calculateStoryZone } from '@/lib/indicator-stories'
import { formatLargeNumber, formatSmallPercent, formatRatio } from '@/lib/format-helpers'

// 首頁精華：最重要的 5 個指標（按熱門程度排序）
const TOP_INDICATORS = [
    'fear-greed',       // 1. FGI - 最知名
    'funding-rate',     // 2. 資金費率 - 交易者必看
    'liquidation',      // 3. 清算 - 熱門話題
    'open-interest',    // 4. OI - 衍生品核心
    'long-short-ratio', // 5. 多空比 - 散戶指標
]

interface IndicatorStatus {
    slug: string
    name: string
    value: number | null
    displayValue: string
    zone: 'fear' | 'lean_fear' | 'lean_greed' | 'greed'
    zoneLabel: string
    loading: boolean
}


const CARD_WIDTH = 144; // w-36 = 9rem = 144px
const GAP = 12; // gap-3 = 0.75rem = 12px

export function SentimentMatrix() {
    const [indicators, setIndicators] = useState<IndicatorStatus[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // 自動輪播
    const startAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % TOP_INDICATORS.length)
        }, 3000) // 每 3 秒切換
    }, [])

    // 停止輪播（使用者觸摸時）
    const stopAutoScroll = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    // 滾動到指定索引
    useEffect(() => {
        if (scrollRef.current) {
            const scrollX = currentIndex * (CARD_WIDTH + GAP)
            scrollRef.current.scrollTo({ left: scrollX, behavior: 'smooth' })
        }
    }, [currentIndex])

    // 初始化和清理
    useEffect(() => {
        startAutoScroll()
        return () => stopAutoScroll()
    }, [startAutoScroll, stopAutoScroll])

    // 手動滾動時暫停自動輪播
    const handleScroll = useCallback(() => {
        stopAutoScroll()
        // 5 秒後恢復自動輪播
        setTimeout(startAutoScroll, 5000)
    }, [startAutoScroll, stopAutoScroll])

    useEffect(() => {
        // 初始化為 loading 狀態
        const initIndicators: IndicatorStatus[] = TOP_INDICATORS.map(slug => {
            const story = INDICATOR_STORIES.find(s => s.slug === slug)
            return {
                slug,
                name: story?.name || slug,
                value: null,
                displayValue: '...',
                zone: 'lean_fear',
                zoneLabel: '載入中',
                loading: true
            }
        })
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIndicators(initIndicators)

        // 取得即時數據
        const fetchData = async () => {
            const promises = TOP_INDICATORS.map(async (slug) => {
                const story = INDICATOR_STORIES.find(s => s.slug === slug)
                if (!story) return null

                try {
                    const params = new URLSearchParams({
                        range: '1M',
                        ...(story.chart.api.params as Record<string, string>)
                    })
                    const res = await fetch(`${story.chart.api.endpoint}?${params.toString()}`)
                    const json = await res.json()

                    let value = 0
                    if (json.current?.value !== undefined) {
                        value = json.current.value
                    } else if (json.history && json.history.length > 0) {
                        value = json.history[json.history.length - 1].value
                    }


                    const zone = calculateStoryZone(value, story)
                    const zoneLabel = getZoneLabel(story.id, zone)

                    let displayValue = value.toFixed(0)
                    const { valueFormat, unit } = story.chart

                    if (valueFormat === 'percent') {
                        displayValue = formatSmallPercent(value)
                    } else if (valueFormat === 'ratio') {
                        displayValue = formatRatio(value)
                    } else if (unit === 'M' || unit === 'B') {
                        displayValue = formatLargeNumber(value, '$')
                    }

                    return {
                        slug,
                        name: story.name,
                        value,
                        displayValue,
                        zone,
                        zoneLabel,
                        loading: false
                    } as IndicatorStatus
                } catch (e) {
                    logger.error(`Failed to fetch ${slug}`, e, { feature: 'sentiment-matrix' })
                    return {
                        slug,
                        name: story.name,
                        value: null,
                        displayValue: '—',
                        zone: 'lean_fear' as const,
                        zoneLabel: '無數據',
                        loading: false
                    } as IndicatorStatus
                }
            })

            const results = await Promise.all(promises)
            const validResults = results.filter((i): i is IndicatorStatus => i !== null)
            setIndicators(validResults)
        }

        void fetchData()
    }, [])

    return (
        <div className={CARDS.primary}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={TYPOGRAPHY.cardTitle}>市場核心指標</h3>
                <Link href="/indicators" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-1">
                    更多
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            {/* 輪播容器 */}
            <div
                ref={scrollRef}
                onTouchStart={stopAutoScroll}
                onMouseDown={stopAutoScroll}
                onScroll={handleScroll}
                className={cn(
                    "flex items-center overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory",
                    SPACING.classes.gapCards
                )}
            >
                {indicators.map((item) => {
                    const colors = ZONE_COLORS[item.zone]

                    return (
                        <div
                            key={item.slug}
                            className={cn(
                                "flex-none w-36 h-28 relative overflow-hidden group snap-center",
                                "bg-[#141414] rounded-lg"
                            )}
                        >
                            <Link href={`/indicators/${item.slug}`} className="block p-3 h-full w-full relative group">
                                {/* Header Row: Name vs Status (Right Anchor) */}
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-medium text-neutral-400 truncate leading-tight mt-0.5">
                                        {item.name}
                                    </span>

                                    {/* Status Badge - Moved to Top Right as Visual Anchor */}
                                    <div className={cn(
                                        "shrink-0 flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium border",
                                        colors.bg,
                                        colors.text,
                                        colors.border
                                    )}>
                                        <div className={cn("w-1 h-1 rounded-full", colors.text.replace('text-', 'bg-'))} />
                                        {item.loading ? '...' : item.zoneLabel}
                                    </div>
                                </div>

                                {/* Bottom Row: Large Value vs Action */}
                                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                    <div className={cn(
                                        "text-xl font-bold font-mono tracking-tight leading-none",
                                        item.loading ? "animate-pulse bg-neutral-800 text-transparent rounded w-16" : "text-white"
                                    )}>
                                        {item.displayValue}
                                    </div>

                                    {/* Chevron as Bottom Right Anchor */}
                                    <ChevronRight className="w-3.5 h-3.5 text-neutral-700 group-hover:text-neutral-400 transition-colors" />
                                </div>
                            </Link>
                        </div>
                    )
                })}
            </div>

            {/* 指示點 */}
            <div className="flex items-center justify-center gap-1.5">
                {TOP_INDICATORS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all",
                            idx === currentIndex
                                ? "bg-white w-4"
                                : "bg-neutral-700 hover:bg-neutral-500"
                        )}
                    />
                ))}
            </div>
        </div>
    )
}
