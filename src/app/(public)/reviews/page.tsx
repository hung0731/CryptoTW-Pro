'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Clock, TrendingUp, AlertTriangle, BookOpen, ChevronRight, Filter } from 'lucide-react';

export default function ReviewsPage() {
    const [activeTab, setActiveTab] = useState('featured');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Sorting Logic
    const getSortedReviews = (tab: string) => {
        let sorted = [...REVIEWS_DATA];

        switch (tab) {
            case 'featured':
                return sorted
                    .filter(r => r.featuredRank !== undefined)
                    .sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));
            case 'major':
                return sorted.sort((a, b) => {
                    const importanceScore = { 'S': 3, 'A': 2, 'B': 1 };
                    return importanceScore[b.importance] - importanceScore[a.importance];
                });
            case 'latest':
                return sorted.sort((a, b) => new Date(b.eventEndAt).getTime() - new Date(a.eventEndAt).getTime());
            default:
                return sorted;
        }
    };

    const displayReviews = getSortedReviews(activeTab).filter(r =>
        selectedTag ? r.tags.includes(selectedTag) : true
    );

    const allTags = Array.from(new Set(REVIEWS_DATA.flatMap(r => r.tags)));

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 pt-12 pb-4 px-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">📓 市場復盤</h1>
                    <span className="text-xs font-mono text-neutral-500">{REVIEWS_DATA.length} Events</span>
                </div>

                {/* Sorting Tabs */}
                <Tabs defaultValue="featured" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 bg-neutral-900/50 p-1 rounded-lg">
                        <TabsTrigger value="featured" className="text-xs">精選</TabsTrigger>
                        <TabsTrigger value="major" className="text-xs">重大</TabsTrigger>
                        <TabsTrigger value="latest" className="text-xs">最新</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="p-4 space-y-6">
                {/* Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <Filter className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={cn(
                            "text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border",
                            selectedTag === null
                                ? "bg-white text-black border-white"
                                : "bg-neutral-900 text-neutral-400 border-white/10 hover:border-white/20"
                        )}
                    >
                        全部
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={cn(
                                "text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border",
                                selectedTag === tag
                                    ? "bg-white text-black border-white"
                                    : "bg-neutral-900 text-neutral-400 border-white/10 hover:border-white/20"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Review List */}
                <div className="space-y-1">
                    {displayReviews.map((review) => (
                        <Link href={`/reviews/${review.slug}`} key={review.id}>
                            <div className="group relative bg-neutral-900/30 border border-white/[0.03] hover:bg-neutral-800/50 hover:border-white/[0.08] transition-all duration-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-neutral-500">{review.year}</span>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] px-1 py-0 border-0",
                                                review.importance === 'S' ? "bg-red-500/20 text-red-500" :
                                                    review.importance === 'A' ? "bg-orange-500/20 text-orange-500" :
                                                        "bg-blue-500/20 text-blue-500"
                                            )}>
                                                {review.importance} 級
                                            </Badge>
                                            {review.isProOnly && (
                                                <Badge variant="secondary" className="text-[9px] bg-neutral-800 text-amber-400 px-1 py-0 h-4">PRO</Badge>
                                            )}
                                        </div>

                                        <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors leading-tight">
                                            {review.title}
                                        </h3>

                                        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                                            {review.summary}
                                        </p>

                                        <div className="flex items-center gap-2 pt-1">
                                            {review.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                            <span className="text-[10px] text-neutral-600 flex items-center gap-1 ml-auto">
                                                <Clock className="w-3 h-3" />
                                                {review.readingMinutes} min
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 mt-1" />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {displayReviews.length === 0 && (
                        <div className="text-center py-12 text-neutral-500 text-sm">
                            沒有找到符合條件的復盤記錄
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
