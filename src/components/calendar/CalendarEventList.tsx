'use client';

import React from 'react';
import Link from 'next/link';
import {
    Activity,
    Briefcase,
    Calendar,
    Landmark,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnrichedMacroEvent } from '@/lib/services/macro-events';
import { Tag } from '@/components/ui/tag';
import { MiniChartCard } from '@/components/calendar/MiniChartCard';

interface CalendarEventListProps {
    events: EnrichedMacroEvent[];
    alignMode: 'time' | 'reaction';
    onReplay: (occ: any) => void;
}

// Helper to get Icon
const getEventIcon = (key: string) => {
    switch (key) {
        case 'cpi': return <Activity className="w-4 h-4" />
        case 'nfp': return <Briefcase className="w-4 h-4" />
        case 'fomc': return <Landmark className="w-4 h-4" />
        default: return <Calendar className="w-4 h-4" />
    }
}

export function CalendarEventList({ events, alignMode, onReplay }: CalendarEventListProps) {
    return (
        <div className="flex flex-col">
            {events.map((item) => {
                const { def, nextOccurrence, daysUntil, pastOccurrences } = item

                // Local sorting for display only
                const displayOccurrences = [...pastOccurrences]
                if (alignMode === 'reaction') {
                    displayOccurrences.sort((a, b) => {
                        const valA = a.reaction?.stats?.d0d1Return ? Math.abs(a.reaction.stats.d0d1Return) : 0
                        const valB = b.reaction?.stats?.d0d1Return ? Math.abs(b.reaction.stats.d0d1Return) : 0
                        return valB - valA
                    })
                }

                return (
                    <div key={def.key} className="group border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors">
                        <Link
                            href={`/calendar/${def.key}`}
                            className="block px-5 py-4"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] text-white group-hover:border-[#333]")}>
                                        {getEventIcon(def.key)}
                                    </div>

                                    <div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <h2 className={cn("text-sm font-bold text-[#E0E0E0] group-hover:text-white transition-colors")}>
                                                    {def.name}
                                                </h2>
                                                <span className="text-[10px] font-mono text-[#666] bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-[#2A2A2A]">{def.key.toUpperCase()}</span>
                                            </div>
                                            <p className="text-xs text-[#666] truncate max-w-[240px]">
                                                {item.narrative || def.impactSummary}
                                            </p>
                                            {/* Narrative Status Badge */}
                                            {item.narrative && (
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    {item.narrativeStatus && (
                                                        <Tag
                                                            variant={
                                                                item.narrativeStatus === 'bullish_surprise' ? 'success' :
                                                                    item.narrativeStatus === 'bearish_risk' ? 'error' : 'warning'
                                                            }
                                                            size="sm"
                                                            icon={
                                                                item.narrativeStatus === 'bullish_surprise' ? Activity :
                                                                    item.narrativeStatus === 'bearish_risk' ? AlertTriangle : Clock
                                                            }
                                                        >
                                                            {item.narrativeStatus === 'bullish_surprise' ? '利好預期' :
                                                                item.narrativeStatus === 'bearish_risk' ? '風險警示' : '觀望'}
                                                        </Tag>
                                                    )}

                                                    {/* Risk Signal */}
                                                    {item.riskSignal && (
                                                        <Tag
                                                            variant={
                                                                item.riskSignal.level === 'high' ? 'error' :
                                                                    item.riskSignal.level === 'medium' ? 'warning' : 'default'
                                                            }
                                                            size="sm"
                                                            icon={item.riskSignal.level === 'high' ? AlertTriangle : undefined}
                                                        >
                                                            {item.riskSignal.label}
                                                        </Tag>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Anchor: Time Indicator */}
                                {nextOccurrence ? (
                                    <div className="flex flex-col items-end gap-1">
                                        <Tag
                                            variant={daysUntil === 0 ? 'brand' : 'default'}
                                            size="sm"
                                            className={cn(daysUntil === 0 && "bg-white text-black hover:bg-white hover:text-black")}
                                        >
                                            {daysUntil === 0 ? '今天' : `D-${daysUntil}`}
                                        </Tag>
                                    </div>
                                ) : (
                                    <Tag variant="default" size="sm">
                                        待定
                                    </Tag>
                                )}
                            </div>

                            {/* Horizontal Scroll Cards (History) */}
                            <div className="rounded-lg bg-[#050505] border border-[#1A1A1A] p-3 overflow-hidden">
                                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
                                    {nextOccurrence && (
                                        <MiniChartCard
                                            occ={nextOccurrence}
                                            eventKey={def.key}
                                            windowDisplayStart={def.windowDisplay.start}
                                            isNext={true}
                                            daysUntil={daysUntil}
                                        />
                                    )}
                                    {displayOccurrences.map((occ, index) => (
                                        <MiniChartCard
                                            key={occ.occursAt}
                                            occ={occ}
                                            reaction={occ.reaction}
                                            eventKey={def.key}
                                            windowDisplayStart={def.windowDisplay.start}
                                            isLatest={alignMode === 'time' && index === 0}
                                            onReplay={(occ) => {
                                                if ((occ as any).stopPropagation) (occ as any).stopPropagation();
                                                onReplay(occ);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            })}
        </div>
    );
}
