'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, Cell, ReferenceArea
} from 'recharts'
import { ZoomIn, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'

// Static Data Import
import REVIEWS_HISTORY from '@/data/reviews-history.json'

interface ReviewChartProps {
    type: 'price' | 'flow' | 'oi' | 'supply';
    symbol: string;
    eventStart: string;
    eventEnd: string;
    daysBuffer?: number; // Optional buffer days to show context
    className?: string;
    reviewSlug?: string; // New prop to identify which review's data to pick
    focusWindow?: [number, number];
}

export function ReviewChart({ type, symbol, eventStart, eventEnd, daysBuffer = 10, className, reviewSlug, focusWindow }: ReviewChartProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'standard' | 'focus'>('standard')

    const getDaysDiff = (dateStr: string) => {
        const date = new Date(dateStr)
        const start = new Date(eventStart)
        const diffTime = date.getTime() - start.getTime()
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }

    const getDateFromDaysDiff = (diff: number) => {
        const start = new Date(eventStart)
        const target = new Date(start)
        target.setDate(start.getDate() + diff)
        return format(target, 'yyyy-MM-dd')
    }

    useEffect(() => {
        if (!reviewSlug) {
            console.warn('ReviewChart missing reviewSlug prop')
            setLoading(false)
            return
        }

        const loadData = () => {
            try {
                // @ts-ignore
                const reviewData = REVIEWS_HISTORY[reviewSlug]
                if (!reviewData) {
                    setLoading(false)
                    return
                }

                let chartData = []
                if (type === 'price' || type === 'supply') {
                    chartData = reviewData.price || []
                } else if (type === 'flow') {
                    // Special case for LUNA where we mapped flow to supply mock data in generator
                    // Or for ETF where flow is flow
                    chartData = reviewData.flow || []
                } else if (type === 'oi') {
                    chartData = reviewData.oi || []
                }

                // Client-side filtering if needed, though data is already roughly cut by generator
                // We should ensure we show what we need.
                // Generator adds 15 days buffer. Component asks for 'daysBuffer'.
                // We can just set data directly.
                // Filter based on View Mode
                const filteredData = chartData.filter((item: any) => {
                    const daysDiff = getDaysDiff(item.date)
                    if (viewMode === 'focus' && focusWindow) {
                        return daysDiff >= focusWindow[0] && daysDiff <= focusWindow[1]
                    }
                    // Standard: T-30 ~ T+30
                    return daysDiff >= -30 && daysDiff <= 30
                })

                setData(filteredData)
            } catch (e) {
                console.error('Error loading static chart data', e)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [type, symbol, eventStart, eventEnd, daysBuffer, reviewSlug, viewMode, focusWindow])

    if (loading) {
        return <Skeleton className="w-full h-full bg-neutral-900 rounded-lg" />
    }

    // Gradient Definitions
    const gradientId = `gradient-${type}-${symbol}`

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-900/90 border border-white/10 p-2 rounded shadow-xl text-xs">
                    <p className="text-neutral-400 mb-1">{label}</p>
                    <p className="text-white font-mono font-bold">
                        {type === 'price' && `$${Number(payload[0].value).toLocaleString()}`}
                        {type === 'flow' && `$${(Number(payload[0].value) / 1000000).toFixed(1)}M`}
                        {type === 'oi' && `$${(Number(payload[0].value) / 1000000).toFixed(0)}M`}
                        {type === 'supply' && `${Number(payload[0].value).toLocaleString()}`}
                    </p>
                </div>
            )
        }
        return null
    }

    if (!data || data.length === 0) return <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">暫無數據</div>

    return (
        <div className={`w-full h-full relative ${className}`}>
            {focusWindow && (
                <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/50 backdrop-blur rounded-lg p-0.5 border border-white/10">
                    <button
                        onClick={() => setViewMode('standard')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'standard' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="全域視角"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setViewMode('focus')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'focus' ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="重點視角"
                    >
                        <ZoomIn className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Watermark */}
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none opacity-[0.03]">
                <img
                    src="/logo.svg"
                    alt="CryptoTW Watermark"
                    className="w-48 h-48 grayscale"
                />
            </div>

            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                {type === 'price' || type === 'supply' ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {viewMode === 'standard' && focusWindow && (
                            <ReferenceArea
                                x1={getDateFromDaysDiff(focusWindow[0])}
                                x2={getDateFromDaysDiff(focusWindow[1])}
                                strokeOpacity={0}
                                fill="#ffffff"
                                fillOpacity={0.05}
                            />
                        )}
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => str.slice(5)} // MM-DD
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            hide={true}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'flow' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => str.slice(5)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                        <Bar
                            dataKey="flow"
                            fill="#ef4444" // Default color, using Cell for dynamic colors below if needed but simple for now to fix lint
                        >
                            {
                                data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.flow > 0 ? '#22c55e' : '#ef4444'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                ) : (
                    // OI
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {viewMode === 'standard' && focusWindow && (
                            <ReferenceArea
                                x1={getDateFromDaysDiff(focusWindow[0])}
                                x2={getDateFromDaysDiff(focusWindow[1])}
                                strokeOpacity={0}
                                fill="#ffffff"
                                fillOpacity={0.05}
                            />
                        )}
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => str.slice(5)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey={type === 'oi' ? 'oi' : 'price'}
                            stroke="#eab308"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}
