'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { SPACING } from '@/lib/design-tokens';
import { Building2, Calendar, Users, MapPin, ExternalLink } from 'lucide-react';

interface Event {
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
    organizer_url?: string;
}

interface OrganizerStats {
    totalEvents: number;
    upcomingEvents: number;
    cities: string[];
}

export default function OrganizerPage() {
    const params = useParams();
    const organizerName = decodeURIComponent(params?.name as string || '');

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<OrganizerStats>({ totalEvents: 0, upcomingEvents: 0, cities: [] });
    const [organizerInfo, setOrganizerInfo] = useState<{ logo?: string; url?: string } | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!organizerName) return;

            setLoading(true);
            try {
                const res = await fetch(`/api/events?organizer=${encodeURIComponent(organizerName)}&limit=100`);
                if (res.ok) {
                    const data = await res.json();
                    const allEvents = data.events || [];
                    setEvents(allEvents);

                    // Calculate stats
                    const now = new Date();
                    const upcoming = allEvents.filter((e: Event) => new Date(e.start_date) > now);
                    const citiesSet = new Set(allEvents.map((e: Event) => e.city).filter(Boolean));

                    setStats({
                        totalEvents: allEvents.length,
                        upcomingEvents: upcoming.length,
                        cities: Array.from(citiesSet) as string[]
                    });

                    // Get organizer info from first event
                    if (allEvents.length > 0) {
                        setOrganizerInfo({
                            logo: allEvents[0].organizer_logo_url,
                            url: allEvents[0].organizer_url
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to fetch organizer events:', e);
            } finally {
                setLoading(false);
            }
        };

        void fetchEvents();
    }, [organizerName]);

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title={organizerName}
                showLogo={false}
                backHref="/events"
                backLabel="活動"
            />

            <MobileOptimizedLayout className={SPACING.classes.mtHeader}>
                {/* Organizer Info Card */}
                <UniversalCard variant="default" className="mb-6">
                    <div className="p-5">
                        <div className="flex items-start gap-4">
                            {/* Logo */}
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[#2A2A2A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {organizerInfo?.logo ? (
                                    <img
                                        src={organizerInfo.logo}
                                        alt={organizerName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-8 h-8 text-[#666]" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl font-bold text-white truncate">{organizerName}</h1>

                                {organizerInfo?.url && (
                                    <a
                                        href={organizerInfo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        官方網站
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        {!loading && (
                            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#1A1A1A]">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white">{stats.totalEvents}</p>
                                    <p className="text-[10px] text-[#666]">總活動數</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-green-400">{stats.upcomingEvents}</p>
                                    <p className="text-[10px] text-[#666]">即將舉辦</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-blue-400">{stats.cities.length}</p>
                                    <p className="text-[10px] text-[#666]">活動城市</p>
                                </div>
                            </div>
                        )}
                    </div>
                </UniversalCard>

                {/* Events List */}
                <UniversalCard variant="default" className="p-0 overflow-hidden">
                    <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                        <SectionHeaderCard
                            title="舉辦過的活動"
                            icon={Calendar}
                            rightElement={
                                <span className="text-[10px] text-[#666]">
                                    {!loading && `${events.length} 場`}
                                </span>
                            }
                        />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {[1, 2, 3, 4].map(i => (
                                <EventCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-[#333] mx-auto mb-3" />
                            <p className="text-[#666] text-sm">沒有找到相關活動</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {events.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </UniversalCard>
            </MobileOptimizedLayout>
        </main>
    );
}
