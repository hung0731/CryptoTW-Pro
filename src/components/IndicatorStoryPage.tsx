'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Info, Undo2, HelpCircle, BookOpen, GitMerge, Lightbulb, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARDS, TYPOGRAPHY, COLORS, SPACING } from '@/lib/design-tokens';
import { IndicatorStory } from '@/lib/indicator-stories';
import { REVIEWS_DATA } from '@/lib/reviews-data';
import { getRelatedEvents, getRelatedIndicators, getPrerequisiteConcepts } from '@/lib/semantic-linkage';
import { ChartHero } from '@/components/indicators/ChartHero';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';

// ================================================
// ① CHART CALLOUT - 怎麼看這張圖？
// ================================================
interface ChartCalloutProps {
    points: string[];
}

function ChartCallout({ points }: ChartCalloutProps) {
    return (
        <UniversalCard className="p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="怎麼看這張圖？"
                    icon={Info}
                />
            </div>
            <div className="p-5">
                <ul className="space-y-4">
                    {points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                            <p className={cn("text-sm leading-relaxed text-neutral-300")}>
                                {point}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </UniversalCard>
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

const USE_CASE_TYPE_COLORS: Record<string, string> = {
    observe: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    risk: 'bg-red-500/10 text-red-400 border-red-500/20',
    timing: 'bg-green-500/10 text-green-400 border-green-500/20',
};

function UseCaseList({ useCases }: UseCaseListProps) {
    return (
        <UniversalCard className="p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="這個指標在判斷什麼？"
                    icon={Target}
                />
            </div>
            <div className="p-0">
                <div className="flex flex-col divide-y divide-[#1A1A1A]">
                    {useCases.map((uc, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 hover:bg-[#141414] transition-colors">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border flex-shrink-0 mt-0.5",
                                USE_CASE_TYPE_COLORS[uc.type] || "bg-neutral-800 text-neutral-400"
                            )}>
                                {USE_CASE_TYPE_LABELS[uc.type]}
                            </span>
                            <p className="text-sm leading-relaxed text-[#D4D4D4]">{uc.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </UniversalCard>
    );
}

// ================================================
// ③ RELATED EVENTS - 相關歷史事件
// ================================================
function RelatedEvents({ storyId }: { storyId: string }) {
    // Filter REVIEWS_DATA
    const matchedReviews = REVIEWS_DATA
        .filter(r => {
            const hasExplicitLink = r.relatedIndicators?.some(ri => ri.slug === storyId);
            const hasImplicitLink = r.relatedMetrics?.some(m => {
                if (storyId === 'fear-greed' && m === 'fearGreed') return true;
                if (storyId === 'funding-rate' && m === 'funding') return true;
                if (storyId === 'long-short-ratio' && m === 'longShort') return true;
                if (storyId === 'open-interest' && m === 'oi') return true;
                return false;
            });
            return hasExplicitLink || hasImplicitLink;
        })
        .sort((a, b) => new Date(b.eventStartAt).getTime() - new Date(a.eventStartAt).getTime())
        .slice(0, 3);

    if (matchedReviews.length === 0) return null;

    return (
        <UniversalCard className="p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="相關歷史事件回顧"
                    icon={BookOpen}
                    rightElement={
                        <Link href="/reviews" className="text-xs text-neutral-500 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors">
                            查看全部 <ChevronRight className="w-3 h-3" />
                        </Link>
                    }
                />
            </div>
            <div className="flex flex-col divide-y divide-[#1A1A1A]">
                {matchedReviews.map((evt) => (
                    <Link
                        key={evt.id}
                        href={`/reviews/${evt.id}`}
                        className="group flex items-center justify-between p-4 hover:bg-[#141414] transition-colors"
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-[#E0E0E0] group-hover:text-white transition-colors">
                                {evt.title}
                            </span>
                            <span className="text-xs text-[#666] group-hover:text-[#888] font-mono">
                                {evt.eventStartAt}
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-white transition-colors" />
                    </Link>
                ))}
            </div>
        </UniversalCard>
    );
}

// ================================================
// ④ KNOWLEDGE GRAPH - 知識圖譜
// ================================================
function KnowledgeGraph({ storyId }: { storyId: string }) {
    const relatedIndicators = getRelatedIndicators(storyId);
    const prerequisiteConcepts = getPrerequisiteConcepts(storyId);

    if (relatedIndicators.length === 0 && prerequisiteConcepts.length === 0) return null;

    return (
        <UniversalCard className="p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="知識圖譜：延伸學習"
                    icon={GitMerge}
                />
            </div>

            <div className="divide-y divide-[#1A1A1A]">
                {/* 1. Concepts */}
                {prerequisiteConcepts.length > 0 && (
                    <div className="p-4">
                        <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" />
                            基礎概念
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {prerequisiteConcepts.map((concept, i) => (
                                <Link
                                    key={i}
                                    href={`/dictionary/${concept.id}`}
                                    className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 hover:bg-[#202020] transition-all"
                                >
                                    {concept.term}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Related Indicators */}
                {relatedIndicators.length > 0 && (
                    <div className="p-0">
                        <div className="px-4 py-2 bg-[#141414]/50 border-b border-[#1A1A1A] flex items-center gap-2">
                            <GitMerge className="w-3 h-3 text-neutral-500" />
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">相關指標</span>
                        </div>
                        <div className="flex flex-col divide-y divide-[#1A1A1A]">
                            {relatedIndicators.map((ind, i) => (
                                <Link
                                    key={i}
                                    href={`/indicators/${ind.slug}`}
                                    className="flex items-center justify-between p-4 hover:bg-[#141414] transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">
                                            {ind.name}
                                        </div>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-neutral-500 font-medium">
                                            {ind.reason}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </UniversalCard>
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
                <div className="max-w-3xl mx-auto flex items-center h-14 px-4 gap-3 relative">
                    <Link href={getBackLink()} className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold tracking-wide text-white">{story.name}</h1>
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                            <Link href={getBackLink()} className="hover:underline">{getBackLabel()}</Link>
                            <ChevronRight className="w-2.5 h-2.5" />
                            INDICATOR
                        </span>
                    </div>

                    {/* Contextual Hint Button */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Link
                            href={`/learn?from=${story.slug}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444] hover:bg-[#202020] transition-all"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

                {/* 0. Chart Hero */}
                <section>
                    <ChartHero story={story} />
                </section>

                <div className="space-y-8">
                    {/* 1. Callout */}
                    <ChartCallout points={story.chartCallout.points} />

                    {/* 2. Use Cases */}
                    <UseCaseList useCases={story.useCases} />

                    {/* 3. Knowledge Graph */}
                    <KnowledgeGraph storyId={story.id} />

                    {/* 4. Related Events */}
                    <RelatedEvents storyId={story.id} />
                </div>

            </main>
        </div>
    );
}

