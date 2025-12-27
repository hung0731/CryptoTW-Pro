'use client';

import React from 'react';
import Link from 'next/link';
import { GitMerge, Lightbulb, ChevronRight } from 'lucide-react';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { getRelatedIndicators, getPrerequisiteConcepts } from '@/lib/semantic-linkage';

interface KnowledgeGraphProps {
    storyId: string;
}

export function KnowledgeGraph({ storyId }: KnowledgeGraphProps) {
    const relatedIndicators = getRelatedIndicators(storyId);
    const prerequisiteConcepts = getPrerequisiteConcepts(storyId);

    if (relatedIndicators.length === 0 && prerequisiteConcepts.length === 0) return null;

    return (
        <UniversalCard className="p-0 overflow-hidden">
            <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                <SectionHeaderCard
                    title="知識圖譜：延伸學習"
                    icon={GitMerge}
                />
            </div>

            <div className="divide-y divide-[#1A1A1A]">
                {/* 1. Concepts */}
                {prerequisiteConcepts.length > 0 && (
                    <div className="p-4">
                        <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" />
                            基礎概念
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {prerequisiteConcepts.map((concept, i) => (
                                <Link
                                    key={i}
                                    href={`/dictionary/${concept.id}`}
                                    className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 hover:bg-[#202020] transition-all"
                                >
                                    {concept.term}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Related Indicators */}
                {relatedIndicators.length > 0 && (
                    <div className="p-0">
                        <div className="px-4 py-2 bg-[#141414]/50 border-b border-[#1A1A1A] flex items-center gap-2">
                            <GitMerge className="w-3 h-3 text-neutral-500" />
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">相關指標</span>
                        </div>
                        <div className="flex flex-col divide-y divide-[#1A1A1A]">
                            {relatedIndicators.map((ind, i) => (
                                <Link
                                    key={i}
                                    href={`/indicators/${ind.slug}`}
                                    className="flex items-center justify-between p-4 hover:bg-[#141414] transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">
                                            {ind.name}
                                        </div>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-neutral-500 font-medium">
                                            {ind.reason}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </UniversalCard>
    );
}
