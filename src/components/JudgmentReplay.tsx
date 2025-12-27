'use client';

import React from 'react';
import { useJudgmentGame } from './judgment/useJudgmentGame';
import { BriefingOverlay } from './judgment/BriefingOverlay';
import { GameControls } from './judgment/GameControls';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { ReviewChart } from '@/components/ReviewChart';

interface JudgmentReplayProps {
    symbol: string;
    eventStart: string; // D0
    eventEnd: string;
    reviewSlug: string;
    daysBuffer?: number;
}

export function JudgmentReplay({
    symbol,
    eventStart,
    eventEnd,
    reviewSlug,
    daysBuffer = 90
}: JudgmentReplayProps) {
    const {
        gameState,
        displayData,
        displayOIData,
        resultStats,
        loading,
        startGame,
        makeDecision,
        resetGame
    } = useJudgmentGame({ eventStart, reviewSlug, daysBuffer });

    if (loading) {
        return <div className="p-8 text-center text-neutral-500">Loading Replay Data...</div>;
    }

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
                        focusWindow={undefined}
                    />

                    {/* Overlay for Intro */}
                    {gameState === 'intro' && (
                        <BriefingOverlay
                            symbol={symbol}
                            eventStart={eventStart}
                            reviewSlug={reviewSlug}
                            onStart={startGame}
                        />
                    )}
                </div>

                {/* 2. Secondary Chart (OI) - Key Context */}
                <div className="h-[40%] w-full relative bg-[#050505]">
                    {displayOIData && displayOIData.length > 0 ? (
                        <ReviewChart
                            type="oi"
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
            <GameControls
                gameState={gameState}
                resultStats={resultStats}
                onDecision={makeDecision}
                onReset={resetGame}
            />
        </UniversalCard>
    );
}
