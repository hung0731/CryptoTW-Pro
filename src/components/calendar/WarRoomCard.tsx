'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { EnrichedMacroEvent } from '@/lib/services/macro-events';

interface WarRoomCardProps {
    imminentEvent: EnrichedMacroEvent;
}

export function WarRoomCard({ imminentEvent }: WarRoomCardProps) {
    if (!imminentEvent) return null;

    return (
        <UniversalCard className="bg-gradient-to-br from-blue-950/30 to-[#0F0F10] border-blue-500/30 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Activity className="w-16 h-16 text-blue-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-blue-100 tracking-wide uppercase">
                        即將到來：{imminentEvent.def.name} (D-{imminentEvent.daysUntil})
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="text-xs text-neutral-400 font-mono mb-2">PRE-FLIGHT CHECKLIST</div>
                        <div className="space-y-2">
                            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0B] border border-[#2A2A2A] hover:border-blue-500/50 transition-colors cursor-pointer group">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-[#1A1A1A]" />
                                <div>
                                    <span className="text-sm text-neutral-200 group-hover:text-white font-medium">检查資金費率 (Funding Rate)</span>
                                    <p className="text-xs text-neutral-500 mt-0.5">確認是否有多頭過度擁擠的跡象 (&gt;0.01% with high OI)</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0B] border border-[#2A2A2A] hover:border-blue-500/50 transition-colors cursor-pointer group">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-[#1A1A1A]" />
                                <div>
                                    <span className="text-sm text-neutral-200 group-hover:text-white font-medium">標記關鍵支撐阻力</span>
                                    <p className="text-xs text-neutral-500 mt-0.5">預先設定好如果插針 (Wick) 發生的接單點位。</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-xs text-neutral-400 font-mono mb-2">TACTICAL INTELLIGENCE</div>
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-blue-300 font-bold">歷史波動慣性</span>
                                <span className="text-xs text-blue-400">{imminentEvent.stats?.avgRange}% (Avg Range)</span>
                            </div>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                                {imminentEvent.def.impactSummary}
                            </p>
                            {imminentEvent.aiPayload.lastEvent && (
                                <div className="mt-3 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">上次 ({imminentEvent.aiPayload.lastEvent.date.split('T')[0]})</span>
                                    <span className={cn(
                                        "font-mono",
                                        (imminentEvent.aiPayload.lastEvent.d1Return ?? 0) > 0 ? "text-green-400" : "text-red-400"
                                    )}>
                                        {(imminentEvent.aiPayload.lastEvent.d1Return ?? 0) > 0 ? '+' : ''}{imminentEvent.aiPayload.lastEvent.d1Return}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UniversalCard>
    );
}
