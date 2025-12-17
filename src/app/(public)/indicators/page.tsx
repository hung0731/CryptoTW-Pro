'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS } from '@/lib/design-tokens';
import { INDICATOR_STORIES, ZONE_COLORS, getZoneLabel, IndicatorStory } from '@/lib/indicator-stories';
import { PageHeader } from '@/components/PageHeader';

// 即時數據類型
interface LiveIndicatorData {
    value: number;
    zone: 'fear' | 'lean_fear' | 'lean_greed' | 'greed';
    headline: string;
    loading: boolean;
}

// 根據指標的 zones 配置計算 zone
function calculateZone(value: number, story: IndicatorStory): 'fear' | 'lean_fear' | 'lean_greed' | 'greed' {
    const zones = story.chart.zones;
    if (value <= zones.fear.max) return 'fear';
    if (value <= zones.leanFear.max) return 'lean_fear';
    if (value <= zones.leanGreed.max) return 'lean_greed';
    return 'greed';
}

// 格式化數值顯示
function formatValue(value: number, story: IndicatorStory): string {
    const format = story.chart.valueFormat;
    const unit = story.chart.unit;
    if (format === 'percent') return `${value.toFixed(3)}%`;
    if (format === 'ratio') return value.toFixed(2);
    if (unit === 'M') return `$${value.toFixed(0)}M`;
    if (unit === 'B') return `$${value.toFixed(1)}B`;
    return value.toFixed(0);
}

// 入口卡片組件
function IndicatorEntryCard({
    story,
    liveData,
}: {
    story: IndicatorStory;
    liveData?: LiveIndicatorData;
}) {
    const zone = liveData?.zone ?? story.zone;
    const zoneColors = ZONE_COLORS[zone];
    const zoneLabel = getZoneLabel(story.id, zone);

    return (
        <Link href={`/indicators/${story.slug}`} className="block group">
            <div className={cn(
                CARDS.primary,
                "p-4 hover:bg-[#0E0E0F] hover:border-[#2A2A2A]"
            )}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                        <h3 className={cn(TYPOGRAPHY.cardTitle)}>{story.name}</h3>
                        <p className={cn("text-xs truncate", COLORS.textSecondary)}>
                            {liveData?.loading ? '載入中...' : (liveData?.headline ?? story.positionHeadline)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {liveData?.loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                        ) : liveData?.value !== undefined ? (
                            <span className={cn("text-lg font-mono font-bold", zoneColors.text)}>
                                {formatValue(liveData.value, story)}
                            </span>
                        ) : null}
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
                            zoneColors.bg, zoneColors.text
                        )}>
                            {liveData?.loading ? '...' : zoneLabel}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#525252] group-hover:text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function IndicatorsPage() {
    const [liveData, setLiveData] = useState<Record<string, LiveIndicatorData>>({});

    useEffect(() => {
        // 初始化所有指標為 loading 狀態
        const initialState: Record<string, LiveIndicatorData> = {};
        INDICATOR_STORIES.forEach(story => {
            initialState[story.id] = {
                value: 0,
                zone: story.zone,
                headline: '載入中...',
                loading: true,
            };
        });
        setLiveData(initialState);

        // 並行獲取所有指標的即時數據
        INDICATOR_STORIES.forEach(story => {
            const endpoint = story.chart.api.endpoint;
            const params = new URLSearchParams({
                range: '1M',
                ...(story.chart.api.params as Record<string, string>)
            });

            fetch(`${endpoint}?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    if (data.current?.value !== undefined) {
                        const value = data.current.value;
                        const zone = calculateZone(value, story);
                        const zoneLabel = getZoneLabel(story.id, zone);

                        setLiveData(prev => ({
                            ...prev,
                            [story.id]: {
                                value,
                                zone,
                                headline: `${zoneLabel}（${formatValue(value, story)}）`,
                                loading: false,
                            }
                        }));
                    } else {
                        // API 沒有返回 current，使用靜態數據
                        setLiveData(prev => ({
                            ...prev,
                            [story.id]: {
                                value: story.currentValue ?? 0,
                                zone: story.zone,
                                headline: story.positionHeadline,
                                loading: false,
                            }
                        }));
                    }
                })
                .catch(() => {
                    // 錯誤時使用靜態數據
                    setLiveData(prev => ({
                        ...prev,
                        [story.id]: {
                            value: story.currentValue ?? 0,
                            zone: story.zone,
                            headline: story.positionHeadline,
                            loading: false,
                        }
                    }));
                });
        });
    }, []);

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title="市場指標"
                showLogo={false}
                backHref="/"
                backLabel="返回"
            />

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* 說明區塊 */}
                <div className={cn(CARDS.passive, "p-4")}>
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-neutral-500 mt-0.5" />
                        <div>
                            <p className={cn("text-sm", COLORS.textSecondary)}>
                                所有數據即時從 Coinglass 獲取，反映當前市場狀態。
                            </p>
                            <p className={cn("text-xs mt-2", COLORS.textTertiary)}>
                                不做價格預測，只提供決策參考框架。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 指標列表 - 全部使用即時數據 */}
                <section>
                    <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3")}>可用指標（即時）</h2>
                    <div className="space-y-3">
                        {INDICATOR_STORIES.map((story) => (
                            <IndicatorEntryCard
                                key={story.id}
                                story={story}
                                liveData={liveData[story.id]}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
