'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ExternalLink, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
    event: {
        id: string;
        title: string;
        slug: string;
        cover_image_url?: string;
        event_type: string;
        start_date: string;
        end_date?: string;
        venue_name?: string;
        city?: string;
        location_type: string;
        is_free: boolean;
        price_info?: string;
        organizer_name: string;
        organizer_logo_url?: string;
        is_featured?: boolean;
    };
    variant?: 'default' | 'compact';
}

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    conference: { label: 'Conference', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    meetup: { label: 'Meetup', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    workshop: { label: 'Workshop', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    hackathon: { label: 'Hackathon', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    online: { label: 'Online', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
};

function formatEventDate(startDate: string, endDate?: string): string {
    const start = new Date(startDate);
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const dateStr = start.toLocaleDateString('zh-TW', options);
    const timeStr = start.toLocaleTimeString('zh-TW', timeOptions);

    if (endDate) {
        const end = new Date(endDate);
        const endTimeStr = end.toLocaleTimeString('zh-TW', timeOptions);
        return `${dateStr} ${timeStr} - ${endTimeStr}`;
    }

    return `${dateStr} ${timeStr}`;
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
    const typeInfo = EVENT_TYPE_LABELS[event.event_type] || EVENT_TYPE_LABELS.meetup;
    const location = event.location_type === 'online'
        ? '線上活動'
        : [event.city, event.venue_name].filter(Boolean).join('・');

    if (variant === 'compact') {
        return (
            <Link
                href={`/events/${event.slug}`}
                className="block group p-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors"
            >
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", typeInfo.color)}>
                                {typeInfo.label}
                            </span>
                            {event.is_free && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                    免費
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                            {event.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#666]">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatEventDate(event.start_date)}
                            </span>
                            {location && (
                                <span className="flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3" />
                                    {location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/events/${event.slug}`}
            className="block group rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden hover:border-[#2A2A2A] transition-all"
        >
            {/* Cover Image */}
            {event.cover_image_url ? (
                <div className="relative h-40 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] overflow-hidden">
                    <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {event.is_featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-1 rounded">
                            ⭐ Featured
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative h-32 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-[#333]" />
                    {event.is_featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-1 rounded">
                            ⭐ Featured
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                {/* Date & Type */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatEventDate(event.start_date, event.end_date)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                    {event.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-[#666] mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{location || '待定'}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded border", typeInfo.color)}>
                            {typeInfo.label}
                        </span>
                        {event.is_free ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                免費
                            </span>
                        ) : event.price_info && (
                            <span className="text-[10px] text-[#888]">
                                {event.price_info}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#666]">
                        <Users className="w-3 h-3" />
                        {event.organizer_name}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function EventCardSkeleton() {
    return (
        <div className="rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden animate-pulse">
            <div className="h-32 bg-[#1A1A1A]" />
            <div className="p-4 space-y-3">
                <div className="h-4 w-32 bg-[#1A1A1A] rounded" />
                <div className="h-5 w-full bg-[#1A1A1A] rounded" />
                <div className="h-4 w-24 bg-[#1A1A1A] rounded" />
                <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
                    <div className="h-5 w-16 bg-[#1A1A1A] rounded" />
                    <div className="h-4 w-20 bg-[#1A1A1A] rounded" />
                </div>
            </div>
        </div>
    );
}
