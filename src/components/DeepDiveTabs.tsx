'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Activity, Clock, AlertTriangle, GitCompare, Eye, ChevronRight } from 'lucide-react';
import { COLORS } from '@/lib/design-tokens';

interface TimelineItem {
    date: string;
    title: string;
    description: string;
    marketImpact: string;
    riskLevel: 'high' | 'medium' | 'low';
}

interface Misconception {
    myth: string;
    fact: string;
}

interface RelatedIndicator {
    slug: string;
    why: string;
}

interface HistoricalComparison {
    event: string;
    similarity: string;
}

interface DeepDiveTabsProps {
    timeline: TimelineItem[];
    misconceptions?: Misconception[];
    relatedIndicators?: RelatedIndicator[];
    historicalComparison?: HistoricalComparison;
    reviewId: string;
    reviewTitle: string;
}

// 指標 meta
const INDICATOR_META: Record<string, { emoji: string; name: string }> = {
    'funding-rate': { emoji: '💰', name: '資金費率' },
    'liquidation': { emoji: '💥', name: '清算數據' },
    'open-interest': { emoji: '📊', name: '未平倉量' },
    'fear-greed': { emoji: '😱', name: '恐懼貪婪' },
    'etf-flow': { emoji: '🏦', name: 'ETF 資金流' },
    'stablecoin-supply': { emoji: '💵', name: '穩定幣供應' },
};

export function DeepDiveTabs({
    timeline,
    misconceptions,
    relatedIndicators,
    historicalComparison,
    reviewId,
    reviewTitle,
}: DeepDiveTabsProps) {
    const [activeTab, setActiveTab] = useState<'timeline' | 'myths' | 'indicators' | 'history'>('timeline');

    // 計算可用的 tabs
    const tabs = [
        { id: 'timeline' as const, label: '時間軸', icon: Clock, count: timeline.length },
        ...(misconceptions && misconceptions.length > 0 ? [{ id: 'myths' as const, label: '常見誤解', icon: AlertTriangle, count: misconceptions.length }] : []),
        ...(relatedIndicators && relatedIndicators.length > 0 ? [{ id: 'indicators' as const, label: '指標視角', icon: Eye, count: relatedIndicators.length }] : []),
        ...(historicalComparison ? [{ id: 'history' as const, label: '歷史對照', icon: GitCompare, count: 1 }] : []),
    ];

    return (
        <div className="border-t border-b border-white/5">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto border-b border-white/5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all border-b-2 flex-shrink-0",
                                activeTab === tab.id
                                    ? "text-white border-white"
                                    : "text-neutral-500 border-transparent hover:text-neutral-300"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full",
                                activeTab === tab.id ? "bg-white/10" : "bg-white/5"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="p-4">
                {/* Timeline Panel */}
                {activeTab === 'timeline' && (
                    <div className="space-y-4">
                        {timeline.map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-mono text-neutral-500 bg-black px-1.5 py-0.5 rounded border border-white/10">
                                        {item.date.slice(5)}
                                    </span>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-2",
                                        item.riskLevel === 'high' ? "bg-white" :
                                            item.riskLevel === 'medium' ? "bg-neutral-500" :
                                                "bg-neutral-700"
                                    )} />
                                    {idx < timeline.length - 1 && (
                                        <div className="w-px flex-1 bg-neutral-800 mt-2" />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="text-sm text-neutral-300 leading-relaxed mb-1">
                                        {item.description}
                                    </p>
                                    <p className="text-[10px] text-neutral-600 flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        {item.marketImpact}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Myths Panel */}
                {activeTab === 'myths' && misconceptions && (
                    <div className="space-y-3">
                        {misconceptions.map((m, idx) => (
                            <div key={idx} className="rounded-lg p-3" style={{ backgroundColor: '#0C0C0D' }}>
                                <div className="flex gap-2 mb-2">
                                    <span className="text-red-400 text-xs">✗</span>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{m.myth}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-green-400 text-xs">✓</span>
                                    <p className="text-sm text-neutral-300 leading-relaxed">{m.fact}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Indicators Panel */}
                {activeTab === 'indicators' && relatedIndicators && (
                    <div className="space-y-2">
                        {relatedIndicators.map((ind) => {
                            const meta = INDICATOR_META[ind.slug] || { emoji: '📊', name: ind.slug };
                            return (
                                <Link
                                    key={ind.slug}
                                    href={`/indicators/${ind.slug}?from=review&reviewId=${encodeURIComponent(reviewId)}`}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0C0C0D] hover:bg-[#101012] group transition-colors"
                                >
                                    <span className="text-lg">{meta.emoji}</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-white font-medium">{meta.name}</p>
                                        <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>{ind.why}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* History Panel */}
                {activeTab === 'history' && historicalComparison && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#0C0C0D' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <GitCompare className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-medium text-blue-400">
                                對照：{historicalComparison.event}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed">
                            {historicalComparison.similarity}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
