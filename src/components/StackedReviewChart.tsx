'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import { AlertCircle, Zap } from 'lucide-react'
import { REVIEWS_DATA } from '@/lib/reviews-data'
import REVIEWS_HISTORY from '@/data/reviews-history.json'

interface StackedReviewChartProps {
    leftSlug: string
    rightSlug: string
    focusWindow?: [number, number]
}

export function StackedReviewChart({ leftSlug, rightSlug, focusWindow }: StackedReviewChartProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewType, setViewType] = useState<'pct' | 'dd'>('pct') // New toggle state

    useEffect(() => {
        const loadData = () => {
            // @ts-ignore
            const leftHistory = REVIEWS_HISTORY[leftSlug]
            // @ts-ignore
            const rightHistory = REVIEWS_HISTORY[rightSlug]

            const leftInfo = REVIEWS_DATA.find(r => r.slug === leftSlug)
            const rightInfo = REVIEWS_DATA.find(r => r.slug === rightSlug)

            if (!leftHistory || !rightHistory || !leftInfo || !rightInfo) {
                setLoading(false)
                return
            }

            // Helper to process a single event history into relative items
            const processHistory = (history: any, eventStart: string, keyPrefix: string) => {
                const priceData = history.price || []
                const start = new Date(eventStart).getTime()
                const oneDay = 1000 * 60 * 60 * 24

                return priceData.map((item: any) => {
                    const current = new Date(item.date).getTime()
                    const diffDays = Math.floor((current - start) / oneDay)
                    return {
                        t: diffDays,
                        [`${keyPrefix}Price`]: item.price,
                        [`${keyPrefix}Date`]: item.date
                    }
                })
            }

            // Normalize data to T-days
            const leftSeries = processHistory(leftHistory, leftInfo.eventStartAt, 'left')
            const rightSeries = processHistory(rightHistory, rightInfo.eventStartAt, 'right')

            // Merge logic
            // We want a unified T-axis from min(T) to max(T) of interest
            // Usually -30 to +60 or whatever available.
            // Let's create a map by T
            const mergedMap = new Map<number, any>()

            // Populate Map
            leftSeries.forEach((item: any) => {
                const existing = mergedMap.get(item.t) || { t: item.t }
                mergedMap.set(item.t, { ...existing, ...item })
            })
            rightSeries.forEach((item: any) => {
                const existing = mergedMap.get(item.t) || { t: item.t }
                mergedMap.set(item.t, { ...existing, ...item })
            })

            // Filter Range (e.g. -30 ~ +30 standard, or focus window)
            // Use standard -30 to +30 for now unless focus window passed?
            // Actually user might want to see full range.
            // Let's default to -30 to +30 like ReviewChart
            const rangeMin = -30
            const rangeMax = 60 // Extended range for stacked

            const sortedData = Array.from(mergedMap.values())
                .filter(d => {
                    // If focusWindow provided, filter strict? Or just show range?
                    // Let's stick to a reasonable window
                    return d.t >= -45 && d.t <= 60
                })
                .sort((a, b) => a.t - b.t)

            // Normalize Price to % change from T=0?
            // User likely wants to compare *trend* not absolute price ($100k vs $800).
            // Normalizing to % relative to T0 is best practice for stacking.
            // Find T0 price for each
            const leftT0 = leftSeries.find((d: any) => d.t === 0)?.leftPrice || leftSeries.find((d: any) => d.t === 1)?.leftPrice || leftSeries[0].leftPrice
            const rightT0 = rightSeries.find((d: any) => d.t === 0)?.rightPrice || rightSeries.find((d: any) => d.t === 1)?.rightPrice || rightSeries[0].rightPrice

            // Calculate Peaks for Drawdown (assuming starting from max before T=0 is not needed, usually DD from local peak in window)
            // But for event study, DD usually means decline from T0 or peak within window.
            // Let's implement DD from Peak-to-Date (Rolling Max).
            let leftMax = -Infinity
            let rightMax = -Infinity

            const finalData = sortedData.map(d => {
                if (d.leftPrice) leftMax = Math.max(leftMax, d.leftPrice)
                if (d.rightPrice) rightMax = Math.max(rightMax, d.rightPrice)

                const leftPct = d.leftPrice ? ((d.leftPrice - leftT0) / leftT0) * 100 : null
                const rightPct = d.rightPrice ? ((d.rightPrice - rightT0) / rightT0) * 100 : null

                const leftDD = d.leftPrice ? ((d.leftPrice - leftMax) / leftMax) * 100 : null
                const rightDD = d.rightPrice ? ((d.rightPrice - rightMax) / rightMax) * 100 : null

                return {
                    ...d,
                    leftPct,
                    rightPct,
                    leftDD,
                    rightDD
                }
            })

            setData(finalData)
            setLoading(false)
        }

        loadData()
    }, [leftSlug, rightSlug])

    const getLeftColor = () => '#3b82f6' // Blue
    const getRightColor = () => '#fbbf24' // Amber

    if (loading) return <Skeleton className="w-full h-full bg-neutral-900 rounded-lg" />

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-950/90 border border-white/10 p-4 rounded-lg shadow-2xl text-xs backdrop-blur-md min-w-[200px]">
                    <p className="text-neutral-400 mb-2 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="text-white font-bold">D{label >= 0 ? `+${label}` : label}</span>
                        <span>(事件日)</span>
                    </p>
                    {payload.map((p: any, i: number) => {
                        const val = Number(p.value)
                        // Mock context based on value
                        let context = ''
                        if (val < -20) context = '市場恐慌加劇'
                        else if (val < -10) context = '信心脆弱'
                        else if (val > 10) context = '反彈強勁'
                        else if (val > 0) context = '震盪回穩'
                        else context = '盤整中'

                        return (
                            <div key={i} className="mb-2 last:mb-0">
                                <div className="flex items-center justify-between gap-4 mb-0.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                        <span className="text-neutral-300 font-medium">
                                            {p.name.includes('基準') ? '基準' : '對照'}
                                        </span>
                                    </div>
                                    <span className={`font-mono font-bold text-sm ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <span className="text-[10px] text-neutral-500 italic">
                                        {context}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        }
        return null
    }

    return (
        <div className="w-full h-full relative">
            {/* View Type Toggle */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 flex bg-neutral-900/80 backdrop-blur rounded-lg p-0.5 border border-white/10">
                <button
                    onClick={() => setViewType('pct')}
                    className={`px-3 py-1 rounded text-[10px] transition-all font-medium ${viewType === 'pct' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    漲跌幅 %
                </button>
                <div className="w-[1px] bg-white/10 my-1 mx-0.5" />
                <button
                    onClick={() => setViewType('dd')}
                    className={`px-3 py-1 rounded text-[10px] transition-all font-medium ${viewType === 'dd' ? 'bg-red-500/10 text-red-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    最大回撤 (DD)
                </button>
            </div>

            {/* D0 Event Pulse Marker (Visual only, on top of graph) */}
            <div className="absolute top-8 bottom-8 left-[calc(30%)] -translate-x-1/2 z-10 pointer-events-none hidden md:block" style={{ left: 'calc(45px + (100% - 60px) * (2000 / 6300))' /* Manual approx or ignore for SVG */ }}>
                {/* This is hard to calculate in absolute div without knowing scale. Recharts ReferenceLine is better. */}
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

                    {/* Enhanced D0 Line */}
                    <ReferenceLine
                        x={0}
                        stroke="#ef4444"
                        strokeOpacity={0.6}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        label={{
                            value: '⚡ 事件爆發',
                            position: 'insideTop',
                            fill: '#ef4444',
                            fontSize: 10,
                            fontWeight: 'bold',
                            dy: -15
                        }}
                    />

                    <XAxis
                        dataKey="t"
                        tick={{ fontSize: 10, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                        tickFormatter={(t) => t === 0 ? 'D0' : `D${t}`}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                    <Legend iconType="circle" />
                    <Line
                        type="monotone"
                        dataKey={viewType === 'pct' ? 'leftPct' : 'leftDD'}
                        name="基準 (左)"
                        stroke={getLeftColor()}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        animationDuration={500}
                    />
                    <Line
                        type="monotone"
                        dataKey={viewType === 'pct' ? 'rightPct' : 'rightDD'}
                        name="對照 (右)"
                        stroke={getRightColor()}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        animationDuration={500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
