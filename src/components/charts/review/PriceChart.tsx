'use client'

import React from 'react'
import {
    ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceArea, ReferenceLine
} from 'recharts'
import { HistoryChartTooltip } from '@/components/history/HistoryChartTooltip'

interface PriceChartProps {
    data: any[]
    gradientId: string
    eventStart: string
    newsDate?: string
    isPercentage: boolean
    overlayType?: 'oi' | 'funding'
    viewMode: 'standard' | 'focus'
    focusWindow?: [number, number]
    getDateFromDaysDiff: (days: number) => string
    renderOverlay: () => React.ReactNode
}

export function PriceChart({
    data,
    gradientId,
    eventStart,
    newsDate,
    isPercentage,
    overlayType,
    viewMode,
    focusWindow,
    getDateFromDaysDiff,
    renderOverlay
}: PriceChartProps) {
    return (
        <ComposedChart data={data}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EDEDED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EDEDED" stopOpacity={0} />
                </linearGradient>
            </defs>
            {viewMode === 'standard' && focusWindow && (
                <ReferenceArea
                    x1={getDateFromDaysDiff(focusWindow[0])}
                    x2={getDateFromDaysDiff(focusWindow[1])}
                    strokeOpacity={0}
                    fill="#ffffff"
                    fillOpacity={0.05}
                />
            )}
            <ReferenceLine
                x={eventStart}
                stroke="#ef4444"
                strokeOpacity={0.8}
                strokeDasharray="3 3"
                label={{
                    value: `${eventStart.replace(/-/g, '.')} (D0)`,
                    position: 'insideTopLeft',
                    fill: '#666',
                    fontSize: 10,
                    fontWeight: 'bold',
                    opacity: 0.9,
                    dy: 10
                }}
            />

            {newsDate && newsDate !== eventStart && (
                <ReferenceLine
                    x={newsDate}
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    strokeDasharray="3 3"
                    label={{
                        value: '📰 新聞',
                        position: 'insideTopLeft',
                        fill: '#ffffff',
                        fontSize: 9,
                        opacity: 0.6,
                        dy: -10
                    }}
                />
            )}

            <ReferenceLine
                x={getDateFromDaysDiff(-30)}
                stroke="#ffffff"
                strokeOpacity={0.1}
                label={{ value: 'D-30', position: 'insideTopLeft', fill: '#ffffff', fontSize: 9, opacity: 0.3 }}
            />
            <ReferenceLine
                x={getDateFromDaysDiff(30)}
                stroke="#ffffff"
                strokeOpacity={0.1}
                label={{ value: 'D+30', position: 'insideTopRight', fill: '#ffffff', fontSize: 9, opacity: 0.3 }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)} // MM-DD
            />

            <YAxis
                domain={['auto', 'auto']}
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                    if (isPercentage) return `${value.toFixed(0)}%`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                    return value
                }}
            />

            {overlayType && (
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={['auto', 'auto']}
                    hide={false}
                    width={40}
                    tick={{ fontSize: 10, fill: '#f59e0b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                        if (overlayType === 'oi') return `${(value / 1000000000).toFixed(1)}B`
                        if (overlayType === 'funding') return `${value.toFixed(3)}%`
                        return value
                    }}
                />
            )}

            <Tooltip content={<HistoryChartTooltip type="price" isPercentage={isPercentage} overlayType={overlayType} />} cursor={{ stroke: '#ffffff20' }} />

            <Area
                type="monotone"
                dataKey={isPercentage ? "percentage" : "price"}
                stroke="#EDEDED"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
            />

            {renderOverlay()}
        </ComposedChart>
    )
}
