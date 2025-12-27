'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameState, Decision } from './useJudgmentGame';

interface GameControlsProps {
    gameState: GameState;
    resultStats: {
        isWin: boolean;
        pnlPercent: number;
        marketMove: number;
    } | null;
    onDecision: (d: Decision) => void;
    onReset: () => void;
}

export function GameControls({ gameState, resultStats, onDecision, onReset }: GameControlsProps) {
    return (
        <div className="border-t border-white/10 p-4 bg-[#0A0A0B]">
            {gameState === 'observing' && (
                <div className="flex justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => onDecision('long')}
                        className="flex-1 max-w-[140px] py-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-white transition-all font-bold flex flex-col items-center gap-1 group"
                    >
                        <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs">LONG (做多)</span>
                    </button>
                    <button
                        onClick={() => onDecision('wait')}
                        className="flex-1 max-w-[140px] py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-all font-bold flex flex-col items-center gap-1 group"
                    >
                        <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs">WAIT (觀望)</span>
                    </button>
                    <button
                        onClick={() => onDecision('short')}
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
                        onClick={onReset}
                        className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-white hover:text-black transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        重玩
                    </button>
                </div>
            )}
        </div>
    );
}
