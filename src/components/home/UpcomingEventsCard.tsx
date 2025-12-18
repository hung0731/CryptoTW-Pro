'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    MACRO_EVENT_DEFS,
    getNextOccurrence,
    getDaysUntil,
    getPastOccurrences,
    calculateEventStats,
    MacroEventDef,
    MacroEventOccurrence,
    MacroReaction
} from '@/lib/macro-events'

interface UpcomingEventsCardProps {
    reactions: Record<string, MacroReaction>
}

// Generate dynamic CTA for each event
function getEventCTA(eventKey: string): string {
    const ctaMap: Record<string, string> = {
        cpi: '→ 每次 CPI 公布市場都!?',
        nfp: '→ 非農數據真的重要嗎？',
        fomc: '→ 升息降息怎麼看？',
        ppi: '→ PPI 與 CPI 有何不同？',
        jobless: '→ 失業金申請代表什麼？',
        consumer_confidence: '→ 信心指數怎麼解讀？',
    }
    return ctaMap[eventKey] || '→ 為什麼重要？'
}

// Mini calendar icon (iOS-style)
function CalendarIcon({ month, day }: { month: string, day: string }) {
    return (
        <div className="flex flex-col items-center rounded-lg overflow-hidden w-[44px] shrink-0 bg-[#1A1A1A] border border-[#2A2A2A]">
            <div className="w-full text-center py-0.5 text-[8px] font-bold bg-neutral-700 text-neutral-300">
                {month}
            </div>
            <div className="py-1 text-center">
                <span className="text-base font-bold text-white leading-none">{day}</span>
            </div>
        </div>
    )
}

// 倒數計時器
function Countdown({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, mins: 0, secs: 0 })

    React.useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime()
            const target = new Date(targetDate).getTime()
            const diff = target - now

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 })
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const secs = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeLeft({ days, hours, mins, secs })
        }

        calculate()
        const interval = setInterval(calculate, 1000) // 每秒更新

        return () => clearInterval(interval)
    }, [targetDate])

    return (
        <div className="inline-flex items-center gap-0.5 text-[9px] font-mono text-neutral-500 mt-0.5">
            <span className="text-white font-bold">{timeLeft.days}</span>日
            <span className="text-white font-bold ml-1">{timeLeft.hours}</span>時
            <span className="text-white font-bold ml-1">{timeLeft.mins}</span>分
            <span className="text-white font-bold ml-1">{String(timeLeft.secs).padStart(2, '0')}</span>秒
        </div>
    )
}

// Mini past event chip
function PastEventChip({ occ, reaction }: { occ: MacroEventOccurrence, reaction?: MacroReaction }) {
    if (!occ.forecast || !occ.actual) return null

    const isBeat = occ.actual > occ.forecast
    const isMiss = occ.actual < occ.forecast
    const isMeet = !isBeat && !isMiss

    // Get BTC reaction from reactions data
    const btcChange = reaction?.stats?.d0d1Return

    const date = new Date(occ.occursAt)
    const monthDay = `${date.getMonth() + 1}/${date.getDate()}`

    return (
        <div className="flex items-center gap-1.5 text-[9px]">
            <span className="text-neutral-600">{monthDay}</span>
            <span className={cn(
                "font-bold",
                isBeat ? "text-red-400" : isMiss ? "text-emerald-400" : "text-neutral-400"
            )}>
                {isBeat ? '超預期' : isMiss ? '低預期' : '符合'}
            </span>
            {btcChange !== undefined && btcChange !== null && (
                <span className={cn(
                    "font-mono",
                    btcChange >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                    {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(1)}%
                </span>
            )}
        </div>
    )
}

export function UpcomingEventsCard({ reactions }: UpcomingEventsCardProps) {
    const upcomingEvents = MACRO_EVENT_DEFS.map(def => {
        const occ = getNextOccurrence(def.key)
        if (!occ) return null
        const days = getDaysUntil(occ.occursAt)
        const pastOccs = getPastOccurrences(def.key, 2)
        return { def, occ, days, pastOccs }
    })
        .filter((item): item is { def: MacroEventDef; occ: MacroEventOccurrence; days: number; pastOccs: MacroEventOccurrence[] } => item !== null)
        .sort((a, b) => a.days - b.days)
        .slice(0, 5)

    if (upcomingEvents.length === 0) return null

    return (
        <div className="overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            <div className="flex gap-3">
                {upcomingEvents.map(({ def, occ, days, pastOccs }) => {
                    const stats = calculateEventStats(def.key, reactions)
                    const date = new Date(occ.occursAt)
                    const month = `${date.getMonth() + 1}月`
                    const day = date.getDate().toString().padStart(2, '0')
                    const winRate = stats?.d1WinRate ?? 50

                    return (
                        <Link
                            key={def.key}
                            href={`/calendar/${def.key}`}
                            className={cn(
                                "snap-start flex-none w-[280px]",
                                "bg-[#0E0E0F] border border-[#1A1A1A] rounded-xl p-3",
                                "hover:bg-[#141414] hover:border-[#2A2A2A]"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {/* Left: Calendar Icon */}
                                <CalendarIcon month={month} day={day} />

                                {/* Right: Event Info */}
                                <div className="flex-1 min-w-0">
                                    {/* Event Name + T-x */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-bold text-white truncate">{def.name}</h4>
                                        <span className={cn(
                                            "shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded",
                                            days <= 3
                                                ? "bg-white/10 text-white"
                                                : "bg-[#1A1A1A] text-neutral-500"
                                        )}>
                                            {days === 0 ? '今天' : days === 1 ? '明天' : `${days}天`}
                                        </span>
                                    </div>

                                    {/* Countdown Timer + Win Rate */}
                                    <Countdown targetDate={occ.occursAt} />
                                    <div className="text-[10px] text-neutral-400 mt-1">
                                        公布後 2 日｜
                                        <span className={cn(
                                            "font-bold",
                                            winRate >= 55 ? "text-emerald-400" :
                                                winRate <= 45 ? "text-red-400" :
                                                    "text-neutral-300"
                                        )}>
                                            上漲機率 {winRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="text-[10px] text-neutral-500 mt-2">
                                {getEventCTA(def.key)}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
