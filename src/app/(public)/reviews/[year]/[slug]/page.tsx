'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReview, getRelatedReviews } from '@/lib/reviews-data';
import { ArrowLeft, Share2, ChevronRight, Lightbulb, BookOpen } from 'lucide-react';
import { CARDS, TYPOGRAPHY } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { StrategyCard } from '@/components/StrategyCard';
import { UnifiedChartSection } from '@/components/UnifiedChartSection';
import { QuickReadHero } from '@/components/QuickReadHero';
import { DeepDiveTabs } from '@/components/DeepDiveTabs';

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
            emoji: '📉',
            value: review.context.realImpact?.split('，')[0] || '-20%',
            label: 'D0~D14'
        },
        ...(review.initialState.funding ? [{
            emoji: '💰',
            value: `${(Number(review.initialState.funding) * 100).toFixed(2)}%`,
            label: '資金費率'
        }] : []),
        ...(review.initialState.fearGreed ? [{
            emoji: '😱',
            value: `${review.initialState.fearGreed}`,
            label: 'FGI'
        }] : []),
    ];

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <Link href={`/reviews/${review.year}`} className="text-[#808080] hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="text-sm font-bold truncate max-w-[200px]">{review.title.split('：')[0]}</div>
                <button className="text-neutral-400 hover:text-white">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            <article className="max-w-3xl mx-auto">
                {/* ① 快讀區塊 - 30 秒掌握核心 */}
                <QuickReadHero
                    year={review.year}
                    title={review.title}
                    summary={review.summary}
                    importance={review.importance}
                    metrics={quickReadMetrics}
                />

                {/* ② 數據證據 - TradingView 風格統一圖表 */}
                <section className="px-5 pb-4">
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
                </section>

                {/* ③ 深入內容 - Tabs 整合 */}
                <DeepDiveTabs
                    timeline={review.timeline}
                    misconceptions={review.misconceptions}
                    relatedIndicators={review.relatedIndicators}
                    historicalComparison={review.historicalComparison}
                    reviewId={review.id}
                    reviewTitle={review.title}
                />

                {/* ④ 未來警訊 - 保留 */}
                <section className="p-5">
                    <div className={CARDS.primary}>
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-3.5 h-3.5 text-white" />
                            <h2 className={TYPOGRAPHY.cardSubtitle + " text-neutral-300"}>
                                下一次需要注意的不是價格，而是：
                            </h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {review.actionableChecklist.map((item, idx) => (
                                <StrategyCard
                                    key={idx}
                                    type={item.type as 'alert' | 'check' | 'insight'}
                                    title={item.label}
                                    content={item.desc}
                                    citation={item.citation}
                                    className="w-full"
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ⑤ 相關復盤 - 移到最底 */}
                {relatedReviews.length > 0 && (
                    <section className="p-5 pt-0 border-t border-white/5">
                        <h3 className="text-xs font-bold text-neutral-500 mb-4 mt-5 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" />
                            相關復盤
                        </h3>
                        <div className="space-y-2">
                            {relatedReviews.slice(0, 3).map((r) => (
                                <Link href={`/reviews/${r.year}/${r.slug}`} key={r.id}>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:bg-[#0E0E0F] group">
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-[#A0A0A0] group-hover:text-white">
                                                {r.title.split('：')[0]}
                                            </div>
                                            <div className="text-[10px] text-neutral-600 mt-0.5">
                                                {r.year}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#525252] group-hover:text-white" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </main>
    );
}
