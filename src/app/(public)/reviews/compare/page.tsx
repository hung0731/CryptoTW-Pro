'use client';

import { useState, Suspense } from 'react';
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
import { UniversalCard } from '@/components/ui/UniversalCard';

function CompareContent() {
    const searchParams = useSearchParams();
    const eventParam = searchParams.get('event');

    // Default: param event OR ETF (2024) vs LUNA (2022) - Showcase Asymmetric Mode
    const [leftSlug, setLeftSlug] = useState(eventParam || 'etf-2024');
    const [rightSlug, setRightSlug] = useState('luna-2022');
    const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split');

    // Get event data
    const leftEvent = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === leftSlug) || REVIEWS_DATA[0];
    const rightEvent = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === rightSlug) || REVIEWS_DATA[1];

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

        // Fix: Match composite slug (slug-year)
        const selected = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === selectedSlug);

        // Reset expanded state when sheet closes
        const handleOpenChange = (open: boolean) => {
            setIsOpen(open);
            if (!open) setExpandedId(null);
        }

        return (
            <Sheet open={isOpen} onOpenChange={handleOpenChange}>
                <SheetTrigger asChild>
                    <button className={cn(
                        "flex items-center gap-2 bg-black/60 backdrop-blur-md border pl-3 pr-2 py-1.5 rounded-full hover:bg-black/80 group max-w-[240px] shadow-lg",
                        side === 'left' ? "border-blue-500/30 text-blue-100" : "border-amber-500/30 text-amber-100"
                    )}>
                        <div className="flex flex-col items-start px-0.5 text-left">
                            <span className={cn(
                                "text-[9px] font-mono leading-none mb-0.5",
                                side === 'left' ? "text-blue-400" : "text-amber-400"
                            )}>
                                {side === 'left' ? '基準' : '對照'}
                            </span>
                            <span className="text-xs font-bold truncate max-w-[160px] block">
                                {selected
                                    ? selected.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').split('：')[0]
                                    : '選擇事件'
                                }
                            </span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 opacity-50 flex-shrink-0", side === 'left' ? "text-blue-400" : "text-amber-400")} />
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
                            const compositeSlug = `${event.slug}-${event.year}`;
                            const isExpanded = expandedId === compositeSlug;
                            const isSelected = selectedSlug === compositeSlug;
                            const isDimmed = expandedId && !isExpanded;

                            return (
                                <div
                                    key={compositeSlug}
                                    className={cn(
                                        "border-b border-white/5 last:border-0",
                                        isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.02]",
                                        isDimmed ? "opacity-30" : "opacity-100"
                                    )}
                                >
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : compositeSlug)}
                                        className="w-full flex items-center justify-between py-3 px-5 text-left"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Year Badge */}
                                            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                                {event.year}
                                            </span>

                                            {/* Title */}
                                            <span className={cn(
                                                "text-sm font-bold truncate",
                                                isSelected ? (side === 'left' ? "text-[#3B82F6]" : "text-[#F59E0B]") : "text-white"
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
                                        {!isSelected && <ChevronDown className={cn("w-4 h-4 ml-2 text-[#525252]", isExpanded ? "rotate-180" : "")} />}
                                    </button>

                                    {/* Expanded Peek Content */}
                                    <div className={cn(
                                        "grid overflow-hidden",
                                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <div className="min-h-0 px-5 pb-4">
                                            <div className="pl-[52px]"> {/* Indent to align with title */}
                                                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                                                    {event.summary}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        onSelect(compositeSlug);
                                                        setIsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full py-2 rounded-lg text-xs font-bold mb-2",
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
                    <Link href="/reviews" className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center hover:bg-[#0E0E0F]">
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
                            "px-3 py-1.5 rounded-md flex items-center gap-1.5",
                            viewMode === 'split' ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#666666] hover:text-[#A0A0A0]"
                        )}
                    >
                        <Columns className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">左右</span>
                    </button>
                    <button
                        onClick={() => setViewMode('stacked')}
                        className={cn(
                            "px-3 py-1.5 rounded-md flex items-center gap-1.5",
                            viewMode === 'stacked' ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#666666] hover:text-[#A0A0A0]"
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
                <div className="flex flex-col gap-3">
                    {/* Base Event Summary */}
                    <UniversalCard variant="subtle" size="M" className="border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">基準</span>
                            <span className="text-xs font-bold text-white">{leftEvent?.title}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            {leftEvent?.summary}
                        </p>
                    </UniversalCard>

                    {/* Compare Event Summary */}
                    <UniversalCard variant="subtle" size="M" className="border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">對照</span>
                            <span className="text-xs font-bold text-white">{rightEvent?.title}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            {rightEvent?.summary}
                        </p>
                    </UniversalCard>
                </div>

                {/* Structure Difference Card */}
                <UniversalCard variant="default" size="M">
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
                </UniversalCard>
            </div>
        </main>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">載入中...</div>}>
            <CompareContent />
        </Suspense>
    )
}
