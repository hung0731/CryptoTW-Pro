'use client'

import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { getReviewBySlug } from '@/lib/reviews-data'
import { Skeleton } from '@/components/ui/skeleton'

// Static Data Import
import REVIEWS_HISTORY from '@/data/reviews-history.json'

interface CompareChartProps {
    slugA: string
    slugB: string
}

interface NormalizedDataPoint {
    tDay: number // T-30, T-29, ..., T-0, T+1, ...
    label: string // "T-30", "T-0", "T+1"
    eventA?: number // % change from T-0
    eventB?: number
}

export function CompareChart({ slugA, slugB }: CompareChartProps) {
    const [data, setData] = useState<NormalizedDataPoint[]>([])
    const [loading, setLoading] = useState(true)

    const reviewA = getReviewBySlug(slugA)
    const reviewB = getReviewBySlug(slugB)

    useEffect(() => {
        if (!slugA || !slugB) {
            setLoading(false)
            return
        }

        const normalizeData = () => {
            // @ts-ignore
            const historyA = REVIEWS_HISTORY[slugA]?.price || []
            // @ts-ignore
            const historyB = REVIEWS_HISTORY[slugB]?.price || []

            if (!historyA.length || !historyB.length) {
                setLoading(false)
                return
            }

            // Get event dates
            const eventDateA = new Date(reviewA?.eventStartAt || '').getTime()
            const eventDateB = new Date(reviewB?.eventStartAt || '').getTime()

            // Find T-0 price for normalization
            const t0PriceA = findClosestPrice(historyA, eventDateA)
            const t0PriceB = findClosestPrice(historyB, eventDateB)

            if (!t0PriceA || !t0PriceB) {
                setLoading(false)
                return
            }

            // Create normalized data for T-30 to T+30
            const combined: NormalizedDataPoint[] = []

            for (let t = -30; t <= 30; t++) {
                const dayA = new Date(eventDateA + t * 86400000).getTime()
                const dayB = new Date(eventDateB + t * 86400000).getTime()

                const priceA = findClosestPrice(historyA, dayA)
                const priceB = findClosestPrice(historyB, dayB)

                combined.push({
                    tDay: t,
                    label: t === 0 ? 'T-0' : t > 0 ? `T+${t}` : `T${t}`,
                    eventA: priceA ? (priceA / t0PriceA) * 100 : undefined,
                    eventB: priceB ? (priceB / t0PriceB) * 100 : undefined
                })
            }

            setData(combined)
            setLoading(false)
        }

        normalizeData()
    }, [slugA, slugB, reviewA, reviewB])

    // Helper: find closest price to a timestamp
    function findClosestPrice(history: any[], timestamp: number): number | null {
        if (!history.length) return null

        let closest = history[0]
        let minDiff = Math.abs(history[0].timestamp - timestamp)

        for (const item of history) {
            const diff = Math.abs(item.timestamp - timestamp)
            if (diff < minDiff) {
                minDiff = diff
                closest = item
            }
        }

        // Only accept if within 2 days
        if (minDiff > 2 * 86400000) return null
        return closest.price
    }

    if (loading) {
        return <Skeleton className="w-full aspect-video bg-neutral-900" />
    }

    if (!data.length) {
        return (
            <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-500 text-sm">
                請選擇兩個事件進行對比
            </div>
        )
    }

    // Get short names for legend
    const nameA = reviewA?.title.split('：')[0] || slugA
    const nameB = reviewB?.title.split('：')[0] || slugB

    return (
        <div className="w-full aspect-video relative" style={{ backgroundColor: '#0B0B0C' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 50, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 9, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        orientation="right"
                        tick={{ fontSize: 9, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        width={45}
                        tickFormatter={(v) => `${v.toFixed(0)}%`}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                        formatter={(value: number, name: string) => [`${value?.toFixed(1)}%`, name]}
                        labelFormatter={(label) => `${label} (事件發生日)`}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="eventA"
                        name={nameA}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="eventB"
                        name={nameB}
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
            {/* T-0 Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none">
                <div className="text-[9px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-white/10">
                    T-0 事件發生
                </div>
            </div>
        </div>
    )
}
