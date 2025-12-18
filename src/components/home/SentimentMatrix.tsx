'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CARDS } from '@/lib/design-tokens'
import { ChevronRight } from 'lucide-react'
import { INDICATOR_STORIES, IndicatorStory, ZONE_COLORS, getZoneLabel } from '@/lib/indicator-stories'

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

// 根據指標的 zones 配置計算 zone
function calculateZone(value: number, story: IndicatorStory): 'fear' | 'lean_fear' | 'lean_greed' | 'greed' {
    const zones = story.chart.zones;
    if (value <= zones.fear.max) return 'fear';
    if (value <= zones.leanFear.max) return 'lean_fear';
    if (value <= zones.leanGreed.max) return 'lean_greed';
    return 'greed';
}

// 格式化數值顯示
function formatValue(value: number, story: IndicatorStory): string {
    const format = story.chart.valueFormat;
    const unit = story.chart.unit;
    if (format === 'percent') return `${value.toFixed(3)}%`;
    if (format === 'ratio') return value.toFixed(2);
    if (unit === 'M') return `$${value.toFixed(0)}M`;
    if (unit === 'B') return `$${value.toFixed(1)}B`;
    return value.toFixed(0);
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

                    const zone = calculateZone(value, story)
                    const zoneLabel = getZoneLabel(story.id, zone)

                    return {
                        slug,
                        name: story.name,
                        value,
                        displayValue: formatValue(value, story),
                        zone,
                        zoneLabel,
                        loading: false
                    } as IndicatorStatus
                } catch (e) {
                    console.error(`Failed to fetch ${slug}`, e)
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

        fetchData()
    }, [])

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">市場核心指標</h3>
                <Link href="/indicators" className="text-[10px] text-neutral-600 hover:text-neutral-400 flex items-center gap-1">
                    查看全部
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            {/* 輪播容器 */}
            <div
                ref={scrollRef}
                onTouchStart={stopAutoScroll}
                onMouseDown={stopAutoScroll}
                onScroll={handleScroll}
                className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
            >
                {indicators.map((item) => {
                    const colors = ZONE_COLORS[item.zone]

                    return (
                        <div
                            key={item.slug}
                            className={cn(
                                "flex-none w-36 h-28 relative overflow-hidden group snap-center",
                                CARDS.secondary,
                                "border border-[#1A1A1A]",
                                "hover:border-[#3A3A3A]"
                            )}
                        >
                            <Link href={`/indicators/${item.slug}`} className="block p-4 h-full w-full flex flex-col justify-between">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-neutral-400 truncate pr-2">
                                        {item.name}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#808080] group-hover:text-white" />
                                </div>

                                {/* Value */}
                                <div className="mt-2">
                                    <div className={cn(
                                        "text-xl font-bold font-mono tracking-tight",
                                        item.loading ? "animate-pulse bg-neutral-800 text-transparent rounded w-16" : "text-white"
                                    )}>
                                        {item.displayValue}
                                    </div>
                                </div>

                                {/* Status Bar - 使用語意化標籤 */}
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium w-fit",
                                    colors.bg,
                                    colors.text,
                                    "border", colors.border
                                )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.text.replace('text-', 'bg-'))} />
                                    {item.loading ? '載入中...' : item.zoneLabel}
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
