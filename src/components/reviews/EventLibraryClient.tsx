'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { MarketEvent, REVIEWS_DATA } from '@/lib/reviews-data';
import { cn } from '@/lib/utils';
import { CARDS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    Landmark,
    Building2,
    Globe,
    TrendingDown,
    Search,
    X,
    Server,
    CheckCircle2,
    BookOpen,
    Filter
} from 'lucide-react';

// Icons for Types
const TypeIcons: Record<string, any> = {
    policy_regulation: Landmark,
    exchange_event: Building2,
    leverage_cleanse: Zap,
    macro_shock: Globe,
    market_structure: TrendingDown,
    tech_event: Server,
};

const TypeLabels: Record<string, string> = {
    policy_regulation: '政策監管',
    exchange_event: '交易所',
    leverage_cleanse: '連鎖清算',
    macro_shock: '黑天鵝',
    market_structure: '市場結構',
    tech_event: '技術升級'
};

const AVAILABLE_YEARS = Array.from(new Set(REVIEWS_DATA.map(d => d.year))).sort((a, b) => b - a);

export function EventLibraryClient() {
    // State
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Logic
    const filteredReviews = useMemo(() => {
        let filtered = REVIEWS_DATA;

        if (selectedYear) {
            filtered = filtered.filter(r => r.year === selectedYear);
        }

        if (selectedType) {
            filtered = filtered.filter(r => r.type === selectedType);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.slug.includes(q) ||
                r.tags?.some(t => t.toLowerCase().includes(q)) ||
                r.behaviorTags?.some(t => t.toLowerCase().includes(q)) || // Symptom Search
                String(r.year).includes(q)
            );
        }

        // Sort by Date Descending (Timeline View)
        return filtered.sort((a, b) => new Date(b.eventEndAt).getTime() - new Date(a.eventEndAt).getTime());
    }, [selectedYear, selectedType, searchQuery]);

    const clearFilters = () => {
        setSelectedType(null);
        setSelectedYear(null);
        setSearchQuery('');
    };

    const hasActiveFilters = selectedType || selectedYear || searchQuery;

    return (
        <div className="pb-24 font-sans">
            {/* 1. Header (Library Context) */}
            <div className="px-4 py-4 space-y-2">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-white" />
                    市場事件庫
                </h1>
                <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">
                    整理歷史上影響市場的重要事件，用於回顧市場行為與結構變化。
                </p>
            </div>

            <div className="sticky top-[56px] z-30 bg-black/95 backdrop-blur-xl border-b border-[#1A1A1A]">
                <div className={`px-4 py-4 ${SPACING.cardGap}`}>
                    {/* 2. Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋事件 / 代幣 / 市場行為 (如：爆倉、插針)..."
                            className={cn("w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-[#525252] focus:outline-none focus:border-[#2A2A2A]")}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-3 h-3 text-neutral-500 hover:text-white" />
                            </button>
                        )}
                    </div>

                    {/* 3. Filter Chips (Horizontal) */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <button
                            onClick={() => setSelectedType(null)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium border shrink-0",
                                selectedType === null
                                    ? "bg-white text-black border-white"
                                    : "bg-[#0A0A0A] text-[#666666] border-[#1A1A1A]"
                            )}
                        >
                            全部類型
                        </button>
                        {Object.entries(TypeLabels).map(([key, label]) => {
                            const Icon = TypeIcons[key] || Filter;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedType(selectedType === key ? null : key)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium border shrink-0",
                                        selectedType === key
                                            ? "bg-white text-black border-white"
                                            : "bg-[#0A0A0A] text-[#666666] border-[#1A1A1A]"
                                    )}
                                >
                                    <Icon className="w-3 h-3" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* 4. Year Navigation */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pt-1 border-t border-white/5 mt-2">
                        <button
                            onClick={() => setSelectedYear(null)}
                            className={cn(
                                "px-3 py-1 text-[11px] font-mono font-bold rounded shrink-0",
                                selectedYear === null ? "text-white bg-[#1A1A1A]" : "text-[#525252]"
                            )}
                        >
                            ALL
                        </button>
                        {AVAILABLE_YEARS.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                                className={cn(
                                    "px-3 py-1 text-[11px] font-mono font-bold rounded shrink-0",
                                    selectedYear === year
                                        ? "text-white bg-[#1A1A1A] border border-[#2A2A2A]"
                                        : "text-[#525252]"
                                )}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Content List */}
            <div className={`px-4 py-4 space-y-3 max-w-3xl mx-auto min-h-[50vh]`}>
                {hasActiveFilters && (
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                        <span>找到 {filteredReviews.length} 個相關事件</span>
                        <button onClick={clearFilters} className="text-blue-400 hover:text-blue-300">清除全部</button>
                    </div>
                )}

                {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => {
                        const TypeIcon = TypeIcons[review.type] || Filter;

                        return (
                            <Link
                                key={review.id}
                                href={`/reviews/${review.year}/${review.slug}`}
                                className={cn(
                                    "block group relative overflow-hidden rounded-xl border border-transparent transition-all",
                                    CARDS.secondary
                                )}
                            >
                                <div className="p-4 flex items-start gap-4">
                                    {/* Left: Icon & Meta */}
                                    <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border",
                                            "bg-[#1A1A1A] border-[#2A2A2A] text-white"
                                        )}>
                                            <TypeIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-mono text-[#525252]">{review.year}</span>
                                    </div>

                                    {/* Right: Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] text-[#666] border border-[#222] px-1.5 rounded">{TypeLabels[review.type]}</span>
                                        </div>

                                        <h3 className={cn(
                                            "text-sm font-bold leading-tight mb-1.5",
                                            "text-white group-hover:text-blue-400"
                                        )}>
                                            {review.title.split('：')[0]}
                                        </h3>

                                        <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">
                                            {review.title.split('：')[1] || review.summary}
                                        </p>

                                        {/* Symptom Tags (Only show if searching or specific context needed) */}
                                        {review.behaviorTags && review.behaviorTags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {review.behaviorTags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[9px] text-[#444] bg-[#111] px-1.5 py-0.5 rounded">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })
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
        </div>
    );
}
