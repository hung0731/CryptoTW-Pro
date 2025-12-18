'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/design-tokens';

interface QuickReadHeroProps {
    year: number;
    title: string;          // 「2024 比特幣 ETF 上線」
    summary: string;        // 一句話結論
    metrics: {
        label: string;      // 「D0~D14」
        value: string;      // 「-20%」
        emoji: string;      // 「📉」
    }[];
    importance: string;     // 'S' / 'A' / 'B' 級
}

export function QuickReadHero({
    year,
    title,
    summary,
    metrics,
    importance
}: QuickReadHeroProps) {
    const importanceLabel = importance;

    return (
        <div className="p-5 pb-6">
            {/* 年份 + 級別 */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono text-neutral-500">{year}</span>
                <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    importanceLabel === 'S' ? "bg-yellow-500/20 text-yellow-400" :
                        importanceLabel === 'A' ? "bg-blue-500/20 text-blue-400" :
                            "bg-neutral-500/20 text-neutral-400"
                )}>
                    {importanceLabel} 級事件
                </span>
            </div>

            {/* 主標題 */}
            <h1 className="text-2xl font-bold text-white leading-tight mb-4">
                {title}
            </h1>

            {/* 一句話結論 - 醒目框 */}
            <div className="rounded-lg px-4 py-3 mb-5 border border-white/10" style={{ backgroundColor: '#0C0C0D' }}>
                <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                    「{summary}」
                </p>
            </div>

            {/* 關鍵數據 - 橫排 */}
            <div className="flex gap-4 overflow-x-auto pb-1">
                {metrics.map((m, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center min-w-[80px] p-3 rounded-lg"
                        style={{ backgroundColor: '#0A0A0B' }}
                    >
                        <span className="text-lg mb-1">{m.emoji}</span>
                        <span className="text-sm font-bold text-white">{m.value}</span>
                        <span className={cn("text-[10px]", COLORS.textTertiary)}>{m.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
