'use client'

import React, { useState, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, Cell, ReferenceArea, ReferenceLine, ComposedChart
} from 'recharts'
import { CHART, COLORS } from '@/lib/design-tokens'
import { formatPercent } from '@/lib/format-helpers'
import { getChartSemanticModel, getSemanticColor } from '@/lib/chart-semantics'
import { SkeletonReviewChart } from '@/components/SkeletonReviewChart'

// Extracted Components
import { ReviewChartTooltip } from '@/components/reviews/ReviewChartTooltip'
import { ReviewChartControls } from '@/components/reviews/ReviewChartControls'
import { useReviewChartData } from '@/hooks/useReviewChartData'

interface ReviewChartProps {
    type: 'price' | 'flow' | 'oi' | 'supply' | 'fgi' | 'funding' | 'liquidation' | 'longShort' | 'basis' | 'premium' | 'stablecoin';
    symbol: string;
    eventStart: string;
    eventEnd: string;
    daysBuffer?: number; // Optional buffer days to show context
    className?: string; // Default: CHART.heightDefault set in container
    reviewSlug?: string; // New prop to identify which review's data to pick
    focusWindow?: [number, number];
    isPercentage?: boolean;
    newsDate?: string;
    overrideData?: any[]; // Allow direct data injection
    overlayType?: 'oi' | 'funding'; // [NEW] Overlay support
}

export function ReviewChart({ type, symbol, eventStart, eventEnd, daysBuffer = 10, className, reviewSlug, focusWindow, isPercentage = false, newsDate, overrideData, overlayType }: ReviewChartProps) {
    const [viewMode, setViewMode] = useState<'standard' | 'focus'>('standard')

    // 1. Fetch Main Data
    const { data: mainData, loading: mainLoading, getDateFromDaysDiff } = useReviewChartData({
        type,
        eventStart,
        reviewSlug,
        viewMode,
        focusWindow,
        isPercentage,
        overrideData
    })

    // 2. Fetch Overlay Data (if requested)
    const { data: overlayDataRaw, loading: overlayLoading } = useReviewChartData({
        type: overlayType || 'price', // fallback, won't use if null
        eventStart,
        reviewSlug,
        viewMode,
        focusWindow,
        isPercentage: false,
    })

    // 3. Merge Data
    const mergedData = useMemo(() => {
        // If using overrideData, the data is already in mainData. Map it directly.
        if (overrideData) {
            return mainData.map((d: any) => ({
                ...d,
                [`overlay_${overlayType}`]: overlayType === 'oi' ? d.oi : d.fundingRate
            }));
        }

        if (!mainData) return [];
        if (!overlayType || !overlayDataRaw) return mainData;

        return mainData.map((d: any) => {
            const match = overlayDataRaw.find((o: any) => o.date === d.date);
            return {
                ...d,
                [`overlay_${overlayType}`]: match ? (overlayType === 'oi' ? match.oi : match.fundingRate) : null
            };
        });
    }, [mainData, overlayDataRaw, overlayType]);

    const loading = mainLoading || (!!overlayType && overlayLoading);
    const yDomain = type === 'price' ? ['auto', 'auto'] : ['auto', 'auto']; // Simplified for now

    if (loading) {
        return <SkeletonReviewChart />
    }

    if (!mergedData || mergedData.length === 0) return <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">尚無數據</div>

    // Gradient Definitions
    const gradientId = `gradient-${type}-${symbol}`

    // Render Overlay
    const renderOverlay = () => {
        if (!overlayType) return null;
        if (overlayType === 'oi') {
            return (
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="overlay_oi"
                    stroke="#f59e0b" // Orange
                    strokeWidth={2}
                    dot={false}
                    opacity={0.8}
                />
            );
        }
        if (overlayType === 'funding') {
            // Funding Rate usually needs its own small domain or it gets invisible
            // But let's try auto-scaled axis
            return (
                <Bar
                    yAxisId="right"
                    dataKey="overlay_funding"
                    fill="#eab308"
                    opacity={0.3}
                />
            );
        }
        return null;
    };

    return (
        <div className={`w-full relative ${className || CHART.heightDefault}`}>
            <ReviewChartControls
                viewMode={viewMode}
                setViewMode={setViewMode}
                focusWindow={focusWindow}
            />

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none opacity-[0.03]">
                <img
                    src="/logo.svg"
                    alt="CryptoTW Watermark"
                    className="w-48 h-48 grayscale"
                />
            </div>

            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                {type === 'price' || type === 'supply' ? (
                    <ComposedChart data={mergedData}>
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

                        {/* News Date Marker (Visual Aid) */}
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

                        {/* Analysis Window Markers (D-30 / D+30) */}
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

                        {/* MAIN AXIS - Default 0 */}
                        <YAxis
                            domain={['auto', 'auto']}
                            hide={false}
                            width={40}
                            tick={{ fontSize: 10, fill: '#525252' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (isPercentage && type === 'price') return `${value.toFixed(0)}%`
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                                return value
                            }}
                        />

                        {/* OVERLAY AXIS */}
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

                        {/* Needs custom tooltip to handle merged data and ignore missing props */}
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} overlayType={overlayType} />} cursor={{ stroke: '#ffffff20' }} />

                        <Area
                            type="monotone"
                            dataKey={isPercentage && type === 'price' ? "percentage" : "price"}
                            stroke="#EDEDED"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />

                        {renderOverlay()}

                    </ComposedChart>
                ) : type === 'flow' ? (
                    <BarChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ fill: '#ffffff10' }} />
                        <Bar
                            dataKey="flow"
                            fill="#ef4444"
                        >
                            {
                                mergedData.map((entry: any, index: number) => {
                                    const model = getChartSemanticModel('etfFlow')
                                    return <Cell key={`cell-${index}`} fill={model ? getSemanticColor(entry.flow, model) : '#ef4444'} />
                                })
                            }
                        </Bar>
                    </BarChart>
                ) : type === 'fgi' ? (
                    <AreaChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey="fgi"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'funding' ? (
                    <BarChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ fill: '#ffffff10' }} />
                        {/* Y=0 中軸線 */}
                        <ReferenceLine y={0} stroke="#666" strokeWidth={1.5} label={{ value: '中性', position: 'insideRight', fill: '#666', fontSize: 9 }} />
                        {/* 擁擠警戒區間 */}
                        <ReferenceLine y={0.05} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: '多頭擁擠', position: 'insideTopRight', fill: '#ef4444', fontSize: 8, opacity: 0.7 }} />
                        <ReferenceLine y={-0.02} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: '空頭擁擠', position: 'insideBottomRight', fill: '#22c55e', fontSize: 8, opacity: 0.7 }} />
                        <Bar dataKey="fundingRate" fill="#eab308">
                            {mergedData.map((entry: any, index: number) => {
                                const model = getChartSemanticModel('fundingRate')
                                return <Cell key={`cell-${index}`} fill={model ? getSemanticColor(entry.fundingRate, model) : '#eab308'} />
                            })}
                        </Bar>
                    </BarChart>
                ) : type === 'liquidation' ? (
                    <BarChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ fill: '#ffffff10' }} />
                        <Bar dataKey="liquidation" fill="#f59e0b" />
                    </BarChart>
                ) : type === 'longShort' ? (
                    <AreaChart data={mergedData}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {/* 多空均衡線 Y=1 */}
                        <ReferenceLine y={1} stroke="#fff" strokeWidth={1.5} strokeOpacity={0.8} label={{ value: '均衡 1.0', position: 'insideRight', fill: '#fff', fontSize: 9, fontWeight: 'bold' }} />
                        {/* 失衡警戒線 */}
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey="longShortRatio"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'basis' ? (
                    <AreaChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey="basis"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : type === 'premium' ? (
                    <BarChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ fill: '#ffffff10' }} />
                        <ReferenceLine y={0} stroke="#333" />
                        <Bar dataKey="premium">
                            {mergedData.map((entry: any, index: number) => {
                                const model = getChartSemanticModel('premium')
                                return <Cell key={`cell-${index}`} fill={model ? getSemanticColor(entry.premium, model) : '#22c55e'} />
                            })}
                        </Bar>
                    </BarChart>
                ) : type === 'stablecoin' ? (
                    <AreaChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey="stablecoin"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : (
                    // OI (Default fallback) - Wrapped in AreaChart like before
                    <AreaChart data={mergedData}>
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
                        <Tooltip content={<ReviewChartTooltip type={type} isPercentage={isPercentage} />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey="percentage"
                            stroke="#eab308"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}
