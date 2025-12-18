'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS } from '@/lib/design-tokens';
import { IndicatorMiniChart } from './IndicatorMiniChart';

// 指標 slug → 顯示資訊映射
const INDICATOR_META: Record<string, { emoji: string; name: string }> = {
    'funding-rate': { emoji: '💰', name: '資金費率' },
    'liquidation': { emoji: '💥', name: '清算數據' },
    'open-interest': { emoji: '📊', name: '未平倉量' },
    'long-short-ratio': { emoji: '👥', name: '多空比' },
    'fear-greed': { emoji: '😱', name: '恐懼貪婪' },
    'etf-flow': { emoji: '🏦', name: 'ETF 資金流' },
    'futures-basis': { emoji: '📈', name: '期貨基差' },
    'coinbase-premium': { emoji: '🇺🇸', name: 'Coinbase 溢價' },
    'stablecoin-supply': { emoji: '💵', name: '穩定幣供應' },
};

interface ReviewIndicatorHintProps {
    reviewId: string;
    reviewTitle: string;
    eventStartDate: string; // YYYY-MM-DD
    eventEndDate: string;   // YYYY-MM-DD
    indicators: Array<{
        slug: string;
        why: string;
        anchor?: string;
    }>;
}

export function ReviewIndicatorHint({
    reviewId,
    reviewTitle,
    eventStartDate,
    eventEndDate,
    indicators
}: ReviewIndicatorHintProps) {
    if (!indicators || indicators.length === 0) return null;

    return (
        <section className="py-4">
            {/* Section Header - 更清晰的標題 */}
            <div className="flex items-center justify-between mb-3">
                <h3 className={cn(TYPOGRAPHY.sectionLabel, "text-neutral-400 flex items-center gap-2")}>
                    <span className="text-base">👁️</span>
                    換個視角理解這次事件
                </h3>
            </div>

            {/* Indicator Cards - 帶迷你圖表 */}
            <div className="space-y-3">
                {indicators.map((indicator) => {
                    const meta = INDICATOR_META[indicator.slug] || {
                        emoji: '📊',
                        name: indicator.slug
                    };

                    const targetUrl = `/indicators/${indicator.slug}?from=review&reviewId=${encodeURIComponent(reviewId)}&reviewTitle=${encodeURIComponent(reviewTitle)}`;

                    return (
                        <div
                            key={indicator.slug}
                            className={cn(
                                CARDS.secondary,
                                "relative overflow-hidden"
                            )}
                        >
                            {/* 卡片主體 */}
                            <div className="relative z-10">
                                {/* 標題行 */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{meta.emoji}</span>
                                    <span className={cn("text-sm font-medium", COLORS.textPrimary)}>
                                        用「{meta.name}」視角看這次
                                    </span>
                                </div>

                                {/* 迷你圖表 */}
                                <div className="mb-3">
                                    <IndicatorMiniChart
                                        indicatorSlug={indicator.slug}
                                        eventStartDate={eventStartDate}
                                        eventEndDate={eventEndDate}
                                        className="rounded"
                                    />
                                </div>

                                {/* 關鍵洞察 */}
                                <p className={cn("text-xs leading-relaxed mb-3", COLORS.textSecondary)}>
                                    {indicator.why}
                                </p>

                                {/* CTA */}
                                <Link
                                    href={targetUrl}
                                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors group"
                                >
                                    <span>深入了解 {meta.name}</span>
                                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
