'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REVIEWS_DATA, MarketEvent } from '@/lib/reviews-data';
import { ReviewChart } from '@/components/ReviewChart';
import { ArrowLeft, ChevronDown, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function ComparePage() {
    // Default: FTX (2022) vs Mt.Gox (2014) if available, or just first two
    const [leftSlug, setLeftSlug] = useState('ftx-collapse-2022');
    const [rightSlug, setRightSlug] = useState('covid-crash-2020');

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
                    <button className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 pl-3 pr-2 py-1.5 rounded-full hover:bg-black/80 transition-all group max-w-[240px]">
                        <div className="flex flex-col items-start px-0.5">
                            <span className="text-[9px] text-neutral-400 font-mono leading-none mb-0.5">{side === 'left' ? 'BASE (基準)' : 'COMPARE (對照)'}</span>
                            <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate max-w-[160px]">
                                {selected?.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')}
                            </span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
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
            </div>

            {/* Content Grid */}
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
                        {/* Overlay Summary */}
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
                        {/* Overlay Summary */}
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
        </main>
    );
}
