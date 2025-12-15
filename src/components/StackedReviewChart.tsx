'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
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

            const finalData = sortedData.map(d => ({
                ...d,
                leftPct: d.leftPrice ? ((d.leftPrice - leftT0) / leftT0) * 100 : null,
                rightPct: d.rightPrice ? ((d.rightPrice - rightT0) / rightT0) * 100 : null
            }))

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
                <div className="bg-neutral-900/90 border border-white/10 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
                    <p className="text-neutral-400 mb-2 font-mono">D{label >= 0 ? `+${label}` : label} (事件日)</p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-neutral-300">
                                {p.dataKey === 'leftPct' ? '基準' : '對照'}:
                            </span>
                            <span className={`font-mono font-bold ${Number(p.value) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Number(p.value) > 0 ? '+' : ''}{Number(p.value).toFixed(2)}%
                            </span>
                            <span className="text-neutral-500 text-[10px]">
                                (${Number(p.payload[p.dataKey === 'leftPct' ? 'leftPrice' : 'rightPrice']).toLocaleString()})
                            </span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <ReferenceLine x={0} stroke="#ffffff" strokeOpacity={0.2} strokeDasharray="3 3" />
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
                        dataKey="leftPct"
                        name="基準 (左)"
                        stroke={getLeftColor()}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="rightPct"
                        name="對照 (右)"
                        stroke={getRightColor()}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
