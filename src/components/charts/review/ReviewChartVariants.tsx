'use client'

import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, AreaChart, Area, ResponsiveContainer, ReferenceArea
} from 'recharts'
import { HistoryChartTooltip } from '@/components/history/HistoryChartTooltip'
import { getChartSemanticModel, getSemanticColor } from '@/lib/chart-semantics'

// ----------------------------------------------------------------------------
// FlowChart
// ----------------------------------------------------------------------------
export function FlowChart({ data }: { data: any[] }) {
    return (
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="flow" isPercentage={false} />} cursor={{ fill: '#ffffff10' }} />
            <Bar dataKey="flow" fill="#ef4444">
                {data.map((entry: any, index: number) => {
                    const model = getChartSemanticModel('etfFlow')
                    return <Cell key={`cell-${index}`} fill={model ? getSemanticColor(entry.flow, model) : '#ef4444'} />
                })}
            </Bar>
        </BarChart>
    )
}

// ----------------------------------------------------------------------------
// FundingChart
// ----------------------------------------------------------------------------
export function FundingChart({ data }: { data: any[] }) {
    return (
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={45}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${Number(value).toFixed(3)}%`}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="funding" isPercentage={false} />} cursor={{ fill: '#ffffff10' }} />
            <ReferenceLine y={0} stroke="#666" strokeWidth={1.5} label={{ value: '中性', position: 'insideRight', fill: '#666', fontSize: 9 }} />
            <ReferenceLine y={0.05} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: '多頭擁擠', position: 'insideTopRight', fill: '#ef4444', fontSize: 8, opacity: 0.7 }} />
            <ReferenceLine y={-0.02} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: '空頭擁擠', position: 'insideBottomRight', fill: '#22c55e', fontSize: 8, opacity: 0.7 }} />
            <Bar dataKey="fundingRate" fill="#eab308">
                {data.map((entry: any, index: number) => {
                    const model = getChartSemanticModel('fundingRate')
                    return <Cell key={`cell-${index}`} fill={model ? getSemanticColor(entry.fundingRate, model) : '#eab308'} />
                })}
            </Bar>
        </BarChart>
    )
}

// ----------------------------------------------------------------------------
// FgiChart
// ----------------------------------------------------------------------------
export function FgiChart({ data, gradientId }: { data: any[], gradientId: string }) {
    return (
        <AreaChart data={data}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
            </defs>
            <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} label={{ value: '極恐', position: 'insideRight', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} label={{ value: '極貪', position: 'insideRight', fill: '#22c55e', fontSize: 10 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="fgi" isPercentage={false} />} cursor={{ stroke: '#ffffff20' }} />
            <Area
                type="monotone"
                dataKey="fgi"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
            />
        </AreaChart>
    )
}

// ----------------------------------------------------------------------------
// LiquidationChart
// ----------------------------------------------------------------------------
export function LiquidationChart({ data }: { data: any[] }) {
    return (
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="liquidation" isPercentage={false} />} cursor={{ fill: '#ffffff10' }} />
            <Bar dataKey="liquidation" fill="#f59e0b" />
        </BarChart>
    )
}

// ----------------------------------------------------------------------------
// LongShortChart
// ----------------------------------------------------------------------------
export function LongShortChart({ data, gradientId }: { data: any[], gradientId: string }) {
    return (
        <AreaChart data={data}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
            </defs>
            <ReferenceLine y={1} stroke="#fff" strokeWidth={1.5} strokeOpacity={0.8} label={{ value: '均衡 1.0', position: 'insideRight', fill: '#fff', fontSize: 9, fontWeight: 'bold' }} />
            <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: '偏多', position: 'insideTopRight', fill: '#ef4444', fontSize: 8, opacity: 0.6 }} />
            <ReferenceLine y={0.67} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: '偏空', position: 'insideBottomRight', fill: '#22c55e', fontSize: 8, opacity: 0.6 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="longShort" isPercentage={false} />} cursor={{ stroke: '#ffffff20' }} />
            <Area
                type="monotone"
                dataKey="longShortRatio"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
            />
        </AreaChart>
    )
}

// ----------------------------------------------------------------------------
// BasisChart
// ----------------------------------------------------------------------------
export function BasisChart({ data, gradientId }: { data: any[], gradientId: string }) {
    return (
        <AreaChart data={data}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="basis" isPercentage={false} />} cursor={{ stroke: '#ffffff20' }} />
            <Area
                type="monotone"
                dataKey="basis"
                stroke="#f59e0b"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
            />
        </AreaChart>
    )
}

// ----------------------------------------------------------------------------
// PremiumChart
// ----------------------------------------------------------------------------
export function PremiumChart({ data }: { data: any[] }) {
    return (
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${Number(value).toFixed(2)}%`}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="premium" isPercentage={false} />} cursor={{ fill: '#ffffff10' }} />
            <ReferenceLine y={0} stroke="#333" />
            <Bar dataKey="premium">
                {data.map((entry: any, index: number) => {
                    const model = getChartSemanticModel('premium')
                    return <Cell key={`cell-${index}`} fill={model ? getSemanticColor(entry.premium, model) : '#22c55e'} />
                })}
            </Bar>
        </BarChart>
    )
}

// ----------------------------------------------------------------------------
// StablecoinChart
// ----------------------------------------------------------------------------
export function StablecoinChart({ data, gradientId }: { data: any[], gradientId: string }) {
    return (
        <AreaChart data={data}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${(value / 1000000000).toFixed(0)}B`}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="stablecoin" isPercentage={false} />} cursor={{ stroke: '#ffffff20' }} />
            <Area
                type="monotone"
                dataKey="stablecoin"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
            />
        </AreaChart>
    )
}

// ----------------------------------------------------------------------------
// OpenInterestChart (Default Fallback)
// ----------------------------------------------------------------------------
export function OpenInterestChart({ data, gradientId, viewMode, focusWindow, getDateFromDaysDiff }: { data: any[], gradientId: string, viewMode: 'standard' | 'focus', focusWindow?: [number, number], getDateFromDaysDiff: (days: number) => string }) {
    return (
        <AreaChart data={data}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <YAxis
                hide={false}
                width={40}
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
            />
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str) => str.slice(5)}
            />
            <Tooltip content={<HistoryChartTooltip type="oi" isPercentage={false} />} cursor={{ stroke: '#ffffff20' }} />
            <Area
                type="monotone"
                dataKey="percentage"
                stroke="#eab308"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
            />
        </AreaChart>
    )
}

