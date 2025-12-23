'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, COLORS } from '@/lib/design-tokens';
import { INDICATOR_STORIES, ZONE_COLORS, getZoneLabel, IndicatorStory } from '@/lib/indicator-stories';
import { PageHeader } from '@/components/PageHeader';

// 簡化版圖表組件
interface MiniChartProps {
    story: IndicatorStory;
    timeRange: '1M' | '3M';
    initialData?: { history: any[], current: any };
}

interface ChartDataPoint {
    date: number;
    value: number;
}

function MiniChart({ story, timeRange, initialData }: MiniChartProps) {
    const [chartData, setChartData] = useState<ChartDataPoint[]>(initialData?.history || []);
    const [currentValue, setCurrentValue] = useState<number | null>(initialData?.current?.value ?? null);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        // If we have initial data and the time range matches default (1M), don't fetch
        if (initialData && timeRange === '1M') {
            // Check if we need to reset to initial if switching back? 
            // For simplicity, if initialData provided is for 1M, and current range is 1M, use logic to avoid fetch?
            // Actually, simplest is to just fetch on change, but use initial data for first render.
            // If timeRange changes, we must fetch.
            return;
        }

        // If timeRange changed from default, fetch new data.
        if (timeRange === '1M' && initialData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setChartData(initialData.history);
            if (initialData.current?.value !== undefined) setCurrentValue(initialData.current.value);
            setLoading(false);
            return;
        }

        setLoading(true);
        const endpoint = story.chart.api.endpoint;
        const params = new URLSearchParams({
            range: timeRange,
            ...(story.chart.api.params as Record<string, string>)
        });

        fetch(`${endpoint}?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.history) {
                    setChartData(data.history);
                }
                if (data.current?.value !== undefined) {
                    setCurrentValue(data.current.value);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [story, timeRange, initialData]);

    // 計算 zone 和顏色
    const zones = story.chart.zones;
    let zone: 'fear' | 'lean_fear' | 'lean_greed' | 'greed' = 'lean_fear';
    if (currentValue !== null) {
        if (currentValue <= zones.fear.max) zone = 'fear';
        else if (currentValue <= zones.leanFear.max) zone = 'lean_fear';
        else if (currentValue <= zones.leanGreed.max) zone = 'lean_greed';
        else zone = 'greed';
    }
    const zoneColors = ZONE_COLORS[zone];

    // 生成 SVG 路徑
    const generatePath = () => {
        if (chartData.length === 0) return '';
        const values = chartData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        const width = 200;
        const height = 60;

        return chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * width;
            const y = height - ((d.value - min) / range) * height;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    // 格式化數值
    const formatValue = (value: number) => {
        const format = story.chart.valueFormat;
        const unit = story.chart.unit;
        if (format === 'percent') return `${value.toFixed(3)}%`;
        if (format === 'ratio') return value.toFixed(2);
        if (unit === 'M') return `$${value.toFixed(0)}M`;
        if (unit === 'B') return `$${value.toFixed(1)}B`;
        return value.toFixed(0);
    };

    return (
        <div className={cn(CARDS.secondary, "p-3")}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className={cn("text-xs font-medium", COLORS.textSecondary)}>
                    {story.name}
                </span>
                {loading ? (
                    <span className="text-[10px] text-neutral-600">載入中...</span>
                ) : currentValue !== null && (
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-mono font-bold", zoneColors.text)}>
                            {formatValue(currentValue)}
                        </span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded", zoneColors.bg, zoneColors.text)}>
                            {getZoneLabel(story.id, zone)}
                        </span>
                    </div>
                )}
            </div>

            {/* Mini Chart */}
            <div className="h-[60px] w-full relative">
                {loading ? (
                    <div className="absolute inset-0 bg-neutral-900/50 rounded animate-pulse" />
                ) : chartData.length > 0 && (
                    <svg viewBox="0 0 200 60" className="w-full h-full">
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
}

interface CompareClientProps {
    initialDataMap: Record<string, { history: any[], current: any }>;
}

export default function CompareIndicatorsPageClient({ initialDataMap }: CompareClientProps) {
    const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
        'fear-greed', 'funding-rate', 'long-short-ratio', 'liquidation'
    ]);
    const [timeRange, setTimeRange] = useState<'1M' | '3M'>('1M');

    const toggleIndicator = (slug: string) => {
        if (selectedIndicators.includes(slug)) {
            if (selectedIndicators.length > 2) {
                setSelectedIndicators(prev => prev.filter(s => s !== slug));
            }
        } else if (selectedIndicators.length < 4) {
            setSelectedIndicators(prev => [...prev, slug]);
        }
    };

    const selectedStories = INDICATOR_STORIES.filter(s => selectedIndicators.includes(s.slug));

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title="指標比較"
                showLogo={false}
                backHref="/indicators"
                backLabel="返回"
            />

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* 控制區 */}
                <div className={cn(CARDS.passive, "p-4")}>
                    <div className="flex items-center justify-between mb-3">
                        <span className={cn("text-xs font-medium", COLORS.textSecondary)}>
                            選擇指標（2-4 個）
                        </span>
                        <div className="flex gap-1">
                            {(['1M', '3M'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={cn(
                                        "text-[10px] px-2 py-1 rounded font-mono",
                                        timeRange === range
                                            ? "bg-white/10 text-white"
                                            : "text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {INDICATOR_STORIES.map(story => {
                            const isSelected = selectedIndicators.includes(story.slug);
                            return (
                                <button
                                    key={story.id}
                                    onClick={() => toggleIndicator(story.slug)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border",
                                        isSelected
                                            ? "bg-white/10 border-white/20 text-white"
                                            : "border-white/5 text-neutral-500 hover:border-white/10 hover:text-neutral-300"
                                    )}
                                >
                                    {isSelected && <Check className="w-3 h-3" />}
                                    {story.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 比較圖表網格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedStories.map(story => (
                        <Link key={story.id} href={`/indicators/${story.slug}`}>
                            <MiniChart
                                story={story}
                                timeRange={timeRange}
                                initialData={initialDataMap[story.id]}
                            />
                        </Link>
                    ))}
                </div>

                {/* 說明 */}
                <div className={cn("text-center py-4 text-xs", COLORS.textTertiary)}>
                    點擊圖表可查看詳細資訊
                </div>
            </div>
        </main>
    );
}
