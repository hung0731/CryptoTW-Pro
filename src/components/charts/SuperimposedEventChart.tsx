'use client'

import React, { useMemo, useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface HistoricalEventData {
    eventKey: string // e.g. "cpi-2024-10-15"
    date: string     // "2024-10-15"
    actual: string | number
    forecast: string | number
    priceData: {
        date: string
        close: number
        price?: number
    }[]
}

interface Props {
    events: HistoricalEventData[]
    className?: string
    windowStart?: number // e.g. -5 (5 days before)
    windowEnd?: number   // e.g. 10 (10 days after)
    variant?: 'default' | 'minimal'
}

// Helper to determine semantic color based on comparison with previous period
// For CPI/PPI: Higher than previous = Bearish (Red), Lower = Bullish (Green)
// This logic compares current actual vs previous actual (used as forecast)
function getSurpriseColor(actual: number, forecast: number, eventType: string = 'cpi') {
    if (isNaN(actual) || isNaN(forecast)) return '#666'

    const diff = actual - forecast
    // Default logic for CPI/PPI (Inflation): Higher is bad (Red)
    if (eventType.includes('cpi') || eventType.includes('ppi') || eventType.includes('pce')) {
        return diff > 0 ? '#ef4444' : (diff < 0 ? '#22c55e' : '#fbbf24')
    }
    // Default logic for NFP/GDP (Growth): Higher is good (Green)
    return diff > 0 ? '#22c55e' : (diff < 0 ? '#ef4444' : '#fbbf24')
}

export function SuperimposedEventChart({ events, className, windowStart = -5, windowEnd = 10, variant = 'default' }: Props) {
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

    // 1. Process Data: Normalize to T-Days
    const processedEvents = useMemo(() => {
        return events.map(event => {
            const eventDate = new Date(event.date).getTime()

            // Find base price at T-0 (event date)
            // We use the 'close' of the event date as the normalization point (0%)? 
            // Or the 'open' (close of T-1)? Let's use T-0 close for simplicity or T-1 close if avail.
            // Actually, usually "Reaction" is measured from T-0 Open or T-1 Close.
            // Let's find T-0 entry.
            const t0Entry = event.priceData.find(d => d.date === event.date)
            const basePrice = t0Entry ? (t0Entry.price || t0Entry.close) : 0

            if (!basePrice) return null

            // Filter data within window
            const normalizedData = event.priceData.map(d => {
                const currentMetric = new Date(d.date).getTime()
                const diffTime = currentMetric - eventDate
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

                if (diffDays < windowStart || diffDays > windowEnd) return null

                const val = d.price || d.close
                const pctChange = ((val - basePrice) / basePrice) * 100

                return {
                    day: diffDays,
                    val: pctChange
                }
            }).filter(d => d !== null)

            return {
                ...event,
                color: getSurpriseColor(Number(event.actual), Number(event.forecast)), // Simple check, might need robust parsing
                data: normalizedData
            }
        }).filter(Boolean) as (HistoricalEventData & { color: string, data: { day: number, val: number }[] })[]
    }, [events, windowStart, windowEnd])

    // 2. Flatten for Recharts: Array of { day: -5, "2024-10-15": 1.2, "2023...": -0.5 }
    const chartData = useMemo(() => {
        const map = new Map<number, any>()

        // Initialize x-axis points
        for (let i = windowStart; i <= windowEnd; i++) {
            map.set(i, { name: `T${i >= 0 ? '+' : ''}${i}`, day: i })
        }

        processedEvents.forEach(evt => {
            evt.data.forEach(point => {
                const entry = map.get(point.day)
                if (entry) {
                    entry[evt.date] = point.val
                }
            })
        })

        return Array.from(map.values()).sort((a, b) => a.day - b.day)
    }, [processedEvents, windowStart, windowEnd])

    if (!events.length) return <div className="text-center text-neutral-500 py-10">無可用數據</div>

    return (
        <div className={cn(variant === 'default' ? "w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-4" : "w-full", className)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        歷史走勢疊加
                        <span className="text-[10px] bg-[#1A1A1A] text-neutral-400 px-1.5 py-0.5 rounded border border-[#2A2A2A]">
                            T = 發布日
                        </span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">比較過去 3 年每次發布前後的價格走勢 (以發布日收盤價歸零)</p>
                </div>

                {/* Legend / Info */}
                <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-neutral-400">低於前期</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-neutral-400">高於前期</span>
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            stroke="#525252"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#525252"
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null

                                // Calculate Stats for this specific day
                                const values = payload.map((p: any) => p.value as number)
                                const avg = values.reduce((a, b) => a + b, 0) / values.length
                                const max = Math.max(...values)
                                const min = Math.min(...values)
                                const upCount = values.filter(v => v > 0).length
                                const downCount = values.filter(v => v < 0).length

                                return (
                                    <div className="bg-[#0A0A0A]/95 backdrop-blur-md border border-[#333] p-3 rounded-lg shadow-xl text-xs">
                                        <div className="text-neutral-400 font-mono mb-2 border-b border-[#333] pb-1 flex justify-between gap-4">
                                            <span>{label}</span>
                                            <span className="text-neutral-500">n={values.length}</span>
                                        </div>

                                        <div className="space-y-1.5 min-w-[120px]">
                                            <div className="flex justify-between items-center">
                                                <span className="text-neutral-400">平均 (Avg)</span>
                                                <span className={cn(
                                                    "font-bold font-mono",
                                                    avg > 0 ? "text-green-400" : "text-red-400"
                                                )}>
                                                    {avg > 0 ? '+' : ''}{avg.toFixed(2)}%
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-1 border-t border-[#222]">
                                                <span>最高 (Max)</span>
                                                <span className="font-mono text-neutral-300">{max > 0 ? '+' : ''}{max.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-neutral-500">
                                                <span>最低 (Min)</span>
                                                <span className="font-mono text-neutral-300">{min > 0 ? '+' : ''}{min.toFixed(2)}%</span>
                                            </div>

                                            <div className="flex items-center gap-1 pt-1.5 mt-1 border-t border-[#222]">
                                                <div className="flex-1 h-1 bg-red-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500" style={{ width: `${(downCount / values.length) * 100}%` }} />
                                                </div>
                                                <div className="flex-1 h-1 bg-green-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500" style={{ width: `${(upCount / values.length) * 100}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-[9px] text-neutral-600 font-mono">
                                                <span>{downCount} Bear</span>
                                                <span>{upCount} Bull</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }}
                        />
                        <ReferenceLine x="T+0" stroke="#666" strokeDasharray="3 3" />

                        {processedEvents.map(evt => {
                            const isHovered = hoveredEvent === evt.date
                            // Opacity logic: if something is hovered, fade others. If nothing hovered, show all clearly but recent ones brighter?
                            // Simple logic: default opacity 0.5, hover 1.0. Recent events (top of list) thicker?

                            return (
                                <Line
                                    key={evt.date}
                                    type="monotone"
                                    dataKey={evt.date}
                                    stroke={evt.color}
                                    strokeWidth={isHovered ? 3 : 1.5}
                                    dot={false}
                                    opacity={hoveredEvent ? (isHovered ? 1 : 0.1) : 0.6}
                                    activeDot={{ r: 4 }}
                                    onMouseEnter={() => setHoveredEvent(evt.date)}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                    connectNulls
                                />
                            )
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
