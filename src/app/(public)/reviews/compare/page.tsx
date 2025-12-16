'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data';
import { StackedReviewChart } from '@/components/StackedReviewChart';
import { Columns, Layers, ArrowLeft, ChevronDown, CheckCircle2, TrendingDown, ShieldAlert, Cpu, BrainCircuit } from 'lucide-react';
import { ReviewChart } from '@/components/ReviewChart';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export default function ComparePage() {
    const searchParams = useSearchParams();
    const eventParam = searchParams.get('event');

    // Default: param event OR FTX (2022)
    const [leftSlug, setLeftSlug] = useState(eventParam || 'ftx-collapse-2022');
    const [rightSlug, setRightSlug] = useState('covid-crash-2020');
    const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split');

    // Get event data
    const leftEvent = REVIEWS_DATA.find(r => r.slug === leftSlug) || REVIEWS_DATA[0];
    const rightEvent = REVIEWS_DATA.find(r => r.slug === rightSlug) || REVIEWS_DATA[1];

    // Reaction Type Mapping
    const reactionTypeMap: Record<string, string> = {
        'trust_collapse': '信任崩壞',
        'liquidity_crisis': '流動性衝擊',
        'priced_in': '利多出盡',
        'external_shock': '外部衝擊'
    };

    // Compact Selector Component
    const EventSelector = ({ selectedSlug, onSelect, side }: { selectedSlug: string, onSelect: (s: string) => void, side: 'left' | 'right' }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [expandedId, setExpandedId] = useState<string | null>(null); // For Peek mode
        const selected = REVIEWS_DATA.find(r => r.slug === selectedSlug);

        // Reset expanded state when sheet closes
        const handleOpenChange = (open: boolean) => {
            setIsOpen(open);
            if (!open) setExpandedId(null);
        }

        const handleItemClick = (e: React.MouseEvent, slug: string) => {
            // If clicking the currently selected/active item, select it (close sheet)
            // Or if already expanded, select it
            if (expandedId === slug || selectedSlug === slug) {
                onSelect(slug);
                setIsOpen(false);
            } else {
                // Otherwise contrast peek
                setExpandedId(slug);
                e.stopPropagation(); // Prevent immediate selection if we treat the row as click-to-select, but here we separate logic maybe?
                // Actually user suggests: "Click to peek" then maybe double click or button to select? 
                // "點擊某一列 → 只展開該列的描述... 使用者會自然只看一個事件"
                // Let's implement: Click toggle expansion. If expanded, showing a "Confirm" button or just let them select?
                // Simpler: Row click expands. Inside expanded area, have a "Select" button? 
                // Or: Row click expands. Clicking AGAIN selects?
                // Let's go with: Click sets expandedId. If already expandedId, do nothing (or toggle off?). 
                // To Select: We need a clear action. Maybe the row itself is selectable, but the description reveals?
                // Re-reading: "點擊某一列 → 只展開該列的描述" -> implies interaction to see detail. 
                // But ultimately they need to SELECT.
                // Let's make single click -> Expand. Double click or click "Select" button inside -> Select.
            }
        }

        // Revised logic based on "control layer":
        // List items are buttons. Click = Select (and Close)? 
        // User said: "點擊某一列 → 只展開該列的描述... 自動 dim 其他列"
        // This implies the SELECTION hasn't happened yet. It's browsing.
        // So: Click -> Expand (Peek). 
        // How to finalize selection? Maybe a specific "Select" button appears in the expanded view?
        // Or clicking the header of expanded item selects it?

        return (
            <Sheet open={isOpen} onOpenChange={handleOpenChange}>
                <SheetTrigger asChild>
                    <button className={cn(
                        "flex items-center gap-2 bg-black/60 backdrop-blur-md border pl-3 pr-2 py-1.5 rounded-full hover:bg-black/80 transition-all group max-w-[240px] shadow-lg",
                        side === 'left' ? "border-blue-500/30 text-blue-100" : "border-amber-500/30 text-amber-100"
                    )}>
                        <div className="flex flex-col items-start px-0.5">
                            <span className={cn(
                                "text-[9px] font-mono leading-none mb-0.5",
                                side === 'left' ? "text-blue-400" : "text-amber-400"
                            )}>
                                {side === 'left' ? '基準' : '對照'}
                            </span>
                            <span className="text-xs font-bold truncate max-w-[160px]">
                                {selected?.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').split('：')[0]}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 opacity-50", side === 'left' ? "text-blue-400" : "text-amber-400")} />
                    </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-neutral-950 border-white/10 max-h-[70vh] rounded-t-3xl px-0 pb-8">
                    <SheetHeader className="mb-2 text-left px-5 pt-4">
                        <SheetTitle className="text-white text-base">
                            選擇<span className={side === 'left' ? "text-blue-400" : "text-amber-400"}>{side === 'left' ? '基準' : '對照'}</span>事件
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col overflow-y-auto max-h-[50vh]">
                        {REVIEWS_DATA.map((event) => {
                            const isExpanded = expandedId === event.slug;
                            const isSelected = selectedSlug === event.slug;
                            const isDimmed = expandedId && !isExpanded;

                            return (
                                <div
                                    key={event.slug}
                                    className={cn(
                                        "transition-all duration-300 border-b border-white/5 last:border-0",
                                        isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.02]",
                                        isDimmed ? "opacity-30" : "opacity-100"
                                    )}
                                >
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : event.slug)}
                                        className="w-full flex items-center justify-between py-3 px-5 text-left"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Year Badge */}
                                            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                                {event.year}
                                            </span>

                                            {/* Title */}
                                            <span className={cn(
                                                "text-sm font-bold truncate transition-colors",
                                                isSelected ? (side === 'left' ? "text-blue-400" : "text-amber-400") : "text-white"
                                            )}>
                                                {event.title.split('：')[0]}
                                            </span>

                                            {/* Reaction Dot */}
                                            {event.reactionType && (
                                                <div className="flex items-center gap-1.5 ml-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    <span className="text-[10px] text-neutral-500 hidden sm:inline-block">
                                                        {reactionTypeMap[event.reactionType]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Icon */}
                                        {isSelected && <CheckCircle2 className="w-4 h-4 ml-2 flex-shrink-0 text-white" />}
                                        {!isSelected && <ChevronDown className={cn("w-4 h-4 ml-2 text-neutral-600 transition-transform", isExpanded ? "rotate-180" : "")} />}
                                    </button>

                                    {/* Expanded Peek Content */}
                                    <div className={cn(
                                        "grid transition-all duration-300 ease-out overflow-hidden",
                                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <div className="min-h-0 px-5 pb-4">
                                            <div className="pl-[52px]"> {/* Indent to align with title */}
                                                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                                                    {event.summary}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        onSelect(event.slug);
                                                        setIsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full py-2 rounded-lg text-xs font-bold transition-colors mb-2",
                                                        side === 'left'
                                                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                                            : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                                    )}
                                                >
                                                    確認選取
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/reviews" className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-neutral-400" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-white flex items-center gap-2">
                            歷史對照
                            <span className="text-[9px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded border border-white/10 font-medium">測試版</span>
                        </h1>
                    </div>
                </div>

                {/* View Mode Toggle (Global Analysis Syntax) */}
                <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-white/10">
                    <button
                        onClick={() => setViewMode('split')}
                        className={cn(
                            "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                            viewMode === 'split' ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Columns className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">左右</span>
                    </button>
                    <button
                        onClick={() => setViewMode('stacked')}
                        className={cn(
                            "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                            viewMode === 'stacked' ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">堆疊</span>
                    </button>
                </div>
            </div>

            {/* Control Bar (Strict Data Selection: 50/50) */}
            <div className="sticky top-[60px] z-30 bg-black/95 border-b border-white/5">
                <div className="grid grid-cols-2 divide-x divide-white/10">
                    {/* Left Selector (Autonomous) */}
                    <div className="p-3 flex justify-start pl-4 md:pl-6">
                        <EventSelector selectedSlug={leftSlug} onSelect={setLeftSlug} side="left" />
                    </div>

                    {/* Right Selector (Autonomous) */}
                    <div className="p-3 flex justify-end pr-4 md:pr-6">
                        <EventSelector selectedSlug={rightSlug} onSelect={setRightSlug} side="right" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'split' ? (
                /* Split View (Grid) */
                <div className="grid grid-cols-1 md:grid-cols-2 h-[40vh] divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {/* Left Panel */}
                    <section className="relative flex flex-col h-[20vh] md:h-[40vh] overflow-hidden bg-[#0B0B0C]">
                        <div className="flex-1 relative w-full h-full min-h-0 pt-4 px-4 pb-0">
                            {/* Watermark (Center Logo) */}


                            {leftEvent && (
                                <ReviewChart
                                    type="price"
                                    symbol={leftEvent.slug.toUpperCase()}
                                    eventStart={leftEvent.reactionStartAt}
                                    eventEnd={leftEvent.eventEndAt}
                                    reviewSlug={`${leftEvent.slug}-${leftEvent.year}`}
                                    focusWindow={leftEvent.focusWindow}
                                    isPercentage={true}
                                    className="w-full h-full"
                                />
                            )}
                        </div>
                    </section>

                    {/* Right Panel */}
                    <section className="relative flex flex-col h-[20vh] md:h-[40vh] overflow-hidden bg-[#0B0B0C]">
                        <div className="flex-1 relative w-full h-full min-h-0 pt-4 px-4 pb-0">
                            {/* Watermark (Center Logo) */}


                            {rightEvent && (
                                <ReviewChart
                                    type="price"
                                    symbol={rightEvent.slug.toUpperCase()}
                                    eventStart={rightEvent.reactionStartAt}
                                    eventEnd={rightEvent.eventEndAt}
                                    reviewSlug={`${rightEvent.slug}-${rightEvent.year}`}
                                    focusWindow={rightEvent.focusWindow}
                                    isPercentage={true}
                                    className="w-full h-full"
                                />
                            )}
                        </div>
                    </section>
                </div>
            ) : (
                /* Stacked View (Full Overlay) */
                <div className="relative w-full h-[40vh] bg-[#0B0B0C]">
                    <div className="w-full h-full pt-4 pb-4 px-4">
                        <StackedReviewChart
                            leftSlug={leftSlug}
                            rightSlug={rightSlug}
                        />
                    </div>
                </div>
            )}

            {/* Unified Event Summary Section - Below Charts */}
            <div className="p-4 space-y-4 bg-black">
                {/* Event Summaries */}
                {/* Event Summaries */}
                <div className="flex flex-col gap-3">
                    {/* Base Event Summary */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 bg-neutral-800 rounded border border-white/5">基準</span>
                            <span className="text-xs font-bold text-white">{leftEvent?.title}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            {leftEvent?.summary}
                        </p>
                    </div>

                    {/* Compare Event Summary */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 bg-neutral-800 rounded border border-white/5">對照</span>
                            <span className="text-xs font-bold text-white">{rightEvent?.title}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            {rightEvent?.summary}
                        </p>
                    </div>
                </div>

                {/* Structure Difference Card */}
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-neutral-300">結構差異摘要</span>
                    </div>
                    <div className="space-y-2 text-xs text-neutral-400">
                        <div className="flex items-start gap-3">
                            <span className="text-blue-400 font-bold min-w-[32px]">基準</span>
                            <p>
                                <span className="font-bold text-white">{leftEvent?.title.split(' ')[0]}</span>
                                ：中心化信任破壞 → 修復期長，資金撤離後難回流
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-amber-400 font-bold min-w-[32px]">對照</span>
                            <p>
                                <span className="font-bold text-white">{rightEvent?.title.split(' ')[0]}</span>
                                ：外生衝擊 → 流動性危機，央行介入後快速回補
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-neutral-200">
                            <span className="font-bold">結論：</span>雖然跌幅相似，但本質不同。建議關注鏈上資金留存率而非單純價格反彈。
                        </p>
                    </div>
                </div>
            </div>
        </main>

    );
}
