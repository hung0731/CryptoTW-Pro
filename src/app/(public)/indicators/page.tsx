'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS, SPACING } from '@/lib/design-tokens';
import { INDICATOR_STORIES, getZoneFromValue, ZONE_LABELS, ZONE_COLORS } from '@/lib/indicator-stories';
import { PageHeader } from '@/components/PageHeader';

interface LiveData {
    fearGreed?: { value: string; classification: string };
}

// 入口卡片組件
function IndicatorEntryCard({
    slug,
    name,
    headline,
    zone,
    value,
}: {
    slug: string;
    name: string;
    headline: string;
    zone: string;
    value?: number;
}) {
    const zoneColors = ZONE_COLORS[zone as keyof typeof ZONE_COLORS] || ZONE_COLORS.lean_fear;
    const zoneLabel = ZONE_LABELS[zone as keyof typeof ZONE_LABELS] || '—';

    return (
        <Link href={`/indicators/${slug}`} className="block group">
            <div className={cn(
                CARDS.primary,
                "p-4 hover:bg-[#0E0E0F] hover:border-[#2A2A2A]"
            )}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className={cn(TYPOGRAPHY.cardTitle)}>{name}</h3>
                        <p className={cn("text-xs", COLORS.textSecondary)}>{headline}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {value !== undefined && (
                            <span className={cn("text-lg font-mono font-bold", zoneColors.text)}>
                                {value}
                            </span>
                        )}
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            zoneColors.bg, zoneColors.text
                        )}>
                            {zoneLabel}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#525252] group-hover:text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function IndicatorsPage() {
    const [liveData, setLiveData] = useState<LiveData | null>(null);

    useEffect(() => {
        fetch('/api/market')
            .then(res => res.json())
            .then(data => setLiveData({ fearGreed: data.fearGreed }))
            .catch(console.error);
    }, []);

    // 動態更新 Fear & Greed 數據
    const fgiValue = liveData?.fearGreed ? parseInt(liveData.fearGreed.value) : undefined;
    const fgiZone = fgiValue ? getZoneFromValue(fgiValue) : 'lean_fear';
    const fgiHeadline = liveData?.fearGreed
        ? `${liveData.fearGreed.classification}（指數 ${liveData.fearGreed.value}）`
        : '載入中...';

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
                                每個指標頁面會告訴你：現在在什麼位置、歷史上這個位置發生過什麼、以及你可以去哪裡驗證。
                            </p>
                            <p className={cn("text-xs mt-2", COLORS.textTertiary)}>
                                不做價格預測，只提供決策參考框架。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 指標列表 */}
                <section>
                    <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3")}>可用指標</h2>
                    <div className="space-y-3">
                        {INDICATOR_STORIES.map((story) => {
                            // 對於 Fear & Greed，使用真實數據
                            if (story.slug === 'fear-greed') {
                                return (
                                    <IndicatorEntryCard
                                        key={story.id}
                                        slug={story.slug}
                                        name={story.name}
                                        headline={fgiHeadline}
                                        zone={fgiZone}
                                        value={fgiValue}
                                    />
                                );
                            }
                            // 其他指標使用靜態數據
                            return (
                                <IndicatorEntryCard
                                    key={story.id}
                                    slug={story.slug}
                                    name={story.name}
                                    headline={story.positionHeadline}
                                    zone={story.zone}
                                    value={story.currentValue}
                                />
                            );
                        })}
                    </div>
                </section>


            </div>
        </main>
    );
}
