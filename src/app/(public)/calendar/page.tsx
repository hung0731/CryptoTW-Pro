'use client'

import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { translateEventName } from '@/lib/calendar-translation'

interface EconomicEvent {
    calendar_name: string
    country_code: string
    country_name: string
    data_effect: string
    forecast_value: string
    revised_previous_value: string
    previous_value: string
    publish_timestamp: number
    published_value: string
    importance_level: number
    has_exact_publish_time: number
}

// Group events by YYYY-MM-DD
type GroupedEvents = Record<string, EconomicEvent[]>

export default function CalendarPage() {
    const [events, setEvents] = useState<EconomicEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

    useEffect(() => {
        fetchCalendar()
    }, [])

    const fetchCalendar = async () => {
        try {
            const res = await fetch('/api/calendar')
            const json = await res.json()
            if (json.data) {
                // Filter and Process Data
                const filtered = json.data.filter((e: EconomicEvent) => {
                    // Filter for US and Taiwan (check country_code or country_name)
                    // Coinglass might use 'US', 'TW', 'CN' etc. as codes.
                    // We also need to rename 'Taiwan, China' if it appears.
                    // Let's log unique countries first to be sure, but for now strict filter.
                    const name = e.country_name.toLowerCase()
                    const code = e.country_code.toLowerCase()
                    return (
                        code === 'us' ||
                        code === 'tw' ||
                        name.includes('united states') ||
                        name.includes('taiwan') ||
                        name.includes('china') // check if it's actually Taiwan labelled as China? Unlikely for economic data, usually distinct. 
                        // User said "Taiwan they write taiwan, china". So we keep it and rename.
                    )
                }).map((e: EconomicEvent) => {
                    // Rename Logic
                    let displayCountry = e.country_name
                    if (displayCountry.toLowerCase().includes('taiwan')) {
                        displayCountry = '台灣'
                    } else if (displayCountry.toLowerCase().includes('united states') || e.country_code === 'US') {
                        displayCountry = '美國'
                    } else if (displayCountry.toLowerCase().includes('china')) {
                        // Only keep if it refers to Taiwan? 
                        // Or maybe user wants actual China data too? 
                        // "只留台灣和美國" -> Only Taiwan and USA. 
                        // So if it's Mainland China data, we should probably EXCLUDE it based on user request "Only leave Taiwan and USA".
                        // BUT, if "Taiwan, China" is the name for Taiwan data, we keep it.
                        if (displayCountry.includes('Taiwan')) {
                            displayCountry = '台灣'
                        } else {
                            return null // Exclude Mainland China
                        }
                    } else {
                        return null // Exclude others
                    }
                    return { ...e, country_name: displayCountry }
                }).filter(Boolean) as EconomicEvent[]

                // Sort by time
                // Sort by time
                filtered.sort((a, b) => a.publish_timestamp - b.publish_timestamp)

                if (filtered.length === 0 && json.data.length > 0) {
                    console.log("No US/Taiwan events found, showing all events for debug.")
                    // Fallback: Show all events if filter results in empty
                    const allEvents = json.data
                        .slice(0, 50)
                        .map((e: EconomicEvent) => ({ ...e, country_name: e.country_name || e.country_code }))
                        .sort((a: EconomicEvent, b: EconomicEvent) => a.publish_timestamp - b.publish_timestamp)
                    setEvents(allEvents)
                } else {
                    setEvents(filtered)
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Derive Months
    const months = Array.from(new Set(events.map(e => {
        const d = new Date(e.publish_timestamp)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }))).sort()

    // Filter by Month
    const filteredEvents = selectedMonth
        ? events.filter(e => {
            const d = new Date(e.publish_timestamp)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            return key === selectedMonth
        })
        : events

    // Grouping Logic (using filteredEvents)
    const groupedEvents: GroupedEvents = {}
    filteredEvents.forEach(e => {
        const d = new Date(e.publish_timestamp)
        // Key concept: YYYY-MM-DD
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        if (!groupedEvents[key]) groupedEvents[key] = []
        groupedEvents[key].push(e)
    })

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <PageHeader title="財經日曆" backHref="/" backLabel="返回" />

            {/* Month Selector */}
            {!loading && months.length > 0 && (
                <div className="sticky top-[56px] z-40 bg-black/95 backdrop-blur border-b border-white/5 py-3 px-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedMonth(null)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                selectedMonth === null
                                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                    : "bg-neutral-900 border border-white/10 text-neutral-500 hover:text-white"
                            )}
                        >
                            全部
                        </button>
                        {months.map(m => {
                            const [y, mon] = m.split('-')
                            return (
                                <button
                                    key={m}
                                    onClick={() => setSelectedMonth(m === selectedMonth ? null : m)} // Toggle
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                        selectedMonth === m
                                            ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                            : "bg-neutral-900 border border-white/10 text-neutral-500 hover:text-white"
                                    )}
                                >
                                    {mon}月
                                    <span className="ml-1 text-[10px] font-normal opacity-60">{y}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <main className="p-0">
                {/* Header / Week View could go here */}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-0">
                        {Object.entries(groupedEvents).map(([dateKey, items], groupIdx) => (
                            <div key={dateKey} className="border-b border-white/5">
                                {/* Date Header (Sticky below Month Selector) */}
                                <div className="sticky top-[105px] z-30 bg-neutral-950/95 backdrop-blur border-y border-white/5 py-3 px-4 flex items-baseline gap-3">
                                    <span className="font-bold text-2xl text-white font-mono tracking-tight">
                                        {new Date(dateKey).getDate()}
                                    </span>
                                    <span className="text-sm font-medium text-neutral-500 uppercase">
                                        {new Date(dateKey).toLocaleDateString('zh-TW', { weekday: 'long', month: 'long' })}
                                    </span>
                                </div>

                                {/* Events List */}
                                <div className="divide-y divide-white/5">
                                    {items.map((item, idx) => {
                                        const timeStr = new Date(item.publish_timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
                                        return (
                                            <div key={idx} className="grid grid-cols-[50px_1fr_90px] gap-2 p-4 items-center hover:bg-white/5 transition-colors">
                                                {/* Time & Country */}
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-sm font-medium text-neutral-400">{timeStr}</span>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] h-4 px-1 rounded-sm border-0 font-bold",
                                                        item.country_name === '美國' ? "bg-blue-950 text-blue-400" : "bg-green-950 text-green-400"
                                                    )}>
                                                        {item.country_name}
                                                    </Badge>
                                                </div>

                                                {/* Name & Impact */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-neutral-200 truncate">{translateEventName(item.calendar_name)}</span>
                                                        {item.importance_level >= 3 && (
                                                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                                        <span>前值: <span className="text-neutral-300">{item.previous_value || '--'}</span></span>
                                                        <span>預期: <span className="text-neutral-300">{item.forecast_value || '--'}</span></span>
                                                    </div>
                                                </div>

                                                {/* Actual Value */}
                                                <div className="text-right">
                                                    {item.published_value ? (
                                                        <span className={cn(
                                                            "font-mono font-bold text-sm",
                                                            // Simple logic: if actual > forecast usually green? 
                                                            // Without detailed 'impact type' (bullish/bearish), we might just use yellow/white.
                                                            // Coinglass sometimes gives 'data_effect'.
                                                            "text-amber-400"
                                                        )}>
                                                            {item.published_value}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-neutral-600">未公佈</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {events.length === 0 && (
                            <div className="py-20 text-center text-neutral-500 text-sm">
                                近期無相關經濟數據
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
