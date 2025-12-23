'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
    Area, ComposedChart
} from 'recharts'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/design-tokens'
import STATIC_CYCLES from '@/data/halving-cycles.json'
import { ArrowUpRight, Timer, TrendingUp, Activity, AlertTriangle } from 'lucide-react'

// Constants
const NEXT_HALVING_BLOCK = 1050000 // 2028 Halving Block
const BLOCKS_PER_DAY = 144
const BLOCK_TIME_SEC = 600

interface CycleData {
    name: string
    halvingDate: string
    data: { day: number; roi: number; price?: number }[]
}

interface HalvingAPIResponse {
    cycle: CycleData
    currentBlockHeight: number
}

// ----------------------------------------------------------------------
// Sub-Component: Countdown Card
// ----------------------------------------------------------------------
function HalvingCountdown({ currentHeight }: { currentHeight: number }) {
    const [now] = useState(() => Date.now())
    const blocksLeft = NEXT_HALVING_BLOCK - currentHeight
    const secondsLeft = blocksLeft * BLOCK_TIME_SEC
    const daysLeft = Math.floor(secondsLeft / (3600 * 24))
    const dateEstimated = new Date(now + secondsLeft * 1000)

    return (
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-50" />

            <div className="flex items-center gap-2 mb-2 z-10">
                <Timer className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-neutral-400">2028 減半倒數</span>
            </div>

            <div className="text-3xl font-bold text-white z-10 font-mono tracking-tight">
                {blocksLeft > 0 ? blocksLeft.toLocaleString() : 'HOORAY'}
            </div>
            <div className="text-[10px] text-neutral-500 z-10 mb-2">剩餘區塊 (Blocks)</div>

            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${(1 - (blocksLeft / 210000)) * 100}%` }}
                />
            </div>
            <div className="flex justify-between w-full mt-1.5 px-0.5">
                <span className="text-[10px] text-neutral-600">預計日期</span>
                <span className="text-[10px] text-indigo-300 font-mono">{dateEstimated.toLocaleDateString()}</span>
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// Sub-Component: Stats Table
// ----------------------------------------------------------------------
function HalvingStatsTable({ currentData }: { currentData?: CycleData }) {
    const stats = [
        {
            label: 'Cycle 2 (2016)',
            peakRoi: '30x',
            daysToPeak: '518天',
            halvingPrice: '$650'
        },
        {
            label: 'Cycle 3 (2020)',
            peakRoi: '8x',
            daysToPeak: '549天',
            halvingPrice: '$8,800'
        },
        {
            label: 'Current (2024)',
            peakRoi: currentData ? `${Math.max(...currentData.data.map(d => d.roi)).toFixed(2)}x` : '...',
            daysToPeak: '進行中...',
            halvingPrice: '$63,900',
            highlight: true
        },
    ]

    return (
        <div className="col-span-1 md:col-span-2 bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    週期表現計分板
                </h3>
            </div>
            <div className="p-0">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] text-neutral-500 border-b border-white/[0.05]">
                            <th className="px-4 py-2 font-medium">週期</th>
                            <th className="px-4 py-2 font-medium">減半價</th>
                            <th className="px-4 py-2 font-medium">峰值倍數</th>
                            <th className="px-4 py-2 font-medium text-right">達峰天數</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((row, i) => (
                            <tr key={i} className={cn("text-xs group hover:bg-white/[0.02]", row.highlight && "bg-white/[0.02]")}>
                                <td className={cn("px-4 py-3 font-medium text-neutral-300", row.highlight && "text-yellow-400")}>
                                    {row.label}
                                </td>
                                <td className="px-4 py-3 text-neutral-400 font-mono">{row.halvingPrice}</td>
                                <td className={cn("px-4 py-3 font-mono", row.highlight ? "text-white font-bold" : "text-neutral-400")}>
                                    {row.peakRoi}
                                </td>
                                <td className="px-4 py-3 text-right text-neutral-500 font-mono">{row.daysToPeak}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// Main Component: Dashboard
// ----------------------------------------------------------------------
export function HalvingCycleChart() {
    const [apiData, setApiData] = useState<HalvingAPIResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/halving-status')
                const json = await res.json()
                if (json.cycle) {
                    setApiData(json)
                }
            } catch (error) {
                console.error('Failed to fetch halving data:', error)
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [])

    // Prepare Chart Data with Projection
    const chartData = useMemo(() => {
        const dataMap = new Map<number, any>()

        // 1. Static History
        STATIC_CYCLES.cycles.forEach(cycle => {
            if (cycle.name === 'Cycle 1 (2012)') return; // Ignore Cycle 1 for projection avg
            cycle.data.forEach(d => {
                const existing = dataMap.get(d.day) || { day: d.day }
                existing[cycle.name] = d.roi
                dataMap.set(d.day, existing)
            })
        })

        // 2. Current Cycle
        const currentData = apiData?.cycle.data || []
        const currentDayMax = currentData.length > 0 ? currentData[currentData.length - 1].day : 0

        currentData.forEach(d => {
            const existing = dataMap.get(d.day) || { day: d.day }
            existing['Current (2024)'] = d.roi
            dataMap.set(d.day, existing)
        })

        // 3. Projection (Average of Cycle 2 & 3)
        // Project for next 365 days from current day
        const projectionDays = []
        for (let i = 1; i <= 365; i++) {
            const day = currentDayMax + i
            const c2 = STATIC_CYCLES.cycles.find(c => c.name === 'Cycle 2 (2016)')?.data.find(d => d.day === day)?.roi
            const c3 = STATIC_CYCLES.cycles.find(c => c.name === 'Cycle 3 (2020)')?.data.find(d => d.day === day)?.roi

            if (c2 && c3) {
                const avgRoi = (c2 + c3) / 2
                // Keep projection aligned with current ROI scale shift if needed, but for now raw avg is safer as "fair value"
                // Or verify if we should scale it. Let's start with raw avg of historical performance at that Day.
                const existing = dataMap.get(day) || { day }
                existing['Projection'] = avgRoi
                dataMap.set(day, existing)
            }
        }

        return Array.from(dataMap.values())
            .filter(d => d.day >= -30 && d.day <= 900) // Focus view
            .sort((a, b) => a.day - b.day)
    }, [apiData])

    if (loading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-[#050505] rounded-2xl border border-white/[0.08]">
                <div className="flex flex-col items-center gap-2">
                    <span className="animate-spin text-2xl">⏳</span>
                    <span className="text-xs text-neutral-500 font-mono">Loading Dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HalvingCountdown currentHeight={apiData?.currentBlockHeight || 0} />
                <HalvingStatsTable currentData={apiData?.cycle} />
            </div>

            {/* Main Chart */}
            <div className="w-full bg-[#050505] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col p-4 relative">
                {/* Background Phases Annotations (Absolute) */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute left-[5%] top-0 bottom-0 w-[15%] bg-blue-500" /> {/* Pre-Halving */}
                    <div className="absolute left-[20%] top-0 bottom-0 w-[30%] bg-purple-500" /> {/* Accumulation */}
                    <div className="absolute left-[50%] top-0 bottom-0 w-[40%] bg-green-500" /> {/* Parabolic */}
                </div>

                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex flex-col gap-1">
                        <span className={cn("text-xs font-medium", COLORS.textSecondary)}>減半週期全景圖 (Log Scale)</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-[10px] text-neutral-400">目前位置 (ROI: {apiData?.cycle.data[apiData.cycle.data.length - 1]?.roi.toFixed(2)}x)</span>
                            <span className="w-2 h-2 rounded-full bg-indigo-400/50 dashed border border-indigo-400" />
                            <span className="text-[10px] text-neutral-400">理論路徑</span>
                        </div>
                    </div>
                </div>

                <div className="h-[450px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#555"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(val) => `D${val}`}
                                type="number"
                                domain={[-50, 800]}
                                allowDataOverflow
                            />
                            <YAxis
                                stroke="#555"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(val) => `${val}x`}
                                scale="log"
                                domain={[0.5, 30]} // Optimized for log view of recent cycles
                                allowDataOverflow
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }}
                                itemStyle={{ fontSize: '11px' }}
                                formatter={(value: number) => [`${value.toFixed(2)}x`, 'ROI']}
                                labelFormatter={(day) => `Day ${day} (Since Halving)`}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                            <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3" label={{ value: 'HALVING', fontSize: 9, fill: '#888', position: 'insideTopRight' }} />

                            {/* Historical Cycles */}
                            <Line type="monotone" dataKey="Cycle 2 (2016)" stroke="#3B82F6" strokeWidth={1} dot={false} opacity={0.4} />
                            <Line type="monotone" dataKey="Cycle 3 (2020)" stroke="#22C55E" strokeWidth={1} dot={false} opacity={0.4} />

                            {/* Projection Line */}
                            <Line
                                type="monotone"
                                dataKey="Projection"
                                stroke="#6366f1"
                                strokeWidth={2}
                                strokeDasharray="4 4" // Dashed
                                dot={false}
                                opacity={0.8}
                                name="理論路徑 (Avg)"
                            />

                            {/* Current Cycle (Highest Z-Index) */}
                            <Line
                                type="monotone"
                                dataKey="Current (2024)"
                                stroke="#F59E0B"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
