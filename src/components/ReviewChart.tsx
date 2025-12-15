'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, Cell
} from 'recharts'
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
}

export function ReviewChart({ type, symbol, eventStart, eventEnd, daysBuffer = 10, className, reviewSlug }: ReviewChartProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
                setData(chartData)
            } catch (e) {
                console.error('Error loading static chart data', e)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [type, symbol, eventStart, eventEnd, daysBuffer, reviewSlug])

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
        <div className={`w-full h-full ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                {type === 'price' || type === 'supply' ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
