'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data';
import { StackedReviewChart } from '@/components/StackedReviewChart';
import { Columns, Layers } from 'lucide-react';

export default function ComparePage() {
    // Default: FTX (2022) vs Mt.Gox (2014) if available, or just first two
    const [leftSlug, setLeftSlug] = useState('ftx-collapse-2022');
    const [rightSlug, setRightSlug] = useState('covid-crash-2020');
    const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split');

    // Get event data
    const leftEvent = REVIEWS_DATA.find(r => r.slug === leftSlug) || REVIEWS_DATA[0];
    const rightEvent = REVIEWS_DATA.find(r => r.slug === rightSlug) || REVIEWS_DATA[1];

    // Compact Selector Component
    const EventSelector = ({ selectedSlug, onSelect, side }: { selectedSlug: string, onSelect: (s: string) => void, side: 'left' | 'right' }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selected = REVIEWS_DATA.find(r => r.slug === selectedSlug);

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button className={cn(
                        "flex items-center gap-2 bg-black/60 backdrop-blur-md border pl-3 pr-2 py-1.5 rounded-full hover:bg-black/80 transition-all group max-w-[240px] shadow-lg",
                        side === 'left' ? "border-blue-500/30 text-blue-100" : "border-amber-500/30 text-amber-100"
                    )}>
                        <div className="flex flex-col items-start px-0.5">
                            <span className={cn(
                                "text-[9px] font-mono leading-none mb-0.5",
                                side === 'left' ? "text-blue-400" : "text-amber-400"
                            )}>
                                {side === 'left' ? 'BASE (基準)' : 'COMPARE (對照)'}
                            </span>
                            <span className="text-xs font-bold truncate max-w-[160px]">
                                {selected?.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 opacity-50", side === 'left' ? "text-blue-400" : "text-amber-400")} />
                    </button>
                </DialogTrigger>
                <DialogContent className="bg-neutral-950 border-white/10 max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>選擇{side === 'left' ? '基準' : '對照'}事件</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 mt-4">
                        {REVIEWS_DATA.map((event) => (
                            <button
                                key={event.slug}
                                onClick={() => {
                                    onSelect(event.slug);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                    selectedSlug === event.slug
                                        ? "bg-white/10 border-white/20"
                                        : "bg-neutral-900/50 border-white/5 hover:bg-neutral-900 hover:border-white/10"
                                )}
                            >
                                <div className="flex-1 min-w-0 mr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{event.year}</span>
                                        <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                                    </div>
                                    <p className="text-xs text-neutral-500 line-clamp-1">{event.summary}</p>
                                </div>
                                {selectedSlug === event.slug && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
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
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-medium">BETA</span>
                        </h1>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-white/10">
                    <button
                        onClick={() => setViewMode('split')}
                        className={cn(
                            "p-2 rounded-md transition-all flex items-center gap-1.5",
                            viewMode === 'split' ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Columns className="w-4 h-4" />
                        <span className="text-[10px] font-medium hidden sm:inline">左右</span>
                    </button>
                    <button
                        onClick={() => setViewMode('stacked')}
                        className={cn(
                            "p-2 rounded-md transition-all flex items-center gap-1.5",
                            viewMode === 'stacked' ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Layers className="w-4 h-4" />
                        <span className="text-[10px] font-medium hidden sm:inline">堆疊</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'split' ? (
                /* Split View (Grid) */
                <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-60px)] divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {/* Left Panel */}
                    <section className="relative flex flex-col h-[50vh] md:h-full overflow-hidden bg-[#0B0B0C]">
                        <div className="absolute top-4 left-4 z-30">
                            <EventSelector selectedSlug={leftSlug} onSelect={setLeftSlug} side="left" />
                        </div>

                        <div className="flex-1 relative w-full h-full min-h-0 pt-0">
                            {leftEvent && (
                                <ReviewChart
                                    type="price"
                                    symbol={leftEvent.chartConfig?.symbol || 'BTC'}
                                    eventStart={leftEvent.eventStartAt}
                                    eventEnd={leftEvent.eventEndAt}
                                    reviewSlug={leftEvent.slug}
                                    daysBuffer={leftEvent.chartConfig?.daysBuffer}
                                    focusWindow={leftEvent.focusWindow}
                                    className="w-full h-full"
                                />
                            )}
                            <div className="absolute bottom-6 left-4 right-4 z-20 pointer-events-none">
                                <div className="bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-xl shadow-xl">
                                    <p className="text-[11px] text-neutral-200 leading-relaxed font-medium">
                                        <span className="text-blue-400 font-bold mr-1">▌</span>
                                        {leftEvent?.summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel */}
                    <section className="relative flex flex-col h-[50vh] md:h-full overflow-hidden bg-[#0B0B0C]">
                        <div className="absolute top-4 left-4 z-30">
                            <EventSelector selectedSlug={rightSlug} onSelect={setRightSlug} side="right" />
                        </div>

                        <div className="flex-1 relative w-full h-full min-h-0 pt-0">
                            {rightEvent && (
                                <ReviewChart
                                    type="price"
                                    symbol={rightEvent.chartConfig?.symbol || 'BTC'}
                                    eventStart={rightEvent.eventStartAt}
                                    eventEnd={rightEvent.eventEndAt}
                                    reviewSlug={rightEvent.slug}
                                    daysBuffer={rightEvent.chartConfig?.daysBuffer}
                                    focusWindow={rightEvent.focusWindow}
                                    className="w-full h-full"
                                />
                            )}
                            <div className="absolute bottom-6 left-4 right-4 z-20 pointer-events-none">
                                <div className="bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-xl shadow-xl">
                                    <p className="text-[11px] text-neutral-200 leading-relaxed font-medium">
                                        <span className="text-amber-400 font-bold mr-1">▌</span>
                                        {rightEvent?.summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                /* Stacked View (Full Overlay) */
                <div className="relative w-full h-[calc(100vh-60px)] bg-[#0B0B0C]">
                    {/* Controls Positioned Absolute */}
                    <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                        <EventSelector selectedSlug={leftSlug} onSelect={setLeftSlug} side="left" />
                    </div>
                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
                        <EventSelector selectedSlug={rightSlug} onSelect={setRightSlug} side="right" />
                    </div>

                    <div className="w-full h-full pt-16 pb-4 px-4">
                        <StackedReviewChart
                            leftSlug={leftSlug}
                            rightSlug={rightSlug}
                        />
                    </div>

                    {/* Footer Info for Stacked View */}
                    <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex justify-center">
                        <div className="bg-black/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full shadow-xl">
                            <p className="text-[10px] text-neutral-400">
                                D0 = 事件發生日，數值顯示為相對 D0 的漲跌幅 %
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
