'use client'

import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { JudgmentReplay } from '@/components/JudgmentReplay'
import { cn } from '@/lib/utils'
import { MacroEventOccurrence } from '@/lib/macro-events'
import { SPACING } from '@/lib/design-tokens'
import { AISummaryCard } from '@/components/ui/AISummaryCard'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { EnrichedMacroEvent } from '@/lib/services/macro-events'
import { useCalendarAISummary } from '@/hooks/useCalendarAISummary'
import { WarRoomCard } from './calendar/WarRoomCard'
import { CalendarEventList } from './calendar/CalendarEventList'

interface CalendarPageClientProps {
    enrichedEvents: EnrichedMacroEvent[]
}

export default function CalendarPageClient({ enrichedEvents }: CalendarPageClientProps) {
    const [alignMode, setAlignMode] = useState<'time' | 'reaction'>('time')
    const [activeReplayEvent, setActiveReplayEvent] = useState<(MacroEventOccurrence & { linkedReviewSlug?: string }) | null>(null)
    const { aiSummary, isLoading: aiLoading } = useCalendarAISummary(enrichedEvents)

    // Find imminent event for War Room
    const imminentEvent = enrichedEvents.find(e => e.daysUntil <= 3 && e.daysUntil >= 0);

    return (
        <div className={cn(SPACING.pageX, SPACING.pageTop, "pb-20 space-y-6 font-sans")}>

            {/* AI Summary Card */}
            <AISummaryCard
                summary={aiSummary.summary || '正在分析近期宏觀事件結構...'}
                source="事件結構分析"
                loading={aiLoading}
                recommendations={aiSummary.recommendations}
            />

            {/* War Room Card */}
            {imminentEvent && <WarRoomCard imminentEvent={imminentEvent} />}

            {/* Unified Calendar Container */}
            <UniversalCard className="w-full p-0 overflow-hidden">
                {/* Header */}
                <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                    <SectionHeaderCard
                        title="經濟日曆"
                        icon={Calendar}
                        rightElement={
                            <div className="flex rounded-lg p-0.5 border border-[#1A1A1A] bg-[#0A0A0A]">
                                <button
                                    onClick={() => setAlignMode('time')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] rounded transition-colors",
                                        alignMode === 'time'
                                            ? "text-white bg-[#1A1A1A]"
                                            : "text-[#666] hover:text-[#999]"
                                    )}
                                >
                                    依日期
                                </button>
                                <button
                                    onClick={() => setAlignMode('reaction')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] rounded transition-colors",
                                        alignMode === 'reaction'
                                            ? "text-white bg-[#1A1A1A]"
                                            : "text-[#666] hover:text-[#999]"
                                    )}
                                >
                                    依波動
                                </button>
                            </div>
                        }
                    />
                </div>

                {/* Event List */}
                <CalendarEventList
                    events={enrichedEvents}
                    alignMode={alignMode}
                    onReplay={(occ) => {
                        // Prevent link navigation if clicking chart inside link
                        // Actually event propagation is handled in the child, 
                        // but here we just set state.
                        setActiveReplayEvent(occ)
                    }}
                />
            </UniversalCard>

            {/* Replay Modal */}
            {activeReplayEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-5xl bg-[#0F0F10] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden relative">
                        <button
                            onClick={() => setActiveReplayEvent(null)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <JudgmentReplay
                            symbol="BTC"
                            eventStart={activeReplayEvent.linkedReviewSlug ? '2022-11-06' : activeReplayEvent.occursAt.split('T')[0]} // Hardcoded date in original code?
                            eventEnd={activeReplayEvent.occursAt.split('T')[0]}
                            reviewSlug={activeReplayEvent.linkedReviewSlug || 'demo'}
                            daysBuffer={90}
                        />
                    </div>
                </div>
            )}
        </div >
    )
}
