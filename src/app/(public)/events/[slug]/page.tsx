'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { EventCard } from '@/components/events/EventCard';
import { CalendarButtons } from '@/components/events/CalendarButtons';
import { MapEmbed } from '@/components/events/MapEmbed';
import { EventTimeline, TimelineItem } from '@/components/events/EventTimeline';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { SPACING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import {
    Calendar, MapPin, Clock, Users, ExternalLink, Ticket,
    Globe, Building, ChevronRight, ArrowLeft, Share2, Bookmark
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Event {
    id: string;
    title: string;
    slug: string;
    description?: string;
    cover_image_url?: string;
    event_type: string;
    start_date: string;
    end_date?: string;
    timezone: string;
    location_type: string;
    venue_name?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    online_url?: string;
    registration_url?: string;
    registration_deadline?: string;
    is_free: boolean;
    price_info?: string;
    organizer_name: string;
    organizer_logo_url?: string;
    organizer_url?: string;
    co_organizers?: { name: string; logo_url?: string; url?: string }[];
    parent_event_id?: string;
    tags?: string[];
    schedule?: TimelineItem[];
    view_count: number;
}

interface SideEvent {
    id: string;
    title: string;
    slug: string;
    start_date: string;
    end_date?: string;
    venue_name?: string;
    city?: string;
    event_type: string;
    is_free: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
    conference: 'Conference',
    meetup: 'Meetup',
    workshop: 'Workshop',
    hackathon: 'Hackathon',
    online: 'Online'
};

function formatFullDate(dateStr: string, timezone: string = 'Asia/Taipei'): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        timeZone: timezone
    });
}

function formatTime(dateStr: string, timezone: string = 'Asia/Taipei'): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone
    });
}

export default function EventDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [sideEvents, setSideEvents] = useState<SideEvent[]>([]);
    const [parentEvent, setParentEvent] = useState<{ id: string; title: string; slug: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/events/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data.event);
                    setSideEvents(data.sideEvents || []);
                    setParentEvent(data.parentEvent);
                }
            } catch (e) {
                console.error('Failed to fetch event:', e);
            } finally {
                setLoading(false);
            }
        };
        void fetchEvent();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white pb-24 font-sans">
                <PageHeader title="載入中..." showLogo={false} backHref="/events" backLabel="活動" />
                <div className="animate-pulse p-4 space-y-4">
                    <div className="h-48 bg-[#1A1A1A] rounded-xl" />
                    <div className="h-8 w-2/3 bg-[#1A1A1A] rounded" />
                    <div className="h-4 w-1/2 bg-[#1A1A1A] rounded" />
                </div>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="min-h-screen bg-black text-white pb-24 font-sans">
                <PageHeader title="找不到活動" showLogo={false} backHref="/events" backLabel="活動" />
                <div className="p-8 text-center">
                    <p className="text-[#666]">此活動不存在或已被移除</p>
                    <Link href="/events">
                        <Button className="mt-4">返回活動列表</Button>
                    </Link>
                </div>
            </main>
        );
    }

    const location = event.location_type === 'online'
        ? '線上活動'
        : [event.venue_name, event.city].filter(Boolean).join('・');

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title={event.title}
                showLogo={false}
                backHref="/events"
                backLabel="活動"
            />

            {/* Hero Image */}
            {event.cover_image_url && (
                <div className="relative h-56 md:h-72 w-full">
                    <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>
            )}

            <MobileOptimizedLayout className={event.cover_image_url ? '-mt-20 relative z-10' : SPACING.classes.mtHeader}>
                {/* Parent Event Link */}
                {parentEvent && (
                    <Link href={`/events/${parentEvent.slug}`} className="block mb-4">
                        <div className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>返回主活動：{parentEvent.title}</span>
                        </div>
                    </Link>
                )}

                {/* Main Info Card */}
                <UniversalCard variant="default" className="mb-6">
                    <div className="p-5 space-y-4">
                        {/* Type Badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                            </span>
                            {event.is_free ? (
                                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                    免費
                                </span>
                            ) : event.price_info && (
                                <span className="text-xs text-[#888]">{event.price_info}</span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-white">{event.title}</h1>

                        {/* Date & Time */}
                        <div className="flex items-start gap-3 text-sm">
                            <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium">{formatFullDate(event.start_date, event.timezone)}</p>
                                <p className="text-[#888]">
                                    {formatTime(event.start_date, event.timezone)}
                                    {event.end_date && ` - ${formatTime(event.end_date, event.timezone)}`}
                                    <span className="ml-2 text-[#555]">({event.timezone})</span>
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-3 text-sm">
                            {event.location_type === 'online' ? (
                                <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <MapPin className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className="text-white font-medium">{location}</p>
                                {event.address && (
                                    <p className="text-[#888]">{event.address}</p>
                                )}
                            </div>
                        </div>

                        {/* Organizer */}
                        <div className="flex items-start gap-3 text-sm">
                            <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium">主辦：{event.organizer_name}</p>
                                {event.co_organizers && event.co_organizers.length > 0 && (
                                    <p className="text-[#888]">
                                        協辦：{event.co_organizers.map(o => o.name).join('、')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Registration Button */}
                        {event.registration_url && (
                            <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className="block">
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white gap-2">
                                    <Ticket className="w-4 h-4" />
                                    立即報名
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </a>
                        )}

                        {/* Calendar Buttons */}
                        <CalendarButtons event={event} />
                    </div>
                </UniversalCard>

                {/* Map */}
                {event.location_type !== 'online' && (
                    <div className="mb-6">
                        <MapEmbed
                            latitude={event.latitude}
                            longitude={event.longitude}
                            venue_name={event.venue_name}
                            address={event.address}
                            city={event.city}
                        />
                    </div>
                )}

                {/* Description */}
                {event.description && (
                    <UniversalCard variant="default" className="mb-6">
                        <div className="p-5">
                            <h2 className="text-lg font-bold text-white mb-4">活動說明</h2>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{event.description}</ReactMarkdown>
                            </div>
                        </div>
                    </UniversalCard>
                )}

                {/* Schedule Timeline */}
                {event.schedule && event.schedule.length > 0 && (
                    <UniversalCard variant="default" className="mb-6">
                        <div className="p-5">
                            <h2 className="text-lg font-bold text-white mb-4">📋 議程時間軸</h2>
                            <EventTimeline
                                items={event.schedule}
                                date={formatFullDate(event.start_date, event.timezone)}
                            />
                        </div>
                    </UniversalCard>
                )}

                {/* Side Events */}
                {sideEvents.length > 0 && (
                    <UniversalCard variant="default" className="mb-6 p-0 overflow-hidden">
                        <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                            <SectionHeaderCard
                                title="Side Events"
                                rightElement={
                                    <span className="text-[10px] text-[#666]">{sideEvents.length} 場</span>
                                }
                            />
                        </div>
                        <div className="divide-y divide-[#1A1A1A]">
                            {sideEvents.map(se => (
                                <Link
                                    key={se.id}
                                    href={`/events/${se.slug}`}
                                    className="block p-4 hover:bg-[#141414] transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">{se.title}</p>
                                            <p className="text-xs text-[#666] mt-1">
                                                {new Date(se.start_date).toLocaleDateString('zh-TW')}
                                                {se.venue_name && ` • ${se.venue_name}`}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#444]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </UniversalCard>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {event.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded bg-[#1A1A1A] text-[#888] border border-[#2A2A2A]">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </MobileOptimizedLayout>
        </main>
    );
}
