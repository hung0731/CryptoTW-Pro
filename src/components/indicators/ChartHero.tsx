'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS, SPACING, CHART } from '@/lib/design-tokens';
import { IndicatorStory, ZONE_COLORS, getZoneLabel, YAxisModel } from '@/lib/indicator-stories';
import { getIndicatorExplanation } from '@/lib/chart-semantics';
import { useIndicatorChart, ChartDataPoint } from '@/hooks/useIndicatorChart';
import { SeasonalityHeatmap } from '@/components/indicators/SeasonalityHeatmap';
import { HalvingCycleChart } from '@/components/indicators/HalvingCycleChart';
import { DivergenceScreener } from '@/components/indicators/DivergenceScreener';

// ================================================
// HLPER FUNCTIONS
// ================================================

// 計算 Y 軸範圍（根據 yAxisModel）
function computeYBounds(data: ChartDataPoint[], model: YAxisModel): { min: number; max: number } {
    if (model.type === 'fixed') {
        return { min: model.min, max: model.max };
    }

    if (data.length === 0) {
        // 無數據時的預設值
        if (model.type === 'symmetric') {
            return { min: model.center - 1, max: model.center + 1 };
        }
        return { min: 0, max: 100 };
    }

    const values = data.map(d => d.value);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    if (model.type === 'symmetric') {
        // 對稱軸：以 center 為中心，上下對稱
        const maxDeviation = Math.max(
            Math.abs(dataMax - model.center),
            Math.abs(dataMin - model.center)
        ) * 1.1; // 留 10% 邊距
        return { min: model.center - maxDeviation, max: model.center + maxDeviation };
    }

    // auto: 自動縮放
    const range = dataMax - dataMin || 1;
    const padding = range * 0.1;
    return { min: dataMin - padding, max: dataMax + padding };
}

// 格式化 Y 軸數值
function formatYAxisValue(value: number, story: IndicatorStory): string {
    const format = story.chart.valueFormat;
    const unit = story.chart.unit;
    if (format === 'percent') return `${value.toFixed(2)}%`;
    if (format === 'ratio') return value.toFixed(2);
    if (unit === 'M') return `$${value.toFixed(0)}M`;
    if (unit === 'B') return `$${value.toFixed(1)}B`;
    return value.toFixed(1);
}

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

    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // 2. Y-Axis Logic
    const yAxisModel = story.chart.yAxisModel;
    const isFixedAxis = yAxisModel.type === 'fixed';

    const yBounds = useMemo(() =>
        computeYBounds(chartData, yAxisModel),
        [chartData, yAxisModel]
    );

    // 3. SVG Path Generator
    const generatePath = (data: ChartDataPoint[], accessor: 'value' | 'price', height: number, minVal?: number, maxVal?: number) => {
        if (data.length === 0) return '';

        const values = data.map(d => accessor === 'value' ? d.value : (d.price ?? 0));
        const min = minVal ?? Math.min(...values);
        const max = maxVal ?? Math.max(...values);
        const range = max - min || 1;

        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 400;
            const val = accessor === 'value' ? d.value : (d.price ?? 0);
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');
    };

    const hoverData = hoverIndex !== null && chartData[hoverIndex] ? chartData[hoverIndex] : null;

    // 4. Render Specialized Charts
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

    // 5. Render Standard Chart
    return (
        <div className="space-y-4">
            {/* Chart Container */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050505]">
                {/* Time Range Selector - Top Right */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-1">
                    {(['1M', '3M', '1Y'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "text-[10px] font-mono uppercase px-2 py-1 rounded",
                                timeRange === range
                                    ? "bg-white/10 text-white"
                                    : "text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                {/* Indicator Name - Top Left */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-medium", COLORS.textSecondary)}>{story.name}</span>
                        {loading && (
                            <span className="text-[9px] text-neutral-600">載入中...</span>
                        )}
                    </div>
                    {!loading && lastUpdated && (
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            <span className="text-[9px] text-neutral-600 font-mono">
                                {lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="text-[8px] text-neutral-700">（自動更新）</span>
                        </div>
                    )}
                </div>

                {/* Hover Info - Top Center (Design Token: CHART.tooltip) */}
                {hoverData && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 bg-black/90 rounded-lg px-3 py-2 border border-white/10">
                        <div className="flex items-center gap-3">
                            <span className={CHART.tooltip.date}>
                                {new Date(hoverData.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className={cn(CHART.tooltip.value, zoneColors.text)}>
                                {formatYAxisValue(hoverData.value, story)}
                            </span>
                            {hoverData.price && (
                                <span className="text-xs font-mono text-[#F59E0B]">
                                    ${hoverData.price.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {/* 語意解釋 */}
                        <span className="text-[9px] text-neutral-400 max-w-[200px] text-center">
                            {getIndicatorExplanation(story.id.replace(/-/g, ''), hoverData.value)}
                        </span>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* 上層：指標主圖 */}
                {/* ═══════════════════════════════════════════════ */}
                <div className="aspect-[16/9] w-full relative pt-12 pb-2 px-4">
                    {/* Zone Backgrounds - 所有指標都顯示 4 區間背景 */}
                    {isFixedAxis ? (
                        <div className="absolute inset-x-0 top-12 bottom-2 flex flex-col">
                            {/* 75-100: 高位區 */}
                            <div className="h-[25%] bg-red-500/[0.04] border-b border-red-500/10 relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-red-400/50 font-mono">
                                    {getZoneLabel(story.id, 'greed')}
                                </span>
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-600 font-mono">
                                    75
                                </span>
                            </div>
                            {/* 50-75: 偏高區 */}
                            <div className="h-[25%] bg-yellow-500/[0.02] border-b border-yellow-500/5 relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-yellow-400/30 font-mono">
                                    {getZoneLabel(story.id, 'lean_greed')}
                                </span>
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-600 font-mono">
                                    50
                                </span>
                            </div>
                            {/* 25-50: 偏低區 */}
                            <div className="h-[25%] bg-blue-500/[0.02] border-b border-blue-500/5 relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-blue-400/30 font-mono">
                                    {getZoneLabel(story.id, 'lean_fear')}
                                </span>
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-600 font-mono">
                                    25
                                </span>
                            </div>
                            {/* 0-25: 低位區 */}
                            <div className="h-[25%] bg-green-500/[0.04] relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-green-400/50 font-mono">
                                    {getZoneLabel(story.id, 'fear')}
                                </span>
                                <span className="absolute left-3 bottom-1 text-[9px] text-neutral-600 font-mono">
                                    0
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* 動態軸 - 同樣顯示 4 區間背景，但用動態 Y 軸標籤 */
                        <div className="absolute inset-x-0 top-12 bottom-2 flex flex-col">
                            {/* 高位區 (貪婪/過熱) */}
                            <div className="h-[25%] bg-red-500/[0.04] border-b border-red-500/10 relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-red-400/50 font-mono">
                                    {getZoneLabel(story.id, 'greed')}
                                </span>
                                <span className="absolute left-3 top-0 text-[9px] text-neutral-600 font-mono">
                                    {formatYAxisValue(yBounds.max, story)}
                                </span>
                            </div>
                            {/* 偏高區 */}
                            <div className="h-[25%] bg-yellow-500/[0.02] border-b border-yellow-500/5 relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-yellow-400/30 font-mono">
                                    {getZoneLabel(story.id, 'lean_greed')}
                                </span>
                            </div>
                            {/* 偏低區 */}
                            <div className="h-[25%] bg-blue-500/[0.02] border-b border-blue-500/5 relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-blue-400/30 font-mono">
                                    {getZoneLabel(story.id, 'lean_fear')}
                                </span>
                                {/* 對稱軸中心線 */}
                                {yAxisModel.type === 'symmetric' && (
                                    <span className="absolute left-3 bottom-0 text-[9px] text-neutral-500 font-mono">
                                        {yAxisModel.center}{story.chart.unit}
                                    </span>
                                )}
                            </div>
                            {/* 低位區 (恐懼/冷清) */}
                            <div className="h-[25%] bg-green-500/[0.04] relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-green-400/50 font-mono">
                                    {getZoneLabel(story.id, 'fear')}
                                </span>
                                <span className="absolute left-3 bottom-1 text-[9px] text-neutral-600 font-mono">
                                    {formatYAxisValue(yBounds.min, story)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Watermark (MANDATORY per design-tokens) */}
                    <div className={CHART.watermark.className}>
                        <img src={CHART.watermark.src} alt="" className="w-full h-full" />
                    </div>

                    {/* Horizontal Grid Lines (Design Token: CHART.grid) */}
                    <div className="absolute inset-x-4 top-12 bottom-2 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full h-px" style={{ background: CHART.grid.stroke, opacity: 0.5 }} />
                        ))}
                    </div>

                    {/* Y-Axis Label (Design Token: CHART.axis) */}
                    {isFixedAxis && (
                        <div className="absolute left-3 top-12" style={{ fontSize: CHART.axis.fontSize, color: CHART.axis.fill }}>
                            100
                        </div>
                    )}

                    {/* Indicator Line */}
                    <div
                        className="relative h-full flex items-center justify-center z-10"
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 400 100"
                            preserveAspectRatio="none"
                            onMouseMove={(e) => {
                                if (chartData.length === 0) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const ratio = x / rect.width;
                                const index = Math.min(
                                    Math.max(0, Math.floor(ratio * chartData.length)),
                                    chartData.length - 1
                                );
                                setHoverIndex(index);
                            }}
                        >
                            {chartData.length > 0 ? (
                                <polyline
                                    fill="none"
                                    stroke={CHART.linePrimary.stroke}
                                    strokeWidth={CHART.linePrimary.strokeWidth}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={generatePath(chartData, 'value', 100, yBounds.min, yBounds.max)}
                                />
                            ) : (
                                <polyline
                                    fill="none"
                                    stroke="#444"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points="0,50 400,50"
                                />
                            )}

                            {/* Hover vertical line */}
                            {hoverIndex !== null && chartData.length > 0 && (
                                <line
                                    x1={(hoverIndex / (chartData.length - 1)) * 400}
                                    y1="0"
                                    x2={(hoverIndex / (chartData.length - 1)) * 400}
                                    y2="100"
                                    stroke="white"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.3"
                                />
                            )}
                        </svg>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════ */}
                {/* 分隔線 + 標籤 */}
                {/* ═══════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 px-4 py-1.5 border-t border-white/[0.04]">
                    <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">比特幣走勢</span>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                </div>

                {/* ═══════════════════════════════════════════════ */}
                {/* 下層：BTC 價格走勢小圖 */}
                {/* ═══════════════════════════════════════════════ */}
                <div className="aspect-[16/3] w-full relative px-4 pb-4">
                    {/* BTC Price Line */}
                    <div
                        className="relative h-full bg-[#030303] rounded-lg border border-white/[0.03] overflow-hidden"
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 400 60"
                            preserveAspectRatio="none"
                            onMouseMove={(e) => {
                                if (chartData.length === 0) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const ratio = x / rect.width;
                                const index = Math.min(
                                    Math.max(0, Math.floor(ratio * chartData.length)),
                                    chartData.length - 1
                                );
                                setHoverIndex(index);
                            }}
                        >
                            {/* 情緒區間背景標示 - 只有 FGI 才顯示 */}
                            {isFixedAxis && chartData.length > 0 && (() => {
                                // 只標示貪婪 (≥75) 和 恐懼 (≤25)
                                type ZoneType = 'fear' | 'greed';
                                const zones: { start: number; end: number; type: ZoneType }[] = [];

                                const getZoneType = (val: number): ZoneType | null => {
                                    if (val <= 25) return 'fear';
                                    if (val >= 75) return 'greed';
                                    return null;
                                };

                                const getZoneColor = (type: ZoneType): string => ({
                                    fear: '#22C55E',   // 綠
                                    greed: '#EF4444',  // 紅
                                })[type];

                                let zoneStart = -1;
                                let zoneType: ZoneType | null = null;

                                for (let i = 0; i < chartData.length; i++) {
                                    const newType = getZoneType(chartData[i].value);

                                    if (newType !== zoneType) {
                                        if (zoneType !== null && zoneStart >= 0) {
                                            zones.push({ start: zoneStart, end: i - 1, type: zoneType });
                                        }
                                        if (newType !== null) {
                                            zoneStart = i;
                                        }
                                        zoneType = newType;
                                    }
                                }
                                if (zoneType !== null && zoneStart >= 0) {
                                    zones.push({ start: zoneStart, end: chartData.length - 1, type: zoneType });
                                }

                                return zones.map((zone, idx) => {
                                    const x1 = (zone.start / (chartData.length - 1)) * 400;
                                    const x2 = (zone.end / (chartData.length - 1)) * 400;
                                    const width = Math.max(x2 - x1, 2);
                                    return (
                                        <rect
                                            key={idx}
                                            x={x1}
                                            y={0}
                                            width={width}
                                            height={60}
                                            fill={getZoneColor(zone.type)}
                                            fillOpacity={0.12}
                                        />
                                    );
                                });
                            })()}

                            {chartData.length > 0 && chartData[0].price ? (
                                <polyline
                                    fill="none"
                                    stroke="#F59E0B"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={generatePath(chartData, 'price', 60)}
                                />
                            ) : (
                                <polyline
                                    fill="none"
                                    stroke="#F59E0B"
                                    strokeWidth="1.2"
                                    strokeOpacity="0.3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points="0,40 400,20"
                                />
                            )}

                            {/* Hover vertical line (synced) */}
                            {hoverIndex !== null && chartData.length > 0 && (
                                <line
                                    x1={(hoverIndex / (chartData.length - 1)) * 400}
                                    y1="0"
                                    x2={(hoverIndex / (chartData.length - 1)) * 400}
                                    y2="60"
                                    stroke="white"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.3"
                                />
                            )}
                        </svg>

                        {/* Y-Axis hint */}
                        <div className="absolute left-2 top-1 text-[8px] text-neutral-700 font-mono">
                            BTC
                        </div>
                        {chartData.length > 0 && chartData[0].price && chartData[chartData.length - 1].price && (
                            <div className="absolute right-2 top-1 text-[8px] text-[#F59E0B]/60 font-mono">
                                {(() => {
                                    const first = chartData[0].price!;
                                    const last = chartData[chartData.length - 1].price!;
                                    const pct = ((last - first) / first) * 100;
                                    return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
                                })()}
                            </div>
                        )}
                    </div>

                    {/* X-Axis Labels (shared with indicator chart) */}
                    <div className="absolute -bottom-1 left-4 right-4 flex justify-between text-[9px] text-neutral-700 font-mono">
                        <span>{timeRange === '1M' ? '1個月前' : timeRange === '3M' ? '3個月前' : '1年前'}</span>
                        <span>現在</span>
                    </div>
                </div>
            </div>

            {/* Position Statement - Below Chart */}
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

// 提取的 PositionStatement 組件 (被多處重複使用)
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
        <div className="px-1 pt-2">
            <div className="flex items-start gap-4">
                {/* 左側：大數字（即時數據 - 只有標準圖表有傳） */}
                {currentValue !== undefined && currentValue !== 0 && (
                    <div className="flex flex-col items-center">
                        <span className={cn(
                            "text-4xl font-mono font-bold tracking-tight",
                            zoneColors.text
                        )}>
                            {loading ? '—' : (
                                story.chart.valueFormat === 'percent'
                                    ? `${currentValue.toFixed(3)}%`
                                    : story.chart.valueFormat === 'ratio'
                                        ? currentValue.toFixed(2)
                                        : currentValue.toFixed(story.chart.unit === '' ? 0 : 1)
                            )}
                        </span>
                        <span className={cn("text-[10px] mt-0.5", COLORS.textTertiary)}>
                            {loading ? '載入中...' : '即時數據'}
                        </span>
                    </div>
                )}

                {/* 右側：區間標籤 + 說明 */}
                <div className="flex-1 space-y-1.5">
                    <span className={cn(
                        "inline-block text-[11px] px-2.5 py-1 rounded-full font-medium border",
                        zoneColors.bg, zoneColors.text, zoneColors.border
                    )}>
                        {loading ? '計算中...' : zoneLabel}
                    </span>
                    {story.positionRationale && (
                        <p className={cn("text-sm leading-relaxed", COLORS.textSecondary)}>
                            {story.positionRationale}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
