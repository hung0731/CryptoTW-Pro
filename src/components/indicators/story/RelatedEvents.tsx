'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { REVIEWS_DATA } from '@/lib/reviews-data';

interface RelatedEventsProps {
    storyId: string;
}

export function RelatedEvents({ storyId }: RelatedEventsProps) {
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
