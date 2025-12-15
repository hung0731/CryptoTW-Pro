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
    // Let's default to FTX vs LUNA or similar
    // FTX: ftx-collapse-2022
    // LUNA: luna-collapse-2022
    // Or 312: covid-crash-2020
    const [leftSlug, setLeftSlug] = useState('ftx-collapse-2022');
    const [rightSlug, setRightSlug] = useState('covid-crash-2020');

    // Get event data
    const leftEvent = REVIEWS_DATA.find(r => r.slug === leftSlug) || REVIEWS_DATA[0];
    const rightEvent = REVIEWS_DATA.find(r => r.slug === rightSlug) || REVIEWS_DATA[1];

    // Selector Component
    const EventSelector = ({ selectedSlug, onSelect, side }: { selectedSlug: string, onSelect: (s: string) => void, side: 'left' | 'right' }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selected = REVIEWS_DATA.find(r => r.slug === selectedSlug);

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center justify-between w-full bg-neutral-900 border border-white/10 p-3 rounded-xl hover:bg-neutral-800 transition-colors group">
                        <div className="text-left">
                            <p className="text-[10px] text-neutral-500 mb-0.5 uppercase tracking-wider">{side === 'left' ? '基準事件' : '對照事件'}</p>
                            <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white truncate max-w-[140px] sm:max-w-none">
                                {selected?.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')}
                            </h3>
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
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
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">{event.year}</span>
                                        <h4 className="text-sm font-bold text-white">{event.title}</h4>
                                    </div>
                                    <p className="text-xs text-neutral-500 line-clamp-1">{event.summary}</p>
                                </div>
                                {selectedSlug === event.slug && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 py-4 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/reviews" className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800">
                        <ArrowLeft className="w-4 h-4 text-neutral-400" />
                    </Link>
                    <div>
                        <h1 className="text-base font-bold text-white flex items-center gap-2">
                            歷史對照
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">BETA</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-65px)] divide-y md:divide-y-0 md:divide-x divide-white/10">
                {/* Left Panel */}
                <section className="flex flex-col h-[50vh] md:h-full overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-neutral-950/50">
                        <EventSelector selectedSlug={leftSlug} onSelect={setLeftSlug} side="left" />
                    </div>
                    <div className="flex-1 relative bg-[#0B0B0C] min-h-0">
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
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
                            <p className="text-xs text-neutral-300 font-medium leading-relaxed drop-shadow-md">
                                {leftEvent?.summary}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Right Panel */}
                <section className="flex flex-col h-[50vh] md:h-full overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-neutral-950/50">
                        <EventSelector selectedSlug={rightSlug} onSelect={setRightSlug} side="right" />
                    </div>
                    <div className="flex-1 relative bg-[#0B0B0C] min-h-0">
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
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
                            <p className="text-xs text-neutral-300 font-medium leading-relaxed drop-shadow-md">
                                {rightEvent?.summary}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
