'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { IndicatorStory } from '@/lib/indicator-stories';

interface UseCaseListProps {
    useCases: IndicatorStory['useCases'];
}

const USE_CASE_TYPE_LABELS: Record<string, string> = {
    observe: '觀察',
    risk: '風險',
    timing: '時機',
};

const USE_CASE_TYPE_COLORS: Record<string, string> = {
    observe: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    risk: 'bg-red-500/10 text-red-400 border-red-500/20',
    timing: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export function UseCaseList({ useCases }: UseCaseListProps) {
    return (
        <UniversalCard className="p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="這個指標在判斷什麼？"
                    icon={Target}
                />
            </div>
            <div className="p-0">
                <div className="flex flex-col divide-y divide-[#1A1A1A]">
                    {useCases.map((uc, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 hover:bg-[#141414] transition-colors">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border flex-shrink-0 mt-0.5",
                                USE_CASE_TYPE_COLORS[uc.type] || "bg-neutral-800 text-neutral-400"
                            )}>
                                {USE_CASE_TYPE_LABELS[uc.type]}
                            </span>
                            <p className="text-sm leading-relaxed text-[#D4D4D4]">{uc.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </UniversalCard>
    );
}
