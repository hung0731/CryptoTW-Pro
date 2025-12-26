'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

// Define the shape of data passed to this component
interface HistoricalTableProps {
    events: any[]
    variant?: 'default' | 'minimal'
}

export function HistoricalEventTable({ events, variant = 'default' }: HistoricalTableProps) {
    if (!events || events.length === 0) return null

    const Container = variant === 'default' ? 'div' : React.Fragment
    const containerClass = variant === 'default' ? "w-full border border-[#1A1A1A] rounded-xl overflow-hidden bg-[#0A0A0A]" : "w-full bg-transparent"

    return (
        <div className={containerClass}>
            {variant === 'default' && (
                <div className="bg-[#0F0F10] border-b border-[#1A1A1A] px-4 py-3">
                    <h3 className="text-sm font-bold text-white">歷史數據明細</h3>
                </div>
            )}

            <div className={cn(
                "overflow-x-auto",
                variant === 'minimal' && "rounded-none border-t border-[#1A1A1A]"
            )}>
                <Table>
                    <TableHeader className="bg-[#0A0A0A]">
                        <TableRow className="border-b border-[#1A1A1A] hover:bg-transparent">
                            <TableHead className="w-[120px] text-xs font-mono text-neutral-500">日期</TableHead>
                            <TableHead className="w-[60px] text-xs font-mono text-neutral-500 text-center">7日走勢</TableHead>
                            <TableHead className="text-right text-xs font-mono text-neutral-500">公佈 / 前期</TableHead>
                            <TableHead className="text-right text-neutral-400 font-medium text-xs">單日漲跌</TableHead>
                            <TableHead className="text-right text-neutral-400 font-medium text-xs">單週漲跌</TableHead>
                            <TableHead className="text-right text-neutral-400 font-medium text-xs">最大回撤</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((evt) => {
                            const dateStr = evt.date
                            const actual = evt.actual
                            const forecast = evt.forecast
                            const hasData = actual && forecast

                            const d1Return = evt.stats?.d0d1Return || 0
                            const maxDrawdown = evt.stats?.maxDrawdown || 0

                            // Calculate D+7 Return & Prepare Sparkline Data
                            let d7Return: number | null = null
                            let sparklineData: any[] = []

                            if (evt.priceData && evt.priceData.length > 0) {
                                // Find T0 index
                                const t0Index = evt.priceData.findIndex((p: any) => p.date === dateStr)
                                if (t0Index !== -1) {
                                    // D+7 Calculation
                                    if (t0Index + 7 < evt.priceData.length) {
                                        const t0Close = evt.priceData[t0Index].close
                                        const t7Close = evt.priceData[t0Index + 7].close
                                        if (t0Close) {
                                            d7Return = Number(((t7Close - t0Close) / t0Close * 100).toFixed(1))
                                        }
                                    }

                                    // Sparkline Data (T0 to T+7, or valid range)
                                    // Slice up to 8 points (T0...T7)
                                    const slice = evt.priceData.slice(t0Index, t0Index + 8)
                                    sparklineData = slice.map((p: any, i: number) => ({ i, c: p.close }))
                                }
                            }

                            // Determine Trend Color for Sparkline
                            const isUpTrend = d7Return !== null ? d7Return > 0 : (d1Return > 0)
                            const chartColor = isUpTrend ? '#34d399' : '#f87171' // emerald-400 : red-400

                            // Surprise Color Logic
                            const surpriseColor = hasData
                                ? (parseFloat(actual) > parseFloat(forecast) ? "text-emerald-400" : "text-red-400")
                                : "text-neutral-400"

                            return (
                                <TableRow key={dateStr} className="border-b border-[#1A1A1A] hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="font-mono text-neutral-400 text-xs text-nowrap">
                                        {dateStr}
                                    </TableCell>

                                    {/* Sparkline Chart */}
                                    <TableCell className="p-1">
                                        <div className="w-[60px] h-[24px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">
                                            {sparklineData.length > 1 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={sparklineData}>
                                                        <Line
                                                            type="monotone"
                                                            dataKey="c"
                                                            stroke={chartColor}
                                                            strokeWidth={1.2}
                                                            dot={false}
                                                            isAnimationActive={false}
                                                        />
                                                        <YAxis domain={['auto', 'auto']} hide />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-[10px] text-neutral-700">-</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <div className={cn("font-bold font-mono text-xs", surpriseColor)}>
                                                {actual || '-'}
                                            </div>
                                            <div className="text-[10px] text-neutral-500 font-mono scale-90 origin-right">
                                                Fcst: {forecast || '-'}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* D+1 */}
                                    <TableCell className="text-right">
                                        <div className={cn(
                                            "flex items-center justify-end gap-1 font-mono text-xs font-bold",
                                            d1Return > 0 ? "text-emerald-400" : (d1Return < 0 ? "text-red-400" : "text-neutral-400")
                                        )}>
                                            {d1Return > 0 ? '+' : ''}{d1Return.toFixed(1)}%
                                        </div>
                                    </TableCell>

                                    {/* D+7 */}
                                    <TableCell className="text-right">
                                        {d7Return !== null ? (
                                            <div className={cn(
                                                "flex items-center justify-end gap-1 font-mono text-xs font-bold",
                                                d7Return > 0 ? "text-emerald-400" : (d7Return < 0 ? "text-red-400" : "text-neutral-400")
                                            )}>
                                                {d7Return > 0 ? '+' : ''}{d7Return.toFixed(1)}%
                                            </div>
                                        ) : (
                                            <span className="text-neutral-600 text-xs">-</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right text-red-500 font-mono text-xs">
                                        {maxDrawdown !== 0 ? `${maxDrawdown}%` : '-'}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
