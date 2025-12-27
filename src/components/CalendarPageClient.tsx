'use client'

import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPACING } from '@/lib/design-tokens'
import { AIQuickRead } from '@/components/ui/AIQuickRead'
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
    const { aiSummary, isLoading: aiLoading } = useCalendarAISummary(enrichedEvents)

    // Find imminent event for War Room
    const imminentEvent = enrichedEvents.find(e => e.daysUntil <= 3 && e.daysUntil >= 0);

    return (
        <div className={cn(SPACING.pageX, SPACING.pageTop, "pb-20 space-y-6 font-sans")}>

            {/* AI Summary Card */}
            <AIQuickRead
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
                />
            </UniversalCard>
        </div >
    )
}
