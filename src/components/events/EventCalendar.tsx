'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
    id: string;
    title: string;
    slug: string;
    start_date: string;
    event_type: string;
    is_free: boolean;
}

interface EventCalendarProps {
    events: CalendarEvent[];
    initialMonth?: Date;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
    conference: 'bg-purple-500',
    meetup: 'bg-blue-500',
    workshop: 'bg-green-500',
    hackathon: 'bg-orange-500',
    online: 'bg-cyan-500'
};

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

export function EventCalendar({ events, initialMonth }: EventCalendarProps) {
    const [currentDate, setCurrentDate] = useState(initialMonth || new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Group events by date
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        events.forEach(event => {
            const date = new Date(event.start_date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (!map[key]) map[key] = [];
            map[key].push(event);
        });
        return map;
    }, [events]);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Generate calendar days
    const calendarDays = [];

    // Empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push({ day: null, key: `empty-${i}` });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarDays.push({
            day,
            key: dateKey,
            events: eventsByDate[dateKey] || [],
            isToday: dateKey === todayKey,
            isPast: new Date(dateKey) < new Date(todayKey)
        });
    }

    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    };

    const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevMonth}
                        className="p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h2 className="text-lg font-bold text-white min-w-[100px] text-center">
                        {year}年 {MONTHS[month]}
                    </h2>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
                <button
                    onClick={goToToday}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                    今天
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((day, i) => (
                    <div
                        key={day}
                        className={cn(
                            "text-center text-xs font-medium py-2",
                            i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[#666]"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ day, key, events: dayEvents, isToday, isPast }) => (
                    <div
                        key={key}
                        onClick={() => day && dayEvents && dayEvents.length > 0 && setSelectedDate(key)}
                        className={cn(
                            "aspect-square p-1 rounded-lg transition-all relative",
                            day ? "hover:bg-[#1A1A1A] cursor-pointer" : "",
                            isToday ? "bg-blue-500/10 ring-1 ring-blue-500/30" : "",
                            selectedDate === key ? "bg-[#2A2A2A] ring-1 ring-white/20" : "",
                            isPast && !isToday ? "opacity-50" : ""
                        )}
                    >
                        {day && (
                            <>
                                <span className={cn(
                                    "text-xs font-medium",
                                    isToday ? "text-blue-400" : "text-white"
                                )}>
                                    {day}
                                </span>

                                {/* Event Dots */}
                                {dayEvents && dayEvents.length > 0 && (
                                    <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center flex-wrap">
                                        {dayEvents.slice(0, 3).map((event, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    EVENT_TYPE_COLORS[event.event_type] || 'bg-gray-500'
                                                )}
                                            />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[8px] text-[#666]">+{dayEvents.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Selected Date Events */}
            {selectedDate && selectedEvents.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    <h3 className="text-sm font-medium text-white mb-3">
                        {new Date(selectedDate).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}
                    </h3>
                    <div className="space-y-2">
                        {selectedEvents.map(event => (
                            <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                            >
                                <div className={cn(
                                    "w-2 h-8 rounded-full flex-shrink-0",
                                    EVENT_TYPE_COLORS[event.event_type] || 'bg-gray-500'
                                )} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{event.title}</p>
                                    <p className="text-xs text-[#666]">
                                        {new Date(event.start_date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                        {event.is_free && <span className="ml-2 text-green-400">免費</span>}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[10px] text-[#666]">
                {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1">
                        <div className={cn("w-2 h-2 rounded-full", color)} />
                        <span className="capitalize">{type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
