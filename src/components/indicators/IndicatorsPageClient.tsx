'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronRight, Loader2, Activity, LayoutDashboard, Calendar, Hourglass, Search,
    Gauge, ArrowLeftRight, Scale, PieChart, Coins, Landmark, TrendingUp, LineChart, Zap, Crown, Sparkles
} from 'lucide-react';
import { Tag } from '@/components/ui/tag';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { IndicatorStory, ZONE_COLORS } from '@/lib/indicator-stories';
import { AIQuickRead } from '@/components/ui/AIQuickRead';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { IndicatorMetricView, IndicatorsPageViewModel } from '@/lib/services/indicators-list';

function getIndicatorIcon(id: string) {
    switch (id) {
        case 'fear-greed': return Gauge;
        case 'funding-rate': return ArrowLeftRight;
        case 'long-short-ratio': return Scale;
        case 'btc-dominance': return PieChart;
        case 'open-interest': return Activity;
        case 'stablecoin-supply': return Coins;
        case 'exchange-balance': return Landmark;
        case 'etf-net-flow': return TrendingUp;
        default: return LineChart;
    }
}

// Helper to map zones to Tag variants
function getZoneVariant(zone: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
    switch (zone) {
        case 'fear': return 'success';      // Low/Buy -> Green
        case 'lean_fear': return 'info';    // Neutral-Low -> Blue (Brand/Info)
        case 'lean_greed': return 'warning';// Neutral-High -> Yellow/Orange
        case 'greed': return 'error';       // High/Sell -> Red
        default: return 'default';
    }
}

// Single Column Card Style
function IndicatorEntryCard({ view }: { view: IndicatorMetricView }) {
    const Icon = getIndicatorIcon(view.id);
    const zoneColors = ZONE_COLORS[view.zone as keyof typeof ZONE_COLORS] || ZONE_COLORS['lean_fear'];

    return (
        <Link href={`/indicators/${view.slug}`} className="block group relative p-5 hover:bg-[#141414] transition-colors border-b border-[#1A1A1A] last:border-0">
            <div className="flex items-center gap-4">
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0 group-hover:bg-[#202020] group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
                </div>

                {/* Content Container */}
                <div className="flex-1 flex items-start justify-between gap-4 min-w-0">
                    {/* Left: Title & Badge */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{view.name}</h3>
                            {view.isPro && (
                                <Tag
                                    variant="warning"
                                    size="sm"
                                    icon={Crown}
                                    className="bg-yellow-900/20 text-yellow-400 border-yellow-700/30"
                                >
                                    PRO
                                </Tag>
                            )}
                        </div>
                        <div className="flex">
                            <Tag variant={getZoneVariant(view.zone)} size="sm">
                                {view.zoneLabel}
                            </Tag>
                        </div>
                    </div>

                    {/* Right: Value & Description */}
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <div className="flex items-center gap-1">
                            <span className={cn("text-xl font-mono font-bold tracking-tight", zoneColors.text)}>
                                {view.formattedValue}
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#404040] group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-xs text-[#666] text-right line-clamp-1 group-hover:text-[#888] transition-colors max-w-[150px]">
                            {view.description}
                        </p>
                    </div>
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
    const [aiSummary, setAiSummary] = useState<{ summary: string, recommended_readings?: Array<{ title: string, path: string }> } | null>(null);
    const [aiLoading, setAiLoading] = useState(true);

    // Load AI summary immediately - no artificial delay
    // Cache will make this instant on subsequent loads
    React.useEffect(() => {
        // v5: Added mandatory reasoning for recommendations
        const fgi = viewModel.marketMetrics.find(m => m.id === 'fear-greed')
        const funding = viewModel.marketMetrics.find(m => m.id === 'funding-rate')
        const lsRatio = viewModel.marketMetrics.find(m => m.id === 'long-short-ratio')

        // Only create a cache key if essential data is available
        const indicatorData = (fgi && funding && lsRatio) ? {
            fearGreedIndex: { value: fgi.value, zone: fgi.zone },
            fundingRate: funding.value / 100,
            longShortRatio: lsRatio.value,
        } : null;

        const CACHE_KEY = indicatorData ? `indicator-ai-summary-v5-${JSON.stringify(indicatorData)}` : null;
        const CACHE_TTL = 10 * 60 * 1000;

        const fetchSummary = async () => {
            if (!CACHE_KEY) {
                setAiLoading(false);
                return;
            }

            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { summary, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setAiSummary(summary); // summary here is actually the whole object in cache
                        setAiLoading(false);
                        return;
                    }
                } catch (e) {
                    // Cache parse error, ignore
                }
            }

            try {
                // Map view model back to payload structure required by API
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
                        setAiSummary(data); // Store full object
                        localStorage.setItem(CACHE_KEY, JSON.stringify({
                            summary: data, // Store full object
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

        // Execute immediately - cache will make this instant
        void fetchSummary()
    }, [viewModel])

    return (
        <div className={cn("max-w-3xl mx-auto", SPACING.pageX, SPACING.pageTop)}>
            {/* AI 總結卡片 */}
            <div className="mb-4">
                <AIQuickRead
                    summary={aiSummary?.summary || '正在分析各項市場數據...'}
                    source="AI 市場觀察"
                    loading={aiLoading}
                    recommendations={aiSummary?.recommended_readings}
                />
            </div>

            {/* Alpha Tools Section (Unified Container) */}
            <section className={cn(SPACING.sectionGap)}>
                <UniversalCard variant="luma" className="p-0 overflow-hidden">
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
                                    {story.id === 'seasonality' && <Calendar className="w-6 h-6 text-[#8B5CF6]" />}
                                    {story.id === 'halving-cycles' && <Hourglass className="w-6 h-6 text-[#8B5CF6]" />}
                                    {story.id === 'divergence-screener' && <Search className="w-6 h-6 text-[#8B5CF6]" />}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-[#E0E0E0] group-hover:text-white transition-colors">
                                        {story.name}
                                    </h3>
                                    <div className="flex justify-center">
                                        <Tag variant="outline" size="sm" icon={Sparkles} className="bg-white/5 text-neutral-400 border-white/10 group-hover:text-white group-hover:border-white/20 transition-colors">
                                            ALPHA
                                        </Tag>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </UniversalCard>
            </section>


            {/* Market Metrics Section (Unified Container) */}
            <section className="mt-6">
                <UniversalCard variant="luma" className="p-0 overflow-hidden">
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
