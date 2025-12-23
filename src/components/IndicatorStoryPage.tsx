'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Info, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS, SPACING, CHART } from '@/lib/design-tokens';
import { IndicatorStory, ZONE_COLORS, getZoneLabel, YAxisModel } from '@/lib/indicator-stories';
import { REVIEWS_DATA } from '@/lib/reviews-data';
import { getIndicatorExplanation, CHART_SEMANTIC_MODELS } from '@/lib/chart-semantics';
import { getRelatedEvents, getRelatedIndicators, getPrerequisiteConcepts } from '@/lib/semantic-linkage';
import { SeasonalityHeatmap } from '@/components/indicators/SeasonalityHeatmap';
import { HalvingCycleChart } from '@/components/indicators/HalvingCycleChart';
import { DivergenceScreener } from '@/components/indicators/DivergenceScreener';

// ================================================
// SECTION CARD - 統一容器
// ================================================
interface SectionCardProps {
    children: React.ReactNode;
    className?: string;
}

function SectionCard({ children, className }: SectionCardProps) {
    return (
        <section className={cn(CARDS.primary, SPACING.card, className)}>
            {children}
        </section>
    );
}

// ================================================
// ⓪ CHART HERO - 雙層圖表 (Above the fold)
// 動態 Y 軸：根據 yAxisModel 決定軸範圍
// ================================================
interface ChartHeroProps {
    story: IndicatorStory;
}

interface ChartDataPoint {
    date: number;
    value: number;
    price?: number;
}

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

function ChartHero({ story }: ChartHeroProps) {
    const [timeRange, setTimeRange] = React.useState<'1M' | '3M' | '1Y'>('3M');
    const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

    // 即時數據狀態（從 API 獲取）
    const [liveCurrentValue, setLiveCurrentValue] = React.useState<number | null>(null);
    const [liveZone, setLiveZone] = React.useState<'fear' | 'lean_fear' | 'lean_greed' | 'greed' | null>(null);

    // 自動刷新狀態
    const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
    const refreshIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const AUTO_REFRESH_INTERVAL = 60 * 1000; // 60 秒

    // 使用即時數據或靜態數據
    const currentValue = liveCurrentValue ?? story.currentValue ?? 0;
    const currentZone = liveZone ?? story.zone;
    const zoneColors = ZONE_COLORS[currentZone];
    const zoneLabel = getZoneLabel(story.id, currentZone);

    // Y 軸模型
    const yAxisModel = story.chart.yAxisModel;
    const isFixedAxis = yAxisModel.type === 'fixed';

    // 計算動態 Y 軸範圍
    const yBounds = React.useMemo(() =>
        computeYBounds(chartData, yAxisModel),
        [chartData, yAxisModel]
    );

    // 獲取真實數據的回調函數
    const fetchData = React.useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);

        const endpoint = story.chart.api.endpoint;
        const params = new URLSearchParams({
            range: timeRange,
            ...(story.chart.api.params as Record<string, string>)
        });

        try {
            // 並行獲取指標數據和 BTC 價格（非 FGI 的話才需要 BTC 價格）
            const indicatorFetch = fetch(`${endpoint}?${params.toString()}`).then(res => res.json());
            const btcPriceFetch = !isFixedAxis
                ? fetch(`/api/coinglass/fear-greed?range=${timeRange}`).then(res => res.json())
                : Promise.resolve(null);

            const [indicatorData, btcData] = await Promise.all([indicatorFetch, btcPriceFetch]);

            if (!indicatorData.history) {
                console.warn(`No history data found for ${story.slug}`);
                setChartData([]);
                return;
            }

            // 設置即時當前值（從 API 響應中獲取）
            if (indicatorData.current?.value !== undefined) {
                const value = indicatorData.current.value;
                setLiveCurrentValue(value);

                // 根據指標的 zones 設定計算 zone
                const zones = story.chart.zones;
                if (value <= zones.fear.max) {
                    setLiveZone('fear');
                } else if (value <= zones.leanFear.max) {
                    setLiveZone('lean_fear');
                } else if (value <= zones.leanGreed.max) {
                    setLiveZone('lean_greed');
                } else {
                    setLiveZone('greed');
                }
            }

            // 合併 BTC 價格數據（如果有）
            if (btcData?.history && btcData.history.length > 0) {
                const priceMap = new Map<number, number>();
                btcData.history.forEach((item: { date: number; price: number }) => {
                    const dayKey = Math.floor(item.date / 86400000) * 86400000;
                    priceMap.set(dayKey, item.price);
                });

                const mergedData = indicatorData.history.map((item: ChartDataPoint) => {
                    const dayKey = Math.floor(item.date / 86400000) * 86400000;
                    let price = priceMap.get(dayKey);
                    if (!price) {
                        const keys = Array.from(priceMap.keys()).sort((a, b) =>
                            Math.abs(a - item.date) - Math.abs(b - item.date)
                        );
                        if (keys.length > 0) {
                            price = priceMap.get(keys[0]);
                        }
                    }
                    return { ...item, price: price || 0 };
                });
                setChartData(mergedData);
            } else {
                setChartData(indicatorData.history);
            }

            // 更新最後刷新時間
            setLastUpdated(new Date());
        } catch (err) {
            console.error(`Failed to fetch chart data for ${story.slug}:`, err);
            setChartData([]);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, [story.slug, timeRange, story.chart.api.endpoint, story.chart.api.params, isFixedAxis, story.chart.zones]);

    // 初始加載和自動刷新
    React.useEffect(() => {
        void fetchData(true); // 初始加載

        // 設置 60 秒自動刷新
        refreshIntervalRef.current = setInterval(() => {
            void fetchData(false); // 背景刷新（不顯示 loading）
        }, AUTO_REFRESH_INTERVAL);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [fetchData, AUTO_REFRESH_INTERVAL]);


    // 將數據轉換為 SVG 路徑點（使用動態 Y 軸範圍）
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

    // Hover info
    const hoverData = hoverIndex !== null && chartData[hoverIndex] ? chartData[hoverIndex] : null;

    if (story.chart.type === 'heatmap') {
        return (
            <div className="space-y-4">
                <SeasonalityHeatmap />
                {/* Position Statement - Below Chart (Reused) */}
                <div className="px-1 pt-2">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-1.5">
                            <span className={cn(
                                "inline-block text-[11px] px-2.5 py-1 rounded-full font-medium border",
                                zoneColors.bg, zoneColors.text, zoneColors.border
                            )}>
                                {zoneLabel}
                            </span>
                            {story.positionRationale && (
                                <p className={cn("text-sm leading-relaxed", COLORS.textSecondary)}>
                                    {story.positionRationale}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (story.chart.type === 'halving') {
        return (
            <div className="space-y-4">
                <HalvingCycleChart />
                {/* Position Statement - Below Chart (Reused) */}
                <div className="px-1 pt-2">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-1.5">
                            <span className={cn(
                                "inline-block text-[11px] px-2.5 py-1 rounded-full font-medium border",
                                zoneColors.bg, zoneColors.text, zoneColors.border
                            )}>
                                {zoneLabel}
                            </span>
                            {story.positionRationale && (
                                <p className={cn("text-sm leading-relaxed", COLORS.textSecondary)}>
                                    {story.positionRationale}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (story.chart.type === 'screener') {
        return (
            <div className="space-y-4">
                <DivergenceScreener />
                {/* Position Statement - Below Chart (Reused) */}
                <div className="px-1 pt-2">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-1.5">
                            <span className={cn(
                                "inline-block text-[11px] px-2.5 py-1 rounded-full font-medium border",
                                zoneColors.bg, zoneColors.text, zoneColors.border
                            )}>
                                {zoneLabel}
                            </span>
                            {story.positionRationale && (
                                <p className={cn("text-sm leading-relaxed", COLORS.textSecondary)}>
                                    {story.positionRationale}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
            <div className="px-1 pt-2">
                {/* 主要資訊區：數值 + 區間 + 描述 */}
                <div className="flex items-start gap-4">
                    {/* 左側：大數字（即時數據） */}
                    {currentValue !== 0 && (
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
        </div>
    );
}

// ================================================
// ① CHART CALLOUT - 怎麼看這張圖？(TradingView 教學提示)
// 無 emoji，專業白話
// ================================================
interface ChartCalloutProps {
    points: string[];
}

function ChartCallout({ points }: ChartCalloutProps) {
    return (
        <SectionCard className="bg-[#080808] border-dashed">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                    <h2 className={cn(TYPOGRAPHY.cardSubtitle, "mb-3")}>怎麼看這張圖？</h2>
                    <ul className="space-y-2">
                        {points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-neutral-600 mt-2 flex-shrink-0" />
                                <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>
                                    {point}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </SectionCard>
    );
}

// ================================================
// ② USE CASE LIST - 這個指標在判斷什麼？
// 無 emoji，改用 type 標籤
// ================================================
interface UseCaseListProps {
    useCases: IndicatorStory['useCases'];
}

const USE_CASE_TYPE_LABELS: Record<string, string> = {
    observe: '觀察',
    risk: '風險',
    timing: '時機',
};

function UseCaseList({ useCases }: UseCaseListProps) {
    return (
        <SectionCard>
            <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3")}>這個指標在判斷什麼？</h2>
            <div className="space-y-3">
                {useCases.map((uc, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-medium bg-neutral-800 text-neutral-400 uppercase tracking-wider flex-shrink-0 mt-0.5"
                        )}>
                            {USE_CASE_TYPE_LABELS[uc.type]}
                        </span>
                        <p className={cn("text-sm leading-relaxed", COLORS.textSecondary)}>{uc.description}</p>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}

// ================================================
// ④ RELATED EVENT TYPES - 這個指標在哪些事件特別有用？ (Reverse Citation)
// ================================================
interface RelatedEventTypesProps {
    indicatorSlug: string;
}

function RelatedEventTypes({ indicatorSlug }: RelatedEventTypesProps) {
    const relatedEvents = getRelatedEvents(indicatorSlug);
    if (relatedEvents.length === 0) return null;

    return (
        <SectionCard>
            <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3")}>此指標特別適用於</h2>
            <div className="space-y-3">
                {relatedEvents.map((evt, idx) => (
                    <Link
                        key={idx}
                        href={`/reviews/2024/${evt.slug}`}
                        className={cn(CARDS.secondary, "block group relative overflow-hidden")}
                    >
                        {/* Bg Gradient Hint */}
                        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-blue-500/10 to-transparent" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Event Thumbnail Mock */}
                                <div className="w-10 h-10 rounded bg-[#1A1A1A] flex items-center justify-center border border-[#333]">
                                    <span className="text-[10px] font-bold text-neutral-400">{evt.eventName}</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={cn("text-xs font-bold", COLORS.textPrimary)}>
                                            {evt.context}
                                        </span>
                                        <div className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold border border-blue-500/30">
                                            命中率 {evt.hitRate}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-neutral-500">
                                        點擊查看：回顧 {evt.eventName} 事件中的指標表現
                                    </p>
                                </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
        </SectionCard>
    );
}

// ================================================
// ③ HISTORICAL CASES - 指標實戰：這個指標在哪些事件特別有用？
// ================================================
interface HistoricalCasesProps {
    cases: IndicatorStory['historicalCases'];
    storyName: string;
}

function HistoricalCases({ cases, storyName }: HistoricalCasesProps) {
    return (
        <SectionCard>
            <div className="mb-4">
                <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-1 text-neutral-400")}>📌 這個指標，在哪些事件特別有用？</h2>
                <p className={cn(TYPOGRAPHY.caption)}>點擊卡片，用「{storyName}」視角重看當次行情</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cases.map((c, idx) => {
                    const review = REVIEWS_DATA.find(r => r.id === c.reviewId);

                    return (
                        <Link
                            key={idx}
                            href={review ? `/reviews/${review.year}/${review.slug}` : '#'}
                            className="block group h-full"
                        >
                            <div className={cn(
                                "h-full flex flex-col justify-between",
                                "bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-4",
                                "transition-all duration-300",
                                "group-hover:border-[#333] group-hover:bg-[#0F0F10] group-hover:scale-[1.01]",
                                CARDS.secondary,
                                "p-4 border border-transparent hover:border-[#2A2A2A]"
                            )}>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-medium", COLORS.textPrimary)}>{c.label}</span>
                                        {c.indicatorValue !== undefined && (
                                            <>
                                                <div className="w-[1px] h-3 bg-[#2A2A2A]" />
                                                <span className={cn("font-mono text-[10px]", COLORS.textTertiary)}>
                                                    當時指數 {c.indicatorValue}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#525252] group-hover:text-white" />
                                </div>

                                {/* 7/30/90 Returns Grid */}
                                {c.returns && (
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {[
                                            { label: '7D 後', value: c.returns.d7 },
                                            { label: '30D 後', value: c.returns.d30 },
                                            { label: '90D 後', value: c.returns.d90 },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-[#0A0A0A] rounded-lg p-2 text-center">
                                                <span className={cn("text-[9px] block mb-0.5", COLORS.textTertiary)}>
                                                    {item.label}
                                                </span>
                                                <span className={cn(
                                                    "text-xs font-mono font-bold",
                                                    item.value === undefined ? COLORS.textTertiary :
                                                        item.value > 0 ? COLORS.positive :
                                                            item.value < 0 ? COLORS.negative : COLORS.neutral
                                                )}>
                                                    {item.value === undefined ? '—' :
                                                        item.value > 0 ? `+${item.value}%` : `${item.value}%`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Takeaway */}
                                <div className="flex items-start gap-2">
                                    <div className="w-0.5 h-auto bg-[#2A2A2A] rounded-full flex-shrink-0 self-stretch" />
                                    <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>
                                        {c.takeaway}
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="mt-2 text-right">
                                    <span className={cn("text-[10px]", COLORS.textTertiary, "group-hover:text-white")}>
                                        前往事件回測 &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </SectionCard>
    );
}

// ================================================
// ④ ACTION GUIDELINES - 在這種圖表結構下
// ================================================
interface ActionGuidelinesProps {
    guidelines: string[];
    relatedLinks: IndicatorStory['relatedLinks'];
}

function ActionGuidelines({ guidelines, relatedLinks }: ActionGuidelinesProps) {
    return (
        <SectionCard>
            <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-1")}>
                那我現在應該怎麼用這個資訊？
            </h2>
            <p className={cn(TYPOGRAPHY.caption, "mb-4")}>
                在這種圖表結構下，常見的使用方式是：
            </p>

            {/* Guidelines */}
            <div className="space-y-2 mb-4">
                {guidelines.map((g, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 mt-1.5 flex-shrink-0" />
                        <p className={cn("text-sm leading-relaxed", COLORS.textSecondary)}>{g}</p>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-[#1A1A1A] my-4" />

            {/* Related Links */}
            <p className={cn(TYPOGRAPHY.micro, "mb-3")}>搭配其他結構確認</p>
            <div className="space-y-2">
                {relatedLinks.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.href}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#080808] border border-[#1A1A1A] hover:bg-[#0E0E0F] hover:border-[#2A2A2A] group"
                    >
                        <span className={cn("text-xs", COLORS.textSecondary, "group-hover:text-white")}>
                            {link.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#525252] group-hover:text-white" />
                    </Link>
                ))}
            </div>
        </SectionCard>
    );
}

// ================================================
// ⑤ RELATED CONCEPTS - 想看懂這個指標，先了解
// ================================================
interface RelatedConceptsProps {
    indicatorId: string;
}

function RelatedConcepts({ indicatorId }: RelatedConceptsProps) {
    const concepts = getPrerequisiteConcepts(indicatorId);
    if (concepts.length === 0) return null;

    return (
        <SectionCard className="bg-[#050505] border-dashed border-blue-500/20">
            <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3 text-blue-400/80")}>
                💡 想看懂這個指標，先了解
            </h2>
            <div className="flex flex-wrap gap-2">
                {concepts.map((c) => (
                    <div
                        key={c.id}
                        className="group relative px-3 py-1.5 rounded-full 
                                   bg-blue-500/10 border border-blue-500/20 
                                   hover:bg-blue-500/20 transition-colors cursor-help"
                    >
                        <span className="text-xs text-blue-300">{c.term}</span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                        hidden group-hover:block z-50 w-48">
                            <div className="bg-black/95 border border-white/10 rounded-lg 
                                            p-2 text-[10px] text-neutral-300 shadow-xl">
                                {c.definition}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className={cn(TYPOGRAPHY.micro, "mt-3 italic")}>
                基礎知識頁面即將上線 ✨
            </p>
        </SectionCard>
    );
}

// ================================================
// ⑥ RELATED INDICATORS - 搭配閱讀
// ================================================
interface RelatedIndicatorsProps {
    indicatorId: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
    prerequisite: '先修',
    complementary: '互補',
    contrast: '對照',
};

function RelatedIndicators({ indicatorId }: RelatedIndicatorsProps) {
    const related = getRelatedIndicators(indicatorId);
    if (related.length === 0) return null;

    return (
        <SectionCard>
            <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3")}>
                🔗 搭配閱讀
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((r) => (
                    <Link
                        key={r.indicatorId}
                        href={`/indicators/${r.slug}`}
                        className={cn(
                            CARDS.secondary,
                            "block group hover:border-white/20 transition-colors"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.5 rounded 
                                               bg-neutral-800 text-neutral-400">
                                    {RELATIONSHIP_LABELS[r.relationship]}
                                </span>
                                <span className="text-sm font-medium text-white">
                                    {r.name}
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-600 
                                                    group-hover:text-white" />
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                            {r.reason}
                        </p>
                    </Link>
                ))}
            </div>
        </SectionCard>
    );
}

// ================================================
// MAIN COMPONENT - INDICATOR STORY PAGE
// 順序：圖表 Hero → 怎麼看 → 判斷什麼 → 例題 → 行動
// ================================================
interface IndicatorStoryPageProps {
    story: IndicatorStory;
}

export default function IndicatorStoryPage({ story }: IndicatorStoryPageProps) {
    // 雙向連結：處理 from=review 參數
    const searchParams = useSearchParams();
    const fromReview = searchParams.get('from') === 'review';
    const reviewId = searchParams.get('reviewId');
    const reviewTitle = searchParams.get('reviewTitle');

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* 雙向連結提示 */}
            {fromReview && reviewTitle && (
                <div className="bg-blue-500/5 border-b border-blue-500/20 px-4 py-2">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-blue-300/80">
                            <span className="text-neutral-500">你是從</span>
                            <span className="font-medium text-blue-300">{decodeURIComponent(reviewTitle).split('：')[0]}</span>
                            <span className="text-neutral-500">來的</span>
                        </div>
                        <Link
                            href={`/reviews/2024/${reviewId?.replace('review-', '').replace('-2024', '').replace('-2022', '').replace('-2020', '')}`}
                            className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
                        >
                            <Undo2 className="w-3 h-3" />
                            返回復盤
                        </Link>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href="/indicators" className="text-[#808080] hover:text-white flex items-center gap-1">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-xs">返回</span>
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px]">
                    {story.name}
                </div>
                <div className="w-5" />
            </div>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {/* ⓪ Chart Hero (Above the fold) */}
                <ChartHero story={story} />

                {/* ① 怎麼看這張圖？ */}
                <ChartCallout points={story.chartCallout.points} />

                {/* ② 這個指標在判斷什麼？ */}
                <UseCaseList useCases={story.useCases} />

                {/* ③ 想看懂這個指標，先了解 (基礎概念) */}
                <RelatedConcepts indicatorId={story.id} />

                {/* ④ Related Event Types (Reverse Citation) */}
                <RelatedEventTypes indicatorSlug={story.id} />

                {/* ⑤ 歷史案例 (Pattern 3: Reverse Citation) */}
                <HistoricalCases cases={story.historicalCases} storyName={story.name} />

                {/* ⑥ 搭配閱讀 (相關指標) */}
                <RelatedIndicators indicatorId={story.id} />

                {/* ⑦ 行動指引 */}
                <ActionGuidelines
                    guidelines={story.actionGuidelines}
                    relatedLinks={story.relatedLinks}
                />

                {/* Footer Disclaimer */}
                <div className="text-center pt-4 border-t border-white/5">
                    <p className={cn(TYPOGRAPHY.micro, "italic")}>
                        以上內容僅供參考，不構成投資建議。
                    </p>
                </div>
            </article>
        </main>
    );
}
