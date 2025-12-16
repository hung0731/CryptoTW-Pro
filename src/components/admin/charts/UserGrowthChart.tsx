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
import { CHARTS } from '@/lib/design-tokens'

interface UserGrowthData {
    date: string
    users: number
}

interface UserGrowthChartProps {
    data: UserGrowthData[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
    if (!data?.length) return <div className="h-[200px] flex items-center justify-center text-neutral-500">無數據</div>

    return (
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHARTS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHARTS.primary} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHARTS.grid} />
                <XAxis
                    dataKey="date"
                    stroke={CHARTS.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke={CHARTS.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: CHARTS.tooltip.bg,
                        borderColor: CHARTS.tooltip.border,
                        borderRadius: '0.5rem',
                        color: CHARTS.tooltip.text
                    }}
                    labelStyle={{ color: CHARTS.tooltip.label }}
                    itemStyle={{ color: CHARTS.tooltip.text }}
                />
                <Area
                    type="monotone"
                    dataKey="users"
                    stroke={CHARTS.primary}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
