'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REVIEWS_DATA } from '@/lib/reviews-data';

interface BriefingOverlayProps {
    symbol: string;
    eventStart: string;
    reviewSlug: string;
    onStart: () => void;
}

export function BriefingOverlay({ symbol, eventStart, reviewSlug, onStart }: BriefingOverlayProps) {
    // Determine context based on reviewSlug
    const context = useMemo(() => {
        // ID matching logic from original code: compare slug + year
        const eventConfig = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === reviewSlug);
        return eventConfig?.historicalContext;
    }, [reviewSlug]);

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-[#0F0F10] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl"
            >
                {/* Briefing Header */}
                <div className="px-6 py-4 border-b border-[#2A2A2A] bg-[#141414] flex justify-between items-center">
                    <div>
                        <div className="text-xs font-mono text-blue-400 mb-1">MISSION BRIEFING</div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            {eventStart}
                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#2A2A2A] text-neutral-400">
                                {symbol}
                            </span>
                        </h2>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-neutral-500">TARGET</div>
                        <div className="text-sm font-bold text-white">SURVIVE & PROFIT</div>
                    </div>
                </div>

                {/* Intelligent Context Data */}
                <div className="p-6 grid grid-cols-2 gap-6">
                    {!context ? (
                        <div className="col-span-2 text-center text-neutral-400 py-8">
                            <p className="mb-4">我們已將時間撥回到事件爆發前夕。</p>
                            <p className="text-sm">請觀察市場結構、資金費率與持倉量，做出你的決策。</p>
                        </div>
                    ) : (
                        <>
                            {/* Left Col: Narrative & Phase */}
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Market Phase</div>
                                    <div className="text-sm font-medium text-white px-2 py-1 rounded bg-[#1A1A1A] border border-[#2A2A2A] inline-block">
                                        {context.marketPhase.toUpperCase().replace('_', ' ')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Dominant Narrative</div>
                                    <div className="text-sm text-neutral-200 leading-relaxed">
                                        {context.primaryNarrative}
                                    </div>
                                    {context.secondaryNarratives && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {context.secondaryNarratives.map(n => (
                                                <span key={n} className="text-[10px] text-neutral-500 bg-[#1A1A1A] px-1.5 py-0.5 rounded">
                                                    {n}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Col: Macro & Sentiment */}
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Fed Stance</div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            context.fedStance.includes('hawkish') ? "bg-red-500" :
                                                context.fedStance.includes('dovish') ? "bg-green-500" : "bg-yellow-500"
                                        )} />
                                        <span className="text-sm text-white capitalize">{context.fedStance.replace('_', ' ')}</span>
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-0.5">{context.interestRateCtxt}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Market Sentiment</div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-bold text-white">{context.sentiment.score}</div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-neutral-300">{context.sentiment.description}</span>
                                            <span className="text-[10px] text-neutral-500">Positioning: {context.sentiment.positioning}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Alert */}
                            <div className="col-span-2 mt-2 pt-4 border-t border-[#2A2A2A]">
                                <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Technical Key Level</div>
                                <div className="text-sm text-yellow-500/90 font-medium">
                                    ⚠️ Watch: {context.technicalContext.significantLevelLabel} (${context.technicalContext.keySupport} - ${context.technicalContext.keyResistance})
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-[#141414] border-t border-[#2A2A2A] flex justify-center">
                    <button
                        onClick={onStart}
                        className="w-full max-w-sm py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        ENTER SIMULATION
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
