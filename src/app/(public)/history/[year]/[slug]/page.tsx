'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getReview, getRelatedReviews } from '@/lib/reviews-data';
import { Link as LinkIcon, ArrowLeft, Share2, ChevronRight, Lightbulb, BookOpen, LineChart, GitMerge, Calendar, Zap } from 'lucide-react';
import { Tag } from '@/components/ui/tag';
import { CARDS, TYPOGRAPHY } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { StrategyCard } from '@/components/StrategyCard';
import { UnifiedChartSection } from '@/components/UnifiedChartSection';
import { QuickReadHero } from '@/components/QuickReadHero';
import { DeepDiveTabs } from '@/components/DeepDiveTabs';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import for heavy chart component
const EventAnalysisDashboard = dynamic(
    () => import('@/components/reviews/EventAnalysisDashboard').then(mod => ({ default: mod.EventAnalysisDashboard })),
    {
        loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
        ssr: false,  // Disable SSR for chart components
    }
);

export default function ReviewDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const year = params.year as string;
    const review = getReview(slug, year);

    if (!review) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Event not found</div>;
    }
    const relatedReviews = getRelatedReviews(review.marketStates[0]).filter(r => r.id !== review.id);

    // 建立 QuickRead 的關鍵數據
    const quickReadMetrics = [
        {
            label: '最大回撤',
            value: review.maxDrawdown ? `${review.maxDrawdown}` : 'N/A',
            emoji: '📉',
            rowTitle: '風險評估'
        },
        {
            label: '資金費率',
            value: review.initialState.funding ? `${review.initialState.funding}` : 'N/A',
            emoji: '💰',
            rowTitle: '市場成本'
        },
        {
            label: '恐懼指數 (FGI)',
            value: review.initialState.fearGreed ? `${review.initialState.fearGreed}` : 'N/A',
            emoji: '😱',
            rowTitle: '市場情緒'
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* ... Header ... */}

            <article className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
                {/* 1. Event Introduction Card */}
                <UniversalCard className="p-0 overflow-hidden">
                    {/* Header: Tags & Meta */}
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tag variant="default" size="sm" icon={Calendar}>
                                {review.year}
                            </Tag>
                            <span className="text-xs font-bold text-[#E5E5E5]">
                                事件概覽
                            </span>
                        </div>
                        {/* Type Tag (if available) - assuming review.type exists, otherwise skip */}
                        <div className="flex items-center gap-2">
                            <Tag variant="error" size="sm" icon={Zap}>
                                即時分析
                            </Tag>
                        </div>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Title Section */}
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                {review.title.split(/[:：]/)[0]}
                            </h1>
                            {review.title.split(/[:：]/)[1] && (
                                <p className="text-sm sm:text-base text-[#888] font-medium leading-relaxed">
                                    {review.title.split(/[:：]/)[1].trim()}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                            {review.summary}
                        </p>
                    </div>

                    <div className="p-0">
                        <UnifiedChartSection
                            symbol={review.chartConfig?.symbol || 'BTC'}
                            eventStart={review.reactionStartAt}
                            eventEnd={review.eventEndAt}
                            newsDate={review.eventStartAt}
                            reviewSlug={`${review.slug}-${review.year}`}
                            daysBuffer={review.chartConfig?.daysBuffer || 10}
                            eventLabel={`D0: ${review.reactionStartAt.slice(5)}`}
                            availableTabs={[
                                ...(review.charts.flow ? [{
                                    id: 'flow',
                                    label: review.slug.includes('etf') ? 'ETF 資金流' : '資金流',
                                    chartType: 'flow' as const,
                                    interpretation: review.charts.flow.interpretation,
                                }] : []),

                                ...(review.charts.oi ? [{
                                    id: 'oi',
                                    label: '未平倉量',
                                    chartType: 'oi' as const,
                                    interpretation: review.charts.oi.interpretation,
                                }] : []),
                                ...(review.charts.sentiment ? [{
                                    id: 'fgi',
                                    label: '恐懼指數',
                                    chartType: 'fgi' as const,
                                    interpretation: review.charts.sentiment.interpretation,
                                }] : []),
                                ...(review.charts.funding ? [{
                                    id: 'funding',
                                    label: '資金費率',
                                    chartType: 'funding' as const,
                                    interpretation: review.charts.funding?.interpretation,
                                }] : []),
                                ...(review.charts.liquidation ? [{
                                    id: 'liquidation',
                                    label: '清算',
                                    chartType: 'liquidation' as const,
                                    interpretation: review.charts.liquidation?.interpretation,
                                }] : []),
                            ]}
                        />
                    </div>
                </UniversalCard>

                {/* 2.5 Intelligence Layer (Event DNA & Patterns) */}
                <EventAnalysisDashboard slug={`${review.slug}-${review.year}`} />

                {/* 3. Deep Dive Tabs */}
                <UniversalCard className="p-0 overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                        <SectionHeaderCard
                            title="深度分析"
                            icon={BookOpen}
                        />
                    </div>
                    <div>
                        <DeepDiveTabs
                            timeline={review.timeline}
                            misconceptions={review.misconceptions}
                            relatedIndicators={review.relatedIndicators}
                            historicalComparison={review.historicalComparison}
                            reviewId={review.id}
                            reviewTitle={review.title}
                        />
                    </div>
                </UniversalCard>

                {/* 4. Future Alerts */}
                <UniversalCard className="p-0 overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                        <SectionHeaderCard
                            title="未來警訊"
                            icon={Lightbulb}
                        />
                    </div>
                    {/* Seamless List Layout - Single Column */}
                    <div className="flex flex-col divide-y divide-[#1A1A1A]">
                        {review.actionableChecklist.map((item, idx) => (
                            <StrategyCard
                                key={idx}
                                type={item.type as 'alert' | 'check' | 'insight'}
                                title={item.label}
                                content={item.desc}
                                citation={item.citation}
                                className="rounded-none border-0 w-full"
                            />
                        ))}
                    </div>
                </UniversalCard>

                {/* 5. Related Reviews */}
                {relatedReviews.length > 0 && (
                    <UniversalCard className="p-0 overflow-hidden">
                        <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                            <SectionHeaderCard
                                title="相關復盤"
                                icon={GitMerge}
                            />
                        </div>
                        {/* Single Column List Layout */}
                        <div className="flex flex-col">
                            {relatedReviews.slice(0, 5).map((r) => (
                                <Link
                                    href={`/reviews/${r.year}/${r.slug}`}
                                    key={r.id}
                                    className="group block p-4 sm:p-5 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0E0E0F] transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Year Badge */}
                                        <div className="shrink-0 mt-1">
                                            <Tag variant="default" size="sm">
                                                {r.year}
                                            </Tag>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm sm:text-base font-bold text-[#E0E0E0] group-hover:text-white transition-colors truncate pr-2">
                                                    {r.title.split('：')[0]}
                                                </h3>
                                                <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-white transition-colors shrink-0" />
                                            </div>
                                            <p className="text-xs text-[#666] group-hover:text-[#888] line-clamp-2 leading-relaxed">
                                                {r.summary}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </UniversalCard>
                )}
            </article>
        </main >
    );
}
