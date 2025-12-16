'use client'

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { CHARTS } from '@/lib/design-tokens'

interface VolumeTrendChartProps {
    data: { date: string; volume: number; commission: number }[]
}

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
}

export function VolumeTrendChart({ data }: VolumeTrendChartProps) {
    if (!data || data.length === 0) return <div className="h-[250px] flex items-center justify-center text-neutral-500 text-sm">無數據</div>

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHARTS.grid} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: CHARTS.axis, fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        tick={{ fill: CHARTS.axis, fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatCurrency}
                        width={40}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: CHARTS.axis, fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: CHARTS.tooltip.bg,
                            border: `1px solid ${CHARTS.tooltip.border}`,
                            borderRadius: '8px',
                            color: CHARTS.tooltip.text
                        }}
                        itemStyle={{ fontSize: '12px', color: CHARTS.tooltip.text }}
                        cursor={{ fill: CHARTS.grid }} // Use grid color as hover background
                        formatter={(value: number, name: string) => [
                            name === 'volume' ? formatCurrency(value) : `$${value.toLocaleString()}`,
                            name === 'volume' ? '交易量' : '返佣'
                        ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: CHARTS.tooltip.label }} />
                    <Bar yAxisId="left" dataKey="volume" name="交易量" fill={CHARTS.axis} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar yAxisId="right" dataKey="commission" name="返佣" fill={CHARTS.primary} radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
