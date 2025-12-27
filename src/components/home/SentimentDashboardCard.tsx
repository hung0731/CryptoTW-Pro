'use client';

import React from 'react';
import { Gauge, Zap, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { MarketStatusData } from '@/lib/types';
import { cn } from '@/lib/utils';

import { UI_LABELS } from '@/config/naming';

interface SentimentDashboardCardProps {
    status: MarketStatusData | null;
}

export function SentimentDashboardCard({ status }: SentimentDashboardCardProps) {
    if (!status) return null;

    // Helper to determine color based on value/label (minimalist approach)
    const getSentimentColor = (label: string) => {
        if (label.includes('貪婪') || label.includes('樂觀')) return 'text-emerald-400';
        if (label.includes('恐慌') || label.includes('悲觀')) return 'text-rose-400';
        return 'text-neutral-400';
    };

    const getSentimentBg = (label: string) => {
        if (label.includes('貪婪') || label.includes('樂觀')) return 'bg-emerald-500/10 border-emerald-500/20';
        if (label.includes('恐慌') || label.includes('悲觀')) return 'bg-rose-500/10 border-rose-500/20';
        return 'bg-neutral-500/10 border-neutral-500/20';
    };

    const metrics = [
        {
            id: 'sentiment',
            label: '情緒指數',
            value: status.sentiment.value,
            subValue: status.sentiment.label,
            icon: Gauge,
            color: getSentimentColor(status.sentiment.label),
            bgClass: getSentimentBg(status.sentiment.label)
        },
        {
            id: 'leverage',
            label: '槓桿水平',
            value: status.leverage.value,
            subValue: status.leverage.label,
            icon: Zap,
            color: 'text-amber-400',
            bgClass: 'bg-amber-500/10 border-amber-500/20'
        },
        {
            id: 'volatility',
            label: '市場波動',
            value: status.volatility.value,
            subValue: status.volatility.label,
            icon: Activity,
            color: 'text-sky-400',
            bgClass: 'bg-sky-500/10 border-sky-500/20'
        }
    ];

    return (
        <UniversalCard variant="luma" className="p-0 overflow-hidden">
            {/* Header - Luma style with gradient border */}
            <div className="relative border-b border-white/[0.06] bg-white/[0.02]">
                <SectionHeaderCard
                    title={UI_LABELS.HOME.SENTIMENT_TITLE}
                    icon={Activity}
                />
                {/* Top gradient accent */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Grid Content - Luma glassmorphism style */}
            <div className="grid grid-cols-3">
                {metrics.map((m, index) => {
                    const Icon = m.icon;

                    return (
                        <div
                            key={m.id}
                            className={cn(
                                "relative p-5 flex flex-col items-center justify-center gap-3",
                                "bg-white/[0.01] hover:bg-white/[0.03]",
                                "transition-all duration-300 group",
                                // Dividers between cards
                                index !== 0 && "border-l border-white/[0.04]"
                            )}
                        >
                            {/* Icon Circle - Glass style */}
                            <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300",
                                m.bgClass,
                                "group-hover:scale-110 group-hover:shadow-lg",
                                m.color
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="text-center space-y-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block">
                                    {m.label}
                                </span>
                                <div className={cn(
                                    "text-sm font-bold tracking-tight text-white/90 group-hover:text-white transition-colors"
                                )}>
                                    {m.subValue || m.value}
                                </div>
                                {/* Animated accent line */}
                                <div className={cn(
                                    "h-0.5 w-0 mx-auto rounded-full transition-all duration-300 group-hover:w-8",
                                    m.color.replace('text-', 'bg-'),
                                    "opacity-60"
                                )} />
                            </div>

                            {/* Subtle hover glow overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-transparent via-white/[0.02] to-transparent" />
                        </div>
                    );
                })}
            </div>
        </UniversalCard>
    );
}
