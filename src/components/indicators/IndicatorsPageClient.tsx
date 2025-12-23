'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { IndicatorStory, ZONE_COLORS } from '@/lib/indicator-stories';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { IndicatorMetricView, IndicatorsPageViewModel } from '@/lib/services/indicators-list';

interface IndicatorsClientProps {
    viewModel: IndicatorsPageViewModel;
}

function IndicatorEntryCard({ view }: { view: IndicatorMetricView }) {
    const zoneColors = ZONE_COLORS[view.zone];

    return (
        <Link href={`/indicators/${view.slug}`} className="block h-full">
            <UniversalCard
                variant="clickable"
                size="M"
                className={cn(
                    "h-full flex flex-col justify-between",
                    view.isPro && "border-white/10"
                )}
            >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className={TYPOGRAPHY.cardTitle}>{view.name}</h3>
                        {view.isPro && (
                            <span className="bg-amber-500/10 text-amber-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                                PRO
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap border",
                            zoneColors.bg, zoneColors.text, zoneColors.border
                        )}>
                            {view.zoneLabel}
                        </span>
                    </div>
                </div>

                {/* Bottom Row: Description vs Value */}
                <div className="flex items-end justify-between gap-4 mt-auto">
                    <p className={cn(TYPOGRAPHY.bodySmall, "line-clamp-2 max-w-[65%]")}>
                        {view.description}
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                        <span className={cn("text-lg font-mono font-bold leading-none", zoneColors.text)}>
                            {view.formattedValue}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-700 group-hover:text-neutral-400 mb-0.5" />
                    </div>
                </div>
            </UniversalCard>
        </Link>
    );
}

export default function IndicatorsPageClient({ viewModel }: IndicatorsClientProps) {
    // Note: AI Summary logic can be migrated to server later, keeping client-side for now or props
    const [aiSummary, setAiSummary] = useState<string>('');
    const [aiLoading, setAiLoading] = useState(true);

    // Initial load AI summary effect can be added back if needed, 
    // or we can pass it from server if performant.
    // For now, let's render the list immediately which is the LCP goal.

    // Simulating AI Loading for visual consistency, or implementing real fetch if required.
    // Since we have all data in viewModel, we can call the summary API immediately.
    React.useEffect(() => {
        const CACHE_KEY = 'indicator-ai-summary-v2';
        const CACHE_TTL = 10 * 60 * 1000;

        const fetchSummary = async () => {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { summary, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setAiSummary(summary);
                        setAiLoading(false);
                        return;
                    }
                } catch (e) {
                    // Cache parse error, ignore
                }
            }

            try {
                // Map view model back to payload structure required by API
                // This is a simplified reconstruction
                const fgi = viewModel.marketMetrics.find(m => m.id === 'fear-greed')
                const funding = viewModel.marketMetrics.find(m => m.id === 'funding-rate')
                const lsRatio = viewModel.marketMetrics.find(m => m.id === 'long-short-ratio')

                if (fgi && funding && lsRatio) {
                    const res = await fetch('/api/ai/indicator-summary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fearGreedIndex: { value: fgi.value, zone: fgi.zone },
                            fundingRate: funding.value / 100,
                            longShortRatio: lsRatio.value,
                            // Simplified for now
                            liquidation: { total: 0, long: 0, short: 0 },
                            oiChange24h: 0,
                            etfNetFlow: 0,
                            btcPrice: undefined
                        })
                    });
                    const data = await res.json();
                    if (data.summary) {
                        setAiSummary(data.summary);
                        localStorage.setItem(CACHE_KEY, JSON.stringify({
                            summary: data.summary,
                            timestamp: Date.now()
                        }));
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                setAiLoading(false)
            }
        }

        // Slight delay to not block hydration
        const t = setTimeout(fetchSummary, 500)
        return () => clearTimeout(t)
    }, [viewModel])

    return (
        <div className={cn("max-w-3xl mx-auto", SPACING.pageX, SPACING.pageTop)}>
            {/* AI 總結卡片 */}
            <div className="mb-4">
                <AISummaryCard
                    summary={aiSummary || '正在分析各項市場數據...'}
                    source="AI 市場觀察"
                    loading={aiLoading}
                />
            </div>

            {/* Alpha Tools Section (Size S Grid) */}
            <section className={cn(SPACING.sectionGap)}>
                <SectionHeaderCard
                    title="Alpha 工具箱"
                    rightElement={<span className="text-[10px] text-neutral-500 font-mono">POWERED BY CryptoTW</span>}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {viewModel.alphaTools.map(story => (
                        <Link key={story.id} href={`/indicators/${story.slug}`} className="block h-full">
                            <UniversalCard
                                variant="clickable"
                                size="S"
                                className="h-full flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            {story.id === 'seasonality' && <span className="text-indigo-400 text-lg">📅</span>}
                                            {story.id === 'halving-cycles' && <span className="text-orange-400 text-lg">⏳</span>}
                                            {story.id === 'divergence-screener' && <span className="text-cyan-400 text-lg">🔍</span>}
                                        </div>
                                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">ALPHA</span>
                                    </div>
                                    <h3 className={cn(TYPOGRAPHY.cardTitle, "mb-1 group-hover:text-indigo-400")}>{story.name}</h3>
                                </div>
                                <div className="mt-3 flex items-center text-[10px] text-neutral-600 font-medium group-hover:text-neutral-400">
                                    立即使用 <ChevronRight className="w-3 h-3 ml-0.5" />
                                </div>
                            </UniversalCard>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Market Metrics Section (Size M Stack) */}
            <section className={cn(SPACING.sectionGap, "mt-8")}>
                <SectionHeaderCard title="市場數據指標" />
                <div className={SPACING.classes.gapCards}>
                    {viewModel.marketMetrics.map((view) => (
                        <IndicatorEntryCard
                            key={view.id}
                            view={view}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
