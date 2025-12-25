'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard';
import { EventCalendar } from '@/components/events/EventCalendar';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { SPACING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { Calendar, LayoutGrid, Sparkles, List, Search, X } from 'lucide-react';

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
    is_featured?: boolean;
}

const EVENT_TYPES = [
    { key: 'all', label: '全部' },
    { key: 'conference', label: 'Conference' },
    { key: 'meetup', label: 'Meetup' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'hackathon', label: 'Hackathon' },
    { key: 'online', label: '線上' }
];

const CITIES = [
    { key: 'all', label: '全部地點' },
    { key: '台北', label: '台北' },
    { key: '新竹', label: '新竹' },
    { key: '台中', label: '台中' },
    { key: '高雄', label: '高雄' },
    { key: 'online', label: '線上' }
];

type ViewMode = 'list' | 'calendar';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [allEvents, setAllEvents] = useState<Event[]>([]); // For calendar
    const [featured, setFeatured] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [showPast, setShowPast] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter events based on search query
    const filteredEvents = useMemo(() => {
        if (!searchQuery.trim()) return events;
        const query = searchQuery.toLowerCase();
        return events.filter(event =>
            event.title.toLowerCase().includes(query) ||
            event.organizer_name.toLowerCase().includes(query) ||
            (event.venue_name && event.venue_name.toLowerCase().includes(query)) ||
            (event.city && event.city.toLowerCase().includes(query))
        );
    }, [events, searchQuery]);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (typeFilter !== 'all') params.set('type', typeFilter);
                if (cityFilter !== 'all') params.set('city', cityFilter);
                params.set('upcoming', (!showPast).toString());
                params.set('limit', '100'); // Get more for calendar

                const res = await fetch(`/api/events?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.events || []);
                    setFeatured(data.featured || []);

                    // For calendar, also fetch all upcoming without filters
                    if (viewMode === 'calendar') {
                        const allRes = await fetch('/api/events?upcoming=true&limit=100');
                        if (allRes.ok) {
                            const allData = await allRes.json();
                            setAllEvents(allData.events || []);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to fetch events:', e);
            } finally {
                setLoading(false);
            }
        };
        void fetchEvents();
    }, [typeFilter, cityFilter, showPast, viewMode]);

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title="Web3 活動"
                showLogo={false}
                backHref="/"
                backLabel="返回"
            />

            <MobileOptimizedLayout className={SPACING.classes.mtHeader}>
                {/* Featured Events */}
                {featured.length > 0 && !loading && viewMode === 'list' && (
                    <section className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <h2 className="text-sm font-bold text-white">精選活動</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featured.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋活動名稱、主辦方、地點..."
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder:text-[#555] focus:border-blue-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#2A2A2A]"
                            >
                                <X className="w-4 h-4 text-[#666]" />
                            </button>
                        )}
                    </div>
                </div>

                {/* View Toggle + Filters */}
                <div className="mb-6 space-y-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
                            {EVENT_TYPES.map(type => (
                                <button
                                    key={type.key}
                                    onClick={() => setTypeFilter(type.key)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                                        typeFilter === type.key
                                            ? "bg-white text-black"
                                            : "bg-[#1A1A1A] text-[#888] hover:text-white border border-[#2A2A2A]"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-1 ml-3 bg-[#1A1A1A] rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-md transition-colors",
                                    viewMode === 'list' ? "bg-white text-black" : "text-[#888] hover:text-white"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={cn(
                                    "p-2 rounded-md transition-colors",
                                    viewMode === 'calendar' ? "bg-white text-black" : "text-[#888] hover:text-white"
                                )}
                            >
                                <Calendar className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* City & Time Filters (only for list view) */}
                    {viewMode === 'list' && (
                        <div className="flex items-center gap-3">
                            <select
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-lg px-3 py-1.5"
                            >
                                {CITIES.map(city => (
                                    <option key={city.key} value={city.key}>{city.label}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setShowPast(!showPast)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                    showPast
                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                        : "bg-[#1A1A1A] text-[#888] border-[#2A2A2A] hover:text-white"
                                )}
                            >
                                {showPast ? '顯示過去活動' : '僅顯示即將舉辦'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <UniversalCard variant="default" className="mb-6">
                        <div className="p-4">
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-8 bg-[#1A1A1A] rounded w-1/3" />
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array(35).fill(0).map((_, i) => (
                                            <div key={i} className="aspect-square bg-[#1A1A1A] rounded" />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EventCalendar events={allEvents.length > 0 ? allEvents : events} />
                            )}
                        </div>
                    </UniversalCard>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <UniversalCard variant="default" className="p-0 overflow-hidden">
                        <div className="border-b border-[#1A1A1A] bg-[#0F0F10]">
                            <SectionHeaderCard
                                title="活動列表"
                                rightElement={
                                    <span className="text-[10px] text-[#666]">
                                        {!loading && (
                                            searchQuery
                                                ? `找到 ${filteredEvents.length} 場`
                                                : `${events.length} 場活動`
                                        )}
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
                        ) : filteredEvents.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="w-12 h-12 text-[#333] mx-auto mb-3" />
                                <p className="text-[#666] text-sm">
                                    {searchQuery
                                        ? `找不到「${searchQuery}」相關活動`
                                        : showPast ? '沒有找到過去的活動' : '目前沒有即將舉辦的活動'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                {filteredEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </UniversalCard>
                )}
            </MobileOptimizedLayout>
        </main>
    );
}
