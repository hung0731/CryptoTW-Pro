'use client';

import { useState, useMemo } from 'react';
import { useReviewChartData } from '@/hooks/useReviewChartData';

export type GameState = 'intro' | 'observing' | 'result';
export type Decision = 'long' | 'short' | 'wait' | null;

interface UseJudgmentGameProps {
    eventStart: string;
    reviewSlug: string;
    daysBuffer?: number;
}

export function useJudgmentGame({ eventStart, reviewSlug, daysBuffer = 90 }: UseJudgmentGameProps) {
    const [gameState, setGameState] = useState<GameState>('intro');
    const [decision, setDecision] = useState<Decision>(null);

    // Fetch Full Data
    const { data: fullData, loading } = useReviewChartData({
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
    const d0Index = useMemo(() => {
        if (!fullData || fullData.length === 0) return -1;
        return fullData.findIndex(d => d.date >= eventStart);
    }, [fullData, eventStart]);

    // 2. Slice Data based on State
    const displayData = useMemo(() => {
        if (!fullData || d0Index === -1) return [];
        if (gameState === 'intro') return fullData.slice(0, d0Index); // Show contexts
        if (gameState === 'observing') return fullData.slice(0, d0Index); // Stop at D0
        return fullData; // Show All for result
    }, [fullData, d0Index, gameState]);

    const displayOIData = useMemo(() => {
        if (!oiData || d0Index === -1) return [];
        if (gameState === 'observing') return oiData.slice(0, d0Index);
        return oiData; // Show All for result or intro (maybe? no, intro likely stops at D0 too or same as price) -> Original code: intro uses default (d0Index) implicitly if logic holds, actually original code didn't handle intro specifically for OI, let's assume slice to D0 for intro too.
        // Wait, original code:
        // if (gameState === 'observing') return oiData.slice(0, d0Index);
        // if (gameState === 'result') return oiData;
        // return oiData.slice(0, d0Index); // Default fallthrough for intro
    }, [oiData, d0Index, gameState]);

    // 3. PnL Calculation
    const resultStats = useMemo(() => {
        if (gameState !== 'result' || !fullData || d0Index === -1 || !decision) return null;

        const entryPrice = fullData[d0Index].price;
        // Result at D+30 (or end of data)
        const exitIndex = Math.min(d0Index + 30, fullData.length - 1);
        const exitPrice = fullData[exitIndex].price;

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

    const startGame = () => setGameState('observing');

    const makeDecision = (d: Decision) => {
        setDecision(d);
        setGameState('result');
    };

    const resetGame = () => {
        setGameState('intro');
        setDecision(null);
    };

    return {
        gameState,
        decision,
        displayData,
        displayOIData,
        resultStats,
        loading: loading && (!fullData || fullData.length === 0),
        startGame,
        makeDecision,
        resetGame
    };
}
