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

interface UserGrowthChartProps {
    data: { date: string; value: number }[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
    if (!data || data.length === 0) return <div className="h-[200px] flex items-center justify-center text-neutral-500 text-sm">無數據</div>

    return (
        <div style={{ width: '100%', height: 200 }}>
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
                            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#737373', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        tick={{ fill: '#737373', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                        cursor={{ stroke: '#ffffff20' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#60A5FA"
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        strokeWidth={2}
                        name="新增用戶"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
