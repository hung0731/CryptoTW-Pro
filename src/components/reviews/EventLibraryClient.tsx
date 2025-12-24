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
} from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';
import { MasterTimelineChart } from '@/components/reviews/MasterTimelineChart';
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
                <div className={cn(SPACING.pageX, "py-3 space-y-3")}>
                    {/* 2. Search Bar */}
                    <div className="relative">
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

                    {/* 3. Filter Chips (Horizontal) */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
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

                {/* 4. Master Timeline Chart */}
                <div className="border-t border-white/5 bg-[#0A0A0A] py-6">
                    <div className="max-w-7xl mx-auto px-4">
                        <UniversalCard className="p-0 overflow-hidden bg-[#0A0A0A]">
                            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                                <SectionHeaderCard
                                    title="市場事件時間軸"
                                    description="拖曳查看完整歷史週期待"
                                    icon={TrendingDown}
                                />
                            </div>
                            <div className="p-0">
                                <MasterTimelineChart
                                    selectedYear={selectedYear}
                                    onEventClick={(year) => setSelectedYear(year)}
                                />
                            </div>
                        </UniversalCard>
                    </div>
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
                    {/* Featured Event Card (Top of the List) */}
                    {filteredReviews.length > 0 && (
                        <Link
                            href={`/reviews/${filteredReviews[0].year}/${filteredReviews[0].slug}`}
                            className="block group relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                {/* Icon */}
                                <div className="shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#333] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                                        <Zap className="w-8 h-8 text-yellow-500" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            本週精選回顧
                                        </span>
                                        <span className="text-[10px] text-[#666] font-mono">
                                            {filteredReviews[0].year}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                                        {filteredReviews[0].title.split('：')[0]}
                                    </h2>
                                    <p className="text-sm text-[#888] line-clamp-2 max-w-xl">
                                        {filteredReviews[0].summary}
                                    </p>
                                </div>

                                {/* Action */}
                                <div className="shrink-0 hidden sm:flex items-center gap-2 text-xs font-bold text-[#E0E0E0] group-hover:translate-x-1 transition-transform">
                                    <span>深度復盤</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    )}

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

                            {/* Event List - Flat Rows */}
                            <div className="flex flex-col">
                                {filteredReviews.slice(1).map((review) => {
                                    const TypeIcon = TypeIcons[review.type] || Filter;
                                    const displaySparkline = review.sparklineData || DEFAULT_SPARKLINE;

                                    return (
                                        <Link
                                            key={review.id}
                                            href={`/reviews/${review.year}/${review.slug}`}
                                            className="group block px-5 py-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors"
                                        >
                                            <div className="flex items-center gap-5">
                                                {/* Left: Type Icon & Year */}
                                                <div className="flex flex-col items-center gap-2 shrink-0">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center border",
                                                        "bg-[#111] border-[#2A2A2A] text-neutral-500 group-hover:text-white group-hover:border-neutral-500 transition-colors"
                                                    )}>
                                                        <TypeIcon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-[#444] group-hover:text-[#666] transition-colors">{review.year}</span>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Meta Row */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] text-[#666] bg-[#151515] border border-[#222] px-1.5 py-0.5 rounded">
                                                            {TypeLabels[review.type]}
                                                        </span>
                                                        {review.maxDrawdown && (
                                                            <span className="text-[10px] font-mono font-medium text-red-500 bg-red-950/10 px-1.5 py-0.5 rounded border border-red-900/20">
                                                                最大跌幅 {review.maxDrawdown}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title & Desc */}
                                                    <div>
                                                        <h3 className="text-base font-bold text-[#E0E0E0] group-hover:text-white mb-0.5 transition-colors">
                                                            {review.title.split('：')[0]}
                                                        </h3>
                                                        <p className="text-xs text-[#525252] group-hover:text-[#888] line-clamp-1">
                                                            {review.title.split('：')[1] || review.summary}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Sparkline (Right) */}
                                                <div className="hidden sm:block shrink-0 w-32 opacity-40 group-hover:opacity-100 transition-all group-hover:scale-105 origin-right">
                                                    <Sparkline
                                                        data={displaySparkline}
                                                        width={128}
                                                        height={40}
                                                        color="#ef4444"
                                                    />
                                                </div>
                                            </div>
                                        </Link>
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
