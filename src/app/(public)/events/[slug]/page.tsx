'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Calendar, MapPin, Users, ExternalLink, Ticket,
    Globe, ChevronLeft, Share2, Copy, Twitter, MessageCircle,
    Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { MapEmbed } from '@/components/events/MapEmbed';
import { EventQRCode } from '@/components/events/EventQRCode';
import { EventTimeline, TimelineItem } from '@/components/events/EventTimeline';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CARDS, BUTTONS, TYPOGRAPHY, COLORS, BADGES } from '@/lib/design-tokens';

// --- Interfaces ---
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

// --- Utils ---
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

// --- Main Component ---
export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [sideEvents, setSideEvents] = useState<SideEvent[]>([]);
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
                }
            } catch (e) {
                console.error('Failed to fetch event:', e);
            } finally {
                setLoading(false);
            }
        };
        void fetchEvent();
    }, [slug]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: '連結已複製', description: '您現在可以分享此活動連結' });
    };

    const addToGoogleCalendar = () => {
        if (!event) return;
        const start = new Date(event.start_date).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const end = event.end_date
            ? new Date(event.end_date).toISOString().replace(/-|:|\.\d\d\d/g, '')
            : new Date(new Date(event.start_date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.venue_name || event.online_url || '')}`;
        window.open(url, '_blank');
    };

    const downloadIcal = () => {
        toast({ title: '即將推出', description: 'iCal 下載功能暫未開放' });
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#666666]">載入中...</div>;
    if (!event) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#666666]">找不到活動</div>;

    return (
        <MobileOptimizedLayout className="bg-[#050505] min-h-screen pb-24">

            {/* Top Navigation */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-[#1A1A1A] px-4 h-14 flex items-center justify-between">
                <button onClick={() => router.push('/events')} className="flex items-center gap-1 text-[#A0A0A0] hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">活動</span>
                </button>
                <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{event.title}</h1>
                <div className="w-8" />
            </div>

            <div className="p-4 space-y-4">

                {/* Main Card */}
                <div className={CARDS.primary}>
                    <div className="space-y-6">
                        {/* Tags */}
                        <div className="flex items-center gap-2">
                            <span className={BADGES.neutral}>
                                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                            </span>
                            {event.is_free ? (
                                <span className={BADGES.success}>
                                    免費
                                </span>
                            ) : (
                                <span className={BADGES.neutral}>
                                    {event.price_info || '付費'}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className={TYPOGRAPHY.pageTitle}>
                            {event.title}
                        </h1>

                        {/* Metadata Grid */}
                        <div className="space-y-4">
                            {/* Time */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5 text-[#A0A0A0]" />
                                </div>
                                <div>
                                    <p className={TYPOGRAPHY.cardTitle}>{formatFullDate(event.start_date, event.timezone)}</p>
                                    <p className={TYPOGRAPHY.cardSubtitle}>
                                        {formatTime(event.start_date, event.timezone)} - {formatTime(event.end_date || event.start_date, event.timezone)} ({event.timezone})
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                                    {event.location_type === 'online' ? <Globe className="w-5 h-5 text-[#A0A0A0]" /> : <MapPin className="w-5 h-5 text-[#A0A0A0]" />}
                                </div>
                                <div>
                                    <p className={TYPOGRAPHY.cardTitle}>{event.venue_name || (event.location_type === 'online' ? '線上直播' : '待定地點')}</p>
                                    {event.address && <p className={TYPOGRAPHY.cardSubtitle}>{event.address}</p>}
                                </div>
                            </div>

                            {/* Organizer */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-[#A0A0A0]" />
                                </div>
                                <div>
                                    <p className={TYPOGRAPHY.cardTitle}>主辦：{event.organizer_name}</p>
                                    {event.co_organizers && event.co_organizers.length > 0 && (
                                        <p className={TYPOGRAPHY.cardSubtitle}>協辦：{event.co_organizers.map(c => c.name).join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Primary Action */}
                        {event.registration_url ? (
                            <Button
                                className="w-full h-12 rounded-lg bg-white text-black font-medium hover:bg-[#E0E0E0] transition-colors"
                                onClick={() => window.open(event.registration_url, '_blank')}
                            >
                                <Ticket className="w-5 h-5 mr-2" />
                                立即報名
                                <ExternalLink className="w-4 h-4 ml-1 opacity-50" />
                            </Button>
                        ) : (
                            <div className="w-full h-12 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center text-[#666666] text-sm font-medium cursor-not-allowed">
                                暫無報名連結
                            </div>
                        )}

                        {/* Secondary Actions (Calendar) */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-10 rounded-lg bg-[#0A0A0A] border-[#1A1A1A] text-[#A0A0A0] hover:text-white hover:bg-[#141414]"
                                onClick={addToGoogleCalendar}
                            >
                                <Calendar className="w-3.5 h-3.5 mr-2" />
                                Google Calendar
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 rounded-lg bg-[#0A0A0A] border-[#1A1A1A] text-[#A0A0A0] hover:text-white hover:bg-[#141414]"
                                onClick={downloadIcal}
                            >
                                <Download className="w-3.5 h-3.5 mr-2" />
                                iCal
                            </Button>
                        </div>

                        {/* Share Row */}
                        <div className="pt-2">
                            <p className={TYPOGRAPHY.caption + " mb-3"}>分享活動</p>
                            <div className="flex items-center gap-3">
                                <button className={BUTTONS.icon + " group"} onClick={() => { }}>
                                    <MessageCircle className="w-5 h-5 text-[#A0A0A0] group-hover:text-white transition-colors" />
                                </button>
                                <button className={BUTTONS.icon + " group"} onClick={() => { }}>
                                    <Twitter className="w-4 h-4 text-[#A0A0A0] group-hover:text-white transition-colors" />
                                </button>
                                <button onClick={handleCopyLink} className={BUTTONS.icon + " group"}>
                                    <Copy className="w-4 h-4 text-[#A0A0A0] group-hover:text-white transition-colors" />
                                </button>
                                <button className={BUTTONS.icon + " group"} onClick={() => { }}>
                                    <Share2 className="w-4 h-4 text-[#A0A0A0] group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Map Card */}
                {event.location_type !== 'online' && (
                    <div className={CARDS.primary}>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6 text-[#A0A0A0]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={TYPOGRAPHY.cardTitle}>活動地點</h3>
                                <p className={TYPOGRAPHY.bodyDefault + " mt-0.5 line-clamp-2"}>
                                    {event.venue_name} {event.address}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Description Card */}
                <div className={CARDS.primary}>
                    <h2 className={TYPOGRAPHY.sectionTitle + " mb-4"}>活動說明</h2>
                    <div className="prose prose-invert prose-sm max-w-none text-[#A0A0A0] leading-relaxed">
                        <ReactMarkdown>{event.description || '暫無詳細說明'}</ReactMarkdown>
                    </div>
                </div>

                {/* Schedule (if any) */}
                {event.schedule && event.schedule.length > 0 && (
                    <div className={CARDS.primary}>
                        <h2 className={TYPOGRAPHY.sectionTitle + " mb-4"}>活動議程</h2>
                        <EventTimeline items={event.schedule} date={formatFullDate(event.start_date, event.timezone)} />
                    </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {event.tags.map(tag => (
                            <span key={tag} className={BADGES.neutral}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* QR Code */}
                <div className={CARDS.passive + " flex flex-col items-center text-center"}>
                    <p className={TYPOGRAPHY.caption + " mb-4"}>掃描 QR Code 分享活動</p>
                    <div className="bg-white p-2 rounded-xl">
                        <EventQRCode url={`https://cryptotw.pro/events/${event.slug}`} title={event.title} size={150} />
                    </div>
                    <Button variant="ghost" className="mt-6 text-xs h-8 text-[#666666] hover:bg-transparent hover:text-[#A0A0A0]">
                        <Download className="w-3 h-3 mr-1.5" />
                        下載 QR Code
                    </Button>
                </div>

            </div>
        </MobileOptimizedLayout>
    );
}
