'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
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
import { Tag, TagProps } from '@/components/ui/tag';

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

// Semantic Colors for Types
// Semantic Variants for Tags
const TypeVariants: Record<string, TagProps['variant']> = {
    policy_regulation: 'brand',      // Blue
    exchange_event: 'purple',        // Purple
    leverage_cleanse: 'warning',     // Orange
    macro_shock: 'error',            // Red
    market_structure: 'success',     // Emerald
    tech_event: 'info',              // Cyan
};

// Semantic Styles for Icon Boxes (matching Tag colors)
const TypeStyles: Record<string, { bg: string, border: string, text: string, icon: string }> = {
    policy_regulation: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
    exchange_event: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'text-purple-400' },
    leverage_cleanse: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: 'text-orange-400' },
    macro_shock: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'text-red-400' },
    market_structure: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
    tech_event: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', icon: 'text-cyan-400' },
};
const DefaultTypeStyle = { bg: 'bg-[#111]', border: 'border-[#2A2A2A]', text: 'text-neutral-500', icon: 'text-neutral-500' };

const DEFAULT_SPARKLINE = [42000, 41000, 39000, 38000, 39500, 41000, 43000, 42500, 44000, 46000, 45000, 47000];

export function ReviewsPageClient() {
    // State
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // AI Summary State
    const [aiSummary, setAiSummary] = useState<{
        summary: string,
        source: string,
        recommended_readings?: Array<{ title: string, path: string }>
    } | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(true);

    // Fetch AI Summary
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/reviews/ai-summary');
                if (res.ok) {
                    const data = await res.json();
                    setAiSummary(data);
                }
            } catch (error) {
                console.error('Failed to fetch AI summary', error);
            } finally {
                setLoadingSummary(false);
            }
        };
        fetchSummary();
    }, []);

    // Virtual scrolling ref
    const parentRef = useRef<HTMLDivElement>(null);

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

    // Virtual scrolling setup
    const rowVirtualizer = useVirtualizer({
        count: filteredReviews.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140, // More height for stacked layout
        overscan: 5,
    });

    const clearFilters = () => {
        setSelectedType(null);
        setSelectedYear(null);
        setSearchQuery('');
    };

    const hasActiveFilters = selectedType || selectedYear || searchQuery;

    return (
        <div className="pb-24 font-sans text-white">
            {/* 0. AI Summary Section (Top of Page) */}
            <div className={cn("px-4 pt-4 pb-2", SPACING.pageX)}>
                <div className="max-w-5xl mx-auto">
                    <AISummaryCard
                        summary={aiSummary?.summary || "正在分析歷史數據庫..."}
                        source={aiSummary?.source || "AI 歷史回測"}
                        loading={loadingSummary}
                        variant="hero"
                        recommendations={aiSummary?.recommended_readings}
                    />
                </div>
            </div>

            {/* 1. Header (Library Context - Sticky) */}
            <div className="sticky top-[56px] z-30 bg-black/95 backdrop-blur-xl border-b border-[#1A1A1A]">
                {/* 2. Top Stats Row (Dashboard Style) */}
                {/* 2. Top Stats Row (Removed) */}

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
                                ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
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
                                        ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
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
            <div className={cn("max-w-5xl mx-auto min-h-[50vh]", SPACING.pageX, "pt-4 space-y-4")}>
                {/* AI Summary Card (Moved to Top) */}

                {hasActiveFilters && (
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                        <span>找到 {filteredReviews.length} 個相關事件</span>
                        <button onClick={clearFilters} className="text-[#8B5CF6] hover:text-[#8B5CF6]/80 transition-colors">清除全部</button>
                    </div>
                )}

                {/* Content Area */}
                <div className="space-y-6">


                    {filteredReviews.length > 0 ? (
                        <UniversalCard variant="luma" className="p-0 overflow-hidden">
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

                            {/* Event List - Virtual Scrolling Enabled */}
                            <div
                                ref={parentRef}
                                className="overflow-auto"
                                style={{
                                    height: `${Math.min(filteredReviews.length * 140, 800)}px`,
                                    maxHeight: '800px'
                                }}
                            >
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >

                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const review = filteredReviews[virtualRow.index];
                                        if (!review) return null;

                                        const TypeIcon = TypeIcons[review.type] || Filter;
                                        const theme = TypeStyles[review.type] || DefaultTypeStyle;

                                        return (
                                            <div
                                                key={virtualRow.key}
                                                data-index={virtualRow.index}
                                                ref={rowVirtualizer.measureElement}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <div className="group relative grid grid-cols-[auto_1fr_auto] gap-3 sm:gap-4 p-4 min-h-[100px] bg-transparent hover:bg-[#141414] transition-colors border-b border-[#1A1A1A] last:border-0 items-center">
                                                    {/* Main Click Target */}
                                                    <Link
                                                        href={`/reviews/${review.year}/${review.slug}`}
                                                        className="absolute inset-0 z-0"
                                                    />

                                                    {/* Col 1: Icon (Always Visible) */}
                                                    <div className="flex flex-shrink-0 items-center justify-center relative z-10 pointer-events-none">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center border transition-colors",
                                                            theme.bg, theme.border, theme.icon
                                                        )}>
                                                            <TypeIcon className="w-5 h-5" />
                                                        </div>
                                                    </div>

                                                    {/* Col 2: Text Info (Always Visible) */}
                                                    <div className="flex flex-col justify-center gap-0.5 w-full min-w-0 relative z-10 pointer-events-none">
                                                        {/* Title */}
                                                        <h3 className="text-sm font-bold text-white truncate">
                                                            {review.title.split(/[:：]/)[0]}
                                                        </h3>

                                                        {/* Subtitle */}
                                                        {review.title.split(/[:：]/)[1] && (
                                                            <p className="text-xs text-[#888] font-medium truncate">
                                                                {review.title.split(/[:：]/)[1].trim()}
                                                            </p>
                                                        )}

                                                        {/* Type Tag */}
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <Tag
                                                                variant={TypeVariants[review.type] || 'default'}
                                                                size="sm"
                                                            >
                                                                {TypeLabels[review.type]}
                                                            </Tag>
                                                        </div>
                                                    </div>

                                                    {/* Col 3: Data (Sparkline Only) - Always Right Aligned */}
                                                    <div className="flex flex-col items-end justify-center gap-2 w-[100px] sm:w-[140px] relative z-10">

                                                        {/* Sparkline */}
                                                        <div className="w-20 sm:w-24 h-6 sm:h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <Sparkline
                                                                data={review.sparklineData || DEFAULT_SPARKLINE}
                                                                width={96}
                                                                height={32}
                                                                color={review.sparklineData ? (review.maxDrawdown?.includes('-') ? '#ef4444' : '#10b981') : '#333'}
                                                                className="overflow-visible w-full h-full"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Action Arrow (Absolute Right - Desktop Only or subtle) */}
                                                    {/* Removing Action Arrow to save space on mobile, entire card is clickable */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </UniversalCard>
                    ) : (
                        <div className="text-center py-20 bg-neutral-900/20 rounded-2xl border border-white/5 border-dashed">
                            <Search className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">沒有找到相關事件</p>
                            <button onClick={clearFilters} className="text-[#8B5CF6] text-xs mt-2 hover:underline">
                                清除篩選條件
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
