'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/design-tokens'
import STATIC_CYCLES from '@/data/halving-cycles.json'

interface CycleData {
    name: string
    halvingDate: string
    data: { day: number; roi: number; price?: number; date?: number }[]
}

const CYCLE_COLORS = {
    'Cycle 1 (2012)': '#A855F7', // Purple
    'Cycle 2 (2016)': '#3B82F6', // Blue
    'Cycle 3 (2020)': '#22C55E', // Green
    'Current (2024)': '#F59E0B', // Yellow (Highlight)
}

export function HalvingCycleChart() {
    const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCurrentCycle = async () => {
            try {
                const res = await fetch('/api/market/halving-status')
                const json = await res.json()
                if (json.cycle) {
                    setCurrentCycle(json.cycle)
                }
            } catch (error) {
                console.error('Failed to fetch halving status:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCurrentCycle()
    }, [])

    // Merge Data for Recharts
    // We need a unified X-Axis (Day) -> { day, c1_roi, c2_roi, c3_roi, curr_roi }
    const chartData = useMemo(() => {
        const dataMap = new Map<number, any>()

        // 1. Process Static Cycles
        STATIC_CYCLES.cycles.forEach(cycle => {
            cycle.data.forEach(d => {
                const existing = dataMap.get(d.day) || { day: d.day }
                // @ts-ignore
                existing[cycle.name] = d.roi
                dataMap.set(d.day, existing)
            })
        })

        // 2. Process Current Cycle
        if (currentCycle) {
            currentCycle.data.forEach(d => {
                const existing = dataMap.get(d.day) || { day: d.day }
                // @ts-ignore
                existing['Current (2024)'] = d.roi
                dataMap.set(d.day, existing)
            })
        }

        // 3. Convert to Array and Sort
        return Array.from(dataMap.values()).sort((a, b) => a.day - b.day)
    }, [currentCycle])

    if (loading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-[#050505] rounded-2xl border border-white/[0.08]">
                <div className="flex flex-col items-center gap-2">
                    <LoaderIcon />
                    <span className="text-xs text-neutral-500 font-mono">Loading cycles...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-[#050505] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                    <span className={cn("text-xs font-medium", COLORS.textSecondary)}>比特幣減半週期對比</span>
                    <span className="text-[10px] text-neutral-600 font-mono">X軸: 減半後天數 / Y軸: 投資回報倍數 (ROI)</span>
                </div>
                {currentCycle && (
                    <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-500 font-mono">
                        Day {currentCycle.data[currentCycle.data.length - 1]?.day}
                    </div>
                )}
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#555"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(val) => `D${val}`}
                            type="number"
                            domain={[-100, 1000]} // Focus view
                            allowDataOverflow={true}
                        />
                        <YAxis
                            stroke="#555"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(val) => `${val}x`}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }}
                            itemStyle={{ fontSize: '11px' }}
                            formatter={(value: number) => [`${value.toFixed(2)}x`, 'ROI']}
                            labelFormatter={(day) => `Day ${day} (Since Halving)`}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                        <ReferenceLine x={0} stroke="#444" strokeDasharray="3 3" label={{ value: 'HALVING', fontSize: 9, fill: '#666', position: 'insideTopRight' }} />

                        {STATIC_CYCLES.cycles.map(cycle => (
                            <Line
                                key={cycle.name}
                                type="monotone"
                                dataKey={cycle.name}
                                // @ts-ignore
                                stroke={CYCLE_COLORS[cycle.name] || '#888'}
                                strokeWidth={1.5}
                                dot={false}
                                connectNulls
                                opacity={0.6}
                                activeDot={{ r: 4 }}
                            />
                        ))}

                        <Line
                            type="monotone"
                            dataKey="Current (2024)"
                            stroke={CYCLE_COLORS['Current (2024)']}
                            strokeWidth={3}
                            dot={false}
                            connectNulls
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] grid grid-cols-2 gap-4">
                <div className="text-[10px] text-neutral-500">
                    <span className="block text-white mb-1 font-medium">當前進度</span>
                    本週期目前處於第 {currentCycle?.data[currentCycle.data.length - 1]?.day} 天，
                    ROI 為 {currentCycle?.data[currentCycle.data.length - 1]?.roi.toFixed(2)}x。
                    相較於 Cycle 2 (2016) 同期，表現{getComparisonText(currentCycle, 'Cycle 2 (2016)')}。
                </div>
                <div className="text-[10px] text-neutral-500">
                    <span className="block text-white mb-1 font-medium">觀察重點</span>
                    如果黃色線持續低於藍色線 (2016) 或紫色線 (2012)，代表本輪牛市動能較弱，或週期拉長（Left-Translated vs Right-Translated）。
                </div>
            </div>
        </div>
    )
}

function LoaderIcon() {
    return (
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-neutral-500"></span>
        </span>
    )
}

function getComparisonText(current: any, targetName: string) {
    if (!current) return '...'
    const currentDay = current.data[current.data.length - 1]?.day
    const currentRoi = current.data[current.data.length - 1]?.roi

    // Find target cycle roi at similar day
    const targetCycle = STATIC_CYCLES.cycles.find(c => c.name === targetName)
    if (!targetCycle) return '...'

    // Find closest day
    const targetPoint = targetCycle.data.reduce((prev, curr) =>
        Math.abs(curr.day - currentDay) < Math.abs(prev.day - currentDay) ? curr : prev
    )

    if (Math.abs(targetPoint.day - currentDay) > 30) return '無法對比' // Too far apart

    if (currentRoi > targetPoint.roi) return '較強'
    if (currentRoi < targetPoint.roi) return '較弱'
    return '持平'
}
