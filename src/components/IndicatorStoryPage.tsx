'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS, SPACING, CHART } from '@/lib/design-tokens';
import { IndicatorStory, ZONE_LABELS, ZONE_COLORS } from '@/lib/indicator-stories';
import { REVIEWS_DATA } from '@/lib/reviews-data';

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
// 上：指標主圖（0-100 區間）
// 下：BTC Context（價格走勢）
// 同步時間範圍切換 + Hover 同步
// ================================================
interface ChartHeroProps {
    story: IndicatorStory;
}

interface ChartDataPoint {
    date: number;
    value: number;
    price?: number;
}

function ChartHero({ story }: ChartHeroProps) {
    const [timeRange, setTimeRange] = React.useState<'1M' | '3M' | '1Y'>('3M');
    const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
    const zoneColors = ZONE_COLORS[story.zone];
    const zoneLabel = ZONE_LABELS[story.zone];

    // 獲取真實數據
    // 獲取真實數據
    React.useEffect(() => {
        setLoading(true);
        const endpoint = story.chart.api.endpoint;
        // Construct query params
        const params = new URLSearchParams({
            range: timeRange,
            ...(story.chart.api.params as Record<string, string>)
        });

        fetch(`${endpoint}?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.history) {
                    setChartData(data.history);
                } else {
                    console.warn(`No history data found for ${story.slug}`);
                    setChartData([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(`Failed to fetch chart data for ${story.slug}:`, err);
                setChartData([]);
                setLoading(false);
            });
    }, [story.slug, timeRange, story.chart.api.endpoint, story.chart.api.params]);

    // 計算當前值在 Y 軸的位置 (0-100 scale)
    const currentValue = story.currentValue ?? 50;

    // 將數據轉換為 SVG 路徑點
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
                    {!loading && chartData.length > 0 && (
                        <span className="text-[9px] text-neutral-600 font-mono">
                            Updated: {new Date(chartData[chartData.length - 1].date).toLocaleDateString('zh-TW')}
                        </span>
                    )}
                </div>

                {/* Hover Info - Top Center (Design Token: CHART.tooltip) */}
                {hoverData && (
                    <div className={cn(CHART.tooltip.container, "absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4")}>
                        <span className={CHART.tooltip.date}>
                            {new Date(hoverData.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className={CHART.tooltip.value}>FGI: {hoverData.value}</span>
                        {hoverData.price && (
                            <span className="text-xs font-mono text-[#F59E0B]">
                                ${hoverData.price.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* 上層：指標主圖 (0-100) */}
                {/* ═══════════════════════════════════════════════ */}
                <div className="aspect-[16/9] w-full relative pt-12 pb-2 px-4">
                    {/* Zone Backgrounds (0-25 / 25-50 / 50-75 / 75-100) */}
                    <div className="absolute inset-x-0 top-12 bottom-2 flex flex-col">
                        {/* 75-100: 貪婪區 */}
                        <div className="h-[25%] bg-red-500/[0.04] border-b border-red-500/10 relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-red-400/50 font-mono">
                                貪婪
                            </span>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-600 font-mono">
                                75
                            </span>
                        </div>
                        {/* 50-75: 偏貪婪 */}
                        <div className="h-[25%] bg-yellow-500/[0.02] border-b border-yellow-500/5 relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-yellow-400/30 font-mono">
                                偏貪婪
                            </span>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-600 font-mono">
                                50
                            </span>
                        </div>
                        {/* 25-50: 偏恐懼 */}
                        <div className="h-[25%] bg-blue-500/[0.02] border-b border-blue-500/5 relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-blue-400/30 font-mono">
                                偏恐懼
                            </span>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-600 font-mono">
                                25
                            </span>
                        </div>
                        {/* 0-25: 恐懼區 (綠色 - 更直觀) */}
                        <div className="h-[25%] bg-green-500/[0.04] relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-green-400/50 font-mono">
                                恐懼
                            </span>
                            <span className="absolute left-3 bottom-1 text-[9px] text-neutral-600 font-mono">
                                0
                            </span>
                        </div>
                    </div>

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
                    <div className="absolute left-3 top-12" style={{ fontSize: CHART.axis.fontSize, color: CHART.axis.fill }}>
                        100
                    </div>

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
                                    points={generatePath(chartData, 'value', 100, 0, 100)}
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
                    <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">BTC Context</span>
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
                            {/* 情緒區間背景標示 - 只標貪婪(紅)和恐懼(綠) */}
                            {chartData.length > 0 && (() => {
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
                    {/* 左側：大數字 */}
                    {story.currentValue !== undefined && (
                        <div className="flex flex-col items-center">
                            <span className={cn(
                                "text-4xl font-mono font-bold tracking-tight",
                                zoneColors.text
                            )}>
                                {story.currentValue}
                            </span>
                            <span className={cn("text-[10px] mt-0.5", COLORS.textTertiary)}>
                                指數
                            </span>
                        </div>
                    )}

                    {/* 右側：區間標籤 + 說明 */}
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
// ③ HISTORICAL CASES - 例題：當這張圖長這樣時
// ================================================
interface HistoricalCasesProps {
    cases: IndicatorStory['historicalCases'];
}

function HistoricalCases({ cases }: HistoricalCasesProps) {
    return (
        <SectionCard>
            <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-1")}>當這張圖長這樣時</h2>
            <p className={cn(TYPOGRAPHY.caption, "mb-4")}>歷史發生過什麼？</p>

            <div className="space-y-3">
                {cases.map((c, idx) => {
                    const review = REVIEWS_DATA.find(r => r.id === c.reviewId);

                    return (
                        <Link
                            key={idx}
                            href={review ? `/reviews/${review.year}/${review.slug}` : '#'}
                            className="block group"
                        >
                            <div className={cn(
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
                                        查看完整復盤 →
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
// MAIN COMPONENT - INDICATOR STORY PAGE
// 順序：圖表 Hero → 怎麼看 → 判斷什麼 → 例題 → 行動
// ================================================
interface IndicatorStoryPageProps {
    story: IndicatorStory;
}

export default function IndicatorStoryPage({ story }: IndicatorStoryPageProps) {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
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

                {/* ③ 例題：歷史案例 */}
                <HistoricalCases cases={story.historicalCases} />

                {/* ④ 行動指引 */}
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
