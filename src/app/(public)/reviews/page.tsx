'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Clock, TrendingUp, AlertTriangle, BookOpen, ChevronRight, Filter, Search, Calendar, Star } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export default function ReviewsPage() {
    // State
    const [activeTab, setActiveTab] = useState('all'); // 'all' (was featured/major)
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- P1: Editor's Pick (Must Read) ---
    // Hardcoded list as requested: ETF 2024, FTX 2022, COVID 2020
    const MUST_READ_SLUGS = ['bitcoin-etf-launch-2024', 'ftx-collapse-2022', 'covid-crash-2020'];
    const mustReadReviews = REVIEWS_DATA.filter(r => MUST_READ_SLUGS.includes(r.slug));

    // Remaining Reviews (Non-Must Read, or All if user wants to browse)
    // Actually user wants "Editor's Pick" to be separate from the list.
    // Let's keep a "Browse" section below.

    // --- Helpers ---
    const allYears = Array.from(new Set(REVIEWS_DATA.map(r => r.year))).sort((a, b) => b - a);
    const apiTags = Array.from(new Set(REVIEWS_DATA.flatMap(r => r.tags)));

    // --- P0: Context Entry Scenarios ---
    const SCENARIOS = [
        { label: '市場崩潰時怎麼發生的', icon: AlertTriangle, filter: { tag: '崩跌' } }, // Or tag: '系統性風險'
        { label: '機構資金進場的案例', icon: TrendingUp, filter: { tag: '機構資金' } },
        { label: '結構性風險怎麼累積', icon: BookOpen, filter: { tag: '系統性風險' } },
        { label: '機制失效的教訓', icon: AlertTriangle, filter: { tag: '機制風險' } },
    ];

    const applyScenario = (tag: string) => {
        setSelectedTag(tag);
        setSelectedYear(null);
        setActiveTab('all'); // switch to list view
        window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll to list
    }

    // --- Filtering Logic ---
    const getFilteredReviews = () => {
        let filtered = REVIEWS_DATA;

        // 1. Tag
        if (selectedTag) {
            filtered = filtered.filter(r => r.tags.includes(selectedTag));
        }

        // 2. Year
        if (selectedYear) {
            filtered = filtered.filter(r => r.year === selectedYear);
        }

        // 3. Search (Simple implementation for P2 future proofing)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.slug.includes(q)
            );
        }

        // Sort by Date Descending
        return filtered.sort((a, b) => new Date(b.eventEndAt).getTime() - new Date(a.eventEndAt).getTime());
    };

    const displayReviews = getFilteredReviews();

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header & P0: Context Entry */}
            <div className="bg-black/80 backdrop-blur-xl border-b border-white/5 pt-12 pb-6 px-4 sticky top-0 z-40">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">📓 市場復盤</h1>
                        <p className="text-xs text-neutral-500 mt-1">把歷史變成可查詢的投資記憶</p>
                    </div>
                    {/* Year Jump (P1) */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-full text-xs text-neutral-300">
                                <Calendar className="w-3 h-3" />
                                {selectedYear || '所有年份'}
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="bg-neutral-950 border-white/10 p-6 rounded-t-xl h-[40vh]">
                            <SheetHeader className="mb-4">
                                <SheetTitle className="text-neutral-200 text-sm">選擇年份</SheetTitle>
                                <SheetDescription className="text-xs text-neutral-500">跳轉至特定年份的市場復盤</SheetDescription>
                            </SheetHeader>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setSelectedYear(null)}
                                    className={cn("p-2 rounded-lg text-xs font-mono border", !selectedYear ? "bg-white text-black border-white" : "bg-neutral-900 text-neutral-400 border-white/10")}
                                >
                                    ALL
                                </button>
                                {allYears.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={cn("p-2 rounded-lg text-xs font-mono border", selectedYear === year ? "bg-white text-black border-white" : "bg-neutral-900 text-neutral-400 border-white/10")}
                                    >
                                        {year} <span className="text-[10px] opacity-50 ml-1">({REVIEWS_DATA.filter(r => r.year === year).length})</span>
                                    </button>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* P0: Scenario Entry */}
                {!selectedTag && !selectedYear && (
                    <div className="space-y-3 mb-2">
                        <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider pl-1">我想找...</span>
                        <div className="grid grid-cols-2 gap-2">
                            {SCENARIOS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyScenario(s.filter.tag)}
                                    className="text-left p-3 rounded-lg bg-neutral-900/50 border border-white/5 hover:bg-neutral-800 transition-colors"
                                >
                                    <h4 className="text-xs text-neutral-300 font-medium mb-0.5">{s.label}</h4>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {(selectedTag || selectedYear) && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Filtered by:</span>
                        {selectedTag && (
                            <Badge variant="secondary" onClick={() => setSelectedTag(null)} className="cursor-pointer bg-white text-black hover:bg-neutral-200 text-[10px] h-5 px-2">
                                #{selectedTag} <span className="ml-1 text-xs">×</span>
                            </Badge>
                        )}
                        {selectedYear && (
                            <Badge variant="secondary" onClick={() => setSelectedYear(null)} className="cursor-pointer bg-white text-black hover:bg-neutral-200 text-[10px] h-5 px-2">
                                {selectedYear} <span className="ml-1 text-xs">×</span>
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 space-y-8">

                {/* P1: Must Read (Only show when no specific filter active or if it matches) */}
                {(!selectedTag && !selectedYear) && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <h2 className="text-sm font-bold text-neutral-200">第一次來必讀</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {mustReadReviews.map(review => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Browse List */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-neutral-200">
                            {selectedTag ? `#${selectedTag} 相關復盤` : selectedYear ? `${selectedYear} 歷史紀錄` : '完整記憶庫'}
                        </h2>
                        <span className="text-xs text-neutral-600 font-mono">{displayReviews.length} 篇</span>
                    </div>

                    {/* Filter Chips (Horizontal Scroll) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
                        <Filter className="w-3 h-3 text-neutral-600 flex-shrink-0" />
                        {apiTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={cn(
                                    "text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border",
                                    selectedTag === tag
                                        ? "bg-neutral-200 text-black border-neutral-200"
                                        : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20"
                                )}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {displayReviews.length > 0 ? (
                            displayReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-neutral-900/30 rounded-xl border border-white/5 border-dashed">
                                <p className="text-neutral-500 text-xs mb-2">沒有找到相關歷史紀錄</p>
                                <button onClick={() => { setSelectedTag(null); setSelectedYear(null) }} className="text-blue-400 text-xs hover:underline">
                                    清除篩選
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

// --- P0: Card Redesign ---
// [S級｜系統性風險]
// 2022 FTX 倒閉
// 一句話結論（淡色）
// Tags
function ReviewCard({ review }: { review: MarketEvent }) {
    // Extract first sentence or use summary text. User wants "One sentence conclusion".
    // We will use the full summary but truncate it visually to 1 line?
    // Or maybe we process the summary to be shorter.
    // User Ex: "中心化信任崩潰，而非單一資產下跌"
    // Our data `summary`: "當 FTX ... 宣佈破產時..." (Longer)
    // We will use `line-clamp-1` and a more subtle color.

    return (
        <Link href={`/reviews/${review.slug}`} className="block">
            <div className="group bg-neutral-900/30 border border-white/[0.05] hover:bg-neutral-900/60 hover:border-white/20 transition-all duration-200 rounded-xl p-4 relative overflow-hidden">

                {/* Header Meta: Grade | Type */}
                <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className={cn(
                        "text-[9px] px-1.5 py-0 border h-4 font-mono",
                        review.importance === 'S' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            review.importance === 'A' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                        {review.importance} 級
                    </Badge>
                    <span className="text-[10px] text-neutral-500">|</span>
                    <span className="text-[10px] text-neutral-400">{review.tags[0]}</span>

                    <span className="ml-auto text-[10px] font-mono text-neutral-600">{review.year}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors mb-1">
                    {review.title}
                </h3>

                {/* P0: One-line Conclusion */}
                <p className="text-[11px] text-neutral-500 line-clamp-1 leading-relaxed mb-3">
                    {review.summary}
                </p>

                {/* Footer Tags (Secondary) */}
                <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 mt-1">
                    <div className="flex gap-2">
                        {review.tags.slice(1, 3).map(tag => (
                            <span key={tag} className="text-[9px] text-neutral-600 hover:text-neutral-500">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <ChevronRight className="w-3 h-3 text-neutral-700 group-hover:text-neutral-400 transition-colors" />
                </div>
            </div>
        </Link>
    )
}
