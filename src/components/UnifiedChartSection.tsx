'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ReviewChart } from './ReviewChart';
import { COLORS } from '@/lib/design-tokens';

// 可用的指標 Tab 定義
interface IndicatorTab {
    id: string;
    label: string;
    chartType: 'price' | 'flow' | 'oi' | 'fgi' | 'funding' | 'liquidation' | 'longShort' | 'basis' | 'premium' | 'stablecoin';
    interpretation?: {
        whatItMeans: string;
        whatToWatch?: string;
    };
}

interface UnifiedChartSectionProps {
    symbol: string;
    eventStart: string;   // D0 日期
    eventEnd: string;
    newsDate?: string;    // 新聞日期
    reviewSlug: string;
    daysBuffer?: number;

    // 可用的指標 tabs
    availableTabs: IndicatorTab[];

    // 事件標記
    eventLabel?: string;  // e.g. "ETF 通過"
}

export function UnifiedChartSection({
    symbol,
    eventStart,
    eventEnd,
    newsDate,
    reviewSlug,
    daysBuffer = 10,
    availableTabs,
    eventLabel = 'D0',
}: UnifiedChartSectionProps) {
    const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'price');
    const [overlayType, setOverlayType] = useState<'oi' | 'funding' | undefined>(undefined);

    const activeIndicator = availableTabs.find(t => t.id === activeTab) || availableTabs[0];

    return (
        <div className="flex flex-col">
            {/* Header - kept as a sub-header or merged */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#0A0A0B]">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{symbol}/USDT</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        {eventLabel}
                    </span>
                </div>
                <span className="text-[10px] text-neutral-600">加密台灣 Pro</span>
            </div>

            {/* 主圖：價格（固定） */}
            <div className="border-b border-white/5">
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500">主圖</span>
                        <span className="text-xs text-neutral-400">價格走勢</span>
                    </div>

                    {/* Overlay Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setOverlayType(overlayType === 'oi' ? undefined : 'oi')}
                            className={cn(
                                "text-[10px] px-2 py-0.5 rounded border transition-colors",
                                overlayType === 'oi'
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/50"
                                    : "bg-transparent text-neutral-600 border-neutral-800 hover:border-neutral-600"
                            )}
                        >
                            + 持倉 (OI)
                        </button>
                        <button
                            onClick={() => setOverlayType(overlayType === 'funding' ? undefined : 'funding')}
                            className={cn(
                                "text-[10px] px-2 py-0.5 rounded border transition-colors",
                                overlayType === 'funding'
                                    ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/50"
                                    : "bg-transparent text-neutral-600 border-neutral-800 hover:border-neutral-600"
                            )}
                        >
                            + 費率 (Funding)
                        </button>
                    </div>
                </div>
                <div className="aspect-[21/9] w-full relative" style={{ backgroundColor: '#080809' }}>
                    <ReviewChart
                        type="price"
                        symbol={symbol}
                        daysBuffer={daysBuffer}
                        eventStart={eventStart}
                        eventEnd={eventEnd}
                        reviewSlug={reviewSlug}
                        newsDate={newsDate}
                        overlayType={overlayType}
                    />
                </div>
            </div>

            {/* 副圖：可切換指標 */}
            <div>
                {/* Tabs */}
                <div className="px-3 py-2 flex items-center gap-1 border-b border-white/5 overflow-x-auto">
                    <span className="text-[10px] text-neutral-600 mr-2 flex-shrink-0">副圖</span>
                    {availableTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs transition-all flex-shrink-0",
                                activeTab === tab.id
                                    ? "bg-white/10 text-white"
                                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 副圖區域 - 高度為主圖一半 */}
                <div className="aspect-[21/4] w-full relative" style={{ backgroundColor: '#080809' }}>
                    <ReviewChart
                        type={activeIndicator?.chartType || 'funding'}
                        symbol={symbol}
                        daysBuffer={daysBuffer}
                        eventStart={eventStart}
                        eventEnd={eventEnd}
                        reviewSlug={reviewSlug}
                        newsDate={newsDate}
                    />
                </div>
            </div>

            {/* 解讀區 */}
            {activeIndicator?.interpretation && (
                <div className="px-4 py-3 border-t border-white/5" style={{ backgroundColor: '#0C0C0D' }}>
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-500 text-sm">💡</span>
                        <div className="flex-1">
                            <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>
                                {activeIndicator.interpretation.whatItMeans}
                            </p>
                            {activeIndicator.interpretation.whatToWatch && (
                                <p className={cn("text-[11px] mt-1 leading-relaxed", COLORS.textTertiary)}>
                                    📌 {activeIndicator.interpretation.whatToWatch}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
