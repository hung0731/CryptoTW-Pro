'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Info, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS, SPACING } from '@/lib/design-tokens';
import { IndicatorStory } from '@/lib/indicator-stories';
import { REVIEWS_DATA } from '@/lib/reviews-data';
import { getRelatedEvents, getRelatedIndicators, getPrerequisiteConcepts } from '@/lib/semantic-linkage';
import { ChartHero } from '@/components/indicators/ChartHero';

// ================================================
// SECTION CARD - 統一容器
// ================================================
interface SectionCardProps {
    children: React.ReactNode;
    className?: string;
}

function SectionCard({ children, className }: SectionCardProps) {
    return (
        <section className={cn(CARDS.primary, SPACING.card, className)}>
            {children}
        </section>
    );
}

// ================================================
// ① CHART CALLOUT - 怎麼看這張圖？
// ================================================
interface ChartCalloutProps {
    points: string[];
}

function ChartCallout({ points }: ChartCalloutProps) {
    return (
        <SectionCard className="bg-[#080808] border-dashed">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                    <h2 className={cn(TYPOGRAPHY.cardSubtitle, "mb-3")}>怎麼看這張圖？</h2>
                    <ul className="space-y-2">
                        {points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-neutral-600 mt-2 flex-shrink-0" />
                                <p className={cn("text-xs leading-relaxed", COLORS.textSecondary)}>
                                    {point}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </SectionCard>
    );
}

// ================================================
// ② USE CASE LIST - 這個指標在判斷什麼？
// ================================================
interface UseCaseListProps {
    useCases: IndicatorStory['useCases'];
}

const USE_CASE_TYPE_LABELS: Record<string, string> = {
    observe: '觀察',
    risk: '風險',
    timing: '時機',
};

function UseCaseList({ useCases }: UseCaseListProps) {
    return (
        <SectionCard>
            <h2 className={cn(TYPOGRAPHY.sectionLabel, "mb-3")}>這個指標在判斷什麼？</h2>
            <div className="space-y-3">
                {useCases.map((uc, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-medium bg-neutral-800 text-neutral-400 uppercase tracking-wider flex-shrink-0 mt-0.5"
                        )}>
                            {USE_CASE_TYPE_LABELS[uc.type]}
                        </span>
                        <p className={cn("text-sm leading-relaxed", COLORS.textSecondary)}>{uc.description}</p>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}

// ================================================
// ③ RELATED EVENTS - 相關歷史事件
// ================================================
function RelatedEvents({ storyId }: { storyId: string }) {
    // 獲取相關事件（自動關聯）
    const relatedEvents = getRelatedEvents(storyId);

    // 如果沒有關聯事件，則看是否有直接定義的 reviews
    const manualReviews = relatedEvents.length === 0
        ? Object.values(REVIEWS_DATA)
            .filter(r => r.tags.includes(storyId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
        : [];

    // 優先顯示自動關聯，其次手動
    const displayEvents = relatedEvents.length > 0
        ? relatedEvents.map(rev => ({
            id: rev.id,
            date: rev.date,
            title: rev.title,
            impact: rev.impact
        }))
        : manualReviews.map(rev => ({
            id: rev.id,
            date: rev.date,
            title: rev.title,
            impact: 100 // Default placeholder
        }));

    if (displayEvents.length === 0) return null;

    return (
        <SectionCard>
            <div className="flex items-center justify-between mb-3">
                <h2 className={TYPOGRAPHY.sectionLabel}>相關歷史事件回顧</h2>
                <Link href="/reviews" className="text-xs text-neutral-500 hover:text-white flex items-center">
                    更多 <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="space-y-0 divide-y divide-white/5">
                {displayEvents.map((evt) => (
                    <Link
                        key={evt.id}
                        href={`/reviews/${evt.id}`}
                        className="flex items-center justify-between py-3 hover:bg-white/5 px-2 -mx-2 rounded transition-colors group"
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                                {evt.title}
                            </span>
                            <span className="text-xs text-neutral-500">{evt.date}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-neutral-400" />
                    </Link>
                ))}
            </div>
        </SectionCard>
    );
}

// ================================================
// ④ KNOWLEDGE GRAPH - 知識圖譜：相關指標與概念
// ================================================
function KnowledgeGraph({ storyId }: { storyId: string }) {
    const relatedIndicators = getRelatedIndicators(storyId);
    const prerequisiteConcepts = getPrerequisiteConcepts(storyId);

    if (relatedIndicators.length === 0 && prerequisiteConcepts.length === 0) return null;

    return (
        <SectionCard>
            <h2 className={TYPOGRAPHY.sectionLabel}>知識圖譜：延伸閱讀</h2>
            <div className="space-y-4 pt-2">
                {/* 1. 先備知識 (Concepts) */}
                {prerequisiteConcepts.length > 0 && (
                    <div>
                        <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">基礎概念</h3>
                        <div className="flex flex-wrap gap-2">
                            {prerequisiteConcepts.map((concept, i) => (
                                <Link
                                    key={i}
                                    href={`/dictionary/${concept.slug}`}
                                    className="px-3 py-1.5 rounded-md bg-neutral-900 border border-white/5 text-xs text-neutral-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    {concept.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. 相關指標 (Indicators) */}
                {relatedIndicators.length > 0 && (
                    <div>
                        <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">相關指標</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {relatedIndicators.map((ind, i) => (
                                <Link
                                    key={i}
                                    href={`/indicators/${ind.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-white/5 hover:bg-white/5 transition-all group"
                                >
                                    <div>
                                        <div className="text-xs font-bold text-neutral-300 group-hover:text-white flex items-center gap-2">
                                            {ind.title}
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-normal">
                                                關聯度：{ind.relevance}%
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{ind.relation}</p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </SectionCard>
    );
}

// ================================================
// MAIN PAGE COMPONENT
// ================================================
interface IndicatorStoryPageProps {
    story: IndicatorStory;
}

export function IndicatorStoryPage({ story }: IndicatorStoryPageProps) {
    const searchParams = useSearchParams();
    const from = searchParams.get('from');

    // Breadcrumb logic
    const getBackLink = () => {
        if (from === 'home') return '/';
        if (from === 'market') return '/market';
        return '/indicators';
    };

    const getBackLabel = () => {
        if (from === 'home') return '首頁';
        if (from === 'market') return '市場';
        return '指標總覽';
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center h-14 px-4 gap-3">
                    <Link href={getBackLink()} className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold tracking-wide">{story.name}</h1>
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Link href={getBackLink()} className="hover:underline">{getBackLabel()}</Link>
                            <ChevronRight className="w-3 h-3" />
                            {story.category.split(' ')[0]}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

                {/* 0. Chart Hero (Extracted) */}
                <ChartHero story={story} />

                {/* 1. Callout (Interpretation) */}
                <ChartCallout points={story.chart.calloutPoints} />

                {/* 2. Use Cases */}
                <UseCaseList useCases={story.useCases} />

                {/* 3. Related Events (Integration) */}
                <RelatedEvents storyId={story.id} />

                {/* 4. Knowledge Graph (Semantic Links) */}
                <KnowledgeGraph storyId={story.id} />

                {/* 5. Definition (Bottom) */}
                <SectionCard className="border-t border-white/5 pt-6 mt-8">
                    <h2 className={TYPOGRAPHY.sectionLabel}>指標定義</h2>
                    <p className={cn("mt-2 text-xs leading-relaxed", COLORS.textTertiary)}>
                        {story.definition}
                    </p>
                </SectionCard>

            </main>
        </div>
    );
}
