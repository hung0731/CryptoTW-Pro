'use client';

import React from 'react';
import { Gauge, Zap, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { MarketStatusData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY } from '@/lib/design-tokens';

interface SentimentDashboardCardProps {
    status: MarketStatusData | null;
}

export function SentimentDashboardCard({ status }: SentimentDashboardCardProps) {
    if (!status) return null;

    // Helper to determine color based on value/label (minimalist approach)
    const getSentimentColor = (label: string) => {
        if (label.includes('貪婪') || label.includes('樂觀')) return 'text-green-400';
        if (label.includes('恐慌') || label.includes('悲觀')) return 'text-red-400';
        return 'text-neutral-400';
    };

    const getTrendIcon = (label: string) => {
        if (label.includes('多') || label.includes('高') || label.includes('貪婪')) return TrendingUp;
        if (label.includes('空') || label.includes('低') || label.includes('恐慌')) return TrendingDown;
        return Minus;
    };

    const metrics = [
        {
            id: 'sentiment',
            label: '情緒指數',
            value: status.sentiment.value, // e.g. "極度貪婪" or score
            subValue: status.sentiment.label,
            icon: Gauge,
            color: getSentimentColor(status.sentiment.label)
        },
        {
            id: 'leverage',
            label: '槓桿水平',
            value: status.leverage.value,
            subValue: status.leverage.label,
            icon: Zap,
            color: 'text-yellow-500' // Fixed gold for leverage/money
        },
        {
            id: 'volatility',
            label: '市場波動',
            value: status.volatility.value,
            subValue: status.volatility.label,
            icon: Activity,
            color: 'text-blue-400' // Cool blue for volatility
        }
    ];

    return (
        <UniversalCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="市場情緒與資金"
                    icon={Activity}
                />
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-3 divide-x divide-[#1A1A1A] bg-[#1A1A1A] gap-px">
                {metrics.map((m) => {
                    const Icon = m.icon;
                    // Try to parse number if value is a string number
                    // const isNumber = !isNaN(Number(m.value));

                    return (
                        <div key={m.id} className="bg-[#0A0A0A] p-4 flex flex-col items-center justify-center gap-3 hover:bg-[#141414] transition-colors group">
                            {/* Icon Circle */}
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300",
                                "bg-[#151515] border-[#2A2A2A] group-hover:border-[#333] group-hover:scale-110",
                                "text-neutral-500 group-hover:text-neutral-300"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="text-center space-y-1">
                                <span className="text-[10px] uppercase tracking-wider text-[#666] font-bold block">
                                    {m.label}
                                </span>
                                <div className={cn("text-sm font-bold tracking-tight text-[#E0E0E0] group-hover:text-white transition-colors")}>
                                    {m.subValue || m.value}
                                </div>
                                {/* Optional: Small indicator line */}
                                <div className={cn("h-0.5 w-6 mx-auto rounded-full opacity-20 group-hover:opacity-100 transition-opacity mt-1", m.color.replace('text-', 'bg-'))} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </UniversalCard>
    );
}
