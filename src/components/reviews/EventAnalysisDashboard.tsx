
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Event DNA (Radar) */}
            <UniversalCard className="md:col-span-1 p-0 overflow-hidden min-h-[320px]">
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="事件基因 (DNA)"
                        icon={Zap}
                        description="市場性格特徵分析"
                    />
                </div>
                <div className="h-[260px] relative bg-black/40">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }}
                            />
                            <Radar
                                name="DNA"
                                dataKey="A"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="#3b82f6"
                                fillOpacity={0.2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                    {/* Overlay Stats */}
                    <div className="absolute top-2 right-4 text-[10px] text-right text-neutral-500 font-mono">
                        <div>DMG: {data.dna.damage}</div>
                        <div>REC: {data.dna.resilience}</div>
                    </div>
                </div>
            </UniversalCard>

            {/* 2. Smart Pattern Finder (Similar Events) */}
            <UniversalCard className="md:col-span-2 p-0 overflow-hidden min-h-[320px]">
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10] flex justify-between items-center pr-4">
                    <SectionHeaderCard
                        title="歷史押韻 (History Rhymes)"
                        icon={BrainCircuit}
                        description="走勢關聯度匹配"
                    />
                </div>

                <div className="flex flex-col">
                    {similarEvents.map((sim: any, idx: number) => (
                        <div key={sim.slug} className="group flex items-center gap-4 p-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors relative overflow-hidden">
                            {/* Similarity Score */}
                            <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-full border border-[#2A2A2A] bg-[#0A0A0A] group-hover:border-blue-500/30 transition-colors z-10">
                                <span className="text-xl font-bold text-blue-500">{sim.score}%</span>
                                <span className="text-[9px] text-neutral-500 uppercase">Match</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono text-neutral-500 border border-[#333] px-1.5 rounded bg-[#111]">
                                        {sim.year}
                                    </span>
                                    <h4 className="text-sm font-bold text-neutral-200 group-hover:text-white truncate">
                                        {sim.title}
                                    </h4>
                                </div>
                                <p className="text-xs text-neutral-500 line-clamp-1 group-hover:text-neutral-400">
                                    {sim.summary}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 z-10">
                                <Link
                                    href={`/reviews/compare?event=${slug}&compare=${sim.originalSlug}`}
                                    className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-xs font-medium text-neutral-400 hover:bg-black hover:text-white border border-[#2A2A2A] transition-all flex items-center gap-1.5"
                                >
                                    <GitCompare className="w-3.5 h-3.5" />
                                    <span>VS</span>
                                </Link>
                                <Link
                                    href={`/reviews/${sim.year}/${sim.originalSlug.split('-')[0]}`} // Approximate link reconstruction
                                    className="p-2 rounded-lg hover:bg-[#1A1A1A] text-neutral-500 hover:text-white transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Hover Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/0 via-blue-900/0 to-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}

                    {similarEvents.length === 0 && (
                        <div className="p-8 text-center text-neutral-500 text-sm">
                            數據分析中，暫無匹配事件
                        </div>
                    )}
                </div>
            </UniversalCard>
        </div>
    );
}

// Default export for dynamic import if needed
export default EventAnalysisDashboard;
