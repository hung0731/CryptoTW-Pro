'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    getNextOccurrence,
    getDaysUntil,
    MacroEventDef,
    MacroEventOccurrence,
    MacroReaction
} from '@/lib/macro-events'
import { Calendar } from 'lucide-react'

// Countdown Component (Minimal)
function Countdown({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = React.useState('')

    React.useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime()
            const target = new Date(targetDate).getTime()
            const diff = target - now

            if (diff <= 0) {
                setTimeLeft('NOW')
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            // Format to 2 digits
            const d = days.toString().padStart(2, '0')
            const h = hours.toString().padStart(2, '0')
            const m = minutes.toString().padStart(2, '0')
            const s = seconds.toString().padStart(2, '0')

            // Display format: 05d 12h 30m 05s
            if (days > 0) setTimeLeft(`${d}天 ${h}時 ${m}分 ${s}秒`)
            else setTimeLeft(`${h}時 ${m}分 ${s}秒`)
        }

        calculate()
        const interval = setInterval(calculate, 1000) // Update every second
        return () => clearInterval(interval)
    }, [targetDate])

    return <span className="font-mono text-[10px] text-amber-500 font-bold tracking-wider">{timeLeft}</span>
}

interface UpcomingEventsCardProps {
    reactions?: Record<string, MacroReaction>
}

// Timeline Item
function EventTimelineItem({ def, occ, days, isLast }: { def: MacroEventDef, occ: MacroEventOccurrence, days: number, isLast: boolean }) {
    const date = new Date(occ.occursAt)
    const monthDay = `${date.getMonth() + 1}/${date.getDate()}`

    // Style logic
    const isToday = days === 0
    const dotClass = isToday ? 'bg-white animate-pulse' : 'bg-neutral-600'
    const lineClass = isToday ? 'bg-neutral-600' : 'bg-neutral-800'

    return (
        <Link href={`/calendar/${def.key}`} className="group relative flex gap-4 py-3 pl-2">
            {/* Timeline Node */}
            <div className="flex flex-col items-center shrink-0 w-6 relative">
                <div className={cn(
                    "w-2 h-2 rounded-full border border-black z-10 box-content ring-2 ring-black relative top-0.5",
                    dotClass
                )} />
                {!isLast && (
                    <div className={cn(
                        "w-px absolute top-3 left-1/2 -translate-x-1/2 bottom-[-1rem] -z-0 transition-colors",
                        lineClass
                    )} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-500 w-8">{monthDay}</span>
                        <h4 className={cn(
                            "text-sm font-bold truncate transition-colors",
                            isToday ? "text-white" : "text-neutral-300 group-hover:text-white"
                        )}>
                            {def.name}
                        </h4>
                    </div>
                    <Countdown targetDate={occ.occursAt} />
                </div>
            </div>
        </Link>
    )
}

export function UpcomingEventsCard({ reactions }: UpcomingEventsCardProps) {
    const upcomingEvents = MACRO_EVENT_DEFS.map(def => {
        const occ = getNextOccurrence(def.key)
        if (!occ) return null
        const days = getDaysUntil(occ.occursAt)
        return { def, occ, days }
    })
        .filter((item): item is { def: MacroEventDef; occ: MacroEventOccurrence; days: number } => item !== null)
        .sort((a, b) => a.days - b.days)
        .slice(0, 4)

    if (upcomingEvents.length === 0) return null

    return (
        <section className="mt-8">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Calendar className="w-3 h-3 text-neutral-600" />
                <span className="text-[10px] font-mono text-[#666666] tracking-widest">重要時程</span>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-2 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                />

                <div className="relative z-10 flex flex-col">
                    {upcomingEvents.map((event, i) => (
                        <EventTimelineItem
                            key={event.def.key}
                            {...event}
                            isLast={i === upcomingEvents.length - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
