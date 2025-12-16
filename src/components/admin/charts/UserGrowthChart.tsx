'use client'

import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { CHART, chartTooltipProps } from '@/lib/design-tokens'

interface UserGrowthChartProps {
    data: { date: string; value: number }[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
    if (!data || data.length === 0) return <div className="h-[200px] flex items-center justify-center text-neutral-500 text-sm">無數據</div>

    return (
        <div className="w-full h-[200px] relative">
            <div className={CHART.watermark.className}>
                <img src={CHART.watermark.src} alt="watermark" />
            </div>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART.linePrimary.stroke} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={CHART.linePrimary.stroke} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid {...CHART.grid} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={CHART.axis}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        tick={CHART.axis}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                    />
                    <Tooltip
                        {...chartTooltipProps}
                        cursor={{ stroke: '#ffffff20' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={CHART.linePrimary.stroke}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        strokeWidth={CHART.linePrimary.strokeWidth}
                        name="新增用戶"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
