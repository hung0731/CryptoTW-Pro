import React from 'react';
import { cn } from '@/lib/utils';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface QuickReadHeroProps {
    year: number;
    title: string;          // 「2024 比特幣 ETF 上線」
    summary: string;        // 一句話結論
    metrics: {
        label: string;      // 「D0~D14」
        value: string;      // 「-20%」
        emoji: string;      // 「📉」
        rowTitle?: string;  // Optional row title for improved layout
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
        <UniversalCard className="p-0 overflow-hidden">
            {/* 頂部標題與摘要區域 */}
            <div className="p-6 sm:p-8 space-y-6">
                {/* Header: Year + Badge + Title */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                            {year}
                        </span>
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded font-bold border",
                            importanceLabel === 'S' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                importanceLabel === 'A' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                    "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                        )}>
                            {importanceLabel} 級事件
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        {title}
                    </h1>
                </div>
            </div>

            {/* 關鍵數據 List - 垂直列表 + 分隔線 */}
            <div className="border-t border-[#1A1A1A] bg-[#0A0A0A] flex flex-col">
                {/* 1. Summary Row (Moved inside list as requested) */}
                <div className="p-4 border-b border-[#1A1A1A] hover:bg-[#111] transition-colors">
                    <div className="text-[10px] text-neutral-500 mb-2 font-mono tracking-wider uppercase">
                        事件摘要
                    </div>
                    <div className="flex gap-4">
                        <div className="shrink-0 pt-1 text-neutral-500">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-50">
                                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                            </svg>
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                            {summary}
                        </p>
                    </div>
                </div>

                {/* 2. Metrics Grid (Horizontal on Desktop, Stacked on Mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1A1A1A]">
                    {metrics.map((m, idx) => (
                        <div
                            key={idx}
                            className="p-4 hover:bg-[#111] transition-colors"
                        >
                            {/* Improved Layout: Row Title on top */}
                            {m.rowTitle && (
                                <div className="text-[10px] text-neutral-500 mb-2 font-mono tracking-wider uppercase">
                                    {m.rowTitle}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-xl shrink-0 filter drop-shadow-lg w-8 text-center">{m.emoji}</span>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-[#E0E0E0]">{m.value}</span>
                                    <span className="text-[10px] sm:text-xs font-mono text-[#666] uppercase truncate">{m.label}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </UniversalCard>
    );
}
