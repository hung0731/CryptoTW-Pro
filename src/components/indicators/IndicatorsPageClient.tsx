'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Activity, LayoutDashboard, Calendar, Hourglass, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { IndicatorStory, ZONE_COLORS } from '@/lib/indicator-stories';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { IndicatorMetricView, IndicatorsPageViewModel } from '@/lib/services/indicators-list';

// Single Column Card Style
function IndicatorEntryCard({ view }: { view: IndicatorMetricView }) {
    const zoneColors = ZONE_COLORS[view.zone];

    return (
        <Link href={`/indicators/${view.slug}`} className="block group relative p-5 hover:bg-[#141414] transition-colors border-b border-[#1A1A1A] last:border-0">
            <div className="flex items-start justify-between gap-4">
                {/* Left: Title & Badge */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{view.name}</h3>
                        {view.isPro && (
                            <span className="bg-[#332a00] text-[#FFD700] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#665200]">PRO</span>
                        )}
                    </div>
                    <div className="flex">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium border", zoneColors.bg, zoneColors.text, zoneColors.border)}>
                            {view.zoneLabel}
                        </span>
                    </div>
                </div>

                {/* Right: Value & Description */}
                <div className="flex flex-col items-end gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <span className={cn("text-xl font-mono font-bold tracking-tight", zoneColors.text)}>
                            {view.formattedValue}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#404040] group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs text-[#666] text-right line-clamp-1 group-hover:text-[#888] transition-colors">
                        {view.description}
                    </p>
                </div>
            </div>
        </Link>
    );
}

interface IndicatorsClientProps {
    viewModel: IndicatorsPageViewModel;
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

            {/* Alpha Tools Section (Unified Container) */}
            <section className={cn(SPACING.sectionGap)}>
                <UniversalCard variant="default" className="p-0 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                        <SectionHeaderCard
                            title="Alpha 工具箱"
                            icon={Activity}
                        />
                    </div>

                    {/* Grid of Tools (Explore More Style) */}
                    <div className="grid grid-cols-3 divide-x divide-[#1A1A1A] gap-px bg-[#1A1A1A]">
                        {viewModel.alphaTools.map(story => (
                            <Link key={story.id} href={`/indicators/${story.slug}`} className="group bg-[#0A0A0A] hover:bg-[#141414] transition-colors p-8 flex flex-col items-center justify-center gap-4 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20">
                                    {story.id === 'seasonality' && <Calendar className="w-6 h-6 text-indigo-400" />}
                                    {story.id === 'halving-cycles' && <Hourglass className="w-6 h-6 text-indigo-400" />}
                                    {story.id === 'divergence-screener' && <Search className="w-6 h-6 text-indigo-400" />}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-[#E0E0E0] group-hover:text-white transition-colors">
                                        {story.name}
                                    </h3>
                                    <div className="flex justify-center">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            ALPHA
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </UniversalCard>
            </section>


            {/* Market Metrics Section (Unified Container) */}
            <section className="mt-6">
                <UniversalCard variant="default" className="p-0 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                        <SectionHeaderCard
                            title="市場數據指標"
                            icon={LayoutDashboard}
                        />
                    </div>

                    {/* Single Column List */}
                    <div className="flex flex-col divide-y divide-[#1A1A1A]">
                        {viewModel.marketMetrics.map((view) => (
                            <IndicatorEntryCard key={view.id} view={view} />
                        ))}
                    </div>
                </UniversalCard>
            </section>
        </div>
    );
}
