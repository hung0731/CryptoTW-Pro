'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReviewChart } from '@/components/ReviewChart';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { useReviewChartData } from '@/hooks/useReviewChartData';
import { REVIEWS_DATA } from '@/lib/reviews-data';

interface JudgmentReplayProps {
    symbol: string;
    eventStart: string; // D0
    eventEnd: string;
    reviewSlug: string;
    daysBuffer?: number;
}

type GameState = 'intro' | 'observing' | 'result';
type Decision = 'long' | 'short' | 'wait' | null;

export function JudgmentReplay({
    symbol,
    eventStart,
    eventEnd,
    reviewSlug,
    daysBuffer = 90
}: JudgmentReplayProps) {
    const [gameState, setGameState] = useState<GameState>('intro');
    const [decision, setDecision] = useState<Decision>(null);
    const [showFullHistory, setShowFullHistory] = useState(false);

    // Fetch Full Data
    const { data: fullData } = useReviewChartData({
        type: 'price',
        eventStart,
        reviewSlug,
        viewMode: 'standard', // viewMode is required by type
        daysBuffer // Fetches [-90, +180] or similar
    });

    // Fetch OI Data for context
    const { data: oiData } = useReviewChartData({
        type: 'oi',
        eventStart,
        reviewSlug,
        viewMode: 'standard',
        daysBuffer
    });

    // 1. Determine D0 Index
    // eventStart string (YYYY-MM-DD) -> find index in data
    const d0Index = useMemo(() => {
        if (!fullData || fullData.length === 0) return -1;
        return fullData.findIndex(d => d.date >= eventStart);
    }, [fullData, eventStart]);

    // 2. Slice Data based on State
    const displayData = useMemo(() => {
        if (!fullData || d0Index === -1) return [];
        if (gameState === 'intro') return fullData.slice(0, d0Index); // Show contexts
        if (gameState === 'observing') return fullData.slice(0, d0Index); // Stop at D0
        if (gameState === 'result') return fullData; // Show All
        return fullData;
    }, [fullData, d0Index, gameState]);

    const displayOIData = useMemo(() => {
        if (!oiData || d0Index === -1) return [];
        if (gameState === 'observing') return oiData.slice(0, d0Index);
        if (gameState === 'result') return oiData;
        return oiData.slice(0, d0Index);
    }, [oiData, d0Index, gameState]);

    // 3. PnL Calculation
    const resultStats = useMemo(() => {
        if (gameState !== 'result' || !fullData || d0Index === -1 || !decision) return null;

        const entryPrice = fullData[d0Index].price;
        // Result at D+30 (or end of data)
        const exitIndex = Math.min(d0Index + 30, fullData.length - 1);
        const exitPrice = fullData[exitIndex].price;
        const exitDate = fullData[exitIndex].date;

        const rawChange = (exitPrice - entryPrice) / entryPrice;
        let pnl = 0;
        let isWin = false;

        if (decision === 'long') {
            pnl = rawChange;
            isWin = pnl > 0;
        } else if (decision === 'short') {
            pnl = -rawChange;
            isWin = pnl > 0;
        } else {
            // Wait: Win if market drops or chops? simplified: Win if abs(change) < 5%?
            // "Wait" is good if market crashes (capital preservation) or chops.
            // Let's say Wait is neutral 0% PnL, but "Correct" if market drops > 20%?
            pnl = 0;
            isWin = Math.abs(rawChange) < 0.05; // Win if market didn't move much
        }

        return {
            entryPrice,
            exitPrice,
            daysHeld: 30,
            pnlPercent: pnl * 100,
            isWin,
            marketMove: rawChange * 100
        };
    }, [gameState, fullData, d0Index, decision]);

    const handleStart = () => setGameState('observing');

    const handleDecision = (d: Decision) => {
        setDecision(d);
        setGameState('result');
    };

    const handleReset = () => {
        setGameState('intro');
        setDecision(null);
    };

    if (!fullData || fullData.length === 0) return <div className="p-8 text-center text-neutral-500">Loading Replay Data...</div>;

    return (
        <UniversalCard className="relative overflow-hidden min-h-[500px] flex flex-col bg-[#080809] border border-blue-500/30 shadow-[0_0_50px_-12px_rgba(59,130,246,0.1)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0A0A0B]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-bold text-blue-100 tracking-wide">JUDGMENT REPLAY</span>
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                    {gameState === 'intro' ? 'MISSION BRIEF' :
                        gameState === 'observing' ? 'DECISION PHASE' : 'MISSION DEBRIEF'}
                </div>
            </div>

            {/* Main Viz Area */}
            <div className="flex-1 relative">
                {/* 1. Price Chart */}
                <div className="h-[60%] w-full relative border-b border-white/5">
                    <ReviewChart
                        type="price"
                        symbol={symbol}
                        eventStart={eventStart}
                        eventEnd={eventEnd}
                        overrideData={displayData}
                        daysBuffer={daysBuffer}
                        // Hide markers in observing mode to avoid spoilers? 
                        // Actually eventStart marker is the D0 line. 
                        // In observing mode, D0 is the right edge.
                        focusWindow={undefined}
                    />

                    {/* Overlay for Intro */}
                    {gameState === 'intro' && (
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
                                    {(() => {
                                        // Find context
                                        const eventConfig = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === reviewSlug); // ID matching logic
                                        const ctx = eventConfig?.historicalContext;

                                        if (!ctx) return (
                                            <div className="col-span-2 text-center text-neutral-400 py-8">
                                                <p className="mb-4">我們已將時間撥回到事件爆發前夕。</p>
                                                <p className="text-sm">請觀察市場結構、資金費率與持倉量，做出你的決策。</p>
                                            </div>
                                        );

                                        return (
                                            <>
                                                {/* Left Col: Narrative & Phase */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Market Phase</div>
                                                        <div className="text-sm font-medium text-white px-2 py-1 rounded bg-[#1A1A1A] border border-[#2A2A2A] inline-block">
                                                            {ctx.marketPhase.toUpperCase().replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Dominant Narrative</div>
                                                        <div className="text-sm text-neutral-200 leading-relaxed">
                                                            {ctx.primaryNarrative}
                                                        </div>
                                                        {ctx.secondaryNarratives && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {ctx.secondaryNarratives.map(n => (
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
                                                                ctx.fedStance.includes('hawkish') ? "bg-red-500" :
                                                                    ctx.fedStance.includes('dovish') ? "bg-green-500" : "bg-yellow-500"
                                                            )} />
                                                            <span className="text-sm text-white capitalize">{ctx.fedStance.replace('_', ' ')}</span>
                                                        </div>
                                                        <div className="text-xs text-neutral-500 mt-0.5">{ctx.interestRateCtxt}</div>
                                                    </div>

                                                    <div>
                                                        <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Market Sentiment</div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl font-bold text-white">{ctx.sentiment.score}</div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-neutral-300">{ctx.sentiment.description}</span>
                                                                <span className="text-[10px] text-neutral-500">Positioning: {ctx.sentiment.positioning}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer Alert */}
                                                <div className="col-span-2 mt-2 pt-4 border-t border-[#2A2A2A]">
                                                    <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Technical Key Level</div>
                                                    <div className="text-sm text-yellow-500/90 font-medium">
                                                        ⚠️ Watch: {ctx.technicalContext.significantLevelLabel} (${ctx.technicalContext.keySupport} - ${ctx.technicalContext.keyResistance})
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Action Footer */}
                                <div className="p-4 bg-[#141414] border-t border-[#2A2A2A] flex justify-center">
                                    <button
                                        onClick={handleStart}
                                        className="w-full max-w-sm py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        ENTER SIMULATION
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* 2. Secondary Chart (OI) - Key Context */}
                <div className="h-[40%] w-full relative bg-[#050505]">
                    {oiData && oiData.length > 0 ? (
                        <ReviewChart
                            type="oi" // or funding? Let's default to OI for structure
                            symbol={symbol}
                            eventStart={eventStart}
                            eventEnd={eventEnd}
                            overrideData={displayOIData}
                            daysBuffer={daysBuffer}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-xs text-neutral-700">OI 數據不足</div>
                    )}
                </div>
            </div>

            {/* Controls / Footer */}
            <div className="border-t border-white/10 p-4 bg-[#0A0A0B]">
                {gameState === 'observing' && (
                    <div className="flex justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => handleDecision('long')}
                            className="flex-1 max-w-[140px] py-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-white transition-all font-bold flex flex-col items-center gap-1 group"
                        >
                            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs">LONG (做多)</span>
                        </button>
                        <button
                            onClick={() => handleDecision('wait')}
                            className="flex-1 max-w-[140px] py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-all font-bold flex flex-col items-center gap-1 group"
                        >
                            <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-xs">WAIT (觀望)</span>
                        </button>
                        <button
                            onClick={() => handleDecision('short')}
                            className="flex-1 max-w-[140px] py-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold flex flex-col items-center gap-1 group"
                        >
                            <TrendingDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs">SHORT (做空)</span>
                        </button>
                    </div>
                )}

                {gameState === 'result' && resultStats && (
                    <div className="flex items-center justify-between animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center border-2",
                                resultStats.isWin ? "border-green-500 bg-green-500/20 text-green-500" : "border-red-500 bg-red-500/20 text-red-500"
                            )}>
                                {resultStats.isWin ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className={cn("text-lg font-bold", resultStats.isWin ? "text-green-400" : "text-red-400")}>
                                    {resultStats.isWin ? '決策正確 (Good Call)' : '決策錯誤 (Rekt)'}
                                </h3>
                                <p className="text-xs text-neutral-400">
                                    30天後回報: <span className="font-mono text-white">{resultStats.pnlPercent.toFixed(2)}%</span>
                                    (市場走勢: {resultStats.marketMove.toFixed(2)}%)
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-white hover:text-black transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            重玩
                        </button>
                    </div>
                )}
            </div>
        </UniversalCard>
    );
}
