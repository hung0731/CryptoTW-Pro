'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';

interface ChartCalloutProps {
    points: string[];
}

export function ChartCallout({ points }: ChartCalloutProps) {
    return (
        <UniversalCard className="p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="怎麼看這張圖？"
                    icon={Info}
                />
            </div>
            <div className="p-5">
                <ul className="space-y-4">
                    {points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                            <p className={cn("text-sm leading-relaxed text-neutral-300")}>
                                {point}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </UniversalCard>
    );
}
