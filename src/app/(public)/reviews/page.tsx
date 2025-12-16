'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ReviewCarousel } from '@/components/reviews/ReviewCarousel';
import {
    Zap,
    Landmark,
    Building2,
    Globe,
    TrendingDown,
    BarChart2,
    ArrowRightLeft,
    Search,
    X,
    Filter
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

// Calculate available years from data directly
const AVAILABLE_YEARS = Array.from(new Set(REVIEWS_DATA.map(d => d.year))).sort((a, b) => b - a);

export default function ReviewsPage() {
    // State
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Filter Categories ---
    const FILTERS = [
        { label: '全部', value: null, icon: null },
        { label: '政策監管', value: 'policy_regulation', icon: Landmark },
        { label: '交易所', value: 'exchange_event', icon: Building2 },
        { label: '槓桿清算', value: 'leverage_cleanse', icon: Zap },
        { label: '黑天鵝', value: 'macro_shock', icon: Globe },
        { label: '市場結構', value: 'market_structure', icon: TrendingDown },
    ];

    // --- Derived Data ---
    const { filteredReviews, featuredReviews } = useMemo(() => {
        let filtered = REVIEWS_DATA;

        // 1. Year Filter (Timeline)
        if (selectedYear) {
            filtered = filtered.filter(r => r.year === selectedYear);
        }

        // 2. Type Filter
        if (selectedType) {
            filtered = filtered.filter(r => r.type === selectedType);
        }

        // 3. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.impactSummary?.toLowerCase().includes(q) ||
                r.slug.includes(q) ||
                r.tags?.some(t => t.toLowerCase().includes(q)) ||
                r.impactedTokens?.some(t => t.toLowerCase().includes(q)) ||
                String(r.year).includes(q)
            );
        }

        // Sort by Date Descending
        filtered.sort((a, b) => new Date(b.eventEndAt).getTime() - new Date(a.eventEndAt).getTime());

        // Featured: Sort by Featured Rank then Importance
        const featured = REVIEWS_DATA
            .filter(r => r.importance === 'S' || (r.featuredRank && r.featuredRank > 0))
            .sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99))
            .slice(0, 6);

        return { filteredReviews: filtered, featuredReviews: featured };
    }, [selectedYear, selectedType, searchQuery]);

    const hasActiveFilters = selectedType || selectedYear || searchQuery;

    const clearFilters = () => {
        setSelectedType(null);
        setSelectedYear(null);
        setSearchQuery('');
    };

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader title="市場復盤資料庫" showLogo={false} backHref="/" backLabel="返回" />

            {/* 1. Editor's Picks (Carousel) */}
            {!hasActiveFilters && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4 mb-4">
                    <ReviewCarousel items={featuredReviews} />

                    {/* 1.5 Historical Comparison Card */}
                    <div className="px-4">
                        <Link
                            href="/reviews/compare"
                            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-900/10 border border-amber-500/20 active:scale-[0.98] transition-all hover:border-amber-500/40"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-amber-100">歷史對照模式</h3>
                                    <p className="text-[10px] text-amber-200/60">比較兩個事件的結構差異 (Compare Mode)</p>
                                </div>
                            </div>
                            <div className="bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded">
                                TRY
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            <div className="sticky top-[56px] z-30 bg-black/95 backdrop-blur-xl border-b border-white/5 transition-all">
                <div className="px-4 py-4 space-y-4">
                    {/* 2. Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋事件 / 代幣 (BTC) / 類型 (FTX)..."
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-3 h-3 text-neutral-500 hover:text-white" />
                            </button>
                        )}
                    </div>

                    {/* 3. Filter Chips (Horizontal) */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
                        {FILTERS.map((f) => (
                            <button
                                key={f.label}
                                onClick={() => setSelectedType(selectedType === f.value ? null : f.value)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-medium border shrink-0",
                                    selectedType === f.value
                                        ? "bg-white text-black border-white shadow-lg shadow-white/10"
                                        : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/30 hover:text-neutral-300"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* 4. Year Navigation (Timeline) - Plan A */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pt-1 border-t border-white/5 mt-2">
                        <button
                            onClick={() => setSelectedYear(null)}
                            className={cn(
                                "px-3 py-1 text-[11px] font-mono font-bold rounded transition-colors shrink-0",
                                selectedYear === null ? "text-amber-500 bg-amber-500/10" : "text-neutral-600 hover:text-neutral-400"
                            )}
                        >
                            ALL
                        </button>
                        {AVAILABLE_YEARS.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                                className={cn(
                                    "px-3 py-1 text-[11px] font-mono font-bold rounded transition-colors shrink-0",
                                    selectedYear === year
                                        ? "text-white bg-white/10 border border-white/20"
                                        : "text-neutral-600 hover:text-neutral-300"
                                )}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Content List */}
            <div className="px-4 py-4 space-y-3 max-w-3xl mx-auto min-h-[50vh]">
                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                        <span>找到 {filteredReviews.length} 個相關事件</span>
                        <button onClick={clearFilters} className="text-blue-400 hover:text-blue-300">清除全部</button>
                    </div>
                )}

                {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-neutral-900/20 rounded-2xl border border-white/5 border-dashed">
                        <Search className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                        <p className="text-neutral-500 text-sm">沒有找到相關事件</p>
                        <button onClick={clearFilters} className="text-blue-400 text-xs mt-2 hover:underline">
                            清除篩選條件
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

// --- Component: ReviewCard ---
function ReviewCard({ review }: { review: MarketEvent }) {
    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'leverage_cleanse': return { label: '槓桿清算' };
            case 'policy_regulation': return { label: '政策監管' };
            case 'exchange_event': return { label: '交易所危機' };
            case 'macro_shock': return { label: '黑天鵝' };
            case 'market_structure': return { label: '市場結構' };
            case 'tech_event': return { label: '技術事件' };
            default: return { label: '事件' };
        }
    };
    const typeConfig = getTypeConfig(review.type || 'market_structure');

    return (
        <article className="group relative bg-neutral-900/40 border border-white/5 rounded-xl overflow-hidden hover:bg-neutral-900/60 hover:border-white/20 transition-all duration-300">
            {/* Watermark Logo */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.20] group-hover:opacity-[0.30] transition-opacity rotate-12 pointer-events-none">
                {review.impactedTokens?.[0] && (
                    <img
                        src={`/tokens/${review.impactedTokens[0]}.png`}
                        className="w-16 h-16 blur-[0.5px]"
                        alt=""
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                )}
            </div>

            <div className="p-3 relative">
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-500">{review.year}</span>
                        <div className="w-[1px] h-2 bg-white/10"></div>
                        <span className="text-[10px] text-neutral-400">{typeConfig.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {review.impactedTokens?.slice(0, 3).map(t => (
                            <span key={t} className="text-[9px] font-bold text-neutral-600 bg-white/5 px-1 rounded">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <Link href={`/reviews/${review.slug}`} className="block">
                    <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white mb-1.5 leading-snug">
                        {review.title.split('：')[0]}
                        {review.title.split('：')[1] && <span className="text-neutral-500 font-normal">：{review.title.split('：')[1]}</span>}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                        {review.impactSummary || review.summary}
                    </p>
                </Link>
            </div>
        </article>
    )
}
