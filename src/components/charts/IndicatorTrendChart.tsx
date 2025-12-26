'use client'

import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface IndicatorTrendChartProps {
    events: any[]
    title?: string // e.g. "CPI Year-over-Year"
    className?: string
}

export function IndicatorTrendChart({ events, title = "指標歷史走勢", className }: IndicatorTrendChartProps) {
    if (!events || events.length === 0) return null

    // Sort chronologically (Oldest -> Newest) for the chart
    // events passed in are usually Newest -> Oldest
    const data = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(e => ({
        date: e.date,
        actual: Number(e.actual),
        forecast: Number(e.forecast),
        surprise: Number(e.actual) - Number(e.forecast)
    }))

    return (
        <div className={cn("w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden", className)}>
            <div className="bg-[#0F0F10] border-b border-[#1A1A1A] px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {title}
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-neutral-400">公佈值 (Act)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                        <span className="text-neutral-400">前期值 (Prev)</span>
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#525252"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => str.substring(0, 7)} // "2024-01"
                        />
                        <YAxis
                            stroke="#525252"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null
                                const act = payload[0].value
                                const fcst = payload[1]?.value
                                return (
                                    <div className="bg-[#0A0A0A]/95 backdrop-blur-md border border-[#333] p-3 rounded-lg shadow-xl text-xs">
                                        <div className="text-neutral-400 font-mono mb-2 border-b border-[#333] pb-1">
                                            {label}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-blue-400">公佈 (Act):</span>
                                                <span className="font-bold font-mono">{act}</span>
                                            </div>
                                            {fcst !== undefined && (
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-neutral-500">前期 (Prev):</span>
                                                    <span className="font-bold font-mono text-neutral-400">{fcst}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorActual)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="forecast"
                            stroke="#525252"
                            strokeDasharray="4 4"
                            fill="none"
                            strokeWidth={1.5}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
