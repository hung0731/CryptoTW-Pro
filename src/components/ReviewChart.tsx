'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, Cell, ReferenceArea, ReferenceLine
} from 'recharts'
import { ZoomIn, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { CHART } from '@/lib/design-tokens'
import { formatPercent, formatPrice } from '@/lib/format-helpers'

// Static Data Import
import REVIEWS_HISTORY from '@/data/reviews-history.json'

interface ReviewChartProps {
    type: 'price' | 'flow' | 'oi' | 'supply' | 'fgi' | 'funding' | 'liquidation' | 'longShort' | 'basis' | 'premium' | 'stablecoin';
    symbol: string;
    eventStart: string;
    eventEnd: string;
    daysBuffer?: number; // Optional buffer days to show context
    className?: string;
    reviewSlug?: string; // New prop to identify which review's data to pick
    focusWindow?: [number, number];
    isPercentage?: boolean;
    newsDate?: string;
}

export function ReviewChart({ type, symbol, eventStart, eventEnd, daysBuffer = 10, className, reviewSlug, focusWindow, isPercentage = false, newsDate }: ReviewChartProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'standard' | 'focus'>('standard')
    const [yDomain, setYDomain] = useState<any>(['auto', 'auto'])

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
                } else if (type === 'fgi') {
                    chartData = reviewData.fgi || []
                } else if (type === 'funding') {
                    chartData = reviewData.funding || []
                } else if (type === 'liquidation') {
                    chartData = reviewData.liquidation || []
                } else if (type === 'longShort') {
                    chartData = reviewData.longShort || []
                } else if (type === 'basis') {
                    chartData = reviewData.basis || []
                } else if (type === 'premium') {
                    chartData = reviewData.premium || []
                } else if (type === 'stablecoin') {
                    chartData = reviewData.stablecoin || []
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

                // Normalization Logic (Price & OI)
                const shouldNormalize = (isPercentage && type === 'price') || type === 'oi'

                if (shouldNormalize && filteredData.length > 0) {
                    // Normalize to Percentage Change from D0 (eventStart)
                    const startTimestamp = new Date(eventStart).getTime()
                    // Find D0 item
                    let baseItem = filteredData.find((item: any) => new Date(item.date).getTime() === startTimestamp)
                    if (!baseItem) {
                        const dates = filteredData.map((d: any) => Math.abs(new Date(d.date).getTime() - startTimestamp))
                        const minIdx = dates.indexOf(Math.min(...dates))
                        baseItem = filteredData[minIdx]
                    }

                    const valKey = type === 'oi' ? 'oi' : 'price'
                    const baseVal = baseItem?.[valKey] || 1

                    // Processing Loop & MaxAbs Calculation
                    let maxAbs = 0

                    const processedData = filteredData.map((item: any) => {
                        const val = item[valKey]
                        const pct = ((val - baseVal) / baseVal) * 100
                        if (!isNaN(pct)) maxAbs = Math.max(maxAbs, Math.abs(pct))
                        return {
                            ...item,
                            percentage: pct,
                            displayValue: val // Keep original for tooltip
                        }
                    })

                    setData(processedData)

                    // Adaptive Domain for OI
                    if (type === 'oi') {
                        let limit = maxAbs * 1.25
                        if (limit < 15) limit = 15
                        // Round to nearest 5
                        limit = Math.ceil(limit / 5) * 5
                        setYDomain([-limit, limit])
                    } else {
                        // Price usually keeps auto or custom logic, but for now strict 'auto' for basic area
                        // If we needed symmetric for price percentage, we'd do it here. 
                        // But current request is only strict for OI.
                        setYDomain(['auto', 'auto'])
                    }

                } else {
                    setData(filteredData)
                    setYDomain(['auto', 'auto'])
                }
            } catch (e) {
                console.error('Error loading static chart data', e)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [type, symbol, eventStart, eventEnd, daysBuffer, reviewSlug, viewMode, focusWindow])

    if (loading) {
        return <Skeleton className="w-full h-full bg-[#0A0A0A] rounded-lg" />
    }

    // Gradient Definitions
    const gradientId = `gradient-${type}-${symbol}`

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={CHART.tooltip.container}>
                    <p className={CHART.tooltip.date}>{label}</p>
                    <p className={CHART.tooltip.value}>
                        {type === 'price' && (
                            isPercentage
                                ? <span className={payload[0].payload.percentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {formatPercent(payload[0].payload.percentage)}
                                </span>
                                : formatPrice(Number(payload[0].value))
                        )}
                        {type === 'flow' && `$${(Number(payload[0].value) / 1000000).toFixed(1)}M`}
                        {type === 'oi' && (
                            <span className={payload[0].payload.percentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {formatPercent(payload[0].payload.percentage)}
                            </span>
                        )}
                        {type === 'supply' && `${Number(payload[0].value).toLocaleString()}`}
                        {type === 'fgi' && `${Number(payload[0].value)}`}
                        {type === 'funding' && (
                            <span className={Number(payload[0].value) > 0 ? 'text-red-400' : 'text-green-400'}>
                                {Number(payload[0].value).toFixed(4)}%
                            </span>
                        )}
                        {type === 'liquidation' && `$${(Number(payload[0].value) / 1000000).toFixed(1)}M`}
                        {type === 'longShort' && Number(payload[0].value).toFixed(2)}
                        {type === 'basis' && `${Number(payload[0].value).toFixed(2)}%`}
                        {type === 'premium' && (
                            <span className={Number(payload[0].value) > 0 ? 'text-green-400' : 'text-red-400'}>
                                {Number(payload[0].value).toFixed(4)}%
                            </span>
                        )}
                        {type === 'stablecoin' && `$${(Number(payload[0].value) / 1000000000).toFixed(2)}B`}
                    </p>
                    {isPercentage && type === 'price' && (
                        <p className="text-neutral-500 text-[10px] mt-1">
                            {formatPrice(Number(payload[0].payload.price))}
                        </p>
                    )}
                </div>
            )
        }
        return null
    }

    if (!data || data.length === 0) return <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">尚無數據</div>

    return (
        <div className={`w-full h-full relative ${className}`}>
            {focusWindow && (
                <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/50 backdrop-blur rounded-lg p-0.5 border border-white/10">
                    <button
                        onClick={() => setViewMode('standard')}
                        className={`p-1.5 rounded ${viewMode === 'standard' ? 'bg-[#1A1A1A] text-white' : 'text-[#666666] hover:text-[#A0A0A0]'}`}
                        title="全域視角"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setViewMode('focus')}
                        className={`p-1.5 rounded ${viewMode === 'focus' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#666666] hover:text-[#A0A0A0]'}`}
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
                                <stop offset="5%" stopColor="#EDEDED" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#EDEDED" stopOpacity={0} />
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
                        <ReferenceLine
                            x={eventStart}
                            stroke="#ef4444"
                            strokeOpacity={0.8}
                            strokeDasharray="3 3"
                            label={{
                                value: `${eventStart.replace(/-/g, '.')} (D0)`,
                                position: 'insideTopLeft',
                                fill: '#666',
                                fontSize: 10,
                                fontWeight: 'bold',
                                opacity: 0.9,
                                dy: 10
                            }}
                        />

                        {/* News Date Marker (Visual Aid) */}
                        {newsDate && newsDate !== eventStart && (
                            <ReferenceLine
                                x={newsDate}
                                stroke="#ffffff"
                                strokeOpacity={0.4}
                                strokeDasharray="3 3"
                                label={{
                                    value: '📰 新聞',
                                    position: 'insideTopLeft',
                                    fill: '#ffffff',
                                    fontSize: 9,
                                    opacity: 0.6,
                                    dy: -10
                                }}
                            />
                        )}

                        {/* Analysis Window Markers (D-30 / D+30) */}
                        <ReferenceLine
                            x={getDateFromDaysDiff(-30)}
                            stroke="#ffffff"
                            strokeOpacity={0.1}
                            label={{ value: 'D-30', position: 'insideTopLeft', fill: '#ffffff', fontSize: 9, opacity: 0.3 }}
                        />
                        <ReferenceLine
                            x={getDateFromDaysDiff(30)}
                            stroke="#ffffff"
                            strokeOpacity={0.1}
                            label={{ value: 'D+30', position: 'insideTopRight', fill: '#ffffff', fontSize: 9, opacity: 0.3 }}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#111111" vertical={false} />
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
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (isPercentage && type === 'price') return `${value.toFixed(0)}%`
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                                return value
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey={isPercentage && type === 'price' ? "percentage" : "price"}
                            stroke="#EDEDED"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'flow' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
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
                ) : type === 'fgi' ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} label={{ value: '極恐', position: 'insideRight', fill: '#ef4444', fontSize: 10 }} />
                        <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} label={{ value: '極貪', position: 'insideRight', fill: '#22c55e', fontSize: 10 }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                        />
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
                            dataKey="fgi"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'funding' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={45}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${Number(value).toFixed(3)}%`}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => str.slice(5)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                        <ReferenceLine y={0} stroke="#333" />
                        <Bar dataKey="fundingRate" fill="#eab308">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fundingRate > 0 ? '#ef4444' : '#22c55e'} />
                            ))}
                        </Bar>
                    </BarChart>
                ) : type === 'liquidation' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => str.slice(5)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                        <Bar dataKey="liquidation" fill="#f59e0b" />
                    </BarChart>
                ) : type === 'longShort' ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <ReferenceLine y={1} stroke="#fff" strokeOpacity={0.5} strokeDasharray="3 3" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
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
                            dataKey="longShortRatio"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'basis' ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
                        />
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
                            dataKey="basis"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'premium' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${Number(value).toFixed(2)}%`}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => str.slice(5)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                        <ReferenceLine y={0} stroke="#333" />
                        <Bar dataKey="premium">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.premium > 0 ? '#22c55e' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                ) : type === 'stablecoin' ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${(value / 1000000000).toFixed(0)}B`}
                        />
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
                            dataKey="stablecoin"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
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
                        <YAxis
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            domain={yDomain}
                            tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                        />
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
                            dataKey="percentage"
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
