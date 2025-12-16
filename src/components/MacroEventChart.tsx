'use client'

import React, { useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { CHART } from '@/lib/design-tokens'
import { formatPercent } from '@/lib/format-helpers'

interface MacroPricePoint {
    t: number  // Day relative to D0 (-5 to +5)
    r: number  // Normalized return
}

interface MacroEventChartProps {
    // Price data for multiple instances { date: [{t, r}] }
    priceData: Record<string, MacroPricePoint[]>
    // Currently selected instance date (or 'avg' for average)
    selectedDate?: string
    // Mode: 'single' (one instance) or 'compare' (multiple + average)
    mode?: 'single' | 'compare'
    // Range: 'short' (D-3 to D+3) or 'full' (D-5 to D+5)
    range?: 'short' | 'full'
    className?: string
}

export function MacroEventChart({
    priceData,
    selectedDate,
    mode = 'single',
    range = 'short',
    className
}: MacroEventChartProps) {
    const dates = Object.keys(priceData).sort().reverse() // Most recent first
    const [activeDate, setActiveDate] = useState(selectedDate || dates[0] || '')
    const [showAverage, setShowAverage] = useState(mode === 'compare')

    // Determine X-axis range
    const xMin = range === 'short' ? -3 : -5
    const xMax = range === 'short' ? 3 : 5

    // Calculate average line
    const calculateAverage = (): MacroPricePoint[] => {
        const tValues = range === 'short'
            ? [-3, -2, -1, 0, 1, 2, 3]
            : [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

        return tValues.map(t => {
            const returns = Object.values(priceData)
                .map(pts => pts.find(p => p.t === t)?.r)
                .filter((r): r is number => r !== undefined)

            const avg = returns.length > 0
                ? returns.reduce((a, b) => a + b, 0) / returns.length
                : 0

            return { t, r: Math.round(avg * 10000) / 10000 }
        })
    }

    // Prepare chart data
    const chartData = (() => {
        const result: any[] = []
        const tValues = range === 'short'
            ? [-3, -2, -1, 0, 1, 2, 3]
            : [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

        const avgData = calculateAverage()

        for (const t of tValues) {
            const point: any = { t }

            // Add active instance data
            if (activeDate && priceData[activeDate]) {
                const instancePoint = priceData[activeDate].find(p => p.t === t)
                point.active = instancePoint ? instancePoint.r * 100 : null // Convert to %
            }

            // Add average data
            const avgPoint = avgData.find(p => p.t === t)
            point.average = avgPoint ? avgPoint.r * 100 : null

            result.push(point)
        }

        return result
    })()

    // Calculate final return for display
    const finalReturn = chartData.find(d => d.t === (range === 'short' ? 3 : 5))?.active

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={CHART.tooltip.container}>
                    <p className="text-neutral-400 mb-2 font-mono">
                        D{label >= 0 ? `+${label}` : label}
                    </p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                            <span style={{ color: p.color }}>{p.name}</span>
                            <span className={cn(
                                "font-mono font-bold",
                                p.value >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                                {p.value !== null ? formatPercent(p.value) : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className={cn("w-full", className)}>
            {/* Date Tabs (if multiple instances) */}
            {dates.length > 1 && (
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                    {dates.slice(0, 6).map(date => (
                        <button
                            key={date}
                            onClick={() => setActiveDate(date)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                                activeDate === date
                                    ? "bg-[#1A2234] text-[#3B82F6] border border-[#3B82F6]/30"
                                    : "bg-[#0A0A0A] text-[#808080] border border-[#1A1A1A] hover:text-white"
                            )}
                        >
                            {date.slice(0, 7)} {/* YYYY-MM */}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowAverage(!showAverage)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                            showAverage
                                ? "bg-[#1A1F2E] text-[#F59E0B] border border-[#F59E0B]/30"
                                : "bg-[#0A0A0A] text-[#808080] border border-[#1A1A1A] hover:text-white"
                        )}
                    >
                        平均線
                    </button>
                </div>
            )}

            {/* Chart */}
            <div className="h-[240px] relative">
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-5">
                    <img src="/logo.svg" alt="" className="w-32 h-32" />
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                        <defs>
                            <linearGradient id="macroGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray={CHART.grid.strokeDasharray} stroke={CHART.grid.stroke} vertical={false} />

                        {/* D0 Reference Line */}
                        <ReferenceLine
                            x={0}
                            stroke="#ef4444"
                            strokeOpacity={0.6}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            label={{
                                value: '📅 事件日',
                                position: 'insideTopRight',
                                fill: '#ef4444',
                                fontSize: 10,
                                fontWeight: 'bold'
                            }}
                        />

                        {/* Zero Line */}
                        <ReferenceLine y={0} stroke="#ffffff20" strokeWidth={1} />

                        <XAxis
                            dataKey="t"
                            type="number"
                            domain={[xMin, xMax]}
                            ticks={range === 'short' ? [-3, 0, 3] : [-5, -3, 0, 3, 5]}
                            tickFormatter={(val) => val === 0 ? 'D0' : `D${val > 0 ? '+' : ''}${val}`}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`}
                            domain={['auto', 'auto']}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />

                        {/* Average Line (if enabled) */}
                        {showAverage && (
                            <Line
                                type="monotone"
                                dataKey="average"
                                name="歷史平均"
                                stroke="#fbbf24"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                connectNulls
                            />
                        )}

                        {/* Active Instance Line */}
                        <Line
                            type="monotone"
                            dataKey="active"
                            name="本次"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={false}
                            connectNulls
                            animationDuration={500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Final Return Indicator */}
            {finalReturn !== null && finalReturn !== undefined && (
                <div className={cn(
                    "mt-3 flex items-center justify-center gap-2 py-2 rounded-lg",
                    finalReturn >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                    {finalReturn >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={cn(
                        "text-sm font-bold",
                        finalReturn >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                        D+{range === 'short' ? 3 : 5} 報酬：{formatPercent(finalReturn)}
                    </span>
                </div>
            )}
        </div>
    )
}
