'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceArea, ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS, SPACING, CHART } from '@/lib/design-tokens';
import { IndicatorStory, ZONE_COLORS, getZoneLabel, YAxisModel } from '@/lib/indicator-stories';
import { getIndicatorExplanation } from '@/lib/chart-semantics';
import { useIndicatorChart, ChartDataPoint } from '@/hooks/useIndicatorChart';
import { Skeleton } from '@/components/ui/skeleton';
import { SeasonalityHeatmap } from '@/components/indicators/SeasonalityHeatmap';
import { UniversalCard } from '@/components/ui/UniversalCard';

// Dynamic import for heavy chart components
const HalvingCycleChart = dynamic(
    () => import('@/components/indicators/HalvingCycleChart').then(mod => ({ default: mod.HalvingCycleChart })),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5" />
    }
);

const DivergenceScreener = dynamic(
    () => import('@/components/indicators/DivergenceScreener').then(mod => ({ default: mod.DivergenceScreener })),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[600px] w-full rounded-2xl bg-white/5" />
    }
);

// ================================================
// COMPONENT
// ================================================

interface ChartHeroProps {
    story: IndicatorStory;
}

export function ChartHero({ story }: ChartHeroProps) {
    // 1. Logic Hook
    const {
        chartData,
        loading,
        timeRange,
        setTimeRange,
        lastUpdated,
        currentValue,
        zoneColors,
        zoneLabel
    } = useIndicatorChart(story);

    // 2. Y-Axis Logic (for Recharts domain)
    const yAxisModel = story.chart.yAxisModel;
    const isFixedAxis = yAxisModel.type === 'fixed';

    const yDomain = useMemo(() => {
        if (isFixedAxis) return [yAxisModel.min, yAxisModel.max];
        // Auto domain logic handled by Recharts 'auto', but we can refine if needed
        return ['auto', 'auto'];
    }, [isFixedAxis, yAxisModel]);

    // 3. Render Specialized Charts
    // Note: These will be refactored to specific cards in their own files, 
    // but here we ensure they are rendered cleanly.
    if (story.chart.type === 'heatmap') {
        return (
            <div className="space-y-4">
                <SeasonalityHeatmap />
                <PositionStatement story={story} zoneColors={zoneColors} zoneLabel={zoneLabel} />
            </div>
        )
    }

    if (story.chart.type === 'halving') {
        return (
            <div className="space-y-4">
                <HalvingCycleChart />
                <PositionStatement story={story} zoneColors={zoneColors} zoneLabel={zoneLabel} />
            </div>
        )
    }

    if (story.chart.type === 'screener') {
        return (
            <div className="space-y-4">
                <DivergenceScreener />
                <PositionStatement story={story} zoneColors={zoneColors} zoneLabel={zoneLabel} />
            </div>
        )
    }

    // 4. Render Standard Chart (Recharts)
    const gradientId = `gradient-${story.id}`;
    // Fallback color since 'color' property might not exist on IndicatorStory type yet
    const chartColor = "#EDEDED";

    return (
        <div className="space-y-4">
            {/* Chart Container - Matches ReviewChart visuals */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[350px]">
                <UniversalCard variant="luma" className="w-full h-full p-0 overflow-hidden flex flex-col relative">
                    {/* Header Overlay */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white shadow-black drop-shadow-md">{story.name}</h2>
                            {loading && <span className="text-[10px] text-neutral-400">載入中...</span>}
                        </div>
                        {!loading && lastUpdated && (
                            <div className="flex items-center gap-1.5 opacity-80">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    {lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Time Range Selector - Absolute Top Right */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-lg p-1 border border-white/5">
                        {(['1M', '3M', '1Y'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "text-[10px] font-mono px-2 py-1 rounded transition-all",
                                    timeRange === range
                                        ? "bg-[#F59E0B] text-black font-bold"
                                        : "text-neutral-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Watermark */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none opacity-[0.03]">
                        <img
                            src="/logo.svg"
                            alt=""
                            className="w-48 h-48 grayscale"
                        />
                    </div>

                    {/* Recharts Implementation */}
                    <div className="flex-1 w-full min-h-0 relative z-10 pt-16 pb-2 pr-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                {/* Background Zones (Fixed Axis Only) */}
                                {isFixedAxis && (
                                    <>
                                        <ReferenceArea y1={75} y2={100} fill="#EF4444" fillOpacity={0.03} strokeOpacity={0} />
                                        <ReferenceArea y1={0} y2={25} fill="#22C55E" fillOpacity={0.03} strokeOpacity={0} />
                                        <ReferenceLine y={50} stroke="#ffffff" strokeOpacity={0.1} strokeDasharray="3 3" />
                                    </>
                                )}

                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />

                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    tick={{ fontSize: 10, fill: '#525252' }}
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={40}
                                />
                                <YAxis
                                    yAxisId="left"
                                    domain={yDomain}
                                    hide={false}
                                    width={40}
                                    tick={{ fontSize: 10, fill: '#525252' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => {
                                        if (story.chart.valueFormat === 'percent') return `${val}%`;
                                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                                        return val.toFixed(0);
                                    }}
                                />
                                {chartData.length > 0 && chartData[0].price && (
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        domain={['auto', 'auto']}
                                        hide={true} // Hide axis but allow plotting
                                    />
                                )}

                                <Tooltip content={<CustomTooltip story={story} />} cursor={{ stroke: '#ffffff', strokeOpacity: 0.1 }} />

                                {/* Main Indicator Area */}
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="value"
                                    stroke={chartColor}
                                    strokeWidth={2}
                                    fill={`url(#${gradientId})`}
                                    activeDot={{ r: 4, strokeWidth: 0, fill: chartColor }}
                                />

                                {/* BTC Price Overlay */}
                                {chartData.length > 0 && chartData[0].price && (
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#F59E0B"
                                        strokeWidth={1.5}
                                        dot={false}
                                        opacity={0.5}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* BTC Label Overlay */}
                    <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-2 py-1 rounded text-[9px] text-[#F59E0B]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                            BTC Price
                        </div>
                    </div>
                </UniversalCard>
            </div>

            {/* Position Statement */}
            <PositionStatement
                story={story}
                zoneColors={zoneColors}
                zoneLabel={zoneLabel}
                currentValue={currentValue}
                loading={loading}
            />
        </div>
    );
}

// ================================================
// SUB-COMPONENTS
// ================================================

function CustomTooltip({ active, payload, label, story }: any) {
    if (active && payload && payload.length) {
        const date = new Date(label);
        const value = payload[0].value;
        const price = payload[0].payload.price; // Access price from data point

        return (
            <div className="bg-[#0F0F10]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl min-w-[140px]">
                <p className={CHART.tooltip.date}>
                    {date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </p>
                <div className="space-y-1 mt-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-neutral-400">{story.name}</span>
                        <span className="text-sm font-bold text-white font-mono">
                            {story.chart.valueFormat === 'percent' ? `${value.toFixed(2)}%` : value.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 max-w-[180px] leading-tight pt-1 border-t border-white/5 mt-1">
                        {getIndicatorExplanation(story.id.replace(/-/g, ''), value)}
                    </p>

                    {price && (
                        <div className="pt-1 mt-1 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
                            <span className="text-[#F59E0B] font-medium">BTC</span>
                            <span className="text-neutral-200 tabular-nums font-mono">
                                ${price.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
}

function PositionStatement({
    story,
    zoneColors,
    zoneLabel,
    currentValue,
    loading
}: {
    story: IndicatorStory;
    zoneColors: typeof ZONE_COLORS['fear'];
    zoneLabel: string;
    currentValue?: number;
    loading?: boolean;
}) {
    return (
        <UniversalCard variant="luma" className="p-4 bg-[#0A0A0A]/50">
            <div className="flex items-start gap-5">
                {/* Left: Value */}
                {currentValue !== undefined && currentValue !== 0 && (
                    <div className="flex flex-col items-center flex-shrink-0">
                        <span className={cn(
                            "text-3xl font-mono font-bold tracking-tight",
                            zoneColors.text
                        )}>
                            {loading ? '—' : (
                                story.chart.valueFormat === 'percent'
                                    ? `${currentValue.toFixed(2)}%`
                                    : story.chart.valueFormat === 'ratio'
                                        ? currentValue.toFixed(2)
                                        : currentValue.toFixed(story.chart.unit === '' ? 0 : 1)
                            )}
                        </span>
                        <span className="text-[10px] text-neutral-500 mt-1">即時數值</span>
                    </div>
                )}

                {/* Right: Context */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border",
                            zoneColors.bg, zoneColors.text, zoneColors.border
                        )}>
                            {loading ? '—' : zoneLabel}
                        </span>
                    </div>
                    {story.positionRationale && (
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            {story.positionRationale}
                        </p>
                    )}
                </div>
            </div>
        </UniversalCard>
    )
}
