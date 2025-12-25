'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { REVIEWS_DATA } from '@/lib/reviews-data';
import { cn } from '@/lib/utils';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import {
    Landmark,
    Building2,
    Globe,
    TrendingDown,
    Search,
    X,
    Server,
    BookOpen,
    Filter,
    Zap,
    ChevronRight,
    GitCompare,
} from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';

import { UniversalCard, CardContent } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { AISummaryCard } from '@/components/ui/AISummaryCard';

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

const DEFAULT_SPARKLINE = [42000, 41000, 39000, 38000, 39500, 41000, 43000, 42500, 44000, 46000, 45000, 47000];

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
        <div className="pb-24 font-sans text-white">
            {/* 1. Header (Library Context) */}
            <div className="sticky top-[56px] z-30 bg-black/95 backdrop-blur-xl border-b border-[#1A1A1A]">
                {/* 2. Top Stats Row (Dashboard Style) */}
                {/* 2. Top Stats Row (Unified Card) */}
                <div className="px-4 pt-4 pb-2">
                    <UniversalCard className="p-0 overflow-hidden bg-[#0F0F10] border-[#1A1A1A]">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#1A1A1A]">
                            <div className="p-5 flex flex-col items-center justify-center text-center hover:bg-[#141414] transition-colors">
                                <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-1">事件總數 (Total)</div>
                                <div className="text-2xl font-bold text-white font-mono">{REVIEWS_DATA.length}</div>
                            </div>
                            <div className="p-5 flex flex-col items-center justify-center text-center hover:bg-[#141414] transition-colors">
                                <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-1">市場週期 (Cycles)</div>
                                <div className="text-2xl font-bold text-white font-mono">3</div>
                            </div>
                            <div className="p-5 flex flex-col items-center justify-center text-center hover:bg-[#141414] transition-colors">
                                <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-1">平均修復期 (Avg)</div>
                                <div className="text-2xl font-bold text-emerald-400 font-mono">14d</div>
                            </div>

                            {/* Random Replay Action */}
                            <div
                                onClick={() => {
                                    const random = REVIEWS_DATA[Math.floor(Math.random() * REVIEWS_DATA.length)];
                                    window.location.href = `/reviews/${random.year}/${random.slug}?mode=replay`;
                                }}
                                className="group relative p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-blue-950/10 hover:bg-blue-900/20 transition-all"
                            >
                                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Zap className="w-4 h-4 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-blue-100 group-hover:text-white">隨機復盤</span>
                                </div>
                                <div className="text-[10px] text-blue-300/60 font-mono uppercase tracking-wider group-hover:text-blue-200/80">
                                    Challenge History
                                </div>
                            </div>
                        </div>
                    </UniversalCard>
                </div>

                {/* 3. Search & Filters */}
                <div className="px-4 pb-2 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋事件 / 代幣 / 市場行為..."
                            className={cn("w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-[#525252] focus:outline-none focus:border-[#2A2A2A]")}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-3 h-3 text-neutral-500 hover:text-white" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. Filter Chips (Horizontal) */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 pb-3">
                    <button
                        onClick={() => setSelectedType(null)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium border shrink-0 transition-colors",
                            selectedType === null
                                ? "bg-white text-black border-white"
                                : "bg-[#0A0A0A] text-[#666666] border-[#1A1A1A] hover:border-[#333]"
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
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium border shrink-0 transition-colors",
                                    selectedType === key
                                        ? "bg-white text-black border-white"
                                        : "bg-[#0A0A0A] text-[#666666] border-[#1A1A1A] hover:border-[#333]"
                                )}
                            >
                                <Icon className="w-3 h-3" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 5. Content List */}
            <div className={cn("max-w-3xl mx-auto min-h-[50vh]", SPACING.pageX, "pt-4 space-y-4")}>
                {/* AI Summary Card */}
                <AISummaryCard
                    summary="根據目前的歷史數據庫，我們收錄了過去 3 年的 25 個重大市場事件。數據顯示，在類似的流動性環境下，BTC 的平均回調幅度為 -5.2%，但隨後的修復期平均僅需 14 天。目前市場結構類似 2023 年 Q4 的震盪築底階段。"
                    source="AI 歷史回測"
                    loading={false}
                />

                {hasActiveFilters && (
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                        <span>找到 {filteredReviews.length} 個相關事件</span>
                        <button onClick={clearFilters} className="text-blue-400 hover:text-blue-300">清除全部</button>
                    </div>
                )}

                {/* Content Area */}
                <div className="space-y-6">


                    {filteredReviews.length > 0 ? (
                        <UniversalCard variant="default" className="p-0 overflow-hidden">
                            {/* Header */}
                            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                                <SectionHeaderCard
                                    title="市場事件庫"
                                    icon={BookOpen}
                                    rightElement={
                                        <span className="text-[10px] text-[#666] font-mono">{filteredReviews.length} 個事件</span>
                                    }
                                />
                            </div>

                            {/* Event List - Single Column View */}
                            <div className="grid grid-cols-1 divide-y divide-[#1A1A1A] bg-[#1A1A1A]">
                                {filteredReviews.map((review) => {
                                    const TypeIcon = TypeIcons[review.type] || Filter;
                                    const displaySparkline = review.sparklineData || DEFAULT_SPARKLINE;

                                    return (
                                        <div
                                            key={review.id}
                                            className="group relative block px-5 py-6 bg-[#0A0A0A] hover:bg-[#141414] transition-colors h-full flex flex-col"
                                        >
                                            {/* Main Click Target */}
                                            <Link
                                                href={`/reviews/${review.year}/${review.slug}`}
                                                className="absolute inset-0 z-0"
                                            />

                                            <div className="relative z-0 pointer-events-none flex items-start justify-between mb-4">
                                                {/* Left: Type Icon & Year */}
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                                                        "bg-[#111] border-[#2A2A2A] text-neutral-500 group-hover:text-white group-hover:border-neutral-500 transition-colors"
                                                    )}>
                                                        <TypeIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-mono text-[#444] group-hover:text-[#666] transition-colors">{review.year}</div>
                                                        <span className="text-[10px] text-[#666] bg-[#151515] border border-[#222] px-1.5 py-0.5 rounded">
                                                            {TypeLabels[review.type]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-0 pointer-events-none flex-1 min-w-0 mb-4">
                                                <h3 className="text-lg font-bold text-[#E0E0E0] group-hover:text-white mb-1 transition-colors line-clamp-1">
                                                    {review.title.split('：')[0]}
                                                </h3>
                                                <p className="text-xs text-[#525252] group-hover:text-[#888] line-clamp-2 leading-relaxed">
                                                    {review.title.split('：')[1] || review.summary}
                                                </p>
                                            </div>

                                            {/* Footer: Stats & VS Button */}
                                            <div className="relative z-10 mt-auto pt-4 border-t border-[#1A1A1A] flex items-center justify-between pointer-events-none">
                                                <div className="flex items-center gap-2">
                                                    {review.maxDrawdown && (
                                                        <span className="text-[10px] font-mono font-medium text-red-500">
                                                            DD {review.maxDrawdown}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* VS Button (Interactive) */}
                                                    <Link
                                                        href={`/reviews/compare?event=${review.slug}-${review.year}`}
                                                        className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-white bg-[#1A1A1A] hover:bg-neutral-800 px-2 py-1 rounded-md border border-neutral-800"
                                                    >
                                                        <GitCompare className="w-3 h-3" />
                                                        VS
                                                    </Link>
                                                    <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </UniversalCard>
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
        </div>
    );
}
