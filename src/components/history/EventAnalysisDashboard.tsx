
'use client';

import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { BrainCircuit, GitCompare, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import ANALYSIS_DATA from '@/data/analysis-derived.json'; // Direct import of static JSON
import { REVIEWS_DATA } from '@/lib/reviews-data';

interface EventAnalysisDashboardProps {
    slug: string; // composite "etf-2024"
}

export function EventAnalysisDashboard({ slug }: EventAnalysisDashboardProps) {
    const data = (ANALYSIS_DATA as any)[slug];

    const radarData = useMemo(() => {
        if (!data) return [];
        return [
            { subject: '破壞力', A: data.dna.damage, fullMark: 100 },
            { subject: '恐慌度', A: data.dna.panic, fullMark: 100 },
            { subject: '速度', A: data.dna.speed, fullMark: 100 },
            { subject: '修復力', A: data.dna.resilience, fullMark: 100 },
            { subject: '槓桿', A: data.dna.leverage, fullMark: 100 },
        ];
    }, [data]);

    const similarEvents = useMemo(() => {
        if (!data || !data.similarEvents) return [];
        return data.similarEvents.map((sim: any) => {
            const original = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === sim.slug);
            return {
                ...sim,
                title: original?.title.split('：')[0] || sim.slug,
                year: original?.year || '',
                summary: original?.summary || '',
                originalSlug: sim.slug
            };
        });
    }, [data]);

    if (!data) return null;

    return (
        <div className="flex flex-col gap-6">
            {/* 1. Event DNA (Radar) - Single Column */}
            <UniversalCard className="w-full p-0 overflow-hidden min-h-[320px]">
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="事件基因 (DNA)"
                        icon={Zap}
                        description="市場性格特徵分析"
                    />
                </div>
                <div className="h-[280px] relative bg-[#0A0A0A] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="#262626" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#A3A3A3', fontSize: 12, fontWeight: 500 }}
                            />
                            <Radar
                                name="DNA"
                                dataKey="A"
                                stroke="#FFFFFF"
                                strokeWidth={2}
                                fill="#FFFFFF"
                                fillOpacity={0.15}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                    {/* Overlay Stats */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-xs font-mono text-[#666]">
                            <span>破壞力 (DMG)</span>
                            <span className="text-white font-bold">{data.dna.damage}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#666]">
                            <span>修復力 (REC)</span>
                            <span className="text-white font-bold">{data.dna.resilience}</span>
                        </div>
                    </div>
                </div>
            </UniversalCard>

            {/* 2. Smart Pattern Finder (Similar Events) - Single Column */}
            <UniversalCard className="w-full p-0 overflow-hidden">
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10] flex justify-between items-center pr-4">
                    <SectionHeaderCard
                        title="歷史押韻 (History Rhymes)"
                        icon={BrainCircuit}
                        description="走勢關聯度匹配"
                    />
                </div>

                <div className="flex flex-col">
                    {similarEvents.map((sim: any, idx: number) => (
                        <div key={sim.slug} className="group grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors relative overflow-hidden items-center">
                            {/* Similarity Score */}
                            <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg border border-[#262626] bg-[#0F0F10] z-10">
                                <span className="text-sm font-bold text-white">{sim.score}%</span>
                                <span className="text-[9px] text-[#666] uppercase">Match</span>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1 min-w-0 z-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[#666] border border-[#262626] px-1.5 py-0.5 rounded bg-[#0A0A0A]">
                                        {sim.year}
                                    </span>
                                    <h4 className="text-sm font-bold text-[#E5E5E5] group-hover:text-white truncate">
                                        {sim.title}
                                    </h4>
                                </div>
                                <p className="text-xs text-[#666] line-clamp-1 group-hover:text-[#888]">
                                    {sim.summary}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 z-10">
                                <Link
                                    href={`/reviews/compare?event=${slug}&compare=${sim.originalSlug}`}
                                    className="px-3 py-1.5 rounded bg-[#1A1A1A] text-xs font-medium text-[#888] hover:bg-white hover:text-black border border-[#262626] hover:border-white transition-all flex items-center gap-1.5"
                                >
                                    <GitCompare className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">對比</span>
                                </Link>
                                <Link
                                    href={`/reviews/${sim.year}/${sim.originalSlug.split('-')[0]}`}
                                    className="p-2 rounded hover:bg-[#1A1A1A] text-[#666] hover:text-white transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {similarEvents.length === 0 && (
                        <div className="p-8 text-center text-[#666] text-sm font-mono">
                            暫無高度匹配的歷史事件
                        </div>
                    )}
                </div>
            </UniversalCard>
        </div>
    );
}

// Default export for dynamic import if needed
export default EventAnalysisDashboard;
