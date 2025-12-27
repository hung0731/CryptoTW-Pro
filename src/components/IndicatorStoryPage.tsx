'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { IndicatorStory } from '@/lib/indicator-stories';
import dynamic from 'next/dynamic';
import { ChartCallout } from './indicators/story/ChartCallout';
import { UseCaseList } from './indicators/story/UseCaseList';
import { KnowledgeGraph } from './indicators/story/KnowledgeGraph';
import { RelatedEvents } from './indicators/story/RelatedEvents';

// Dynamically import heavy chart component
const ChartHero = dynamic(() => import('@/components/indicators/ChartHero').then(mod => mod.ChartHero), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-[#0A0A0B] rounded-2xl animate-pulse border border-white/5" />
});

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
